import React, { useState } from 'react';
import {
	Button, Switch, Tooltip,
	IconButton, Menu, MenuItem, Divider
} from '@mui/material';
import { PEPagination } from '../../../components/RFQ/PEPagination';
import { HiChevronLeft, HiChevronRight, HiDotsVertical, HiPencilAlt } from 'react-icons/hi';
import { ExpandLess, ExpandMore, UnfoldLess, UnfoldMore } from '@mui/icons-material';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import { PETableSimple } from '../../../components/RFQ/PETable';
import VendortTable from './VendortTable';

const RenderTable = ({ actions, actionsR }) => {
	const [bidControlAnchor, setBidControlAnchor] = useState(null);

	const upType = actions?.auctionManageData[0]?.bidTypeID === 1 || actions?.auctionManageData[0]?.bidTypeID === 5;
	const expandedSet = new Set(actions?.expandedItemIds ?? []);

	const rankColumn = actions?.expandedItemIds?.length === 0 ? [{
		key: '_rank',
		label: upType ? 'H1 Rank' : 'L1 Rank',
		renderCell: (_, item) => {
			const linked = actions?.allVendorParticipationDetails?.filter(v => v.bidParameterId === item.bidParameterId) ?? [];
			const vendor = linked.find(v => v.rankValue === (upType ? 'H1' : 'L1'));
			return vendor
				? <span className="text-primary f13 fw500 productTd">{vendor.companyName}</span>
				: <span className="text-danger">N/A</span>;
		},
	}] : [];

	const columns = [
		{
			key: '_sno',
			label: 'S.No',
			width: 60,
			renderCell: (_, __, index) => index + 1,
		},
		{
			key: 'itemName',
			label: 'Item / Service',
			renderCell: (_, item, index) => (
				<Tooltip title="Open Graph" componentsProps={{ tooltip: { sx: { fontSize: '0.8rem', padding: '8px 12px' } } }}>
					<span
						className="fw-bold f13 text-primary"
						style={{ cursor: 'pointer', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
						onClick={() => actionsR?.OpenModal(actionsR?.filteredItems, index)}
					>
						{item.itemName}
					</span>
				</Tooltip>
			),
		},
		...rankColumn,
		{
			key: 'quantity',
			label: 'Qty',
			renderCell: (_, item) => (
				<span className="text-primary">{actionsR?.thousands_separators(item.quantity)}<span className="ms-1">{item.uom}</span></span>
			),
		},
		{
			key: 'targetPrice',
			label: 'Target Price',
			renderCell: (_, item) => <span className="text-primary">{actionsR?.thousands_separators(item?.targetPrice)}</span>,
		},
		{
			key: 'hidePrice',
			label: 'Show Target Price',
			renderCell: (_, item) => (
				<Switch
					checked={item?.hidePrice}
					inputProps={{ "aria-label": "controlled" }}
					onChange={(e) => actions?.handleSubmit('hidePrice', null, e.target.checked, item?.bidParameterId)}
					disabled={actions?.bidStatus !== "not_started" || actions?.auctionManageData[0]?.stage === 'Close'}
				/>
			),
		},
		{
			key: 'maskL1Price',
			label: upType ? 'Show H1 Price' : 'Show L1 Price',
			renderCell: (_, item) => (
				<Switch
					checked={item?.maskL1Price}
					inputProps={{ "aria-label": "controlled" }}
					onChange={(e) => actions?.handleSubmit('maskL1Price', null, e.target.checked, item?.bidParameterId)}
					disabled={actions?.auctionManageData[0]?.stage === 'Close' || actionsR?.slotStatus === 'Slot_Closed'}
				/>
			),
		},
		{
			key: 'showStartPrice',
			label: 'Show Start Price',
			renderCell: (_, item) => (
				<Switch
					checked={item?.showStartPrice}
					inputProps={{ "aria-label": "controlled" }}
					onChange={(e) => actions?.handleSubmit('showStartPrice', 0, e.target.checked, item?.bidParameterId)}
					disabled={actions?.auctionManageData[0]?.stage === 'Close' || actionsR?.slotStatus === 'Slot_Closed'}
				/>
			),
		},
		{
			key: 'startPrice',
			label: 'Start Unit Price',
			renderCell: (_, item, index) => (
				<span className="text-primary">
					{actionsR?.thousands_separators(item?.startPrice)}
					{!(actions?.auctionManageData[0]?.stage === 'Close' || actionsR?.slotStatus === 'Slot_Closed') && (
						<button
							className="pe-icon-btn pe-icon-btn--edit"
							style={{ cursor: 'pointer', marginLeft: 4 }}
							onClick={() => actions?.handleOpen('startPrice', index, item?.bidParameterId)}
						><HiPencilAlt /></button>
					)}
				</span>
			),
		},
		{
			key: 'minimumDelta',
			label: upType ? 'Min.Increment' : 'Min.Decrement',
			renderCell: (_, item, index) => (
				<span className="text-primary">
					{actionsR?.thousands_separators(item?.minimumDelta)}
					{!(actions?.auctionManageData[0]?.stage === 'Close' || actionsR?.slotStatus === 'Slot_Closed') && (
						<button
							className="pe-icon-btn pe-icon-btn--edit"
							style={{ cursor: 'pointer', marginLeft: 4 }}
							onClick={() => actions?.handleOpen('minimumDelta', index, item?.bidParameterId)}
						><HiPencilAlt /></button>
					)}
				</span>
			),
		},
		{
			key: '__expand',
			label: '',
			width: 80,
			align: 'right',
			renderHeader: () => (
				<div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
					<Tooltip
						title={actions?.expandAll ? 'Collapse All' : 'Expand All'}
						componentsProps={{ tooltip: { sx: { fontSize: '0.8rem', padding: '8px 12px' } } }}
					>
						<span
							onClick={actions?.expandAll
								? () => actions?.handleCollapseAll(actions?.setExpandAll)
								: () => actions?.handleExpandAll(actions?.setExpandAll)
							}
							style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
						>
							{actions?.expandAll ? <UnfoldLess sx={{ fontSize: 18 }} /> : <UnfoldMore sx={{ fontSize: 18 }} />}
						</span>
					</Tooltip>
					<Tooltip title="Bid Control" componentsProps={{ tooltip: { sx: { fontSize: '0.8rem', padding: '8px 12px' } } }}>
						<span
							onClick={(e) => setBidControlAnchor(e.currentTarget)}
							style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
						>
							<HiDotsVertical />
						</span>
					</Tooltip>
				</div>
			),
			renderCell: (_, item) => (
				<IconButton
					size="small"
					onClick={expandedSet.has(item.bidParameterId)
						? () => actions?.handleCollapseAll(actions?.setExpandAll)
						: () => actions?.handleExpandAll(actions?.setExpandAll)
					}
				>
					{expandedSet.has(item.bidParameterId) ? <ExpandLess /> : <ExpandMore />}
				</IconButton>
			),
		},
	];

	return (
		<>
			{/* Slot navigation */}
			<div className='d-flex justify-content-between minh50px align-items-center p-2 border rounded-3'>
				<Button className='stagger-custom-button' onClick={actionsR?.handlePrevious} disabled={actionsR?.currentTableIndex === 0}>
					<HiChevronLeft />
				</Button>
				<div className='f14 fw500 d-flex align-items-center'>
					{`(Slot ${actionsR?.currentTableIndex + 1} of ${actions?.totalCount} )`}&nbsp;Remaining Time :&nbsp;
					<div className='text-danger'>
						{actionsR?.showRemainingTime ? actionsR?.timeRemainingForGrp : actionsR?.slotStatus}
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
								const bidItems = actions?.lineItemsPerPage ?? [];
								const currentItem = actionsR?.filteredItems[0];
								const currentIndex = bidItems.findIndex(item => item.bidParameterId === currentItem?.bidParameterId);
								const prevItem = bidItems[currentIndex - 1];
								if (prevItem?.itemStatus === "Close" && currentItem?.itemStatus !== "Close") {
									return <PlayCircleFilledWhiteOutlinedIcon onClick={actionsR?.handleOpenModalForReopen} />;
								}
								return null;
							})()
						)}
					</div>
				</div>
				<Button className='stagger-custom-button' onClick={actionsR?.handleNext} disabled={actionsR?.currentTableIndex === actionsR?.uniqueGroupCount - 1}>
					<HiChevronRight />
				</Button>
			</div>

			{/* Main table */}
			<div className="mt-2 mb-2">
				<PETableSimple
					columns={columns}
					rows={actionsR?.filteredItems ?? []}
					getRowKey={(row) => row.bidParameterId}
					expandedKeys={expandedSet}
					onExpandToggle={() => { }}
					getExpandContent={(item) => (
						<VendortTable
							actions={actions}
							actionsR={actionsR}
							hasLoadingFactor={actions?.hasLoadingFactor}
							auctionItem={item}
						/>
					)}
				/>
			</div>

			{/* Pagination */}
			<PEPagination
				page={actionsR?.currentTableIndex + 1}
				pageSize={10}
				totalRows={actions?.totalCount * 10}
				pageSizeOptions={[10]}
				onPageChange={(page) => {
					actionsR?.setCurrentTableIndex?.(page - 1);
					actionsR?.callbackPagination(page, 10);
				}}
				onPageSizeChange={() => { }}
			/>

			{/* Bid Control dropdown (portals to body, escapes sticky stacking context) */}
			<Menu
				anchorEl={bidControlAnchor}
				open={Boolean(bidControlAnchor)}
				onClose={() => setBidControlAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				PaperProps={{
					sx: {
						width: 210,
						borderRadius: 2,
						boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
						'& .MuiMenuItem-root': { fontSize: 13 },
					},
				}}
			>
				<MenuItem
					onClick={() => { setBidControlAnchor(null); actions?.handleShowAddVendorModal('AddSuppliers'); }}
					disabled={["Close", "Paused", "Awarded"].includes(actions?.auctionManageData[0]?.stage)}
				>
					Add Suppliers
				</MenuItem>
				<MenuItem
					onClick={() => { setBidControlAnchor(null); actions?.handleShowSendReminderModal('Reminder'); }}
					disabled={["Close", "Paused", "Awarded"].includes(actions?.auctionManageData[0]?.stage)}
				>
					Send Reminder
				</MenuItem>
				<MenuItem
					onClick={() => { setBidControlAnchor(null); actions?.handleShowReOpenModal('Reopened'); }}
					disabled={["Paused"].includes(actions?.auctionManageData[0]?.stage) || actions?.bidStatus === 'running'}
				>
					Auction Open
				</MenuItem>
				<MenuItem
					onClick={() => { setBidControlAnchor(null); actions?.setActionModal({ ...actions?.actionmodal, surrogateSupplierModal: true }); }}
					disabled={["Close", "Paused", "Awarded"].includes(actions?.auctionManageData[0]?.stage) || actions?.bidStatus === 'running'}
				>
					Surrogate Supplier
				</MenuItem>
				<Divider />
				<MenuItem
					sx={{ color: '#b8232f' }}
					onClick={() => { setBidControlAnchor(null); actions?.bidStatus !== 'running' && actions?.handleCancel(); }}
					disabled={["Close", "Paused", "Awarded"].includes(actions?.auctionManageData[0]?.stage) || actions?.bidStatus === 'running'}
				>
					Cancel Auction
				</MenuItem>
				<MenuItem
					onClick={() => { setBidControlAnchor(null); actionsR?.submitPrebid(); }}
					disabled={
						actions?.bidStatus === 'running' ||
						actions?.allVendorParticipationDetails?.some(i => i.isPrePrice === true || i?.id > 0) ||
						(actions?.auctionManageData[0]?.stage && actions?.auctionManageData[0]?.stage !== 'Open')
					}
				>
					Prebid / Restrict Vendors
				</MenuItem>
			</Menu>
		</>
	);
};

export default RenderTable;
