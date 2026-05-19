import React, { useEffect, useState } from "react";
import { useStateValue } from "../../store";
import {
	Box,
	Button,
	Divider,
	Grid,
	IconButton,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
	Collapse,
	tableCellClasses,
	MenuItem
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { DropdownButton, Modal } from "react-bootstrap";
import { CommentOutlined, InfoOutlined, ExpandMore, ExpandLess } from "@mui/icons-material";
import LaunchIcon from '@mui/icons-material/Launch';
import { FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";
import { HiDotsVertical, HiX } from 'react-icons/hi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";
import { MdCloseFullscreen, MdFullscreen } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { formatDateViaLocale } from "../../utils/common/utility";
import { FaUserLock } from "react-icons/fa";
import EventQuoteSealed from "./EventQuoteSealed";
import SupplierIndividualReport from "../../pages/Configuration/RequestForQuotation/SupplierIndividualReport";
import WhiteTooltip from '../whitetooltip'
import ComparisonTable from "./ComparisonScreen/ComparisonTable";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // [`&.${tableCellClasses.head}`]: {
  //   backgroundColor: 'rgb(26, 39, 66)',
  //   color: theme.palette.common.white,
  // },
  [`&.${tableCellClasses.root}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  border: `1px solid rgba(224, 224, 224, 1)`,
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  // hide last border
  // '&:last-child td, &:last-child th': {
  //   border: 0,
  // },
}));

const EventFinancialComparativeScreen = ({
	rfqItemsList,
	linewiseItemLowest,
	vendorItemAnalysis,
	rfqheaderdetails,
	openQuotes,
	showcommercial = true, // Default to true to always show commercial terms
	handleLoadingFactorNew,
	handleSupplierAction,
	handleLoadingFactorClick,
	currentStage,
	stagearray,
	vendorId,
	permissionManager
}) => {
	const [
		{
			atoken,
			rtoken,
			customerid,
			usertimezone,
			customersuffix,
			userdialingcode,
			roleClaims,
			userDetail,
		},
		dispatch,
		thousands_separators,
	] = useStateValue();
	const { pageSlug, supplierid } = useParams();
	const navigate = useNavigate();
	const [mergedData, setMergedData] = useState([]);
	const [columns, setColumns] = useState([]);
	const [commercialresponses, setCommercialResponses] = useState(null);

	const [openLoadingF, SetLoadingF] = useState(false);
	const handleCloseLoadingF = () => SetLoadingF(false);
	const [selectedLoadingF, SetSelectedLoadingF] = useState(null);
	const handleOpenLoadingF = (v) => {
		SetLoadingF(true);
		SetSelectedLoadingF(v);
	};
	// const [showcommercial, setShowCommercial] = useState(false)
	const [selectedVendorId, setSelectedVendorId] = useState(null);
	const [supplierModalOpen, setSupplierModalOpen] = useState(false);
	const [expandedItems, setExpandedItems] = useState(new Set());
	const [packageLevelExpanded, setPackageLevelExpanded] = useState(false);

	// Always show commercial terms with accordion functionality
	const shouldShowCommercial = true;

	// Function to toggle accordion state
	const toggleItemExpansion = (itemId) => {
		setExpandedItems(prev => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) {
				newSet.delete(itemId);
			} else {
				newSet.add(itemId);
			}
			return newSet;
		});
	};

	// Function to toggle package level accordion
	const togglePackageLevelExpansion = () => {
		setPackageLevelExpanded(prev => !prev);
	};

	// Function to check if any supplier has package-level commercial terms with currency/percentage
	const hasPackageLevelCommercialTerms = () => {
		return commercialresponses?.some(supplier => 
			supplier.vendorCommercial && 
			Array.isArray(supplier.vendorCommercial) && 
			supplier.vendorCommercial.some(term => 
				term.Valuetype === "Currency" || term.Valuetype === "Percentage"
			)
		);
	};

	// useEffect(() =>{
	//
	//     if(vendorId){
	//         supplierid = vendorId;
	//     }
	// },[vendorId])
	useEffect(() => {
		if (vendorItemAnalysis) {
			const suppliercommercials = vendorItemAnalysis?.map((v) => {
				return {
					...v,
					vendorItemAnalysis: JSON.parse(v?.vendorItemAnalysis), // Only include the fields you need
					vendorCommercial: JSON.parse(v?.vendorCommercial || "[]"),
				};
			});

			setCommercialResponses(suppliercommercials);
		}
	}, [vendorItemAnalysis, rfqItemsList]);

	useEffect(() => {
		if (rfqItemsList && rfqItemsList.length > 0) {
			// Merging rfqitem with responses per supplier
			if (commercialresponses) {
				const merged = rfqItemsList.map((rfqitem) => {
					const supplierresponses = commercialresponses?.reduce(
						(acc, response) => {
							const itemresponse = response.vendorItemAnalysis?.find(
								(item) => item.id === rfqitem.id
							);

							acc[response.id] = itemresponse;

							return acc;
						},
						{}
					);
					// 
					const ItemLowest = linewiseItemLowest?.find(
						(item) => item.id === rfqitem.id
					);

					return {
						...rfqitem,
						responses: supplierresponses,
						ItemLowestPrice: ItemLowest?.ItemLowestQuotes,
					};
				});

				setMergedData(merged);
			} else {
				const merged = rfqItemsList.map((rfqitem) => {
					return {
						...rfqitem,
						responses: [],
					};
				});
				setMergedData(merged);
			}

			const itemcolumn = [
				{
					accessorKey: "id",
					header: "#",
					enableColumnOrdering: false,
					enableResizing: false,
					//size: 100,
					size: 20,
					muiTableBodyCellProps: {
						align: "left",
					},

					muiTableBodyRowProps: {
						verticalAlign: "top",
					},

					Cell: ({ cell }) => {
						const index = cell.row.index + 1;
						return (
							<Typography
								variant="body2"
								sx={{
									textAlign: "left",
									fontSize: "12px",
									padding: 0,
									minWidth: "auto",
								}}
							>
								{index}
							</Typography>
						);
					},
				},
				{
					accessorKey: "itemName",
					header: "Item",
					enableColumnOrdering: false,
					minWidth: 10,
					muiTableBodyCellProps: {
						align: "left",
					},
					muiTableBodyRowProps: {
						verticalAlign: "top",
					},

					Footer: () => (
						<table
							style={{
								width: "100%",
								borderCollapse: "collapse",
								fontSize: 13,
							}}
						>
							<tbody>
								{[
									"Package Price:",
									"Loading Factor:",
									"Amount:",
									"Commercial Ranking:",
								].map((label, idx) => (
									<tr
										key={idx}
										style={{
											borderBottom: "1px solid rgba(224, 224, 224, 1)",
											backgroundColor: "white",
										}}
									>
										<td style={{ padding: "8px", fontWeight: "bold" }}>
											{label}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					),

					Cell: ({ cell }) => {
						const response = cell.row._valuesCache[`responses.${supplierid}`];
						const CommercialItem = response?.CommercialItem;
						const item = cell.row.original;
						const maxLength = 50;
						const isLong = item.itemDesc.length > maxLength;
						const truncatedText = isLong
							? item.itemDesc.substring(0, maxLength) + "..."
							: item.itemDesc;

						const offeredprice = response?.SupplierPrice;

						return (
							<Stack spacing={0.2}>
								{item.itemName && (
									<Typography variant="body1" sx={{ fontWeight: "bold" }}>
										{item.itemName}
										<Tooltip title={`Description: ${item?.itemDesc}`}>
											<span
												className="ms-2"
												style={{
													cursor: "pointer",
													color: "#1976d2",
													fontSize: "12px",
												}}
											>
												<InfoOutlined className="f14" />
											</span>
										</Tooltip>
										<Tooltip title={`Remark: ${item?.remarks}`}>
											<span
												className="ms-2"
												style={{
													cursor: "pointer",
													color: "#1976d2",
													fontSize: "12px",
												}}
											>
												<CommentOutlined className="f14" />
											</span>
										</Tooltip>
									</Typography>
								)}

								{item.itemCode && (
									<Typography variant="body2" color="textSecondary">
										<b>Item Code:</b> {item.itemCode}
									</Typography>
								)}

								{item.targetPrice != 0 && (
									<Typography variant="body2" color="textSecondary">
										<b>Target Price:</b> {item.targetPrice}
									</Typography>
								)}

								{item.quantity && (
									<Typography variant="body2" color="textSecondary">
										<b>Quantity:</b> {item.quantity} {item.uom}
									</Typography>
								)}
								{CommercialItem &&
									CommercialItem?.length > 0 &&
									shouldShowCommercial && (
										<TableContainer sx={{ mt: 1, width: "100%" }}>
											<Table
												size="small"
												aria-label="commercial items table"
												sx={{
													width: "100%",
													borderCollapse: "collapse",
													fontSize: 13,
												}}
											>
												<TableBody>
													{CommercialItem.map((comm, index) => (
														<StyledTableRow
															key={index}
															sx={{
																borderBottom:
																	"1px solid rgba(224, 224, 224, 1)",
																backgroundColor: "white",
															}}
														>
															<StyledTableCell
																colSpan={8} // Stretch across all columns
																sx={{
																	padding: "8px",
																	fontWeight: "bold",
																	fontSize: 13,
																	width: "100%",
																	borderBottom:
																		"1px solid rgba(224, 224, 224, 1)",
																}}
															>
																<Typography
																	variant="body2"
																	color="textSecondary"
																>
																	{comm?.Name}
																</Typography>
															</StyledTableCell>
														</StyledTableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
									)}
							</Stack>
						);
					},
				},
			];

			const lowestpricecolumn = !commercialresponses
				? []
				: commercialresponses.length < 2
				? []
				: [
						{
							accessorKey: "ItemLowestPrice",
							header: "Linewise Lowest Price",
							enableColumnOrdering: false,
							minWidth: 10,
							muiTableBodyCellProps: {
								align: "left",
							},
							muiTableBodyRowProps: {
								verticalAlign: "top",
							},
							Header: ({ column }) => {
								return (
									<>
										<div>
											<b
												style={{
													color: "#2A68D3",
													textDecoration: "underline",
												}}
											>
												{"Lowest Price"}
											</b>
										</div>
									</>
								);
							},

							Cell: ({ cell }) => {
								const item = cell.row.original;
								const offeredprice = item.ItemLowestPrice;
								let Amount = 0;
								if (!isNaN(item.ItemLowestPrice)) {
									Amount =
										parseFloat(item.ItemLowestPrice) *
										parseFloat(item.quantity);
									Amount = thousands_separators(Amount);
								} else {
									Amount = item.ItemLowestPrice;
								}

								return (
									<Stack spacing={0.2}>
										{/* Example: Additional Information (Modify as needed) */}
										{item.ItemLowestPrice && (
											<Typography variant="body1" sx={{ fontWeight: "bold" }}>
												{offeredprice}{" "}
												{openQuotes && openQuotes != "N"
													? rfqheaderdetails[0]?.baseCurrency
													: ""}
											</Typography>
										)}

										{Amount && (
											<Typography variant="body2" color="textSecondary">
												<b>
													Amount : {Amount}{" "}
													{openQuotes && openQuotes != "N"
														? rfqheaderdetails[0]?.baseCurrency
														: ""}
												</b>
											</Typography>
										)}
									</Stack>
								);
							},
						},
				  ];

			// Define columns dynamically based on suppliers' unique id
			const supplierNames = Array.from(
				new Set(commercialresponses?.flatMap((response) => response.id))
			);
			const responseColumns = supplierNames.map((supplierid) => ({
				accessorKey: `responses.${supplierid}`,
				header: supplierid,

				enableColumnOrdering: true,
				enableSorting: false,
				Header: ({ column }) => {
					const obj = commercialresponses?.find(
						(x) => x.id == column?.columnDef?.header
					);
					const commercialranking = obj?.vendorRanking ?? "N/A";

					return (
						<>
							<WhiteTooltip
								title={
									<div className="row">
										<div className="col-md-12">
											<div>
												{obj?.tradeName}
												{" | "}
												{obj?.contactPerson} {"|"} {obj?.email}
											</div>
										</div>
										<div className="col-md-12">
											<div>Mobile : {obj?.mobile}</div>
										</div>
										<div className="col-md-12">
											<div>
												Submission Time :{" "}
												{obj?.submissionDate
													? formatDateViaLocale(obj?.submissionDate, userDetail)
													: ""}
											</div>
										</div>
									</div>
								}
							>
								<div
									style={{ cursor: "pointer" }}
									// onClick={() => navigate(`/manage-rfq/${pageSlug}/supplier-individual-report/${obj?.vendorId}?tab=report&eventid=${pageSlug}`)}
									//                                     onClick={() => {
									//   const currentQuery = new URLSearchParams(window.location.search);
									//   const tab = currentQuery.get("tab");
									//   const eventid = currentQuery.get("eventid");
									//   const actionType = currentQuery.get("ActionType");
									//   const activityId = currentQuery.get("ActivityId");

									//   const queryString = [
									//     tab && `tab=${tab}`,
									//     eventid && `eventid=${eventid}`,
									//     actionType && `ActionType=${actionType}`,
									//     activityId && `ActivityId=${activityId}`
									//   ].filter(Boolean).join("&");

									//   navigate(`/manage-rfq/${pageSlug}/supplier-individual-report/${obj?.vendorId}?${queryString}`);

									// }}
									onClick={() => {
										setSelectedVendorId(obj?.vendorId);
										setSupplierModalOpen(true);
									}}
								>
									<b
										style={{
											textDecoration: "underline",
											color: `${
												commercialranking == 1 ? "#155724" : "#2A68D3"
											}`,
										}}
									>
										{obj?.tradeName}
									</b>
								</div>
							</WhiteTooltip>
						</>
					);
				},
				//                 Footer: ({ column }) => {
				//   const response = commercialresponses?.find(x => x.id === column?.columnDef?.header);

				//   let loadingFactors = null;
				//   try {
				//     loadingFactors = JSON.parse(response?.loadingFactors);
				//   } catch {
				//     loadingFactors = null;
				//   }

				//   let packagePrice = 0;
				//   if (!isNaN(response?.packagePrice)) {
				//     packagePrice = thousands_separators(parseFloat(response.packagePrice));
				//   } else {
				//     packagePrice = response?.packagePrice || '-';
				//   }

				//   const vendorAmount = response?.vendorAmount || '-';
				//   const commercialranking = response?.vendorRanking ?? 'N/A';
				//   const currency = rfqheaderdetails[0]?.baseCurrency || '';

				//   return (
				//     <Stack spacing={0.3} sx={{ fontSize: 13 }}>
				//       <Typography variant="body2">{`${packagePrice} ${currency}`}</Typography>

				//       {loadingFactors ? (
				//         <Typography
				//           variant="body2"
				//           sx={{ cursor: 'pointer', color: 'blue' }}
				//           onClick={() => handleOpenLoadingF(loadingFactors)}
				//         >
				//           View
				//         </Typography>
				//       ) : (
				//         <Typography variant="body2">N/A</Typography>
				//       )}

				//       <Typography variant="body2">{`${vendorAmount} ${currency}`}</Typography>
				//       <Typography variant="body2">{`L${commercialranking}`}</Typography>
				//     </Stack>
				//   );
				// },

				Footer: ({ column }) => {
					const response = commercialresponses?.find(
						(x) => x.id === column?.columnDef?.header
					);
					let loadingFactors = null;
					try {
						loadingFactors = JSON.parse(response?.loadingFactors);
					} catch {
						loadingFactors = null;
					}

					const currency = rfqheaderdetails[0]?.baseCurrency || "";

					const packagePrice = !isNaN(response?.packagePrice)
						? `${thousands_separators(
								parseFloat(response.packagePrice)
						  )} ${currency}`
						: response?.packagePrice || "-";

					const vendorAmount = `${response?.vendorAmount || "-"} ${currency}`;

					const vendorRanking = response?.vendorRanking;

					const commercialranking = vendorRanking ? (
						<span
							style={{
								marginLeft: "0.5rem",
								color: vendorRanking === 1 ? "#155724" : "#721c24",
								backgroundColor: vendorRanking === 1 ? "#d4edda" : "#f8d7da",
								padding: "0.2rem",
								borderRadius: "4px",
								minWidth: "2rem",
								display: "inline-block",
								textAlign: "center",
							}}
						>
							{`L${vendorRanking}`}
						</span>
					) : (
						"N/A"
					);
					//   const commercialranking = `L${response?.vendorRanking ?? 'N/A'}`;

					const rows = [
						packagePrice,
						loadingFactors ? (
							<Typography
								variant="body3"
								sx={{ cursor: "pointer", color: "blue", display: "inline" }}
								onClick={() => {
									handleLoadingFactorNew(response);
									// callback();
								}}
							>
								View
							</Typography>
						) : (
							<Typography
								variant="body3"
								sx={{ cursor: "pointer", color: "blue", display: "inline" }}
								onClick={() => {
									handleLoadingFactorNew(response);
									// callback();
								}}
							>
								N/A
							</Typography>
						),
						vendorAmount,
						commercialranking,
					];

					return (
						<table
							style={{
								width: "100%",
								borderCollapse: "collapse",
								fontSize: 13,
							}}
						>
							<tbody>
								{rows.map((value, idx) => (
									<tr
										key={idx}
										style={{
											borderBottom: "1px solid rgba(224, 224, 224, 1)",
											backgroundColor: "white",
										}}
									>
										<td style={{ padding: "8px", textAlign: "left" }}>
											{value}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					);
				},

				// Footer: ({ column }) => {
				//   // Find matching commercial response for the column header
				//   const response = commercialresponses?.find(x => x.id === column?.columnDef?.header);

				//   // Parse loadingFactors safely
				//   let loadingFactors = null;
				//   try {
				//     loadingFactors = JSON.parse(response?.loadingFactors);
				//   } catch {
				//     loadingFactors = null;
				//   }

				//   // Format packagePrice nicely
				//   let packagePrice = 0;
				//   if (!isNaN(response?.packagePrice)) {
				//     packagePrice = thousands_separators(parseFloat(response.packagePrice));
				//   } else {
				//     packagePrice = response?.packagePrice || '-';
				//   }

				//   const vendorAmount = response?.vendorAmount || '-';
				//   const commercialranking = response?.vendorRanking ?? 'N/A';

				//   // Base currency from your rfqheaderdetails
				//   const currency = rfqheaderdetails[0]?.baseCurrency || '';

				//   const rows = [
				//     { label: 'Package Price:', value: `${packagePrice} ${currency}` },
				//     { label: 'Loading Factor:', value: loadingFactors ? (
				//       <Typography
				//         variant="body2"
				//         sx={{ cursor: 'pointer', color: 'blue', display: 'inline' }}
				//         onClick={() => handleOpenLoadingF(loadingFactors)}
				//       >
				//         View
				//       </Typography>
				//     ) : 'N/A' },
				//     { label: 'Amount:', value: `${vendorAmount} ${currency}` },
				//     { label: 'Commercial Ranking:', value: `L${commercialranking}` },
				//   ];

				//   return (
				//     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
				//       <tbody>
				//         {rows.map((row, idx) => (
				//           <tr
				//             key={idx}
				//             style={{
				//               borderTop: idx === 0 ? 'none' : '1px solid rgba(224, 224, 224, 1)',
				//               backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa'
				//             }}
				//           >
				//             <td
				//               style={{
				//                 padding: '8px',
				//                 fontWeight: 'bold',
				//                 borderRight: '1px solid rgba(224, 224, 224, 1)',
				//                 width: '50%',
				//                 whiteSpace: 'nowrap',
				//               }}
				//             >
				//               {row.label}
				//             </td>
				//             <td style={{ padding: '8px' }}>
				//               {row.value}
				//             </td>
				//           </tr>
				//         ))}
				//       </tbody>
				//     </table>
				//   );
				// },

				//              Footer: ({ column }) => {

				//                     const response = commercialresponses?.find(x => x.id == column?.columnDef?.header);

				//                     const loadingFactors = JSON.parse(response?.loadingFactors);
				//                     let packagePrice = 0;
				//                     if (!isNaN(response.packagePrice)) {
				//                         packagePrice = parseFloat(response.packagePrice)
				//                         packagePrice = thousands_separators(packagePrice)
				//                     }
				//                     else {
				//                         packagePrice = response?.packagePrice;
				//                     }
				//                     const vendorAmount = response?.vendorAmount;
				//                     const commercialranking = response?.vendorRanking ?? 'N/A';

				//                     const vendorCommercial = JSON.parse(response?.vendorCommercial)?.filter(x => x.Valuetype == "Percentage" || x.Valuetype == "Currency");
				//                     const loadingAmount = response?.loadingAmount;
				//                     // Determine rank-based styles
				//                     const isBest = commercialranking == 1;
				//                     const isWorst = commercialranking == commercialresponses?.length;
				//   return (
				//     <Stack spacing={0.5}>
				//       <Box display="flex" justifyContent="space-between">
				//         <Typography variant="body2"><b>Package Price:</b></Typography>
				//         <Typography variant="body2">{packagePrice} {rfqheaderdetails[0]?.baseCurrency}</Typography>
				//       </Box>

				//       <Box display="flex" justifyContent="space-between">
				//         <Typography variant="body2"><b>Loading Factor:</b></Typography>
				//         <Typography
				//           variant="body2"
				//           sx={{
				//             cursor: loadingFactors ? 'pointer' : 'default',
				//             color: loadingFactors ? 'blue' : 'textSecondary'
				//           }}
				//           onClick={() => loadingFactors && handleOpenLoadingF(loadingFactors)}
				//         >
				//           {loadingFactors ? "View" : "N/A"}
				//         </Typography>
				//       </Box>

				//       <Box display="flex" justifyContent="space-between">
				//         <Typography variant="body2"><b>Amount:</b></Typography>
				//         <Typography variant="body2">{vendorAmount} {rfqheaderdetails[0]?.baseCurrency}</Typography>
				//       </Box>

				//       <Box display="flex" justifyContent="space-between">
				//         <Typography variant="body2"><b>Commercial Ranking:</b></Typography>
				//         <Typography variant="body2">L{commercialranking}</Typography>
				//       </Box>
				//     </Stack>
				//   );
				// },

				// Footer: ({ column }) => {
				//   const response = commercialresponses.find(x => x.id === column.columnDef.header);
				//   if (!response) return null;

				//   if (openQuotes === 'N') {
				//     return <EventQuoteSealed />;
				//   }

				//   // If quotes are open, show the commercial details
				//   let loadingFactors = {};
				//   try {
				//     loadingFactors = JSON.parse(response.loadingFactors);
				//   } catch (e) {
				//     loadingFactors = null;
				//   }

				//   const packagePrice = !isNaN(response.packagePrice)
				//     ? thousands_separators(parseFloat(response.packagePrice))
				//     : response.packagePrice;

				//   const vendorAmount = response.vendorAmount;
				//   const commercialranking = response.vendorRanking ?? 'N/A';

				//   return (
				//     <Box sx={{ paddingTop: 1 }}>
				//       <Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
				//         Package Level
				//       </Typography>

				//       <Stack spacing={0.5}>
				//         <Box display="flex" justifyContent="space-between">
				//           <Typography variant="body2"><b>Package Price:</b></Typography>
				//           <Typography variant="body2">{packagePrice} {rfqheaderdetails[0]?.baseCurrency}</Typography>
				//         </Box>

				//         <Box display="flex" justifyContent="space-between">
				//           <Typography variant="body2"><b>Loading Factor:</b></Typography>
				//           <Typography
				//             variant="body2"
				//             sx={{ cursor: loadingFactors ? 'pointer' : 'default', color: loadingFactors ? 'blue' : 'textSecondary' }}
				//             onClick={() => loadingFactors && handleOpenLoadingF(loadingFactors)}
				//           >
				//             {loadingFactors ? "View" : "N/A"}
				//           </Typography>
				//         </Box>

				//         <Box display="flex" justifyContent="space-between">
				//           <Typography variant="body2"><b>Amount:</b></Typography>
				//           <Typography variant="body2">{vendorAmount} {rfqheaderdetails[0]?.baseCurrency}</Typography>
				//         </Box>

				//         <Box display="flex" justifyContent="space-between">
				//           <Typography variant="body2"><b>Commercial Ranking:</b></Typography>
				//           <Typography variant="body2">L{commercialranking}</Typography>
				//         </Box>
				//       </Stack>
				//     </Box>
				//   );
				// },

				//                 Footer: ({ column }) => {

				//                     const response = commercialresponses?.find(x => x.id == column?.columnDef?.header);

				//                     const loadingFactors = JSON.parse(response?.loadingFactors);
				//                     let packagePrice = 0;
				//                     if (!isNaN(response.packagePrice)) {
				//                         packagePrice = parseFloat(response.packagePrice)
				//                         packagePrice = thousands_separators(packagePrice)
				//                     }
				//                     else {
				//                         packagePrice = response?.packagePrice;
				//                     }
				//                     const vendorAmount = response?.vendorAmount;
				//                     const commercialranking = response?.vendorRanking ?? 'N/A';

				//                     const vendorCommercial = JSON.parse(response?.vendorCommercial)?.filter(x => x.Valuetype == "Percentage" || x.Valuetype == "Currency");
				//                     const loadingAmount = response?.loadingAmount;
				//                     // Determine rank-based styles
				//                     const isBest = commercialranking == 1;
				//                     const isWorst = commercialranking == commercialresponses?.length;

				//                     return (
				//                         <>

				//                             {(openQuotes && openQuotes != 'N') && <Box
				//                                 sx={{

				//                                     backgroundColor: '#FFF',
				//                                     padding: 1,
				//                                     borderRadius: 1,
				//                                 }}
				//                             >
				//                                 <Stack spacing={0.2}>

				//                                     <Typography variant="body4" color="textSecondary">
				//                                         <b>Package Price :</b> {packagePrice} {rfqheaderdetails[0]?.baseCurrency}
				//                                     </Typography>

				//                                     <Typography variant="body3" color="textSecondary">
				//                                         <b>Loading Price :</b> {loadingAmount} {rfqheaderdetails[0]?.baseCurrency}
				//                                     </Typography>
				//   <Typography variant="body3" color="textSecondary">
				//                                         <b>Amount :</b> {vendorAmount}  {rfqheaderdetails[0]?.baseCurrency}
				//                                     </Typography>

				//                                      <Tooltip title={loadingFactors ? "Click to View Loading Factor" : ""}>
				//                                         <Typography
				//                                             variant="body3"
				//                                             color="textSecondary"
				//                                             onClick={() => {
				//                                                 if (loadingFactors) {
				//                                                     handleOpenLoadingF(loadingFactors);
				//                                                 }
				//                                             }}
				//                                             className="pointer"
				//                                         >
				//                                             <b>Loading Factor :</b>{" "}
				//                                             <span style={{ color: loadingFactors ? "blue" : "" }}>
				//                                                 {!loadingFactors ? "N/A" : "View"}
				//                                             </span>
				//                                         </Typography>
				//                                     </Tooltip>

				//                                     {vendorCommercial && vendorCommercial?.length > 0 && showcommercial && vendorCommercial.map((item, index) => (
				//                                         <Stack key={index}>
				//                                             <Typography variant="body3" color="textSecondary">
				//                                                 <b>{item.Name} :</b> {item.EnterCommValue}{" "}
				//                                                 {item?.Valuetype === "Percentage" ? "%" : item.Valuetype === "Currency" ? rfqheaderdetails[0]?.baseCurrency : ""}
				//                                                 {item?.Remarks && (
				//                                                     <WhiteTooltip title={`Remark :${item?.Remarks}`}>
				//                                                         <span
				//                                                             className="ms-2"
				//                                                             style={{
				//                                                                 cursor: "pointer",
				//                                                                 color: "#1976d2",
				//                                                                 fontSize: "12px",
				//                                                             }}
				//                                                         >
				//                                                             <CommentOutlined className="f14" />
				//                                                         </span>
				//                                                     </WhiteTooltip>
				//                                                 )}
				//                                             </Typography>
				//                                         </Stack>
				//                                     ))}

				//                                     <Typography variant="body3" color="textSecondary">
				//                                         <b>Commercial Ranking :</b> {`L${commercialranking}`}
				//                                     </Typography>

				//                                 </Stack>
				//                             </Box>}

				//                             {(openQuotes && openQuotes == 'N') && (
				//                                 <EventQuoteSealed />
				//                             )}

				//                         </>

				//                     )
				//                 },

				muiTableBodyCellProps: {
					align: "left",
				},
				muiTableBodyRowProps: {
					verticalAlign: "top",
				},
				Cell: ({ cell, table }) => {
					const response = cell.row._valuesCache[`responses.${supplierid}`];
					const CommercialItem = response?.CommercialItem;
					const offeredprice = response?.SupplierPrice;

					const ItemRanking = response?.ItemRanking;

					let Amount = 0;
					if (!isNaN(offeredprice)) {
						Amount = parseFloat(offeredprice) * parseFloat(response?.Quantity);
						Amount = thousands_separators(Amount);
					} else {
						Amount = offeredprice;
					}

					return (
						<>
							{openQuotes && openQuotes != "N" && (
								<Box
									sx={{
										padding: 1,
										borderRadius: 1,
									}}
								>
									<Stack spacing={0.2}>
										{offeredprice && (
											<Tooltip title="Offered Price">
												<Typography variant="body1">
													{offeredprice}{" "}
													{offeredprice
														? rfqheaderdetails[0]?.baseCurrency
														: ""}
													<span
														style={{
															marginLeft: "0.5rem",
															color:
																ItemRanking == 1
																	? "#155724"
																	: ItemRanking == vendorItemAnalysis?.length
																	? "#721c24"
																	: "#000",
															backgroundColor:
																ItemRanking == 1
																	? "#d4edda"
																	: ItemRanking == vendorItemAnalysis?.length
																	? "#f8d7da"
																	: "#f3f3f3",
															padding: "0.2rem",
															borderRadius: "4px",
															minWidth: "2rem",
															display: "inline-block",
															textAlign: "center",
														}}
													>
														{`L${ItemRanking}`}
													</span>
													{/* <span style={{ marginLeft:"0.5rem",color:`${ItemRanking==1 ?'#155724':'#000' }`, backgroundColor:`${ItemRanking==1 ?'#d4edda':'#f3f3f3' }`, padding: "0.2rem",borderRadius: "4px"}}>{`L${ItemRanking}`}</span> */}
												</Typography>
											</Tooltip>
										)}

										{Amount && (
											<Typography variant="body2">
												<b>
													Amount : {Amount}{" "}
													{Amount && openQuotes && openQuotes != "N"
														? rfqheaderdetails[0]?.baseCurrency
														: ""}
												</b>
											</Typography>
										)}

										{CommercialItem &&
											CommercialItem?.length > 0 &&
											shouldShowCommercial && (
												<>
													<TableContainer>
														<Table aria-label="commercial items table">
															<TableBody>
																{CommercialItem?.map((item, index) => (
																	<StyledTableRow key={index}>
																		<StyledTableCell>
																			<Typography
																				variant="body4"
																				color="textSecondary"
																			>
																				{item.EnterCommValue} {""}{" "}
																				{item?.valuetype == "Percentage"
																					? "%"
																					: item.valuetype == "Currency" &&
																					  openQuotes &&
																					  openQuotes != "N"
																					? rfqheaderdetails[0]?.baseCurrency
																					: ""}
																			</Typography>
																		</StyledTableCell>
																	</StyledTableRow>
																))}
															</TableBody>
														</Table>
													</TableContainer>
												</>
											)}
									</Stack>
								</Box>
							)}

							{openQuotes && openQuotes == "N" && <EventQuoteSealed />}
						</>
					);
				},
			}));

			const otheritemcolumn = [
				{
					accessorKey: "poNumber",
					header: "Last PO Details",
					enableColumnOrdering: false,
					minWidth: 10,
					muiTableBodyCellProps: {
						align: "left",
					},
					muiTableBodyRowProps: {
						verticalAlign: "top",
					},
					Cell: ({ cell }) => {
						const item = cell.row.original;

						return (
							<Stack spacing={0.2}>
								{item.poNumber && (
									<Typography variant="body1" sx={{ fontWeight: "bold" }}>
										{item.poNumber}
									</Typography>
								)}

								{!item.poNumber && (
									<Typography variant="body1" sx={{ fontWeight: "bold" }}>
										{""}
									</Typography>
								)}

								{item.poDate && (
									<Typography variant="body2" color="textSecondary">
										<b>PO Date</b>: {item.poDate}
									</Typography>
								)}

								{item.poVendorName && (
									<Typography variant="body2" color="textSecondary">
										<b>Supplier</b>: {item.poVendorName}
									</Typography>
								)}
								{item.poUnitRate && (
									<Typography variant="body2" color="textSecondary">
										<b>Unit Rate</b>: {item.poUnitRate}
									</Typography>
								)}
								{item.poValue && (
									<Typography variant="body2" color="textSecondary">
										<b>PO Value</b>: {item.poValue}
									</Typography>
								)}
							</Stack>
						);
					},
				},
				// {
				//     accessorKey: 'plant',
				//     header: 'Delivery Location',
				//     enableColumnOrdering: false,
				//     minWidth: 10,
				//     muiTableBodyCellProps: {
				//         align: 'left',
				//     },
				//     muiTableBodyRowProps: {
				//         verticalAlign: 'top'
				//     },
				//     Cell: ({ cell }) => {

				//         const item = cell.row.original;

				//         return (
				//             <Stack spacing={0.5}>

				//                 {/* Example: Additional Information (Modify as needed) */}
				//                 {item.plant && (
				//                     <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
				//                         {item.plant}

				//                     </Typography>
				//                 )}

				//             </Stack>
				//         );
				//     }
				// }
			];
			//merging columns

			setColumns([
				...itemcolumn,
				...lowestpricecolumn,
				...responseColumns,
				...otheritemcolumn,
			]);
		}
	}, [rfqItemsList, commercialresponses, shouldShowCommercial]);

	// Helper function to get all unique commercial terms from all items
	const getAllCommercialTerms = () => {
		const allTerms = [];
		mergedData.forEach((item, itemIndex) => {
			const response = item.responses?.[supplierid];
			const CommercialItem = response?.CommercialItem;
			if (CommercialItem && CommercialItem.length > 0) {
				CommercialItem.forEach((comm) => {
					allTerms.push({
						itemIndex,
						itemName: item.itemName,
						termName: comm.Name,
						termId: `${item.id}-${comm.Name}`
					});
				});
			}
		});
		return allTerms;
	};

	// Helper function to render item details
	const renderItemDetails = (item, response) => {
		const maxLength = 50;
		const isLong = item.itemDesc?.length > maxLength;
		const truncatedText = isLong
			? item.itemDesc.substring(0, maxLength) + "..."
			: item.itemDesc;

		const CommercialItem = response?.CommercialItem;
		const hasCommercialTerms = CommercialItem && CommercialItem.length > 0 && shouldShowCommercial;
		const isExpanded = expandedItems.has(item.id);

		return (
			<Stack spacing={0.2}>
				{item.itemName && (
					<Stack direction="row" spacing={1} sx={{ alignItems: 'center', cursor: hasCommercialTerms ? 'pointer' : 'default' }}>
						<Typography 
							variant="h6" 
							sx={{ fontWeight: "bold" }}
							onClick={() => hasCommercialTerms && toggleItemExpansion(item.id)}
						>
							{item.itemName}
						</Typography>
						{hasCommercialTerms && (
							<IconButton 
								size="small" 
								onClick={() => toggleItemExpansion(item.id)}
								sx={{ p: 0.5 }}
							>
								{isExpanded ? <ExpandLess /> : <ExpandMore />}
							</IconButton>
						)}
						<Tooltip title={`Description: ${item?.itemDesc}`}>
							<InfoOutlined className="f14" />
						</Tooltip>
						<Tooltip title={`Remark: ${item?.remarks}`}>
							<CommentOutlined className="f14" />
						</Tooltip>
					</Stack>
				)}

				{item.itemCode && (
					<Typography variant="body1" color="textSecondary">
						<b>Item Code:</b> {item.itemCode}
					</Typography>
				)}

				{item.targetPrice != 0 && (
					<Typography variant="body1" color="textSecondary">
						<b>Target Price:</b> {item.targetPrice}
					</Typography>
				)}

				{item.quantity && (
					<Typography variant="body1" color="textSecondary">
						<b>Quantity:</b> {item.quantity} {item.uom}
					</Typography>
				)}

				{/* Commercial Terms in Accordion */}
				{hasCommercialTerms && (
					<Collapse in={isExpanded}>
						<TableContainer sx={{ mt: 1, width: "100%" }}>
							<Table
								size="small"
								aria-label="commercial items table"
								sx={{
									width: "100%",
									borderCollapse: "collapse",
									fontSize: 13,
								}}
							>
								<TableBody>
									{CommercialItem.map((comm, index) => (
										<StyledTableRow
											key={index}
											sx={{
												borderBottom: "1px solid rgba(224, 224, 224, 1)",
												backgroundColor: "white",
											}}
										>
											<StyledTableCell
												colSpan={8}
												sx={{
													padding: "8px",
													fontWeight: "bold",
													fontSize: 13,
													width: "100%",
													borderBottom: "1px solid rgba(224, 224, 224, 1)",
												}}
											>
												<Typography variant="body2" color="textSecondary">
													{comm?.Name}
												</Typography>
											</StyledTableCell>
										</StyledTableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Collapse>
				)}
			</Stack>
		);
	};

	// Helper function to render supplier response
	const renderSupplierResponse = (item, supplierId) => {
		const response = item.responses?.[supplierId];
		const CommercialItem = response?.CommercialItem;
		const offeredprice = response?.SupplierPrice;
		const ItemRanking = response?.ItemRanking;
		const isExpanded = expandedItems.has(item.id);

		let Amount = 0;
		if (!isNaN(offeredprice)) {
			Amount = parseFloat(offeredprice) * parseFloat(response?.Quantity);
			Amount = thousands_separators(Amount);
		} else {
			Amount = offeredprice;
		}

		if (openQuotes && openQuotes != "N") {
			return (
				<Box sx={{ padding: 1, borderRadius: 1 }}>
					<Stack spacing={0.2}>
						{offeredprice != 0 && (
							<Tooltip title="Offered Price">
								<Typography variant="body1">
									{offeredprice}{" "}
									{offeredprice
										? rfqheaderdetails[0]?.baseCurrency
										: ""}
									<span
										style={{
											marginLeft: "0.5rem",
											color:
												ItemRanking == 1
													? "#155724"
													: ItemRanking == vendorItemAnalysis?.length
													? "#721c24"
													: "#000",
											backgroundColor:
												ItemRanking == 1
													? "#d4edda"
													: ItemRanking == vendorItemAnalysis?.length
													? "#f8d7da"
													: "#f3f3f3",
											padding: "0.2rem",
											borderRadius: "4px",
											minWidth: "2rem",
											display: "inline-block",
											textAlign: "center",
										}}
									>
										L{ItemRanking}
									</span>
								</Typography>
							</Tooltip>
						)}
						{offeredprice == 0 && (
							<Tooltip title="Offered Price">
								<Typography variant="body1">Not Quoted</Typography>
							</Tooltip>
						)}
						{Amount != 0 && (
							<Typography variant="body2">
								<b>
									Amount : {Amount}{" "}
									{Amount && openQuotes && openQuotes != "N"
										? rfqheaderdetails[0]?.baseCurrency
										: ""}
								</b>
							</Typography>
						)}

					</Stack>
				</Box>
			);
		} else {
			return <EventQuoteSealed />;
		}
	};

	// Helper function to render package level data for suppliers
	const renderPackageLevelData = (supplier) => {
		const groupedResponses = commercialresponses.reduce((acc, response) => {
			const supplierId = response.id;
			if (!acc[supplierId]) {
				acc[supplierId] = [];
			}
			acc[supplierId].push(response);
			return acc;
		}, {});
		if (openQuotes && openQuotes != "N") {
			const response = groupedResponses?.[supplier.id]?.[0];
			if (!response) {
				return ['Package Price', 'Loading Factor', 'Amount', 'Commercial Ranking'].map((label) => (
					<Box
						key={`package-${supplier.id}-${label}`}
						sx={{
							height: "40px",
							borderBottom: "1px solid #e0e0e0",
							borderLeft: "1px solid #e0e0e0",
							borderRight: "1px solid #e0e0e0",
							display: "flex",
							alignItems: "center"
						}}
						px={2}
					>
						<Typography variant="body2">N/A</Typography>
					</Box>
				));
			}

			let loadingFactors = null;
			try {
				loadingFactors = JSON.parse(response?.loadingFactors);
			} catch {
				loadingFactors = null;
			}

			const vendorRanking = response?.vendorRanking;
			const currency = rfqheaderdetails[0]?.baseCurrency || "";

			const dataRows = [
				{ 
					label: 'Package Price', 
					content: response?.packagePrice ? `${thousands_separators(response.packagePrice)} ${currency}` : 0
				},
				{ 
					label: 'Loading Factor', 
					content: loadingFactors && loadingFactors.length > 0 ? (
						<Typography
							sx={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
							onClick={() => {
								handleOpenLoadingF(loadingFactors);
							}}
						>
							View
						</Typography>
					) : (
						<Typography
							sx={{ cursor: "pointer", color: "blue", display: "inline" }}
							onClick={() => {
								handleLoadingFactorNew(response);
							}}
						>
							N/A
						</Typography>
					)
				},
				{ 
					label: 'Amount', 
					content: `${response?.vendorAmount || 0} ${currency}`
				},
				{ 
					label: 'Commercial Ranking', 
					content: vendorRanking ? (
						<span
							style={{
								marginLeft: "0.5rem",
								color: vendorRanking === 1 ? "#155724" : "#721c24",
								backgroundColor: vendorRanking === 1 ? "#d4edda" : "#f8d7da",
								padding: "0.2rem",
								borderRadius: "4px",
								minWidth: "2rem",
								display: "inline-block",
								textAlign: "center",
							}}
						>
							{`L${vendorRanking}`}
						</span>
					) : "N/A"
				}
			];

			// First render package level commercial terms, then the constant items
			const commercialTermsRows = hasPackageLevelCommercialTerms() && packageLevelExpanded && supplier.vendorCommercial 
				? supplier.vendorCommercial
					.filter(term => (term.Valuetype === "Currency" || term.Valuetype === "Percentage") && term.IsNetPrice == "N")
					.map((comm, commIndex) => (
						<Box
							key={`package-comm-${supplier.id}-${commIndex}`}
							sx={{
								height: "40px",
								borderBottom: "1px solid #e0e0e0",
								borderLeft: "1px solid #e0e0e0",
								borderRight: "1px solid #e0e0e0",
								display: "flex",
								alignItems: "center"
							}}
							px={2}
						>
							<Typography variant="body2">
								{comm?.EnterCommValue || 0}
								{comm?.Valuetype === "Percentage" ? "%" : ""}
								{comm?.Valuetype === "Currency" && rfqheaderdetails[0]?.baseCurrency ? ` ${rfqheaderdetails[0]?.baseCurrency}` : ""}
							</Typography>
						</Box>
					))
				: [];

			const constantItemsRows = dataRows.map((dataRow) => (
				<Box
					key={`package-${supplier.id}-${dataRow.label}`}
					sx={{
						height: "40px",
						borderBottom: "1px solid #e0e0e0",
						borderLeft: "1px solid #e0e0e0",
						borderRight: "1px solid #e0e0e0",
						display: "flex",
						alignItems: "center"
					}}
					px={2}
				>
					<Typography variant="body2">
						{dataRow.content}
					</Typography>
				</Box>
			));

			return [...commercialTermsRows, ...constantItemsRows];
		} else {
			return <EventQuoteSealed />;
		}
	};

  const renderCommericalResponses = () => {
    if (!commercialresponses || Array.isArray(commercialresponses) && commercialresponses.length === 0) {
      return null;
    }
    
		// Group responses by supplier ID
		const groupedResponses = commercialresponses.reduce((acc, response) => {
			const supplierId = response.id;
			if (!acc[supplierId]) {
				acc[supplierId] = [];
			}
			acc[supplierId].push(response);
			return acc;
		}, {});

    if (!groupedResponses) {
      return null;
    }

		// Create rows for each data point (Package Price, Loading Factor, Amount, Commercial Ranking)
		const dataRows = [
			{ label: 'Package Price', key: 'packagePrice' },
			{ label: 'Loading Factor', key: 'loadingFactor' },
			{ label: 'Amount', key: 'vendorAmount' },
			{ label: 'Commercial Ranking', key: 'vendorRanking' }
		];

		return dataRows.map((dataRow) => {
			const currency = rfqheaderdetails[0]?.baseCurrency || "";

			return (
				<StyledTableRow key={dataRow.key}>
          <StyledTableCell></StyledTableCell>
					<StyledTableCell>
						<Typography variant="h6" sx={{ fontWeight: "bold" }}>
							{dataRow.label}
						</Typography>
					</StyledTableCell>
					{/* Lowest Price column - only show if 2 or more suppliers */}
					{commercialresponses && commercialresponses.length >= 2 && (
						<StyledTableCell></StyledTableCell>
					)}
					{/* Supplier columns */}
					{commercialresponses?.map((supplier) => {
						const response = groupedResponses?.[supplier.id]?.[0]; // Get first response for this supplier
						
						if (!response) {
							return (
								<StyledTableCell key={supplier.id}>
									<Typography variant="body2"></Typography>
								</StyledTableCell>
							);
						}

						let loadingFactors = null;
						try {
							loadingFactors = JSON.parse(response?.loadingFactors);
						} catch {
							loadingFactors = null;
						}

						const vendorRanking = response?.vendorRanking;

						let cellContent = null;

						switch (dataRow.key) {
							case 'packagePrice':
								cellContent = !isNaN(response?.packagePrice)
									? `${thousands_separators(parseFloat(response.packagePrice))} ${currency}`
									: response?.packagePrice || "-";
								break;
							case 'loadingFactor':
								cellContent = loadingFactors ? (
									<Typography
										sx={{ cursor: "pointer", color: "blue", display: "inline" }}
										onClick={() => {
											handleLoadingFactorNew(response);
										}}
									>
										View
									</Typography>
								) : (
									<Typography
										sx={{ cursor: "pointer", color: "blue", display: "inline" }}
										onClick={() => {
											handleLoadingFactorNew(response);
										}}
									>
										N/A
									</Typography>
								);
								break;
							case 'vendorAmount':
								cellContent = `${response?.vendorAmount || "-"} ${currency}`;
								break;
							case 'vendorRanking':
								cellContent = vendorRanking ? (
									<span
										style={{
											marginLeft: "0.5rem",
											color: vendorRanking === 1 ? "#155724" : "#721c24",
											backgroundColor: vendorRanking === 1 ? "#d4edda" : "#f8d7da",
											padding: "0.2rem",
											borderRadius: "4px",
											minWidth: "2rem",
											display: "inline-block",
											textAlign: "center",
										}}
									>
										{`L${vendorRanking}`}
									</span>
								) : (
									"N/A"
								);
								break;
							default:
								cellContent = "";
						}

						return (
							<StyledTableCell key={supplier.id}>
								<Typography>
									{cellContent}
								</Typography>
							</StyledTableCell>
						);
					})}

          <StyledTableCell></StyledTableCell>
				</StyledTableRow>
			);
		});
	};

	return (
		<>
      {/* <ComparisonScreen /> */}
      {/* <ComparisonTable /> */}

      {/* Card-based layout similar to ComparisonTable */}
      <Box display="flex" flexWrap="nowrap" gap={1} sx={{ overflowX: 'auto', width: '100%' }}>
        {/* Items Column */}
        <Box sx={{ minWidth: 280, flexShrink: 0 }}>
          {/* Header */}
          <Box sx={{ height: "60px", backgroundColor: "#1976d2", border: "1px solid #e0e0e0"}} p={2}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }} color="#ffffff">
              ITEM DETAILS
            </Typography>
          </Box>
          
          {/* Items and Commercial Terms */}
          <Box>
            {mergedData.map((item, index) => {
              // Get commercial terms for this item from the first supplier's response that has them
              const firstSupplierWithCommercials = commercialresponses?.find(supplier => {
                const response = item.responses?.[supplier.id];
                return response?.CommercialItem && response.CommercialItem.length > 0;
              });
              
              const firstSupplierResponse = firstSupplierWithCommercials ? 
                item.responses?.[firstSupplierWithCommercials.id] : null;
              
              const hasCommercialTerms = firstSupplierResponse?.CommercialItem && 
                firstSupplierResponse.CommercialItem.length > 0 && shouldShowCommercial;
              const isExpanded = expandedItems.has(item.id);
              
              return (
                <Box key={item.id}>
                  {/* Combined Item Header and Details Row */}
                  <Box
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
                        {/* Item Name with accordion toggle */}
                        <Stack 
                          direction="row" 
                          spacing={1} 
                          sx={{ 
                            alignItems: 'center', 
                            cursor: hasCommercialTerms ? 'pointer' : 'default' 
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}
                            onClick={() => hasCommercialTerms && toggleItemExpansion(item.id)}
                          >
                            {index + 1}. {item.itemName}
                          </Typography>
                          {hasCommercialTerms && (
                            <IconButton 
                              size="small" 
                              onClick={() => toggleItemExpansion(item.id)}
                              sx={{ p: 0.5 }}
                            >
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          )}
                          <Tooltip title={`Description: ${item?.itemDesc}`}>
                            <InfoOutlined className="f14" style={{ marginLeft: "8px", cursor: "pointer", color: "#1976d2", fontSize: "16px" }} />
                          </Tooltip>
                          <Tooltip title={`Remark: ${item?.remarks}`}>
                            <CommentOutlined className="f14" style={{ marginLeft: "8px", cursor: "pointer", color: "#1976d2", fontSize: "16px" }} />
                          </Tooltip>
                        </Stack>
                        
                        {/* Item Details */}
                        {item.itemCode && (
                          <Typography variant="body1" color="textSecondary">
                            <b>Item Code:</b> {item.itemCode}
                          </Typography>
                        )}

                        {item.targetPrice != 0 && (
                          <Typography variant="body1" color="textSecondary">
                            <b>Target Price:</b> {item.targetPrice}
                          </Typography>
                        )}

                        {item.quantity && (
                          <Typography variant="body1" color="textSecondary">
                            <b>Quantity:</b> {item.quantity} {item.uom}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                  
                  {/* Commercial Terms Names (accordion content) */}
                  {hasCommercialTerms && (
                    <Collapse in={isExpanded}>
                      {firstSupplierResponse.CommercialItem
					  .filter((comm) => comm.IsNetPrice == "N")
					  .map((comm, commIndex) => (
                        <Box
                          key={`comm-${item.id}-${commIndex}`}
                          sx={{
                            height: "40px",
                            borderBottom: "1px solid #e0e0e0",
                            borderLeft: "1px solid #e0e0e0",
                            borderRight: "1px solid #e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#f9f9f9"
                          }}
                          px={2}
                        >
                          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: "bold" }}>
                            {comm?.Name}
                          </Typography>
                        </Box>
                      ))}
                    </Collapse>
                  )}
                </Box>
              );
            })}
            
            {/* Package Level Commercial Terms (always show at the end) */}
            {mergedData.length > 0 && (
              <Box>
                <Box
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #e0e0e0",
                    cursor: hasPackageLevelCommercialTerms() ? 'pointer' : 'default'
                  }}
                  px={2}
                  onClick={() => hasPackageLevelCommercialTerms() && togglePackageLevelExpansion()}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Typography variant="body1" color="#ffffff" sx={{ fontWeight: "bold" }}>
                      Package Level
                    </Typography>
                    {hasPackageLevelCommercialTerms() && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePackageLevelExpansion();
                        }}
                        sx={{ p: 0.5, color: '#ffffff' }}
                      >
                        {packageLevelExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    )}
                  </Stack>
                </Box>
                
                {/* Package Level Commercial Terms Accordion */}
                {hasPackageLevelCommercialTerms() && (
                  <Collapse in={packageLevelExpanded}>
                    {commercialresponses && commercialresponses.length > 0 && 
                     commercialresponses[0].vendorCommercial
                       ?.filter(term => (term.Valuetype === "Currency" || term.Valuetype === "Percentage") && term.IsNetPrice == "N")
                       .map((comm, commIndex) => (
                      <Box
                        key={`package-comm-${commIndex}`}
                        sx={{
                          height: "40px",
                          borderBottom: "1px solid #e0e0e0",
                          borderLeft: "1px solid #e0e0e0",
                          borderRight: "1px solid #e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#f9f9f9"
                        }}
                        px={2}
                      >
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: "bold" }}>
                          {comm?.Name || comm?.name}
                        </Typography>
                      </Box>
                    ))}
                  </Collapse>
                )}

                {['Package Price', 'Loading Factor', 'Amount', 'Commercial Ranking'].map((label) => (
                  <Box
                    key={label}
                    sx={{
                      height: "40px",
                      borderBottom: "1px solid #e0e0e0",
                      borderLeft: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#f9f9f9"
                    }}
                    px={2}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Lowest Price Column (if applicable) */}
        {commercialresponses && commercialresponses.length >= 2 && (
          <Box sx={{ minWidth: 200, flexShrink: 0 }}>
            <Box sx={{ height: "60px", backgroundColor: "#f9f9f9", border: "1px solid #e0e0e0" }} p={2}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                LOWEST PRICE
              </Typography>
            </Box>
            
            <Box>
              {mergedData.map((item, index) => {
				// 
                // Check if any supplier has commercial terms for this item
                const hasCommercialTerms = commercialresponses?.some(supplier => {
                  const response = item.responses?.[supplier.id];
                  return response?.CommercialItem && response.CommercialItem.length > 0;
                }) && shouldShowCommercial;
                
                const isExpanded = expandedItems.has(item.id);
                const firstSupplierWithCommercials = commercialresponses?.find(supplier => {
                  const response = item.responses?.[supplier.id];
                  return response?.CommercialItem && response.CommercialItem.length > 0;
                });
                
                return (
                  <Box key={`lowest-${item.id}`}>
                    {/* Lowest Price Data - Combined to match item details height */}
                    <Box
                      sx={{
                        minHeight: "120px", // Match the item details height
                        borderBottom: "1px solid #e0e0e0",
                        borderLeft: "1px solid #e0e0e0",
                        borderRight: "1px solid #e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#f9f9f9"
                      }}
                      px={2}
                    >
                      <Stack spacing={0.2}>
                        {item.ItemLowestPrice && (
                          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                            {item.ItemLowestPrice}{" "}
                            {openQuotes && openQuotes != "N" ? rfqheaderdetails[0]?.baseCurrency : ""}
                          </Typography>
                        )}
                        
                        {item.ItemLowestPrice && (
                          <Typography variant="body2" color="textSecondary">
                            <b>Amount: {thousands_separators(parseFloat(item.ItemLowestPrice) * parseFloat(item.quantity))}{" "}
                            {openQuotes && openQuotes != "N" ? rfqheaderdetails[0]?.baseCurrency : ""}</b>
                          </Typography>
                        )}
                        
                        {!item.ItemLowestPrice && (
                          <Typography variant="body2" color="textSecondary">
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    
                    {/* Commercial Terms Empty Spaces (accordion content) */}
                    {hasCommercialTerms && (
                      <Collapse in={isExpanded}>
                        {firstSupplierWithCommercials && 
                         item.responses?.[firstSupplierWithCommercials.id]?.CommercialItem
						 ?.filter((comm) => comm.IsNetPrice == "N")
						 .map((comm, commIndex) => (
                          <Box
                            key={`lowest-comm-${item.id}-${commIndex}`}
                            sx={{
                              height: "40px",
                              borderBottom: "1px solid #e0e0e0",
                              borderLeft: "1px solid #e0e0e0",
                              borderRight: "1px solid #e0e0e0",
                              backgroundColor: "#f9f9f9"
                            }}
                          />
                        ))}
                      </Collapse>
                    )}
                  </Box>
                );
              })}
              
              {/* Package Level Empty Spaces (always show at the end) */}
              {mergedData.length > 0 && (
                <Box>
                  <Box
                    sx={{
                      height: "40px",
                      backgroundColor: "#e0e0e0",
                      border: "1px solid #e0e0e0"
                    }}
                  />
                  {/* Package Level Commercial Terms Spacing */}
                  {hasPackageLevelCommercialTerms() && (
                    <Collapse in={packageLevelExpanded}>
                      {commercialresponses && commercialresponses.length > 0 && 
                       commercialresponses[0].vendorCommercial
                         ?.filter(term => (term.Valuetype === "Currency" || term.Valuetype === "Percentage") && term.IsNetPrice == "N")
                         .map((comm, commIndex) => (
                        <Box
                          key={`lowest-package-comm-${commIndex}`}
                          sx={{
                            height: "40px",
                            borderBottom: "1px solid #e0e0e0",
                            borderLeft: "1px solid #e0e0e0",
                            borderRight: "1px solid #e0e0e0",
                            backgroundColor: "#f9f9f9"
                          }}
                        />
                      ))}
                    </Collapse>
                  )}

                  {['Package Price', 'Loading Factor', 'Amount', 'Commercial Ranking'].map((label) => (
                    <Box
                      key={`lowest-${label}`}
                      sx={{
                        height: "40px",
                        borderBottom: "1px solid #e0e0e0",
                        borderLeft: "1px solid #e0e0e0",
                        borderRight: "1px solid #e0e0e0",
                        backgroundColor: "#f9f9f9"
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Supplier Columns */}
        {commercialresponses && commercialresponses.length > 0 && commercialresponses?.map((supplier) => {
          const obj = commercialresponses?.find((x) => x.id == supplier.id);
          
          return (
            <Box key={supplier.id} sx={{ minWidth: 200, flexShrink: 0, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
              {/* Supplier Header */}
              <Box sx={{ height: "60px", border: "1px solid #e0e0e0" }} p={1}>
                <Stack spacing={0.5} sx={{ width: "100%" ,height: "50%" }}>
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
							<Typography variant="body2" sx={{ fontSize: "12px",color:"white" }}>
							{obj?.contactPerson} {"|"} {obj?.email}
							</Typography>
							<Typography variant="body2" sx={{ fontSize: "12px" ,color:"white"}}>
							# {obj?.mobile}
							</Typography>
						</>
						}
					>
                    <Typography variant="h6" sx={{ fontWeight: "bold",cursor: "pointer" }}
						onClick={() => {
							if(!vendorId){
								setSelectedVendorId(obj?.vendorId);
								setSupplierModalOpen(true);
							}
						}}
					>
						{obj?.acceptedCurrency ? obj?.tradeName + " (" + obj?.acceptedCurrency + ")" : obj?.tradeName	}
                      {/* {obj?.tradeName} */}
                    </Typography>
					</Tooltip>
					{currentStage != "Awarded" && (<DropdownButton
						as={"div"}
						key={"end7"}
						id={`myacccmenu`}
						className="supplieraccmenu"
						drop={"start"}
						variant="outlined"
						style={{
						color: "#2182cde",
						}}
						title={
						<Tooltip title={"Action"}>
							<div
							style={{
								fontSize: "0.8125rem",
								color: "#2A68D3",
								fontWeight: "500",
							}}
							>
							<HiDotsVertical />
							</div>
						</Tooltip>
						}
					>
						<div className="shadow rounded min-width-200px">
						
						{!stagearray?.includes(currentStage) && obj.status && obj.status !== "Open" && (
							<MenuItem className="f12 fw500" onClick={() => handleSupplierAction(obj, 'Reopen')}>
							Re-Open 
							</MenuItem>
						)}
						{obj.status && obj.status != "Closed" && obj.status != "Regretted"  && (
							<MenuItem className="f12 fw500" onClick={() => handleSupplierAction(obj, 'Reminder')}>
							Send Reminder
							</MenuItem>
						)}
						{obj.status && obj.status != "Closed" && obj.status != "Regretted"  && (
							<MenuItem className="f12 fw500" onClick={() => handleSupplierAction(obj, 'Surrogate')}>
							Surrogate Supplier
							</MenuItem>
						)}
						</div>
					</DropdownButton>)}
                  </Stack>
                  <Divider />
                  <Stack sx={{ width: "100%" ,height: "50%" }}>
                    {/* <Typography variant="body2" sx={{ fontSize: '12px' }}>
                    	{obj?.contactPerson} {"|"} {obj?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '12px' }}>
                      # {obj?.mobile}
                    </Typography> */}
                    <Typography variant="body2" sx={{ fontSize: '12px' }}>
                      Submission Time:{' '}
                      {obj?.submissionDate
                        ? formatDateViaLocale(obj?.submissionDate, userDetail)
                        : ""}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              
              {/* Supplier Data */}
              <Box>
                {mergedData.map((item, index) => {
                  const isExpanded = expandedItems.has(item.id);
                  const supplierResponse = item.responses?.[supplier.id];
                  const hasCommercialTerms = supplierResponse?.CommercialItem && 
                    supplierResponse.CommercialItem.length > 0 && shouldShowCommercial;
                  
                  return (
                    <Box key={`supplier-${supplier.id}-${item.id}`}>
                      {/* Supplier Response Data - Combined to match item details height */}
                      <Box
                        sx={{
                          minHeight: "120px", // Match the item details height
                          borderBottom: "1px solid #e0e0e0",
                          borderLeft: "1px solid #e0e0e0",
                          borderRight: "1px solid #e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "white"
                        }}
                        px={2}
                      >
                        {renderSupplierResponse(item, supplier.id)}
                      </Box>
                      
                      {/* Commercial Terms Values (accordion content) */}
                      {hasCommercialTerms && (
                        <Collapse in={isExpanded}>
                          {supplierResponse.CommercialItem
						  .filter((comm) => comm.IsNetPrice == "N")
						  .map((comm, commIndex) => (
                            <Box
                              key={`supplier-comm-${supplier.id}-${item.id}-${commIndex}`}
                              sx={{
                                height: "40px",
                                borderBottom: "1px solid #e0e0e0",
                                borderLeft: "1px solid #e0e0e0",
                                borderRight: "1px solid #e0e0e0",
                                display: "flex",
                                alignItems: "center"
                              }}
                              px={2}
                            >
                              <Typography variant="body2">
                                {thousands_separators(comm.EnterCommValue)}{" "}
                                {comm?.valuetype == "Percentage" ? "%" : 
                                 comm.valuetype == "Currency" && openQuotes && openQuotes != "N" ? 
                                 rfqheaderdetails[0]?.baseCurrency : ""}
                              </Typography>
                            </Box>
                          ))}
                        </Collapse>
                      )}
                    </Box>
                  );
                })}
                
                {/* Package Level Data (always show at the end) */}
                {mergedData.length > 0 && (
                  <Box>
                    <Box
                      sx={{
                        height: "40px",
                        backgroundColor: "#e0e0e0",
                        border: "1px solid #e0e0e0"
                      }}
                    />
                    {renderPackageLevelData(supplier)}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}

        {/* Last PO Details Column */}
        <Box sx={{ minWidth: 200, flexShrink: 0 }}>
          <Box sx={{ height: "60px", backgroundColor: "#f5f5f5", border: "1px solid #e0e0e0" }} p={2}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              LAST PO DETAILS
            </Typography>
          </Box>
          
          <Box>
            {mergedData.map((item, index) => {
				
              // Check if any supplier has commercial terms for this item
              const hasCommercialTerms = commercialresponses?.some(supplier => {
                const response = item.responses?.[supplier.id];
                return response?.CommercialItem && response.CommercialItem.length > 0;
              }) && shouldShowCommercial;
              
              const isExpanded = expandedItems.has(item.id);
              const firstSupplierWithCommercials = commercialresponses?.find(supplier => {
                const response = item.responses?.[supplier.id];
                return response?.CommercialItem && response.CommercialItem.length > 0;
              });
              
              return (
                <Box key={`po-${item.id}`}>
                  {/* PO Details Data - Combined to match item details height */}
                  <Box
                    sx={{
                      minHeight: "120px", // Match the item details height
                      borderBottom: "1px solid #e0e0e0",
                      borderLeft: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                      display: "flex",
                      alignItems: "flex-start",
                      backgroundColor: "white"
                    }}
                    p={2}
                  >
                    <Stack spacing={0.2}>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {item.poNumber || ""}
                      </Typography>
                      {item.poDate && (
                        <Typography variant="body2" color="textSecondary">
                          <b>PO Date</b>: {item.poDate}
                        </Typography>
                      )}
                      {item.poVendorName && (
                        <Typography variant="body2" color="textSecondary">
                          <b>Supplier</b>: {item.poVendorName}
                        </Typography>
                      )}
                      {item.poUnitRate && (
                        <Typography variant="body2" color="textSecondary">
                          <b>Unit Rate</b>: {item.poUnitRate}
                        </Typography>
                      )}
                      {item.poValue && (
                        <Typography variant="body2" color="textSecondary">
                          <b>PO Value</b>: {item.poValue}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  
                  {/* Commercial Terms Empty Spaces (accordion content) */}
                  {hasCommercialTerms && (
                    <Collapse in={isExpanded}>
                      {firstSupplierWithCommercials && 
                       item.responses?.[firstSupplierWithCommercials.id]?.CommercialItem
					   ?.filter((comm) => comm.IsNetPrice == "N")
					   .map((comm, commIndex) => (
                        <Box
                          key={`po-comm-${item.id}-${commIndex}`}
                          sx={{
                            height: "40px",
                            borderBottom: "1px solid #e0e0e0",
                            borderLeft: "1px solid #e0e0e0",
                            borderRight: "1px solid #e0e0e0",
                            backgroundColor: "#f9f9f9"
                          }}
                        />
                      ))}
                    </Collapse>
                  )}
                </Box>
              );
            })}
            
            {/* Package Level Empty Spaces (always show at the end) */}
            {mergedData.length > 0 && (
              <Box>
                <Box
                  sx={{
                    height: "40px",
                    backgroundColor: "#e0e0e0",
                    border: "1px solid #e0e0e0"
                  }}
                />
                {/* Package Level Commercial Terms Spacing for Last PO */}
                {hasPackageLevelCommercialTerms() && (
                  <Collapse in={packageLevelExpanded}>
                    {commercialresponses && commercialresponses.length > 0 && 
                     commercialresponses[0].vendorCommercial
                       ?.filter(term => (term.Valuetype === "Currency" || term.Valuetype === "Percentage") && term.IsNetPrice == "N")
                       .map((comm, commIndex) => (
                      <Box
                        key={`po-package-comm-${commIndex}`}
                        sx={{
                          height: "40px",
                          borderBottom: "1px solid #e0e0e0",
                          borderLeft: "1px solid #e0e0e0",
                          borderRight: "1px solid #e0e0e0",
                          backgroundColor: "#f9f9f9"
                        }}
                      />
                    ))}
                  </Collapse>
                )}

                {['Package Price', 'Loading Factor', 'Amount', 'Commercial Ranking'].map((label) => (
                  <Box
                    key={`po-${label}`}
                    sx={{
                      height: "40px",
                      borderBottom: "1px solid #e0e0e0",
                      borderLeft: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                      backgroundColor: "#f9f9f9"
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

			{/* {loading factor modal} */}
			<Modal
				size="md"
				show={openLoadingF}
				backdrop="static"
				// keyboard={false}
				//  className=""
				// backdropClassName=""
				centered
				contentClassName="border-0 rounded"
				className="zindex1280"
				backdropClassName="zindex1280"
				onHide={() => handleCloseLoadingF()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">
							Loading Factor
						</div>
					</Modal.Title>

					<IconButton
						onClick={() => handleCloseLoadingF()}
						size="small"
						edge="start"
					>
						<HiOutlineX className="text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
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
														<td className="f12 fw400">{loading?.FactorDesc}</td>
														<td className="f12 fw400">
															{loading?.FactorType == "P"
																? "Percentage"
																: "Absolute"}
														</td>
														<td className="f12 fw400">
															{/* {loading?.FactorType == "P"
                                                                ? `${loading?.FactorPerc} %` 
                                                                : ""} */}
															{/* {loading?.FactorPerc && `${parseFloat(loading.FactorPerc)}%`} */}

															{loading?.FactorType === "P" &&
															loading?.FactorPerc &&
															parseFloat(loading.FactorPerc) !== 0
																? `${parseFloat(loading.FactorPerc)}%`
																: ""}
														</td>

														<td className="f12 fw400">
															{loading?.LoadingAmount}{" "}
															{rfqheaderdetails[0]?.baseCurrency}
														</td>
													</tr>
												</>
											);
										})}
								</tbody>
							</Table>
						</div>
					</div>
				</Modal.Body>
			</Modal>

			<SupplierIndividualReport
				open={supplierModalOpen}
				onClose={() => setSupplierModalOpen(false)}
				vendorId={selectedVendorId}
				permissionManager={permissionManager}
			/>
		</>
	);
};

export default EventFinancialComparativeScreen;
