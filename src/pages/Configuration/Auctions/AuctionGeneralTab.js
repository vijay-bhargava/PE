import React from "react";
import {
	Autocomplete, Alert, Button,
	Checkbox, FormControl, FormControlLabel, FormHelperText, FormLabel,
	InputAdornment, MenuItem, Radio, RadioGroup,
	TextField, Tooltip, Typography, Badge, Box, IconButton,
} from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import ReactQuill from "react-quill";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { HiOutlineX } from "react-icons/hi";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-quill/dist/quill.snow.css";
import { CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import { extractTextFromHTML, getDateFormatPatteronLocale, userampm } from "../../../utils/common/utility";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import BidGeneralPreview from "./BidGeneralPreview";

const AuctionGeneralTab = ({
	loadingPermissions,
	permissionManager,
	stagearray,
	currentStage,
	formik,
	bidtype,
	idFromURL,
	userDetail,
	inputList,
	handleInputChange,
	handleAddClick,
	handleRemoveClick,
	currencyList,
	pullgetCurrency,
	openCurrencyModal,
	setOpenCurrencyModal,
	handleBaseCurrency,
	attachmentdrawerref,
	attachmentforevent,
	updateBidEndDate,
	updateBidDuration,
	handletabEdit,
	showGeneralAccessDenied,
}) => {
	if (loadingPermissions) return <GridSkeleton />;
	const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false;
	const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false;
	const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false;
	const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.REMOVE) ?? false;
	if (!hasReadPermission) {
		return (
			<div className="p-4">
				<Alert severity="error">
					<div className="d-flex align-items-center">
						<HiOutlineX className="me-2 f18" />
						Access Denied: You don't have permission to view General settings.
					</div>
				</Alert>
			</div>
		);
	}
	return (
		<>
			{stagearray.includes(currentStage) && (
				<div className='p-3'>
					<form onSubmit={formik.handleSubmit} autoComplete="off">
						<div className="row mt-2">
							<div className="col-12 mb-4">
								<label className="pe-field-label">Subject <span className="rfq-required-star">*</span></label>
								<TextField
									id="subject"
									name="subject"
									placeholder=""
									size="small"
									variant="outlined"
									className="w-100 f14"
									inputProps={{ maxLength: 200 }}
									disabled={!hasEditPermission}
									value={formik.values.subject}
									onChange={formik.handleChange}
									error={formik.touched.subject && Boolean(formik.errors.subject)}
									helperText={formik.touched.subject && formik.errors.subject}
									InputProps={{
										endAdornment: formik.values.subject && (
											<InputAdornment position="end">
												<Typography variant="body2" color="textSecondary">
													{formik.values.subject.length}/200
												</Typography>
											</InputAdornment>
										),
									}}
								/>
							</div>
							<div className="col-12 mb-3">
								<label className="pe-field-label">Description <span className="rfq-required-star">*</span></label>
								<ReactQuill
									id="descriptionquill"
									theme="snow"
									preserveWhitespace
									className=""
									readOnly={!hasEditPermission}
									value={formik.values.description}
									onChange={(value) => {

										const description = extractTextFromHTML(value);

										const length = description.length;
										if (length <= 2000) {
											formik.setFieldValue(
												"description",
												value
											);
										} else {

											formik.setFieldValue(
												"description",
												formik.values.description
											);
											toast.error('Description greater than 2000 character is not allowed', {
												toastId: "descerr"
											});

										}
									}}
								/>
								{formik.values.description !== undefined && (
									<div
										style={{
											fontSize: "0.8em",
											color: "grey",
											textAlign: "end",
										}}
									>
										{`${extractTextFromHTML(formik.values.description).length}/2000`}{" "}
									</div>
								)}
								{formik.touched.description &&
									Boolean(formik.errors.description) ? (
									<>
										<FormHelperText className="text-danger">
											{formik.errors.description}
										</FormHelperText>
									</>
								) : (
									<></>
								)}
							</div>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<div className="col-12 col-md-3 col-lg-3 mb-4">
									<label className="pe-field-label">Start Date <span className="rfq-required-star">*</span></label>
									<MobileDateTimePicker
										variant="outlined"
										size="small"
										name="bidStDate"
										id="bidStDate"
										timezone={userDetail?.timeZone}
										disabled={!hasEditPermission}
										minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)} // Set min date/time to current
										value={formik.values.bidStDate}
										className="w-100 f14"
										slotProps={{
											textField: {
												variant: 'outlined',
												size: 'small',
												error: formik.touched.bidStDate && Boolean(formik.errors.bidStDate),
												helperText: formik.touched.bidStDate && formik.errors.bidStDate
											},
											actionBar: { actions: ["clear", "cancel", "accept"] }
										}}
										onChange={(newValue) => {

											formik.setFieldValue('bidStDate', newValue);
											updateBidEndDate(newValue, formik.values.bidDuration);
											updateBidDuration(newValue, formik.values.bidEndDate);
										}}
										format={getDateFormatPatteronLocale(userDetail)}
										ampm={userampm(userDetail)}
									/>
								</div>
								<div className="col-12 col-md-3 col-lg-3 mb-4">
									<label className="pe-field-label">End Date</label>
									<MobileDateTimePicker
										variant="outlined"
										size="small"
										name="bidEndDate"
										id="bidEndDate"
										timezone={userDetail?.timeZone}
										minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
										value={formik.values.bidEndDate}
										className="w-100 f14"
										slotProps={{
											textField: {
												variant: 'outlined',
												size: 'small',
											},
											actionBar: { actions: ["clear", "cancel", "accept"] }
										}}
										onChange={(newValue) => {

											formik.setFieldValue('bidEndDate', newValue);
											updateBidDuration(formik.values.bidStDate, newValue);
										}}
										disabled={formik.values.bidClosingType === 'S' || formik.values.bidSubTypeId === 82 || !hasEditPermission}
										format={getDateFormatPatteronLocale(userDetail)}
										ampm={userampm(userDetail)}
									/>
								</div>
								<div className="col-12 col-md-3 col-lg-3 mb-4">
									<label className="pe-field-label">Duration (mins){formik.values.bidClosingType !== 'S' && <span className="rfq-required-star">*</span>}</label>
									<TextField
										name="bidDuration"
										id="bidDuration"
										className="w-100 f14"
										value={formik.values.bidDuration || ''}
										size="small"
										variant="outlined"
										inputProps={{
											maxLength: 7,
											inputMode: 'numeric',
											pattern: "[0-9]*"
										}}
										onKeyDown={(e) => {
											if (
												!/[0-9]/.test(e.key) &&
												e.key !== 'Backspace' &&
												e.key !== 'ArrowLeft' &&
												e.key !== 'ArrowRight' &&
												e.key !== 'Tab'
											) {
												e.preventDefault();
											}
										}}
										onChange={(e) => {
											const newDuration = e.target.value ? e.target.value : 0;
											formik.setFieldValue('bidDuration', newDuration);
											updateBidEndDate(formik.values.bidStDate, newDuration);
										}}
										disabled={formik.values.bidClosingType === 'S' || formik.values.bidSubTypeId === 82 || !hasEditPermission}
									/>
									{formik.errors.bidDuration && formik.touched.bidDuration && (
										<div className="error error-red" style={{ fontSize: '12px' }}>
											{formik.errors.bidDuration}
										</div>
									)}
								</div>
								<div className="col-12 col-md-3 col-lg-3 mb-4">
									<label className="pe-field-label">Display Vendors Rank <span className="rfq-required-star">*</span></label>
									{bidtype?.id === 1 || bidtype?.id === 5 ? (
										<TextField
											id="showRankToVendor"
											name="showRankToVendor"
											select
											className="w-100 f14"
											size="small"
											variant="outlined"
											value={formik.values.showRankToVendor}
											disabled={!hasEditPermission}
											onChange={formik.handleChange}
										>
											<MenuItem value="Y">As H1, H2, H3 etc.</MenuItem>
											<MenuItem value="N">As H1 Or Not H1.</MenuItem>
											{/* <MenuItem value="T">Traffic Light.</MenuItem> */}
										</TextField>
									) : (
										<TextField
											id="showRankToVendor"
											name="showRankToVendor"
											select
											className="w-100 f14"
											size="small"
											variant="outlined"
											value={formik.values.showRankToVendor}
											disabled={!hasEditPermission || formik.values.bidSubTypeId === 82}
											onChange={formik.handleChange}
										>
											<MenuItem value="Y">As L1, L2, L3 etc.</MenuItem>
											<MenuItem value="N">As L1 Or Not L1.</MenuItem>
											{/* <MenuItem value="T">Traffic Light.</MenuItem> */}
										</TextField>
									)}
								</div>
							</LocalizationProvider>
							<div className="col-12">
								<div className="row">
									<div className="col-12 col-md-3 col-lg-3 mb-4">

										<label className="pe-field-label">Closing Type <span className="rfq-required-star">*</span></label>
										<TextField
											id="bidClosingType"
											name="bidClosingType"
											select
											className="w-100 f14"
											size="small"
											variant="outlined"
											value={formik.values.bidClosingType}
											disabled={formik.values.bidSubTypeId === 82 || bidtype?.id === 4 || bidtype?.id === 5 || bidtype?.id === 6 || !hasEditPermission}
											onChange={(event) => {

												const selectedValue = event.target.value;
												formik.setFieldValue("bidClosingType", selectedValue);

												if (selectedValue === 'S') {
													formik.setFieldValue("noOfStaggerItems", 1);
													formik.setFieldValue("bidEndDate", null);
													formik.setFieldValue("bidDuration", 0);
												} else {
													formik.setFieldValue("noOfStaggerItems", 0);
													formik.setFieldValue("bidEndDate", null);
													formik.setFieldValue("bidDuration", 0);
												}
											}}
										>
											<MenuItem value='A'>
												All Items In One go
											</MenuItem>
											<MenuItem value='S'>
												Stagger At Item Level
											</MenuItem>

										</TextField>
									</div>
									{formik.values.bidClosingType === 'S' && (
										<div className="col-12 col-md-3 col-lg-3 mb-4">
											<div className="">
												<label className="pe-field-label">Items to run simultaneously <span className="rfq-required-star">*</span></label>
												<TextField
													id="noOfStaggerItems"
													name="noOfStaggerItems"
													className="w-100 f14"
													size="small"
													variant="outlined"
													value={formik.values.noOfStaggerItems}
													disabled={!hasEditPermission}
													onChange={formik.handleChange}
												/>
											</div>
										</div>
									)}
									<div className="col-12 col-md-3 col-lg-3 mb-4">
										<label className="pe-field-label">Auction Type <span className="rfq-required-star">*</span></label>
										<TextField
											name="bidSubTypeId"
											id="bidSubTypeId"
											select
											className="w-100 f14"
											size="small"
											variant="outlined"
											value={formik.values.bidSubTypeId}
											disabled={bidtype?.id === 4 || !hasEditPermission}
											//onChange={formik.handleChange}
											onChange={(e) => {
												const value = e.target.value;
												formik.setFieldValue("bidSubTypeId", value);
												if (value === 82) {
													formik.setFieldValue("showRankToVendor", "N");
													formik.setFieldValue("bidEndDate", null);
													formik.setFieldValue("bidDuration", 0);
													formik.setFieldValue("bidClosingType", 'A');
												} else {
													formik.setFieldValue("showRankToVendor", "Y");
													formik.setFieldValue("bidEndDate", null);
													formik.setFieldValue("bidDuration", 0);
													formik.setFieldValue("bidClosingType", 'A');
												}
											}}
										>
											<MenuItem value={81}>
												English
											</MenuItem>
											<MenuItem value={83}>
												Japanese
											</MenuItem>
											<MenuItem value={82}>
												Dutch
											</MenuItem>

										</TextField>
									</div>
									<div className="col-12 col-md-3 col-lg-3 mb-4">
										<label className="pe-field-label">Maximum No. of Bid Extensions</label>
										<TextField
											id="maximumExtension"
											name="maximumExtension"
											select
											className="w-100 f14"
											size="small"
											variant="outlined"
											value={formik.values.maximumExtension}
											onChange={(e) => {
												const val = parseInt(e.target.value, 10);
												formik.setFieldValue("maximumExtension", val);
												formik.setFieldValue("extensionDuration", val === 0 ? 0 : 2);
											}}
										>
											<MenuItem value={-1}>Unlimited</MenuItem>
											{/* value 18 maps to display "8" — intentional server-side enum gap */}
											{[0, 1, 2, 3, 4, 5, 6, 7, 18, 9, 10].map((v, i) => (
												<MenuItem key={v} value={v}>{i}</MenuItem>
											))}
										</TextField>
									</div>
									{formik.values.bidClosingType !== 'S' && (
										<div className="col-12 col-md-3 col-lg-3 mb-4">
											<label className="pe-field-label">Extension Duration (mins)</label>
											<TextField
												id="extensionDuration"
												name="extensionDuration"
												className="w-100 f14"
												size="small"
												variant="outlined"
												InputProps={{
													inputProps: {
														min: 0,
														max: 10,
														step: 1,
													},
												}}
												value={formik.values.extensionDuration}
												onChange={(e) => {
													const value = e.target.value;
													if (value === "" || parseInt(value, 10) <= 10) {
														formik.setFieldValue(
															"extensionDuration",
															value === "" ? "" : parseInt(value, 10)
														);
													}
												}}
												disabled={formik.values.maximumExtension === 0 || !hasEditPermission}
											/>
											{formik.errors.extensionDuration && formik.touched.extensionDuration && (
												<div className="error error-red" style={{ fontSize: "12px" }}>
													{formik.errors.extensionDuration}
												</div>
											)}
										</div>
									)}
								</div>
							</div>
							<div className="col-12 ">
								<div className="row">
									{formik.values.bidClosingType === 'S' && (
										<div className="col-12 col-md-3 col-lg-3 mb-4">
											<label className="pe-field-label">Extension Duration (In Minutes)</label>
											<TextField
												id="extensionDuration"
												name="extensionDuration"
												className="w-100 f14"
												size="small"
												variant="outlined"
												InputProps={{
													inputProps: {
														min: 0,
														max: 10,
														step: 1,
													},
												}}
												value={formik.values.extensionDuration}
												onChange={(e) => {
													const value = e.target.value;
													if (value === "" || parseInt(value, 10) <= 10) {
														formik.setFieldValue(
															"extensionDuration",
															value === "" ? "" : parseInt(value, 10)
														);
													}
												}}
												disabled={formik.values.maximumExtension === 0 || !hasEditPermission}
											/>
											{formik.errors.extensionDuration && formik.touched.extensionDuration && (
												<div className="error error-red" style={{ fontSize: "12px" }}>
													{formik.errors.extensionDuration}
												</div>
											)}
										</div>
									)}
									<div className="col-12 col-md-3 col-lg-3 mb-4">
										<label className="pe-field-label">Mask Participants during Bidding <span className="rfq-required-star">*</span></label>
										<TextField
											id="hideVendor"
											name="hideVendor"
											select
											className="w-100 f14"
											size="small"
											variant="outlined"
											value={formik.values.hideVendor}
											disabled={!hasEditPermission}
											onChange={(event) => {
												formik.setFieldValue('hideVendor', event.target.value === 'true');
											}}
										>
											<MenuItem value='false'>
												No
											</MenuItem>
											<MenuItem value='true'>
												Yes
											</MenuItem>
										</TextField>
									</div>
									<div className="col-12 col-md-3 col-lg-3 mb-4">
										<label className="pe-field-label">Mask Quotes during Bidding <span className="rfq-required-star">*</span></label>
										<TextField
											id="hideQuote"
											name="hideQuote"
											select
											className="w-100 f14"
											size="small"
											variant="outlined"
											value={formik.values.hideQuote}
											disabled={!hasEditPermission}
											onChange={(event) => {
												formik.setFieldValue('hideQuote', event.target.value === 'true');
											}}
										>
											<MenuItem value='false'>
												No
											</MenuItem>
											<MenuItem value='true'>
												Yes
											</MenuItem>
										</TextField>
									</div>
								</div>
							</div>
							<div className="col-12 mb-1">
								<FormControl className="w-100">
									<FormLabel id="baseCurrency">
										<span className="f13">
											Select Currency Mode
										</span>
									</FormLabel>
									<RadioGroup
										row
										aria-labelledby="baseCurrency"
										name="baseCurrency"
										value={formik.values.isMultiCurrency}
										onChange={(e) => {
											formik.setFieldValue(
												"isMultiCurrency",
												e.target.value === "true" ? true : false
											);
											formik.setFieldValue(
												"baseCurrency",
												userDetail?.defaultCurrency
											);
										}}
									>
										<FormControlLabel
											value={false}
											control={<Radio />}
											disabled={!hasEditPermission}
											label={
												<span >
													Base Currency{" "}
													{userDetail &&
														userDetail?.defaultCurrency ? (
														<span className="f12 text-primary pointer" onClick={handleBaseCurrency}>
															({`${formik?.values?.baseCurrency || userDetail?.defaultCurrency}`})
														</span>
													) : (
														<span className="f12 pointer" onClick={handleBaseCurrency}>(INR)</span>
													)}
												</span>
											}
										/>
										<FormControlLabel
											value={true}
											control={<Radio />}
											disabled={!hasEditPermission}
											label="Multiple Currency"
										/>
									</RadioGroup>
								</FormControl>
								{
									formik.values.isMultiCurrency ? (
										<>
											<div className="row">
												<div className="col-12">
													<div className="row">
														<div className="col-12 col-lg-12 mt-3">
															{inputList?.map((x, i) => {
																return (
																	<div
																		className="row  d-flex align-items-center w-100 mb-3"
																		key={i}
																	>
																		<div className="col-lg-4 col-12">
																			<label className="pe-field-label">Currency <span className="rfq-required-star">*</span></label>
																			<Autocomplete
																				id={"baseCurrency" + i}
																				name="baseCurrency"
																				options={[
																					{ currencyNm: "ADD NEW", id: "new" },
																					...(currencyList?.filter(cl => cl.currencyNm !== (userDetail?.defaultCurrency || "INR")) || []),
																				]}
																				getOptionLabel={(option) => option.currencyNm ?? ''}
																				disabled={!hasEditPermission}
																				onChange={(event, value) => {
																					if (value?.id === "new") {
																						setOpenCurrencyModal(true);
																					} else {
																						handleInputChange({ target: { value: value?.currencyNm, name: "baseCurrency" } }, i);
																					}
																				}}
																				onOpen={() => {
																					if (currencyList.length === 0)
																						pullgetCurrency();
																				}}
																				value={
																					currencyList.find(
																						(option) => option.currencyNm === x.baseCurrency
																					) || (x.baseCurrency ? { currencyNm: x.baseCurrency } : null)
																				}
																				isOptionEqualToValue={(option, value) => {
																					if (!value) return false;
																					if (option.id === "new") return false;
																					return option.currencyNm === value.currencyNm;
																				}}
																				renderInput={(params) => (
																					<TextField
																						{...params}
																						name="baseCurrency"
																						variant="outlined"
																						size="small"
																						className="w-100 f14"
																					/>
																				)}
																				renderOption={(props, option) => (
																					<Box
																						component="li"
																						{...props}
																						key={option.id || option.currencyNm}
																						className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}
																					>
																						{option.currencyNm}
																					</Box>
																				)}
																				noOptionsText="No options"
																				style={{ width: '100%' }}
																			/>
																		</div>
																		<div className="col-lg-4 col-12">
																			<label className="pe-field-label">Conversion Factor <span className="rfq-required-star">*</span></label>
																			<TextField
																				variant="outlined"
																				className={`w-100 ${x.baseCurrency && x.currencyConversion <= 0 ? 'invalid-input' : ''}`}
																				required
																				disabled={!hasEditPermission}
																				id={`currency-conversion-${i}`}
																				value={x.currencyConversion}
																				size="small"
																				name="currencyConversion"
																				placeholder=""
																				onChange={(e) => handleInputChange(e, i, "currencyConversion")}
																			/>
																		</div>
																		{x.id > 0 ? (
																			<>
																				<div className="col-lg-1 col-6 ms-0 ps-3 pt-4">
																					<button
																						type="button"
																						disabled={inputList?.length === 1 || !hasRemovePermission}
																						className="pe-icon-btn pe-icon-btn--close"
																						onClick={() => handleRemoveClick(i)}
																					>
																						<HiOutlineX className="text-danger" />
																					</button>
																				</div>
																			</>
																		) : (
																			<>
																				{inputList.length !==
																					1 && (
																						<div className="col-lg-1 col-6 ms-0 ps-3 pt-4">
																							<button
																								type="button"
																								disabled={!hasRemovePermission}
																								className="pe-icon-btn pe-icon-btn--close"
																								onClick={() => handleRemoveClick(i)}
																							>
																								<HiOutlineX className="text-danger" />
																							</button>
																						</div>
																					)}
																			</>
																		)}
																		{inputList?.length ? (
																			<>
																				{inputList.length - 1 ===
																					i && (
																						<div className="col-lg-2 col-6 pe-0 ms-0 ps-3 pt-4 currencyButton" >
																							<Button
																								variant="outlined"
																								disabled={
																									x.currencyConversion ===
																									"" ||
																									x.baseCurrency ===
																									"" || !hasCreatePermission
																								}
																								size="small"
																								color="primary"
																								className="f11"
																								onClick={
																									handleAddClick
																								}
																							>
																								+ Add More
																							</Button>
																						</div>
																					)}
																			</>
																		) : null}

																	</div>
																);
															})}
														</div>
													</div>
												</div>
											</div>
										</>
									) : (
										<></>
									)}
							</div>

							<div className="col-12 mb-1">
								<div className="f12 text-muted mb-1">
									<span>Terms & Conditions *</span>
									{idFromURL && (
										<span>
											<Tooltip title="Attachments">
												<IconButton
													size="small"
													className="border-primary  bg-white"
													onClick={() => {
														if (attachmentdrawerref.current) {
															attachmentdrawerref?.current?.handledrawer()
														}
													}}
												>
													<Badge
														style={{ padding: "0px 4px", fontSize: "10px" }}
														// badgeContent={attachmentCount}
														// color={attachmentCount > 0 ? "success" : "info"}
														badgeContent={attachmentforevent?.filter(a => a.fileType === "TC").length || 0}
														color={attachmentforevent?.some(a => a.fileType === "TC") ? "success" : "info"}
													>
														<FilePresentIcon className="f17" />
													</Badge>
												</IconButton>
											</Tooltip>
										</span>
									)}
								</div>

								<ReactQuill
									id="tnC"
									theme="snow"
									preserveWhitespace
									className=""
									readOnly={!hasEditPermission}
									value={formik.values.tnC}
									onChange={(value) => {
										const termandcondition = extractTextFromHTML(value);
										const length = termandcondition.length;
										if (length <= 2000) {
											formik.setFieldValue(
												"tnC",
												value
											);
										} else {
											formik.setFieldValue(
												"tnC",
												formik.values.tnC
											);
											toast.error('Term and Condition greater than 2000 character is not allowed', {
												toastId: "t&cerr"
											});
										}
									}}
								/>
								{formik.values.tnC && extractTextFromHTML(formik.values.tnC)?.length && <div
									style={{
										fontSize: "0.8em",
										color: "grey",
										textAlign: "end",
									}}
								>
									{`${extractTextFromHTML(formik.values.tnC)?.length ?? 0
										}/2000`}{" "}
								</div>}
								{formik.touched.tnC &&
									Boolean(formik.errors.tnC) ? (
									<>
										<FormHelperText className="text-danger">
											{formik.errors.tnC}
										</FormHelperText>
									</>
								) : (
									<></>
								)}
							</div>

							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<div className="col-12 mt-4">
									<div
										className="prebid-row"
										style={{
											display: "grid",
											gridTemplateColumns: formik.values.prebid
												? "1.4fr 1.8fr 1fr 1.5fr 1.5fr"
												: "1.4fr 1.8fr 1fr",
											gap: "16px",
											alignItems: "start",
										}}
									>

										{/* Quotes in Word */}
										<FormControlLabel
											control={
												<Checkbox checked={formik.values.quotesinWords} />
											}
											id="quotesinWords"
											label={<span className="f12 muted">Quotes in Word</span>
											}
											name="quotesinWords"
											value={formik.values.quotesinWords}
											disabled={!hasEditPermission}
											onChange={formik.handleChange}
											sx={{ margin: 0 }}
										/>

										{/* Rank Post Participation */}
										<FormControlLabel
											control={<Checkbox checked={formik.values.rankToVendorPost} />
											}
											id="rankToVendorPost"
											label={<span className="f12 muted">Rank Post Participation</span>
											}
											name="rankToVendorPost"
											value={formik.values.rankToVendorPost}
											disabled={!hasEditPermission}
											onChange={formik.handleChange}
											sx={{ margin: 0 }}
										/>

										{/* Pre Bid */}
										<FormControlLabel
											control={<Checkbox checked={formik.values.prebid} />}
											id="prebid"
											label={<span className="f12 muted">Pre Bid	</span>}
											name="prebid"
											value={formik.values.prebid}
											disabled={!hasEditPermission}
											onChange={formik.handleChange}
											sx={{ margin: 0 }}
										/>

										{/* Start Date + End Date */}
										{formik.values.prebid && (
											<>
												{/* Start Date */}
												<div>
													<label className="pe-field-label"> Start Date{" "}	<span className="rfq-required-star">*</span></label>
													<MobileDateTimePicker
														variant="outlined"
														size="small"
														name="preBidStDate"
														id="preBidStDate"
														timezone={userDetail?.timeZone}
														disabled={!hasEditPermission}
														minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
														value={formik.values.preBidStDate}
														className="w-100 f14"
														slotProps={{
															textField: { variant: "outlined", size: "small", fullWidth: true, },
															actionBar: { actions: ["clear", "cancel", "accept",], },
														}}
														onChange={(newValue) => {
															formik.setFieldValue("preBidStDate", newValue);
														}}
														format={getDateFormatPatteronLocale(userDetail)}
														ampm={userampm(userDetail)}
													/>
												</div>

												{/* End Date */}
												<div>
													<label className="pe-field-label"> End Date{" "}	<span className="rfq-required-star">*</span></label>

													<MobileDateTimePicker
														variant="outlined"
														size="small"
														name="preBidEndDate"
														id="preBidEndDate"
														timezone={userDetail?.timeZone}
														disabled={!hasEditPermission}
														minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
														value={formik.values.preBidEndDate}
														className="w-100 f14"
														slotProps={{
															textField: { variant: "outlined", size: "small", fullWidth: true, },
															actionBar: { actions: ["clear", "cancel", "accept",], },
														}}
														onChange={(newValue) => {
															formik.setFieldValue("preBidEndDate", newValue);
														}}
														format={getDateFormatPatteronLocale(userDetail)}
														ampm={userampm(userDetail)}
													/>
												</div>
											</>
										)}
									</div>
								</div>
							</LocalizationProvider>
						</div>
					</form>
				</div>
			)}
			{!stagearray.includes(currentStage) && !showGeneralAccessDenied && idFromURL && idFromURL !== 'add' && (
				<>
					<BidGeneralPreview
						formik={formik}
						inputList={inputList}
						bidtype={bidtype}
						stagearray={stagearray}
						currentStage={currentStage}
						handletabEdit={handletabEdit}
					//purchaseAllList={purchaseAllList}
					/>
				</>
			)}
		</>
	);
};

export default AuctionGeneralTab;
