import React, { useState } from 'react';
import {
	Accordion, AccordionDetails, AccordionSummary,
	Button, IconButton, Table, TableBody, TableCell,
	TableContainer, TableHead, TableRow, TextField, Tooltip,
} from '@mui/material';
import { ChatOutlined, ExpandLess, ExpandMore } from '@mui/icons-material';
import { HiChevronDown, HiMinusSm, HiPencilAlt, HiPlusSm } from 'react-icons/hi';
import { TiArrowMinimise } from 'react-icons/ti';
import { TbWindowMaximize } from 'react-icons/tb';
import { ACTIONS, CLAIM_TYPES } from '../../../utils/permissionManager';
import { checkUTC, formatDateViaLocale } from '../../../utils/common/utility';

const labelStyle = { color: '#6b7280', fontWeight: 500, fontSize: '12.5px', whiteSpace: 'nowrap' };
const valueStyle = { fontSize: '13px', fontWeight: 500, color: '#101828' };

function InfoField({ label, children }) {
	return (
		<div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
			<span style={labelStyle}>{label}:</span>
			<span style={valueStyle}>{children}</span>
		</div>
	);
}

export default function AuctionDetailBox({
	auctionData,
	bidStatus,
	timeRemaining,
	expanded,
	onExpandChange,
	isFullScreen,
	onToggleFullScreen,
	onToggleChat,
	userDetail,
	permissionManager,
	adjustValue,
	isValueChanged,
	onDecrease,
	onIncrease,
	onDurationChange,
	onGoClick,
	showCurrencyTable,
	onToggleCurrencyTable,
	runningSlotNumber,
	onRunningSlotClick,
	onEditField,
}) {
	const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.MANAGE_AUCTION, ACTIONS.EDIT) ?? false;
	const [subjectExpanded, setSubjectExpanded] = useState(false);
	const [descExpanded, setDescExpanded] = useState(false);
	const TRUNCATE_LEN = 190;

	const auctionTypeLabel = () => {
		const t = auctionData?.bidTypeID;
		const base = t === 1 ? 'Forward Auction' : t === 2 ? 'Reverse Auction' : t === 3 ? 'Freight Auction' :
			t === 4 ? 'Formula Based Auction' : t === 5 ? 'French Forward' : t === 6 ? 'French Reverse' : 'Unknown';
		const sub = auctionData?.bidSubTypeId === 81 ? ' (English)' : auctionData?.bidSubTypeId === 82 ? ' (Dutch)' :
			auctionData?.bidSubTypeId === 83 ? ' (Japanese)' : '';
		return base + sub;
	};

	const rankLabel = () => {
		if (auctionData?.bidTypeID === 1 || auctionData?.bidTypeID === 5) {
			return auctionData?.showRankToVendor === 'Y' ? 'As H1, H2, H3 etc.' :
				auctionData?.showRankToVendor === 'N' ? 'As H1 Or Not H1.' :
					auctionData?.showRankToVendor === 'T' ? 'Traffic Light.' : 'Unknown Rank';
		}
		return auctionData?.showRankToVendor === 'Y' ? 'As L1, L2, L3 etc.' :
			auctionData?.showRankToVendor === 'N' ? 'As L1 Or Not L1.' :
				auctionData?.showRankToVendor === 'T' ? 'Traffic Light.' : 'Unknown Rank';
	};

	return (
		<div style={{ position: 'sticky', top: 0, zIndex: 99, backgroundColor: 'white' }}>
			<Accordion
				expanded={expanded}
				onChange={onExpandChange}
				disableGutters elevation={0} square
				sx={{ '&:before': { display: 'none' } }}
			>
				<AccordionSummary
					expandIcon={<HiChevronDown style={{ color: 'white', fontSize: '16px', margin: '2px' }} />}
					className='px-2 auctionDetail-accordion'
					sx={{
						minHeight: '38px !important',
						maxHeight: '38px !important',
						'&.Mui-expanded': { minHeight: '38px !important', maxHeight: '38px !important' },
						'& .MuiAccordionSummary-content': { margin: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
						'& .MuiAccordionSummary-content.Mui-expanded': { margin: '0' },
					}}
				>
					{/* Left: back arrow + event code */}
					<div className='d-flex align-items-center text-white'>
						<div className='f14 fw500 ms-1'>{auctionData?.eventCode}</div>
					</div>

					{/* Right: timer + controls + icons */}
					<div className='d-flex align-items-center'>
						{bidStatus !== null ? (
							<>
								{bidStatus === "not_started" && (
									<div className="bid-running-text me-3 fw-bold text-white" style={{ fontSize: '14px' }}>
										Bid Start Date: <span style={{ color: '#ffc1a8' }}>{formatDateViaLocale(auctionData?.bidStDate, userDetail)}</span>
										&nbsp;&nbsp;| Bid starts in (hh:mm:ss): <span style={{ color: '#ffc1a8' }}>{timeRemaining}</span>
									</div>
								)}
								{bidStatus === "running" && auctionData?.stage !== 'Paused' && (
									<div className="bid-running-text me-3 fw-bold text-white" style={{ fontSize: '14px' }}>
										Bid End Date: <span style={{ color: '#ffc1a8' }}>{formatDateViaLocale(auctionData?.bidEndDate, userDetail)}</span>
										&nbsp;&nbsp;| Running (hh:mm:ss): <span>{timeRemaining}</span>
									</div>
								)}
								{bidStatus !== "running" && bidStatus !== "not_started" && (
									<span className='fw-bold text-white me-3' style={{ fontSize: '14px' }}>Bid status: Close</span>
								)}
								{auctionData?.bidClosingType !== 'S' && (
									<div className="d-inline-flex align-items-center me-1">
										<Button variant="standard" className="p-0 auction-custom-button"
											onClick={(e) => { e.stopPropagation(); onDecrease(); }}
											disabled={bidStatus !== "running" || !hasEditPermission || auctionData?.extensions > 0}
											style={{ fontSize: "1.2rem", padding: "6px", minWidth: "36px" }}>
											<HiMinusSm />
										</Button>
										<TextField variant="outlined" size="small" type="number"
											value={adjustValue}
											style={{ width: "72px", minWidth: "72px" }}
											inputProps={{ min: 0, maxLength: 7, inputMode: 'numeric', pattern: "[0-9]*", style: { paddingTop: "2px", paddingBottom: "2px" } }}
											onKeyDown={(e) => {
												if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab')
													e.preventDefault();
											}}
											onChange={onDurationChange}
											disabled={bidStatus !== "running" || !hasEditPermission}
											onClick={(e) => e.stopPropagation()}
										/>
										<Button variant="standard" className="p-0 auction-custom-button"
											onClick={(e) => { e.stopPropagation(); onIncrease(); }}
											disabled={bidStatus !== "running" || !hasEditPermission}
											style={{ fontSize: "1.2rem", padding: "6px", minWidth: "36px" }}>
											<HiPlusSm />
										</Button>
										<span className="text-white mx-1">|</span>
										<Button variant="standard" className="p-0 auction-custom-button"
											onClick={(e) => { e.stopPropagation(); onGoClick(); }}
											disabled={bidStatus !== "running" || !isValueChanged || adjustValue === auctionData?.bidDuration || !hasEditPermission}>
											<span className="f14 fw500 text-white">Go</span>
										</Button>
										<span className="text-white mx-1">|</span>
									</div>
								)}
							</>
						) : (
							<span className='fw-bold text-white me-3' style={{ fontSize: '14px' }}>Bid status: Close</span>
						)}
						<Tooltip title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
							<IconButton onClick={(e) => { e.stopPropagation(); onToggleFullScreen(); }} size="small" className="pointer text-white">
								{isFullScreen ? <TiArrowMinimise className="text-white f15" /> : <TbWindowMaximize className="text-white f15" />}
							</IconButton>
						</Tooltip>
						<span className="text-white mx-1">|</span>
						<Tooltip title="Open/Close Chat">
							<IconButton onClick={(e) => { e.stopPropagation(); onToggleChat(); }} size="small" className="pointer text-white">
								<ChatOutlined style={{ fontSize: '15px' }} />
							</IconButton>
						</Tooltip>
					</div>
				</AccordionSummary>

				<hr className='m-0 p-0 mx-2' />
				<AccordionDetails className='p-2 pb-2 mb-3'>
					{/* Subject — full width with Read More */}
					<div className='pb-1 mb-2'>
						<div className='d-flex align-items-baseline'>
							<span style={{ ...labelStyle, flexShrink: 0, marginRight: '6px' }}>Subject:</span>
							<span style={{ fontSize: '13px', fontWeight: 500, color: '#101828', wordBreak: 'break-word' }}>
								{subjectExpanded || (auctionData?.subject?.length ?? 0) <= TRUNCATE_LEN
									? auctionData?.subject
									: auctionData?.subject?.slice(0, TRUNCATE_LEN + 5) + '…'}
								{(auctionData?.subject?.length ?? 0) > TRUNCATE_LEN && (
									<span
										onClick={() => setSubjectExpanded(p => !p)}
										style={{ color: '#1976d2', cursor: 'pointer', fontSize: '12px', marginLeft: '4px', fontWeight: 500 }}
									>
										{subjectExpanded ? 'Show less' : 'Read more'}
									</span>
								)}
							</span>
							{bidStatus !== "running" && bidStatus !== null && hasEditPermission && (
								<HiPencilAlt className="text-primary ms-1" size={14} style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => onEditField('subject')} />
							)}
						</div>
					</div>

					{/* Fields grid — 3 columns, each cell is label + value */}
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px 12px' }}>
						<InfoField label="Start Time">{formatDateViaLocale(auctionData?.bidStDate, userDetail)}</InfoField>
						<InfoField label="End Time">{formatDateViaLocale(auctionData?.bidEndDate, userDetail)}</InfoField>
						<InfoField label="Closing Type">
							{auctionData?.bidClosingType === 'A' ? 'All items in one go' : 'Stagger At Item Level'}
						</InfoField>
						{auctionData?.prebid && auctionData?.preBidStDate && auctionData?.preBidEndDate && (
							<>
								<InfoField label="Prebid Start">{formatDateViaLocale(checkUTC(auctionData?.preBidStDate), userDetail)}</InfoField>
								<InfoField label="Prebid End">{formatDateViaLocale(checkUTC(auctionData?.preBidEndDate), userDetail)}</InfoField>
							</>
						)}
						<InfoField label="Config Duration (mins)">{auctionData?.bidDuration}</InfoField>
						<InfoField label="Actual Duration (mins)">
							{auctionData?.bidDuration + (auctionData?.extensionDuration * auctionData?.extensions ?? 0)}
						</InfoField>
						<InfoField label="Type">{auctionTypeLabel()}</InfoField>
						<InfoField label="Mask Participants">{auctionData?.hideVendor === false ? 'No' : 'Yes'}</InfoField>
						<InfoField label="Mask Quote">{auctionData?.hideQuote === false ? 'No' : 'Yes'}</InfoField>
						<div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
							<span style={labelStyle}>Display Vendors Rank:</span>
							<span style={valueStyle}>{rankLabel()}</span>
							{bidStatus !== null && hasEditPermission && (
								<HiPencilAlt className="text-primary" size={13} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => onEditField('showRankToVendor')} />
							)}
						</div>
						<div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
							<span style={labelStyle}>Max No. of Extensions:</span>
							<span style={valueStyle}>{auctionData?.maximumExtension === -1 ? 'Unlimited' : auctionData?.maximumExtension}</span>
							{bidStatus !== null && hasEditPermission && (
								<HiPencilAlt className="text-primary" size={13} style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => onEditField('maximumExtension')} />
							)}
						</div>
						<InfoField label="No Of Extensions">{auctionData?.extensions ?? 0}</InfoField>
						{auctionData?.isMultiCurrency && (
							<InfoField label="Base Currency">{auctionData?.baseCurrency}</InfoField>
						)}
						<div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
							<span style={labelStyle}>Currency Mode:</span>
							<span style={valueStyle}>{auctionData?.isMultiCurrency ? 'Multi Currency' : auctionData?.baseCurrency}</span>
							{auctionData?.isMultiCurrency && (
								<IconButton onClick={onToggleCurrencyTable} className="p-0" size="small">
									{showCurrencyTable ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
								</IconButton>
							)}
						</div>
						{auctionData?.bidClosingType === 'S' && (
							<div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
								<span style={labelStyle}>Running Slot:</span>
								<span style={valueStyle}>
									{runningSlotNumber !== null ? (
										<Button className='p-0' variant='standard' size='small' onClick={onRunningSlotClick} style={{ cursor: 'pointer' }}>
											<span style={{ color: '#218cde', fontSize: '13px', fontWeight: 'bold' }}>Slot {runningSlotNumber}</span>
										</Button>
									) : <span>No slot running</span>}
								</span>
							</div>
						)}
					</div>

					{/* Multi-currency expandable table */}
					{auctionData?.isMultiCurrency && showCurrencyTable && auctionData?.multicurrencytList?.length > 0 && (
						<div className="mt-1">
							<TableContainer>
								<Table size="small" aria-label="currency table">
									<TableHead>
										<TableRow>
											<TableCell sx={{ pl: 0, fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Currency</TableCell>
											<TableCell align="right" sx={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Conversion Factor</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{auctionData.multicurrencytList.map((row, index) => (
											<TableRow key={index}>
												<TableCell sx={{ pl: 0, width: '160px', fontSize: '13px' }}>{row?.baseCurrency}</TableCell>
												<TableCell align="right" sx={{ fontSize: '13px' }}>{row?.currencyConversion}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</div>
					)}

					{/* Bid Description with Read More */}
					<div className='mt-2 pt-1'>
						<div className='d-flex align-items-baseline' style={{ gap: '6px' }}>
							<span style={{ ...labelStyle, flexShrink: 0 }}>
								Bid Description:

							</span>
							{(() => {
								const raw = auctionData?.description?.replace(/<\/?[^>]+(>|$)/g, '') || '—';
								const truncated = raw.length > TRUNCATE_LEN && !descExpanded;
								return (
									<span style={{ ...valueStyle, wordBreak: 'break-word' }}>
										{truncated ? raw.slice(0, TRUNCATE_LEN) + '…' : raw}
										{raw.length > TRUNCATE_LEN && (
											<span
												onClick={() => setDescExpanded(p => !p)}
												style={{ color: '#1976d2', cursor: 'pointer', fontSize: '12px', marginLeft: '4px', fontWeight: 500 }}
											>
												{descExpanded ? 'Show less' : 'Read more'}
											</span>
										)}
									</span>
								);
							})()}
							{bidStatus !== "running" && bidStatus !== null && hasEditPermission && (
								<HiPencilAlt className="text-primary ms-1" size={13} style={{ cursor: 'pointer' }} onClick={() => onEditField('description')} />
							)}
						</div>
					</div>
				</AccordionDetails>
			</Accordion>
		</div>
	);
}
