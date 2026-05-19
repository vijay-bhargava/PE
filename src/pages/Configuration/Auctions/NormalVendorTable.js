import { Tooltip, TextField, Checkbox, TableHead, TableContainer, TableRow, TableCell, TableBody } from "@mui/material";
import { Table } from "react-bootstrap";
import IconButton from "@mui/material/IconButton";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { HiArrowDown, HiArrowUp, HiPencilAlt, HiX } from "react-icons/hi";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const NormalVendorTable = ({ auctionItem }) => {
    return (
        <TableContainer>
            <Table className="vendors-table mb-0">
                <TableHead>
                    <TableRow>
                        <TableCell>Suppliers</TableCell>
                        <TableCell>Rank</TableCell>
                        <TableCell>Initial Quote</TableCell>
                        <TableCell align="right">Latest Quote</TableCell>
                        <TableCell align="right">Bid Value</TableCell>
                        {auctionItem?.hasLoadingFactor && <TableCell align="right">Loading Factor</TableCell>}
                        {auctionItem?.hasLoadingFactor && <TableCell align="right">Loaded Amount</TableCell>}
                        <TableCell align="right">
                            {auctionItem?.auctionManageData[0]?.bidTypeID === 1 || auctionItem?.auctionManageData[0]?.bidTypeID === 5 ? (
                                <HiArrowUp className="text-success" />
                            ) : (
                                <HiArrowDown className="text-danger" />
                            )}
                            Start Price %
                        </TableCell>
                        <TableCell align="right">
                            {auctionItem?.auctionManageData[0]?.bidTypeID === 1 || auctionItem?.auctionManageData[0]?.bidTypeID === 5 ? (
                                <HiArrowUp className="text-success" />
                            ) : (
                                <HiArrowDown className="text-danger" />
                            )}
                            Target Price %
                        </TableCell>
                        <TableCell align="right">
                            {auctionItem?.auctionManageData[0]?.bidTypeID === 1 || auctionItem?.auctionManageData[0]?.bidTypeID === 5 ? (
                                <HiArrowUp className="text-success" />
                            ) : (
                                <HiArrowDown className="text-danger" />
                            )}
                            Last Invoice Price %
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {auctionItem?.allVendorParticipationDetails
                        ?.filter(vendor => vendor.bidParameterId === auctionItem?.item.bidParameterId)
                        ?.sort((a, b) => (a.restrictRemarks && !b.restrictRemarks ? 1 : !a.restrictRemarks && b.restrictRemarks ? -1 : 0))
                        //?.slice(auctionItem?.page * auctionItem?.rowsPerPage, auctionItem?.page * auctionItem?.rowsPerPage + auctionItem?.rowsPerPage)
                        ?.map((sq, i2) => {
                            if (sq?.vendorId) {
                                return (
                                    <TableRow key={`supplieritemlist${sq.vendorId}-${i2}`}>
                                        <TableCell>

                                            {
                                                (auctionItem?.auctionManageData[0]?.hideVendor === true && auctionItem?.bidStatus === 'running') ? (
                                                    <Tooltip title="Vendor Name">{'Anonymous Vendor'}</Tooltip>
                                                ) : (
                                                    <Tooltip title="Vendor Name">
                                                        {sq.companyName}
                                                        {sq.selectedCurrency && ` (${sq.selectedCurrency})`}
                                                        {/* {auctionItem?.auctionManageData[0]?.isMultiCurrency && 
                                                            (() => {
                                                                const vendorData = auctionItem?.auctionManageData[0]?.bidVendorInvited?.find(v => v.vendorID === sq.vendorId);
                                                                return vendorData?.currency ? ` (${vendorData.currency})` : '';
                                                            })()
                                                        } */}
                                                    </Tooltip>
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className="d-flex align-items-center">
                                                <Tooltip title="Vendor Rank" style={{ color: auctionItem?.getRankColor(sq.rankValue) }}>
                                                    {sq.rankValue || "N/A"}
                                                </Tooltip>

                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Restrict Vendor to Quote">
                                                {!(
                                                    auctionItem?.auctionManageData[0]?.isReOpen === true ||
                                                    (auctionItem?.auctionManageData[0]?.stage && auctionItem?.auctionManageData[0]?.stage !== "Open") || auctionItem?.bidStatus === "running"
                                                ) && (
                                                        <Checkbox
                                                            size="small"
                                                            onChange={() => auctionItem?.handleCheckboxRestrict(sq.vendorId, sq.bidParameterId)}
                                                            checked={
                                                                (auctionItem?.restrictVendorId === sq.vendorId && auctionItem?.restrictParameterId === sq.bidParameterId) ||
                                                                !!(auctionItem?.prebidValues.find(item => item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId)?.restrictRemarks) ||
                                                                !!(sq?.restrictRemarks)
                                                            }
                                                            disabled={
                                                                !!(sq?.restrictRemarks) ||
                                                                (sq.quotedPrice !== undefined && sq.quotedPrice !== null && sq.quotedPrice !== 0) ||
                                                                auctionItem?.prebidValues.some(
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
                                            {auctionItem?.restrictVendorId === sq.vendorId && auctionItem?.restrictParameterId === sq.bidParameterId ? (
                                                <TextField
                                                    value={(() => { const e = auctionItem?.prebidValues.find(item => item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId); return e !== undefined ? (e.restrictRemarks ?? '') : (sq?.restrictRemarks ?? ''); })()}
                                                    onChange={(e) => auctionItem?.handleRestricttChange(e, sq)}
                                                    onBlur={() => auctionItem?.handleBlur()}
                                                    type="text"
                                                    size="small"
                                                    autoFocus
                                                />
                                            ) : (
                                                <>
                                                    {auctionItem?.prebidValues.find(item => item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId)?.restrictRemarks || sq?.restrictRemarks || (sq?.initialPrice > 0 ? auctionItem?.thousands_separators(sq.initialPrice) : (sq.initialPrice === null && sq.id > 0 ? 'Quoted' : 'Not Participated'))}
                                                    {(sq?.restrictRemarks) && !((auctionItem?.auctionManageData[0]?.stage && auctionItem?.auctionManageData[0]?.stage !== "Open") || auctionItem?.bidStatus === "running") && (
                                                        <Tooltip title="Remove Restrict Remark">
                                                            <span>
                                                                <HiX
                                                                    size={16}
                                                                    className="text-danger"
                                                                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                                    onClick={() => auctionItem?.handleRemoveRestrictRemarks(sq?.id)}
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {auctionItem?.editingVendorId === sq.vendorId && auctionItem?.editingParameterId === sq.bidParameterId ? (
                                                <TextField
                                                    value={(() => { const e = auctionItem?.prebidValues.find(item => item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId); return e !== undefined ? (e.quotedPrice ?? '') : (sq.quotedPrice || ''); })()}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value >= 0 || value === '') {
                                                            auctionItem?.handlePriceChange(e, sq);
                                                        }
                                                    }}
                                                    onBlur={() => auctionItem?.handleBlur()}
                                                    type="number"
                                                    size="small"
                                                    autoFocus
                                                />
                                            ) : (
                                                <>
                                                    {auctionItem?.prebidValues.find(item => item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId)?.quotedPrice || (sq.quotedPrice && sq.quotedPrice !== 0 ? auctionItem?.thousands_separators(sq.quotedPrice) : (sq.quotedPrice === null && sq.id > 0 ? 'Quoted' : 'Not Participated'))}
                                                    {sq.rankValue !== null && auctionItem?.bidStatus !== null && !auctionItem?.auctionManageData[0]?.hideVendor && sq.quotedPrice !== null && sq.quotedPrice !== undefined && (
                                                        <Tooltip title="Remove Quote">
                                                            <span>
                                                                <HiX
                                                                    size={18}
                                                                    className="text-danger"
                                                                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                                    onClick={() => auctionItem?.handleOpenModalRemoveQuote(sq?.quotedPrice, sq?.id)}
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                    {!(
                                                        auctionItem?.auctionManageData[0]?.isReOpen === true ||
                                                        (auctionItem?.auctionManageData[0]?.stage && auctionItem?.auctionManageData[0]?.stage !== "Open") ||
                                                        auctionItem?.bidStatus === "running") && (
                                                            <HiPencilAlt
                                                                className="text-primary"
                                                                style={{
                                                                    marginLeft: '5px',
                                                                    cursor: sq?.restrictRemarks || auctionItem?.prebidValues?.some(
                                                                        (item) =>
                                                                            item.createdById === sq.vendorId &&
                                                                            item.bidParameterId === sq.bidParameterId &&
                                                                            item.restrictRemarks
                                                                    )
                                                                        ? 'not-allowed'
                                                                        : 'pointer',
                                                                    pointerEvents: sq?.restrictRemarks || auctionItem?.prebidValues?.some(
                                                                        (item) =>
                                                                            item.createdById === sq.vendorId &&
                                                                            item.bidParameterId === sq.bidParameterId &&
                                                                            item.restrictRemarks
                                                                    )
                                                                        ? 'none'
                                                                        : 'auto'
                                                                }}
                                                                onClick={() => auctionItem?.handleEditPrice(sq.vendorId, sq.bidParameterId)}
                                                            />
                                                        )}
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {((sq?.quotedPrice ?? 0) * (auctionItem?.item?.quantity ?? '')) == 0
                                                //? 'N/A'
                                                ? 0
                                                : auctionItem?.thousands_separators((sq?.quotedPrice ?? '') * (auctionItem?.item?.quantity ?? ''))
                                            }
                                        </TableCell>
                                        {auctionItem?.hasLoadingFactor && <TableCell align="right">{auctionItem?.thousands_separators(sq?.loadingFactors) || 0}</TableCell>}
                                        {auctionItem?.hasLoadingFactor && <TableCell align="right">{auctionItem?.thousands_separators(sq?.loadedPrice) || 0}</TableCell>}
                                        <TableCell align="right">
                                            {sq?.percRedStartPrice != null
                                                ? `${auctionItem?.thousands_separators(Number(sq.percRedStartPrice).toFixed(2))}%`
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell align="right">
                                            {sq?.percRedTargetPrice != null
                                                ? `${auctionItem?.thousands_separators(Number(sq.percRedTargetPrice).toFixed(2))}%`
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell align="right">
                                            {sq?.percRedLastInvPrice != null
                                                ? `${auctionItem?.thousands_separators(Number(sq.percRedLastInvPrice).toFixed(2))}%`
                                                : "N/A"}
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                            return null;
                        })}
                    {auctionItem?.allVendorParticipationDetails?.filter(vendor => vendor.bidParameterId === auctionItem?.item?.bidParameterId)?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={10}>Yet to quote for this line item</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default NormalVendorTable
