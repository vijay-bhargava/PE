import React, { useState } from 'react'
import { formatDateViaLocale, formatDateViaLocale2, formatDateViaLocalet, formatDateViaTime, formatDateViaTimeZone, formattimeoption, renderHtmlAsText } from '../../../utils/common/utility'
import { useNavigate } from 'react-router-dom';
import { api, ApiClient } from '../../../Apiclient';
import { useStateValue } from '../../../store';
import IconButton from "@mui/material/IconButton";
import {
	Close,
	ExpandLess,
	ExpandMore,
} from "@mui/icons-material";
import {
	Autocomplete,
	Button,
	ButtonGroup,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	FormLabel,
	Input,
	InputAdornment,
	InputLabel,
	MenuItem,
	Paper,
	Radio,
	RadioGroup,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
	createFilterOptions,
} from "@mui/material";
import { findStringByValueFromArray } from '../../../utils/common';

const RFIGeneralPreview = ({formik,inputList,purchaseAllList,purchaseGroupAllList,customClassName}) => {
    const navigate = useNavigate();
	const [{ atoken, rtoken, customerid,customersuffix,roleClaims, userDetail }, dispatch] =
		useStateValue();
	const apiClient = new ApiClient(customersuffix);
	


        const [showTable, setShowTable] = useState(true);
  return (
    <>
       <div className={`p-3 ${customClassName ? customClassName : 'item-Table'}`}>
											<div className="row mt-2">

												<div className="col-12 col-md-12">
													<div className="f18">
														<div>
															<div
																className="f14  mb-1"
																style={{
																	color: "black",
																	fontWeight: "500",

																}}
															>
																 Subject:{" "}
															</div>
															<div
																className="f15 mb-2"
																style={{
																	fontWeight: "400",

																}}
															>
																{formik.values.subject}
															</div>
														</div>
													</div>
												</div>
												<hr className="mt-0 mb-2" />
												<div className="row mt-3">
													<div className="col-12 col-md-4">
														<div>
															<div>
																<span
																	className="f14   mb-1"
																	style={{
																		fontWeight: "600",
																		color: "black",

																	}}
																>
																	Start Date/Time :
																</span>{" "}
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	{formik?.values?.startDate ? formatDateViaLocale2(
																		formik?.values?.startDate,
																		userDetail
																	):""}
																</span>
															</div>
														</div>
													</div>
													<div className="col-12 col-md-4">
														<div>
															<div>
																<span
																	className="f14   mb-1"
																	style={{
																		fontWeight: "600",
																		color: "black",

																	}}
																>
																	End Date/Time :
																</span>{" "}
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	{formik?.values?.endDate ? formatDateViaLocale2(
																		formik?.values?.endDate,
																		userDetail
																	):""}
																</span>
															</div>
														</div>
													</div>
													{/* <div className="col-12 col-md-4">
														<div>
															<div>
																<span
																	className="f14   mb-1"
																	style={{
																		fontWeight: "600",
																		color: "black",

																	}}
																>
																	Requisitioner:
																</span>{" "}
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	{formik.values?.requisitioner}
																	
																</span>
															</div>
														</div>
													</div> */}
												
													
													{/* {formik.values?.RFQType =="closed" && <div className="col-12 col-md-4">
														<div>
															<div>
																<span
																	className="f14   mb-1"
																	style={{
																		fontWeight: "600",
																		color: "black",

																	}}
																>
																	Bid Open Date/Time:
																</span>{" "}
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	{formik?.values?.bidOpeningDate ? formatDateViaLocale2(
																		formik?.values?.bidOpeningDate,
																		userDetail
																	):""}
																</span>
															</div>
														</div>
													</div>} */}
													{/* <div className="col-12 col-md-4">
														<div>
															<div>
																<span
																	className="f14   mb-1"
																	style={{
																		fontWeight: "600",
																		color: "black",

																	}}
																>
																	Sealed Bid:
																</span>{" "}
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	{formik.values?.RFQType =="closed"? "Yes" : "No"}
																</span>
															</div>
														</div>
													</div> */}
													{/* <div className="col-12 col-md-4">
														<div>
															<div>
																<span
																	className="f14   mb-1"
																	style={{
																		fontWeight: "600",
																		color: "black",

																	}}
																>
																	BOQ:
																</span>{" "}
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	{formik.values.boqReq ? "Yes" : "No"}
																</span>
															</div>
														</div>
													</div> */}
													{/* {formik.values.baseCurrency == (userDetail?.defaultCurrency ?? "INR") && (
														<div className="col-12 col-md-4">
															<div>
																<span
																	className="f14   mb-1"
																	style={{
																		fontWeight: "600",
																		color: "black",

																	}}
																>
																	{" "}
																	Base Currency:
																</span>{" "}
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	
																</span>
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	{userDetail?.defaultCurrency
																		? ` (${userDetail?.defaultCurrency})`
																		: ` (INR)`}
																</span>
															</div>
														</div>
													)} */}
													{/* {formik.values.IsMultiCurrency && (
														<>
															<div className="col-12 col-md-4">
																<div
																	style={{
																		display: "flex",
																		alignItems: "center",
																	}}
																>
																	<span
																		className="f14 mb-1"
																		style={{
																			fontWeight: "600",
																			color: "black",

																		}}
																	>
																		Currency Mode:
																	</span>
																	<span
																		className="f14 mb-1  ms-1"
																		style={{
																			fontWeight: "400",

																		}}
																	>
																		Multi Currency
																	</span>
																	<IconButton
																		onClick={() => setShowTable(!showTable)}
																		className="p-0"
																	>
																		{showTable ? (
																			<ExpandLess />
																		) : (
																			<ExpandMore />
																		)}
																	</IconButton>
																</div>
																{showTable && (
																	<div className='d-flex align-items-center'>
																	<TableContainer  className='d-block'>
																		<Table
																			size="small"
																			className='d-block'
																			aria-label="a dense table"
																		>
																			<TableHead className='d-flex align-items-center justify-content-between'>
																				<TableRow >
																					<TableCell className='ps-0'>Currency</TableCell>
																					<TableCell align="right">
																						Conversion Factor
																					</TableCell>
																				</TableRow>
																			</TableHead>
																			<TableBody>
																				{inputList.map((row) => (
																					<TableRow
																						key={row.name}
																						sx={{
																							"&:last-child td, &:last-child th":
																							{
																								border: 0,
																							},
																						}}
																					>
																						<TableCell
																							scope="row"
																							className='ps-0'
																							style={{width:"160px"}}
																						>
																							{row?.baseCurrency}
																						</TableCell>
																						<TableCell align="right" className=''>
																							{row?.currencyConversion}
																						</TableCell>
																					</TableRow>
																				))}
																			</TableBody>
																		</Table>
																	</TableContainer>

																	</div>
																)}
															</div>
														</>
													)} */}
													{/* <div className="col-12 col-md-4">
														<div>
															<div>
																<span
																	className="f14   mb-1"
																	style={{
																		fontWeight: "600",
																		color: "black",

																	}}
																>
																	Purchase Org:
																</span>{" "}
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	{findStringByValueFromArray(
																		purchaseAllList,
																		formik.values?.purchOrgId?.id,
																		"id",
																		"orgName"
																	)}
																</span>
															</div>
														</div>
													</div> */}

													{/* <div className="col-12 col-md-4">
														<div>
															<div>
																<span
																	className="f14   mb-1"
																	style={{
																		fontWeight: "600",
																		color: "black",

																	}}
																>
																	Purchase Group:
																</span>{" "}
																<span
																	className="f14 mb-2"
																	style={{
																		fontWeight: "400",

																	}}
																>
																	{findStringByValueFromArray(
																		purchaseGroupAllList,
																		formik.values?.purchGrpId?.id,
																		"id",
																		"groupName"
																	)}
																</span>
															</div>
														</div>
													</div> */}
												</div>
												<hr className="mt-0 mb-4" />
												<div className="col-12 col-md-12  mb-3">
													<div
														className="f14 mb-1"
														style={{
															color: "black",
															fontWeight: "500",

														}}
													>
														Description *
													</div>
													<textarea
                                                    className='w-100 f13 rounded formulaEditor'
                                                    readOnly
                                                    rows={4}
                                                    style={{ resize: 'none' }}
                                                    placeholder='Description'
                                                    value={formik.values.description?.replace(/<\/?[^>]+(>|$)/g, "") || ""}
                                                />
												</div>
												<div className="col-12">
													<div
														className="f14 mb-1"
														style={{
															color: "black",
															fontWeight: "500",

														}}
													>
														Terms & Conditions
													</div>
													<textarea
                                                    className='w-100 f13 rounded formulaEditor'
                                                    readOnly
                                                    rows={4}
                                                    style={{ resize: 'none' }}
                                                    placeholder='Terms & Conditions'
                                                    value={formik.values.termandcondition?.replace(/<\/?[^>]+(>|$)/g, "") || ""}
                                                />
												</div>	
											</div>
										</div>
    </>
  )
}

export default RFIGeneralPreview