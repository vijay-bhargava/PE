import React, { useEffect, useState } from 'react'
import { useStateValue } from '../../store';
import {
	Box, Divider, Stack,
	Tooltip, Typography
} from '@mui/material';
import { Table } from "react-bootstrap";
import PEModal from "../PEModal";
import WhiteTooltip from '../whitetooltip';
import { InfoOutlined } from "@mui/icons-material";
import { formatDateViaLocale } from '../../utils/common/utility';
import EventQuoteSealed from './EventQuoteSealed';
import SupplierIndividualReport from "../../pages/Configuration/RequestForQuotation/SupplierIndividualReport";

const EventCommercialComparativeScreen = ({ rfqItemsList, vendorItemAnalysis, rfqPackageCommercial, rfqheaderdetails, openQuotes, vendorId, permissionManager }) => {
	const [{ atoken, rtoken, customerid, usertimezone, customersuffix, userdialingcode, roleClaims, userDetail }, dispatch, thousands_separators] = useStateValue();
	const [mergedData, setMergedData] = useState([]);
	const [commercialresponses, setCommercialResponses] = useState(null);

	const [openLoadingF, SetLoadingF] = useState(false);
	const handleCloseLoadingF = () => SetLoadingF(false);
	const [selectedLoadingF, SetSelectedLoadingF] = useState(null);

	const [selectedVendorId, setSelectedVendorId] = useState(null);
	const [supplierModalOpen, setSupplierModalOpen] = useState(false);

	// Helper function to get unique suppliers from commercial responses
	const getUniqueSuppliers = () => {
		if (!commercialresponses) return [];
		return commercialresponses.filter((supplier, index, self) =>
			index === self.findIndex(s => s.id === supplier.id)
		);
	};

	// Helper function to render supplier response for a commercial term
	const renderSupplierResponse = (term, supplier) => {

		const vendorCommercial = JSON.parse(supplier?.vendorCommercial || '[]');
		const otherRemarks = supplier?.otherRemarks || '';
		const termResponse = vendorCommercial?.find((x) => x.TermsId === term?.termsId);
		const remarks = termResponse?.Remarks;

		return (
			<Box
				key={`${term.termsId}-${supplier.id}`}
				sx={{
					minHeight: "120px",
					border: "1px solid #e0e0e0",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "white",
					padding: 2
				}}
			>
				{(openQuotes && openQuotes !== 'N') ? (
					<Typography variant="body1" sx={{ textAlign: 'center' }}>
						{/* {remarks || 'No response'} */}
						{term.id === 'other-remarks' ? otherRemarks : remarks}
					</Typography>
				) : (
					<EventQuoteSealed />
				)}
			</Box>
		);
	};
	useEffect(() => {
		if (vendorItemAnalysis && vendorItemAnalysis?.length > 0) {
			const suppliercommercials = vendorItemAnalysis?.map((v) => {
				return {
					...v,
					vendorItemAnalysis: JSON.parse(v?.vendorItemAnalysis),
				};
			});
			setCommercialResponses(suppliercommercials);
		}
	}, [vendorItemAnalysis, rfqItemsList]);

	useEffect(() => {
		if (rfqPackageCommercial && rfqPackageCommercial.length > 0) {
			// Merging rfqterm with responses per supplier

			const commercialWithDefault = [
				...rfqPackageCommercial,
				{ id: "other-remarks", name: "Other Remarks" }
			];

			let merged = [];
			if (commercialresponses) {

				const supplierresponses = commercialresponses?.reduce((acc, response) => {
					acc[response.id] = response;
					return acc;
				}, {});
				merged = commercialWithDefault.map(rfqterm => {
					return {
						...rfqterm,
						responses: supplierresponses,
					};
				});
				// setMergedData(merged);
			} else {
				merged = commercialWithDefault.map(rfqterm => {
					return {
						...rfqterm,
						responses: [],
					};
				});

			}
			setMergedData(merged);
		}
	}, [rfqItemsList, commercialresponses, rfqPackageCommercial]);

	return (
		<>{mergedData && mergedData.length > 0 ?
			<>
				{/* Card-based layout similar to EventFinancialComparativeScreen */}
				<Box display="flex" gap={1} sx={{ overflowX: 'auto', width: '100%', flexWrap: 'nowrap' }}>
					{/* Commercial Terms Column */}
					<Box sx={{ minWidth: 280, flexShrink: 0 }}>
						{/* Header */}
						<Box sx={{ height: "60px", backgroundColor: "#1976d2", border: "1px solid #e0e0e0" }} p={2}>
							<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }} color="#ffffff">
								COMMERCIAL TERMS
							</Typography>
						</Box>

						{/* Commercial Terms List */}
						<Box>
							{mergedData.map((term, index) => (
								<Box
									key={term.termsId}
									sx={{
										minHeight: "120px",
										border: "1px solid #e0e0e0",
										display: "flex",
										alignItems: "flex-start",
										backgroundColor: "white"
									}}
									p={2}
								>
									<Box sx={{ width: "100%" }}>
										<Stack spacing={0.2}>
											{/* Term Name */}
											<Typography
												variant="h6"
												sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}
											>
												{index + 1}. {term.name}
											</Typography>

											{/* Term Details */}
											{term.remarks && (
												<Typography variant="body2" color="textSecondary">
													<b>Remarks:</b> {term.remarks}
												</Typography>
											)}

											{term.formulavalue && (
												<Typography variant="body2" color="textSecondary">
													<b>Formula:</b> {term.formulavalue}
												</Typography>
											)}

											{/* Info Icon */}
											{term.remarks && (
												<WhiteTooltip title={`Remarks: ${term.remarks}`}>
													<InfoOutlined
														className="f14"
														style={{
															cursor: "pointer",
															color: "#1976d2",
															fontSize: "16px"
														}}
													/>
												</WhiteTooltip>
											)}
										</Stack>
									</Box>
								</Box>
							))}
						</Box>
					</Box>

					{/* Supplier Columns */}
					{getUniqueSuppliers().map((supplier) => {
						const obj = commercialresponses?.find((x) => x.id === supplier.id);

						return (
							<Box key={supplier.id} sx={{ minWidth: 250, flexShrink: 0 }}>
								{/* Supplier Header */}
								<Box sx={{ height: "60px", backgroundColor: "#f5f5f5", border: "1px solid #e0e0e0" }} p={1}>
									<Stack spacing={0.5} sx={{ width: "100%", height: "50%" }}>
										<Stack
											direction="row"
											spacing={1}
											sx={{
												width: "100%",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<Tooltip
												title={
													<>
														<Typography variant="body2" sx={{ fontSize: "12px", color: "white" }}>
															{obj?.contactPerson} {"|"} {obj?.email}
														</Typography>
														<Typography variant="body2" sx={{ fontSize: "12px", color: "white" }}>
															# {obj?.mobile}
														</Typography>
													</>
												}
											>
												<Typography
													variant="h6"
													sx={{ fontWeight: "bold", cursor: "pointer", }}
													onClick={() => {
														if (!vendorId) {
															setSelectedVendorId(obj?.vendorId);
															setSupplierModalOpen(true);
														}
													}}
												>
													{obj?.tradeName?.toUpperCase()}
												</Typography>
											</Tooltip>

										</Stack>
										<Divider />
										<Stack sx={{ width: "100%", height: "50%" }}>
											<Typography variant="body2" sx={{ fontSize: '12px' }}>
												Submission Time:{' '}
												{obj?.submissionDate
													? formatDateViaLocale(obj?.submissionDate, userDetail)
													: ""}
											</Typography>
										</Stack>
									</Stack>
								</Box>

								{/* Supplier Responses */}
								<Box>
									{mergedData.map((term) => renderSupplierResponse(term, supplier))}
								</Box>
							</Box>
						);
					})}
				</Box>

				{/* {loading factor modal} */}
				<PEModal
					open={openLoadingF}
					onClose={() => handleCloseLoadingF()}
					size="md"
					title="Loading Factor"
				>
					<div className="p-3">
						<div
							className="row"
							style={{
								paddingLeft: ".7rem",
								paddingRight: ".7rem",
								paddingTop: ".7rem",
							}}
						>
							<Table striped bordered hover responsive className="mb-0 pb0">
								<thead>
									<tr>
										<th className="f12 fw500">Reason</th>
										<th className="f12 fw500"> Loading Type</th>
										<th className="f12 fw500">Loading Factor</th>
										<th className="f12 fw500">Loading Factor Amount</th>
									</tr>
								</thead>
								<tbody>
									{selectedLoadingF &&
										selectedLoadingF?.map((loading) => {
											return (
												<>
													<tr>
														<td className="f12 fw400">
															{loading?.FactorDesc}
														</td>
														<td className="f12 fw400">
															{loading?.FactorType === "P"
																? "Percentage"
																: "Absolute"}
														</td>
														<td className="f12 fw400">
															{loading?.FactorType === "P"
																? loading?.FactorPerc
																: ""}
														</td>

														<td className="f12 fw400">
															{loading?.LoadingAmount}{" "}
														</td>
													</tr>
												</>
											);
										})}
								</tbody>
							</Table>
						</div>
					</div>
				</PEModal>
				<SupplierIndividualReport
					open={supplierModalOpen}
					onClose={() => setSupplierModalOpen(false)}
					vendorId={selectedVendorId}
					permissionManager={permissionManager}
				/>
			</> : <>
				<Typography variant="h6" color="textSecondary" align="center">No Commercial Terms Selected</Typography>
			</>
		}
		</>
	)
}

export default EventCommercialComparativeScreen
