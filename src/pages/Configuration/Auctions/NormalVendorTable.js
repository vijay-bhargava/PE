import { Tooltip, TextField, Checkbox } from "@mui/material";
import { HiArrowDown, HiArrowUp, HiPencilAlt, HiX } from 'react-icons/hi';
import { PETableSimple } from '../../../components/RFQ/PETable';

const NormalVendorTable = ({ auctionItem }) => {
	const upType = auctionItem?.auctionManageData[0]?.bidTypeID === 1 || auctionItem?.auctionManageData[0]?.bidTypeID === 5;
	const isFreightOrFormula = [3, 4].includes(auctionItem?.auctionManageData[0]?.bidTypeID);

	// Derive term columns from the first vendor for the current line item
	const termColumns = (() => {
		if (!isFreightOrFormula) return [];
		const firstVendor = auctionItem?.allVendorParticipationDetails?.find(
			v => v.bidParameterId === auctionItem?.item?.bidParameterId && v.bidParticipationTermsHeader
		);
		if (!firstVendor) return [];
		try {
			const allTerms = JSON.parse(firstVendor.bidParticipationTermsHeader) || [];
			const filteredTerms = allTerms.filter(t => !/total/i.test(t.name));
			const auctionCT = auctionItem?.auctionManageData[0]?.auctionCT || [];
			const textTermIds = new Set(
				filteredTerms
					.filter(term => {
						const ctEntry = auctionCT.find(ct => ct.id === term.termId);
						return ctEntry && ctEntry.valuetype !== 'Currency';
					})
					.map(t => t.termId)
			);
			return [
				...filteredTerms.filter(t => !textTermIds.has(t.termId)).map(t => ({ ...t, isText: false })),
				...filteredTerms.filter(t => textTermIds.has(t.termId)).map(t => ({ ...t, isText: true })),
			];
		} catch { return []; }
	})();

	const bidSubTypeId = auctionItem?.auctionManageData[0]?.bidSubTypeId;
	const stage = auctionItem?.auctionManageData[0]?.stage;
	const showLatestQuoteCol = bidSubTypeId != 82 || ["Close", "Awarded", "Allocation"].includes(stage);
	const latestQuoteLabel = bidSubTypeId != 82 ? 'Latest Quote' : 'Accepted Price';

	const columns = [
		{
			key: 'companyName',
			label: 'Suppliers',
			renderCell: (_, sq) => {
				const invitedVendor = auctionItem?.ManageInvitedVendors?.find(v => v.vendorId === sq.vendorId);
				const isOnline = invitedVendor?.status === true;
				if (auctionItem?.auctionManageData[0]?.hideVendor === true && auctionItem?.bidStatus === 'running') {
					return <Tooltip title="Vendor Name"><span>Anonymous Vendor</span></Tooltip>;
				}
				return (
					<Tooltip title="Vendor Name">
						<span style={{ display: 'inline-flex', alignItems: 'center' }}>
							{isOnline && (
								<>
									<style>{`@keyframes ripple { 0% { transform: scale(.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }`}</style>
									<span style={{ position: "relative", width: "10px", height: "10px", display: "inline-flex", marginRight: "8px", flexShrink: 0 }}>
										<span style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#00c853", animation: "ripple 1.5s infinite" }} />
										<span style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#00c853", zIndex: 1, boxShadow: "0 0 10px #00c853" }} />
									</span>
								</>
							)}
							{sq.companyName}{sq.selectedCurrency && ` (${sq.selectedCurrency})`}
						</span>
					</Tooltip>
				);
			},
		},
		{
			key: 'rankValue',
			label: 'Rank',
			renderCell: (_, sq) => (
				<div className="d-flex align-items-center">
					<Tooltip title="Vendor Rank" style={{ color: auctionItem?.getRankColor(sq.rankValue) }}>
						<span>{sq.rankValue || "N/A"}</span>
					</Tooltip>
				</div>
			),
		},
		...(bidSubTypeId != 82 ? [{
			key: 'initialPrice',
			label: 'Initial Quote',
			renderCell: (_, sq) => {
				const isEditing = auctionItem?.restrictVendorId === sq.vendorId && auctionItem?.restrictParameterId === sq.bidParameterId;
				const canShowCheckbox = !(
					auctionItem?.auctionManageData[0]?.isReOpen === true ||
					(auctionItem?.auctionManageData[0]?.stage && auctionItem?.auctionManageData[0]?.stage !== "Open") ||
					auctionItem?.bidStatus === "running"
				);
				return (
					<div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
						{canShowCheckbox && (
							<Tooltip title="Restrict Vendor to Quote">
								<span>
									<Checkbox
										size="small"
										onChange={() => auctionItem?.handleCheckboxRestrict(sq.vendorId, sq.bidParameterId)}
										checked={
											isEditing ||
											!!(auctionItem?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId)?.restrictRemarks) ||
											!!(sq?.restrictRemarks)
										}
										disabled={
											!!(sq?.restrictRemarks) ||
											(sq.quotedPrice !== undefined && sq.quotedPrice !== null && sq.quotedPrice !== 0) ||
											auctionItem?.prebidValues.some(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId && i.quotedPrice !== undefined && i.quotedPrice !== null)
										}
									/>
								</span>
							</Tooltip>
						)}
						{isEditing ? (
							<TextField
								value={(() => { const e = auctionItem?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId); return e !== undefined ? (e.restrictRemarks ?? '') : (sq?.restrictRemarks ?? ''); })()}
								onChange={(e) => auctionItem?.handleRestricttChange(e, sq)}
								onBlur={() => auctionItem?.handleBlur()}
								type="text" size="small" autoFocus
							/>
						) : (
							<>
								<span>
									{auctionItem?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId)?.restrictRemarks
										|| sq?.restrictRemarks
										|| (sq?.initialPrice > 0 ? auctionItem?.thousands_separators(sq.initialPrice) : (sq.initialPrice === null && sq.id > 0 ? 'Quoted' : 'Not Participated'))}
								</span>{" "}
								{sq?.restrictRemarks && !((auctionItem?.auctionManageData[0]?.stage && auctionItem?.auctionManageData[0]?.stage !== "Open") || auctionItem?.bidStatus === "running") && (
									<Tooltip title="Remove Restrict Remark">
										<span>
											<button className="pe-icon-btn pe-icon-btn--close" onClick={() => auctionItem?.handleRemoveRestrictRemarks(sq?.id)}><HiX className="text-danger" style={{ cursor: 'pointer', marginLeft: 4 }} /></button>
										</span>
									</Tooltip>
								)}
							</>
						)}
					</div>
				);
			},
		}] : []),
		...(showLatestQuoteCol ? [{
			key: 'quotedPrice',
			label: latestQuoteLabel,
			renderCell: (_, sq) => {
				const isEditing = auctionItem?.editingVendorId === sq.vendorId && auctionItem?.editingParameterId === sq.bidParameterId;
				const canEdit = !(
					auctionItem?.auctionManageData[0]?.isReOpen === true ||
					(auctionItem?.auctionManageData[0]?.stage && auctionItem?.auctionManageData[0]?.stage !== "Open") ||
					auctionItem?.bidStatus === "running"
				);
				const hasRestrict = sq?.restrictRemarks || auctionItem?.prebidValues?.some(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId && i.restrictRemarks);
				return isEditing ? (
					<TextField
						value={(() => { const e = auctionItem?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId); return e !== undefined ? (e.quotedPrice ?? '') : (sq.quotedPrice || ''); })()}
						onChange={(e) => { const value = e.target.value; if (value >= 0 || value === '') auctionItem?.handlePriceChange(e, sq); }}
						onBlur={() => auctionItem?.handleBlur()}
						type="number" size="small" autoFocus
					/>
				) : (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<span>
							{auctionItem?.prebidValues.find(i => i.createdById === sq.vendorId && i.bidParameterId === sq.bidParameterId)?.quotedPrice
								|| (sq.quotedPrice && sq.quotedPrice !== 0 ? auctionItem?.thousands_separators(sq.quotedPrice) : (sq.quotedPrice === null && sq.id > 0 ? 'Quoted' : 'Not Participated'))}
						</span>
						{sq.rankValue !== null && auctionItem?.bidStatus !== null && !auctionItem?.auctionManageData[0]?.hideVendor && !auctionItem?.auctionManageData[0]?.groupAuction && sq.quotedPrice !== null && sq.quotedPrice !== undefined && bidSubTypeId != 82 && (
							<Tooltip title="Remove Quote">
								<button className="pe-icon-btn pe-icon-btn--close" onClick={() => auctionItem?.handleOpenModalRemoveQuote(sq?.quotedPrice, sq?.id)}><HiX /></button>
							</Tooltip>
						)}
						{canEdit && (
							<button
								className="pe-icon-btn pe-icon-btn--edit"
								style={{ marginLeft: 4, cursor: hasRestrict ? 'not-allowed' : 'pointer', pointerEvents: hasRestrict ? 'none' : 'auto' }}
								onClick={() => auctionItem?.handleEditPrice(sq.vendorId, sq.bidParameterId)}
							><HiPencilAlt /></button>
						)}
					</div>
				);
			},
		}] : []),
		...(isFreightOrFormula ? termColumns.map(col => ({
			key: `term_${col.termId}`,
			label: col.name,
			renderCell: (_, sq) => {
				let terms = [];
				try { terms = JSON.parse(sq.bidParticipationTermsHeader) || []; } catch { terms = []; }
				const t = terms.find(t => t.termId === col.termId);
				return t ? (col.isText ? (t.remarks || 'N/A') : auctionItem?.thousands_separators(t.quotedPrice)) : '-';
			},
		})) : []),
		{
			key: '_bidValue',
			label: 'Bid Value',
			renderCell: (_, sq) => ((sq?.quotedPrice ?? 0) * (auctionItem?.item?.quantity ?? '')) === 0
				? 0
				: auctionItem?.thousands_separators((sq?.quotedPrice ?? '') * (auctionItem?.item?.quantity ?? '')),
		},
		...(auctionItem?.hasLoadingFactor ? [
			{
				key: 'loadingFactors',
				label: 'Loading Factor',
				renderCell: (_, sq) => auctionItem?.thousands_separators(sq?.loadingFactors) || 0,
			},
			{
				key: 'loadedPrice',
				label: 'Loaded Amount',
				renderCell: (_, sq) => auctionItem?.thousands_separators(sq?.loadedPrice) || 0,
			},
		] : []),
		{
			key: 'percRedStartPrice',
			label: 'Start Price %',
			renderHeader: () => <>{upType ? <HiArrowUp className="text-success" /> : <HiArrowDown className="text-danger" />}{' '}Start Price %</>,
			renderCell: (_, sq) => sq?.percRedStartPrice != null ? `${auctionItem?.thousands_separators(Number(sq.percRedStartPrice).toFixed(2))}%` : 'N/A',
		},
		{
			key: 'percRedTargetPrice',
			label: 'Target Price %',
			renderHeader: () => <>{upType ? <HiArrowUp className="text-success" /> : <HiArrowDown className="text-danger" />}{' '}Target Price %</>,
			renderCell: (_, sq) => sq?.percRedTargetPrice != null ? `${auctionItem?.thousands_separators(Number(sq.percRedTargetPrice).toFixed(2))}%` : 'N/A',
		},
		{
			key: 'percRedLastInvPrice',
			label: 'Last Invoice Price %',
			renderHeader: () => <>{upType ? <HiArrowUp className="text-success" /> : <HiArrowDown className="text-danger" />}{' '}Last Invoice Price %</>,
			renderCell: (_, sq) => sq?.percRedLastInvPrice != null ? `${auctionItem?.thousands_separators(Number(sq.percRedLastInvPrice).toFixed(2))}%` : 'N/A',
		},
	];

	const rows = (auctionItem?.allVendorParticipationDetails
		?.filter(vendor => vendor.bidParameterId === auctionItem?.item.bidParameterId)
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

export default NormalVendorTable;
