import { Tooltip, TextField, Checkbox } from "@mui/material";
import { HiArrowDown, HiArrowUp, HiPencilAlt, HiX } from 'react-icons/hi';
import { PETableSimple } from '../../../components/RFQ/PETable';

const VendortTable = ({ actions, auctionItem, actionsR, hasLoadingFactor }) => {
	const upType = actions?.auctionManageData[0]?.bidTypeID === 1 || actions?.auctionManageData[0]?.bidTypeID === 5;

	const columns = [
		{
			key: 'companyName',
			label: 'Suppliers',
			renderCell: (_, sq) => (
				actions?.auctionManageData[0]?.hideVendor === true && actions?.bidStatus === 'running'
					? <Tooltip title="Supplier Name"><span>Anonymous Supplier</span></Tooltip>
					: <Tooltip title="Supplier Name"><span>{sq.companyName}{sq.selectedCurrency && ` (${sq.selectedCurrency})`}</span></Tooltip>
			),
		},
		{
			key: 'rankValue',
			label: 'Rank',
			renderCell: (_, sq) => (
				<div className="d-flex align-items-center">
					<Tooltip title="Rank" style={{ color: actionsR?.getRankColor(sq.rankValue) }}>
						<span>{sq.rankValue || "N/A"}</span>
					</Tooltip>
				</div>
			),
		},
		{
			key: 'initialPrice',
			label: 'Initial Quote',
			renderCell: (_, sq) => {
				const isEditing = actionsR?.restrictVendorId === sq.vendorId && actionsR?.restrictParameterId === sq.bidParameterId;
				const canShowCheckbox = !(
					actions?.auctionManageData[0]?.isReOpen === true ||
					(actions?.auctionManageData[0]?.stage !== "Open" || actions?.auctionManageData[0]?.stage === "Running" || actions?.bidStatus === 'running')
				);
				return (
					<div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
						{canShowCheckbox && (
							<Tooltip title="Restrict Supplier to Quote">
								<span>
									<Checkbox
										size="small"
										onChange={() => actionsR?.handleCheckboxRestrict(sq.vendorId, sq.bidParameterId)}
										checked={
											isEditing ||
											!!(actionsR?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId)?.restrictRemarks) ||
											!!(sq?.restrictRemarks)
										}
										disabled={
											!!(sq?.restrictRemarks) ||
											(sq.quotedPrice !== undefined && sq.quotedPrice !== null && sq.quotedPrice !== 0) ||
											actionsR?.prebidValues.some(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId && i.quotedPrice !== undefined && i.quotedPrice !== null)
										}
									/>
								</span>
							</Tooltip>
						)}
						{isEditing ? (
							<TextField
								value={(() => { const e = actionsR?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId); return e !== undefined ? (e.restrictRemarks ?? '') : (sq?.restrictRemarks ?? ''); })()}
								onChange={(e) => actionsR?.handleRestricttChange(e, sq)}
								onBlur={() => actionsR?.handleBlur()}
								type="text" size="small" autoFocus
							/>
						) : (
							<>
								<span>
									{actionsR?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId)?.restrictRemarks
										|| sq?.restrictRemarks
										|| (sq?.initialPrice > 0 ? actionsR?.thousands_separators(sq.initialPrice) : (sq.initialPrice === null && sq.id > 0 ? 'Quoted' : 'Not Participated'))}
								</span>
								{sq?.restrictRemarks && !((actions?.auctionManageData[0]?.stage !== "Open" || actions?.auctionManageData[0]?.stage === "Running" || actions?.bidStatus === 'running')) && (
									<Tooltip title="Remove Restrict Remark">
										<span>
											<button className="pe-icon-btn pe-icon-btn--close" onClick={() => actionsR?.handleRemoveRestrictRemarks(sq?.id)}><HiX className="text-danger" style={{ cursor: 'pointer', marginLeft: 4 }} /></button>
										</span>
									</Tooltip>
								)}
							</>
						)}
					</div>
				);
			},
		},
		{
			key: 'quotedPrice',
			label: 'Latest Quote',
			renderCell: (_, sq) => {
				const isEditing = actionsR?.editingVendorId === sq.vendorId && actionsR?.editingParameterId === sq.bidParameterId;
				const canEdit = !(
					actions?.auctionManageData[0]?.isReOpen === true ||
					(actions?.auctionManageData[0]?.stage !== "Open" || actions?.auctionManageData[0]?.stage === "Running" || actions?.bidStatus === 'running')
				);
				const hasRestrict = sq?.restrictRemarks || actionsR?.prebidValues?.some(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId && i.restrictRemarks);
				return isEditing ? (
					<TextField
						value={(() => { const e = actionsR?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId); return e !== undefined ? (e.quotedPrice ?? '') : (sq.quotedPrice || ''); })()}
						onChange={(e) => { const value = e.target.value; if (value >= 0 || value === '') actionsR?.handlePriceChange(e, sq); }}
						onBlur={() => actionsR?.handleBlur()}
						type="number" size="small" autoFocus
					/>
				) : (
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
						<span>
							{actionsR?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId)?.quotedPrice
								|| (sq.quotedPrice && sq.quotedPrice !== 0 ? actionsR?.thousands_separators(sq.quotedPrice) : (sq.quotedPrice === null && sq.id > 0 ? 'Quoted' : 'Not Participated'))}
							</span>{" "}
						{sq.rankValue !== null && actionsR?.slotStatus !== "Slot_Closed" && actions?.bidStatus !== null && !actions?.auctionManageData[0]?.hideVendor && sq.quotedPrice !== null && sq.quotedPrice !== undefined && (
							<Tooltip title="Remove Quote">
								<button className="pe-icon-btn pe-icon-btn--close" onClick={() => actionsR?.handleOpenModalRemoveQuoteInStagger(sq?.quotedPrice, sq?.id)}><HiX /></button>
							</Tooltip>
						)}
						{canEdit && (
							<button
								className="pe-icon-btn pe-icon-btn--edit"
								style={{ marginLeft: 4, cursor: hasRestrict ? 'not-allowed' : 'pointer', pointerEvents: hasRestrict ? 'none' : 'auto' }}
								onClick={() => actionsR?.handleEditPrice(sq.vendorId, sq.bidParameterId)}
							><HiPencilAlt /></button>
						)}
					</div>
				);
			},
		},
		{
			key: '_auctionValue',
			label: 'Auction Value',
			renderCell: (_, sq) => ((sq?.quotedPrice ?? 0) * (auctionItem?.quantity ?? '')) === 0
				? 0
				: actionsR?.thousands_separators((sq?.quotedPrice ?? '') * (auctionItem?.quantity ?? '')),
		},
		...(hasLoadingFactor ? [
			{
				key: 'loadingFactors',
				label: 'Loading Factor',
				renderCell: (_, sq) => actionsR?.thousands_separators(sq?.loadingFactors) || 0,
			},
			{
				key: 'loadedPrice',
				label: 'Loaded Amount',
				renderCell: (_, sq) => actionsR?.thousands_separators(sq?.loadedPrice) || 0,
			},
		] : []),
		{
			key: 'percRedStartPrice',
			label: 'Start Price %',
			renderHeader: () => <>{upType ? <HiArrowUp className="text-success" /> : <HiArrowDown className="text-danger" />}{' '}Start Price %</>,
			renderCell: (_, sq) => sq?.percRedStartPrice != null ? `${actionsR?.thousands_separators(Number(sq.percRedStartPrice).toFixed(2))}%` : 'N/A',
		},
		{
			key: 'percRedTargetPrice',
			label: 'Target Price %',
			renderHeader: () => <>{upType ? <HiArrowUp className="text-success" /> : <HiArrowDown className="text-danger" />}{' '}Target Price %</>,
			renderCell: (_, sq) => sq?.percRedTargetPrice != null ? `${actionsR?.thousands_separators(Number(sq.percRedTargetPrice).toFixed(2))}%` : 'N/A',
		},
		{
			key: 'percRedLastInvPrice',
			label: 'Last Invoice Price %',
			renderHeader: () => <>{upType ? <HiArrowUp className="text-success" /> : <HiArrowDown className="text-danger" />}{' '}Last Invoice Price %</>,
			renderCell: (_, sq) => sq?.percRedLastInvPrice != null ? `${actionsR?.thousands_separators(Number(sq.percRedLastInvPrice).toFixed(2))}%` : 'N/A',
		},
	];

	const rows = (actions?.allVendorParticipationDetails
		?.filter(vendor => vendor.bidParameterId === auctionItem.bidParameterId)
		?.sort((a, b) => (a.restrictRemarks && !b.restrictRemarks ? 1 : !a.restrictRemarks && b.restrictRemarks ? -1 : 0))
		?.filter(sq => sq?.vendorId)) ?? [];

	return (
		<PETableSimple
			columns={columns}
			rows={rows}
			getRowKey={(row, i) => `${row.vendorId}-${i}`}
			wrapperStyle={{ border: 'none', borderRadius: 0 }}
		/>
	);
};

export default VendortTable;
