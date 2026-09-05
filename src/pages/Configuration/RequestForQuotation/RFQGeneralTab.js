import React from 'react';
import {
	Alert, Autocomplete, Badge, Box,
	Checkbox, FormControl, FormControlLabel,
	FormGroup, FormLabel, IconButton, Radio,
	RadioGroup, TextField, Tooltip,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import { HiOutlineX } from 'react-icons/hi';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getDateFormatPatteronLocale, userampm, extractTextFromHTML } from '../../../utils/common/utility';
import RFQGeneralPreview from './RFQGeneralPreview';
import { toast } from 'react-toastify';

dayjs.extend(utc);
dayjs.extend(timezone);

const RFQGeneralTab = ({
	// permissions
	canRead,
	canEdit,
	canCreate,
	canRemove,
	showGeneralAccessDenied,
	// form state
	formik,
	inputList,
	// lookups
	loadRequisitioner,
	requisitionerList,
	purchaseAllList,
	purchaseGroupAllList,
	stagelist,
	currencyList,
	loadCurrency,
	stagearray,
	currentStage,
	idFromURL,
	userDetail,
	attachmentforevent,
	// handlers
	handleRequisitionerChange,
	PullUserDesignation,
	handleBaseCurrency,
	pullgetCurrency,
	handleInputChange,
	handleAddClick,
	handleRemoveClick,
	handletabEdit,
	setApproverShow,
	setWorkflowPanelTab,
	setPurchaseOrgModal,
	setPurchaseGroupAllList,
	setPurchaseOrgGrpModal,
	setOpenCurrencyModal,
}) => {
	if (showGeneralAccessDenied) {
		return (
			<div className="p-4">
				<Alert severity="error">
					<div className="d-flex align-items-center">
						Access Denied: You don't have permission to view General settings.
					</div>
				</Alert>
			</div>
		);
	}

	if (stagearray.includes(currentStage)) {
		return (
			<div>
				{/* Permission Status Alert */}
				<div className="row mb-3">
					<div className="col-12">
						<label className="pe-field-label">RFQ Subject <span className="rfq-required-star">*</span></label>
						<TextField
							fullWidth
							size="small"
							variant="outlined"
							name="subject"
							id="subject"
							value={formik.values.subject}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							error={formik.touched.subject && Boolean(formik.errors.subject)}
							helperText={formik.touched.subject && formik.errors.subject}
							disabled={!canEdit}
							className="w-100 f14"
							autoComplete="off"
						/>
					</div>
				</div>
				<div className="row mb-3">
					<div className="col-12">
						<label className="pe-field-label">RFQ Description <span className="rfq-required-star">*</span></label>
						<div className={`rfq-dv2-quill-field${formik.touched.description && formik.errors.description ? ' rfq-dv2-quill-error' : ''}`}>
							<ReactQuill
								theme="snow"
								value={formik.values.description || ''}
								onChange={(content) => {
									formik.setFieldValue('description', content);
									if (!formik.touched.description) formik.setFieldTouched('description', true);
								}}
								readOnly={!canEdit}
								placeholder="Enter description..."
								style={{ backgroundColor: !canEdit ? '#f5f5f5' : 'white' }}
							/>
						</div>
						{formik.touched.description && formik.errors.description && (
							<span className="rfq-field-error">{formik.errors.description}</span>
						)}
					</div>
				</div>

				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<div className="row mt-4 mb-2">
						{/* Requisitioner */}
						<div className="col-12 col-md-4 col-lg-4 rfq-dv2-requisitioner-field">
							<label className="pe-field-label">Requisitioner</label>
							<Autocomplete
								id="requisitioner"
								name="requisitioner"
								size="small"
								className="w-100 f14"
								loading={loadRequisitioner}
								onOpen={() => {
									PullUserDesignation();
								}}
								options={requisitionerList ? requisitionerList.map(item => item.name) : []}
								getOptionLabel={(option) => option}
								value={formik.values.requisitioner || ''}
								onChange={(event, value) => handleRequisitionerChange(value)}
								renderInput={(params) => (
									<TextField
										{...params}
										variant="outlined"
										error={formik.touched.requisitioner && Boolean(formik.errors.requisitioner)}
										helperText={formik.touched.requisitioner && formik.errors.requisitioner}
									/>
								)}
							/>
						</div>

						{/* Start Date */}
						<div className="col-12 col-md-4 col-lg-4 rfq-dv2-start-field">
							<label className="pe-field-label">Start Date/Time</label>
							<MobileDateTimePicker
								name="startDate"
								id="startDate"
								value={formik.values?.startDate}
								onChange={(newValue) => formik.setFieldValue("startDate", newValue)}
								minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
								timezone={userDetail?.timeZone}
								format={getDateFormatPatteronLocale(userDetail)}
								ampm={userampm(userDetail)}
								className="w-100 f14"
								slotProps={{
									textField: {
										variant: "outlined",
										size: "small",
										error: formik.touched?.startDate && Boolean(formik.errors?.startDate),
										helperText: formik.touched?.startDate && formik.errors?.startDate,
									},
									actionBar: {
										actions: ["clear", "cancel", "accept"],
									},
								}}
							/>
						</div>

						{/* End Date */}
						<div className="col-12 col-md-4 col-lg-4 rfq-dv2-end-field">
							<label className="pe-field-label">End Date/Time <span className="rfq-required-star">*</span></label>
							<MobileDateTimePicker
								name="endDate"
								id="endDate"
								value={formik.values.endDate}
								onChange={(newValue) => formik.setFieldValue("endDate", newValue)}
								minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
								timezone={userDetail?.timeZone}
								format={getDateFormatPatteronLocale(userDetail)}
								ampm={userampm(userDetail)}
								className="w-100 f14"
								slotProps={{
									textField: {
										variant: "outlined",
										size: "small",
										error: formik.touched.endDate && Boolean(formik.errors.endDate),
										helperText: formik.touched.endDate && formik.errors.endDate,
									},
									actionBar: { actions: ["clear", "cancel", "accept"] },
								}}
							/>
						</div>
					</div>
				</LocalizationProvider>

				<div className="row mt-4 mb-2 align-items-center">
					{/* Purchase Org */}
					{purchaseAllList && (
						<div className="col-12 col-md-4 col-lg-4 mb-2 rfq-dv2-purchase-org-field">
							<label className="pe-field-label">Purchase Org</label>
							<Autocomplete
								id="purchOrgId"
								name="purchOrgId"
								size="small"
								className="w-100 f14"
								options={(() => {
									if (userDetail?.roleId !== 1 && userDetail?.purchOrgId) {
										const userOrg = purchaseAllList.find(org => org.id === userDetail.purchOrgId);
										return userOrg ? [userOrg] : [];
									}
									return [{ id: "new", orgName: "ADD NEW" }, ...purchaseAllList];
								})()}
								value={formik.values.purchOrgId}
								getOptionLabel={(option) => option.orgName ?? ""}
								onChange={(e, value) => {
									if (value?.id === "new") {
										setPurchaseOrgModal(true);
										formik.setFieldValue("purchGrpId", null);
										return;
									}
									if (value) {
										formik.setFieldValue("purchOrgId", value);
										formik.setFieldValue("purchGrpId", null);
									} else {
										formik.setFieldValue("purchOrgId", null);
										formik.setFieldValue("purchGrpId", null);
									}
									setPurchaseGroupAllList([]);
								}}
								renderOption={(props, option) => (
									<Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
										{option.orgName}
									</Box>
								)}
								renderInput={(params) => (<TextField	{...params} variant="outlined" />)}
							/>
						</div>
					)}

					{/* Purchase Group */}
					{purchaseGroupAllList && (
						<div className="col-12 col-md-4 col-lg-4 mb-2 rfq-dv2-purchase-group-field">
							<label className="pe-field-label">Purchase Group <span className="rfq-required-star">*</span></label>
							<Autocomplete
								id="purchGrpId"
								name="purchGrpId"
								size="small"
								className="w-100 f14"
								options={[
									{ id: "new", groupName: "ADD NEW" },
									...purchaseGroupAllList,
								]}
								value={formik.values?.purchGrpId}
								getOptionLabel={(option) => option?.groupName ?? ""}
								onChange={(e, value) => {
									if (value?.id === "new") {
										setPurchaseOrgGrpModal(true);
										return;
									}
									formik.setFieldValue("purchGrpId", value);
								}}
								renderOption={(props, option) => (
									<Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
										{option.groupName}
									</Box>
								)}
								renderInput={(params) => (
									<TextField
										{...params}
										variant="outlined"
										error={formik.touched.purchGrpId && Boolean(formik.errors.purchGrpId)}
										helperText={formik.touched.purchGrpId && formik.errors.purchGrpId}
									/>
								)}
							/>
						</div>
					)}
					{/* Show Price to Technical Approver */}
					{stagelist?.some(item => item.currentStage === "Technical Approval") &&
						(<div className="col-12 col-md-4 col-lg-4 mb-2 mt-3">
							<FormGroup>
								<FormControlLabel
									control={<Checkbox checked={formik?.values?.showPriceTech === true} />}
									id="sealedBid"
									label={<span className="f13 muted">Show Price to Technical Approver</span>}
									labelPlacement={"end"}
									name="sealedBid"
									value={formik.values.showPriceTech}
									onChange={(e) => {
										const newValue = e.target.checked ? true : false;
										formik.setFieldValue("showPriceTech", newValue);
									}}
								/>
							</FormGroup>
						</div>)
					}
				</div>

				<div className="col-12 mb-1 rfq-dv2-terms-field">
					<FormControl className="w-100">
						<FormLabel id="baseCurrency">
							<span className="f13">	Select Currency Mode	</span>
						</FormLabel>
						<RadioGroup
							row
							aria-labelledby="baseCurrency"
							name="baseCurrency"
							value={formik.values.IsMultiCurrency}
							onChange={(e) => {
								formik.setFieldValue(
									"IsMultiCurrency",
									e.target.value === "true" ? true : false
								);
								formik.setFieldValue(
									"baseCurrency",
									formik?.values?.baseCurrency || userDetail?.defaultCurrency
								);
							}}
						>
							<FormControlLabel
								value={false}
								control={<Radio />}
								label={
									<span>
										Base Currency{" "}
										{userDetail && userDetail?.defaultCurrency ? (
											<span className="f12 text-primary pointer" onClick={handleBaseCurrency}>
												({`${formik?.values?.baseCurrency || userDetail?.defaultCurrency}`})
											</span>
										) : (
											<span></span>
										)}
									</span>
								}
							/>
							<FormControlLabel
								value={true}
								control={<Radio />}
								label="Multiple Currency"
							/>
						</RadioGroup>
					</FormControl>
					{formik.values.IsMultiCurrency ? (
						<>
							<div className="row">
								<div className="col-12">
									<div className="row">
										<div className="col-12 col-lg-12 mt-3">
											{inputList?.map((x, i) => {
												return (
													<div className="row  d-flex align-items-center w-100 mb-3" key={i}>
														<div className="col-lg-4 col-12">
															<label className="pe-field-label">Select Currency <span className="rfq-required-star">*</span></label>
															<Autocomplete
																id={"baseCurrency" + i}
																name="baseCurrency"
																options={[
																	{ currencyNm: "ADD NEW", id: "new" },
																	...(currencyList?.filter(cl => cl.currencyNm !== (formik?.values?.baseCurrency || userDetail?.defaultCurrency)) || []),
																]}
																getOptionLabel={(option) => option.currencyNm}
																loading={loadCurrency}
																onOpen={() => {
																	if (currencyList.length === 0)
																		pullgetCurrency();
																}}
																onChange={(event, value) => {
																	if (value && value.id === "new") {
																		setOpenCurrencyModal(true);
																	} else {
																		handleInputChange({ target: { value: value ? value?.currencyNm : "", name: "baseCurrency" } }, i);
																	}
																}}
																value={
																	currencyList.find(
																		(option) => option.currencyNm === x.baseCurrency
																	) || { currencyNm: x.baseCurrency }
																}
																renderInput={(params) => (
																	<TextField {...params} name="baseCurrency" variant="outlined" size="small" className="w-100 f14" />
																)}
																renderOption={(props, option) => (
																	<Box
																		component="li"
																		{...props}
																		key={option.id || option.currencyNm}
																		style={
																			option.id === "new"
																				? {
																					fontWeight: 500,
																					cursor: "pointer",
																					textDecoration: "underline",
																				}
																				: {}
																		}
																	>
																		{option.currencyNm}
																	</Box>
																)}
															/>
														</div>
														<div className="col-lg-4 col-12">
															<label className="pe-field-label">Conversion Factor <span className="rfq-required-star">*</span></label>
															<TextField
																variant="outlined"
																className={`w-100 ${x && x.baseCurrency && x.currencyConversion && !isNaN(parseFloat(x.currencyConversion)) && parseFloat(x.currencyConversion) <= 0 ? 'invalid-input' : ''}`}
																required
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
																<div className="col-lg-1 col-6 ms-0 ps-0 ps-3 pt-4">
																	<button
																		type="button"
																		className="pe-icon-btn pe-icon-btn--delete"
																		disabled={inputList?.length === 1}
																		onClick={() => handleRemoveClick(i)}
																	>
																		<HiOutlineX />
																	</button>
																</div>
															</>
														) : (
															<>
																{inputList.length !== 1 && (
																	<div className="col-lg-1 col-6 ms-0 ps-0 ps-3 pt-4">
																		<button
																			type="button"
																			className="pe-icon-btn pe-icon-btn--delete"
																			onClick={() => handleRemoveClick(i)}
																		>
																			<HiOutlineX />
																		</button>
																	</div>
																)}
															</>
														)}
														{inputList?.length ? (
															<>
																{inputList.length - 1 === i && (
																	<div className="col-lg-2 col-6 pe-0 ms-0 ps-3 pt-4 currencyButton">
																		<button
																			type="button"
																			disabled={
																				(x.currencyConversion === "") ||
																				(x.baseCurrency === "")
																			}
																			className="pe-btn pe-btn--secondary"
																			onClick={handleAddClick}
																		>
																			+ Add More
																		</button>
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
					<div className="rfq-dv2-quill-field-header">
						<span>Terms & Conditions <span className="rfq-required-star">*</span></span>
						{idFromURL && (
							<span>
								<Tooltip title="Attachments">
									<IconButton
										size="small"
										className="border-primary  bg-white"
										onClick={() => {
											setApproverShow(true);
											setWorkflowPanelTab("attachments");
										}}
									>
										<Badge
											style={{ padding: "0px 4px", fontSize: "10px" }}
											badgeContent={attachmentforevent?.filter(a => a.fileType === "TC").length || 0}
											color={attachmentforevent?.some(a => a.fileType === "TC") ? "success" : "info"}
										>
											<FilePresentIcon className="f16" />
										</Badge>
									</IconButton>
								</Tooltip>
							</span>
						)}
					</div>
					<ReactQuill
						id="termandcondition"
						theme="snow"
						preserveWhitespace
						className=""
						value={formik.values.termandcondition}
						onChange={(value) => {
							const termandcondition = extractTextFromHTML(value);
							const length = termandcondition.length;
							if (length <= 2000) {
								formik.setFieldValue("termandcondition", value);
							} else {
								formik.setFieldValue(
									"termandcondition",
									formik.values.termandcondition
								);
								toast.error('Term and Condition greater than 2000 character is not allowed', {
									toastId: "t&cerr"
								});
							}
						}}
					/>
					{formik.values.termandcondition !== "0" && extractTextFromHTML(formik.values.termandcondition)?.length !== "0" && (
						<div style={{ fontSize: "0.8em", color: "grey", textAlign: "end" }}>
							{`${extractTextFromHTML(formik.values.termandcondition)?.length || ""}/2000`}{" "}
						</div>
					)}
					{formik.touched.termandcondition && formik.errors.termandcondition && (
						<span className="rfq-field-error">{formik.errors.termandcondition}</span>
					)}
				</div>
				<div className="col-12 mb-4 d-flex align-items-center rfq-dv2-toggle-section">
					<div className="col-12 col-md-2 col-lg-2 mt-3">
						<FormGroup>
							<FormControlLabel
								control={<Checkbox checked={formik?.values?.RFQType === "closed"} />}
								id="sealedBid"
								label={<span className="f14 muted">Sealed Bid</span>}
								labelPlacement={"end"}
								name="sealedBid"
								value={formik.values.RFQType}
								onChange={(e) => {
									const newValue = e.target.checked ? "closed" : "open";
									formik.setFieldValue("RFQType", newValue);

									if (newValue === "open") {
										formik.setFieldValue("bidOpeningDate", null);
									}

									//versionhistoryhandling
									const currentVersion = formik.values.Version;
									const updatedHistory = [...(formik.values.RFQVersionHistory || [])];

									const index = updatedHistory?.findIndex(
										(entry) => entry.version === currentVersion
									);
									if (newValue === "open") {
										if (index !== -1) {
											updatedHistory[index].bidOpeningDate = null;
											updatedHistory[index].OpenQuotes = 'Y';
											updatedHistory[index].autoOpenEnabled = false;
										}
									} else {
										if (index !== -1) {
											updatedHistory[index].OpenQuotes = 'N';
										}
									}
								}}
							/>
						</FormGroup>
					</div>
					<div className="col-12 col-md-2 col-lg-2 ms-3 mt-3">
						<FormGroup>
							<FormControlLabel
								control={<Checkbox checked={formik.values.boqReq === true} />}
								id="boqReq"
								label={<span className="f14 muted">BOQ</span>}
								labelPlacement={"end"}
								name="boqReq"
								onChange={(e) => formik.setFieldValue("boqReq", e.target.checked)}
							/>
						</FormGroup>
					</div>
					{formik.values.RFQType === "closed" && (
						<>
							<div className="col-12 col-md-6 col-lg-4 ms-0 ps-0 me-2">
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<label className="pe-field-label">Bid Open Date/Time</label>
									<MobileDateTimePicker
										disabled={!(formik.values.RFQType === "closed")}
										variant="outlined"
										size="small"
										name="bidOpeningDate"
										id="bidOpeningDate"
										timezone={userDetail?.timeZone}
										minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
										value={formik.values?.bidOpeningDate}
										className="w-100 f14 "
										slotProps={{
											textField: {
												variant: "outlined",
												size: "small",
												error: formik.touched.bidOpeningDate && Boolean(formik.errors.bidOpeningDate),
												helperText: formik.touched.bidOpeningDate && formik.errors.bidOpeningDate,
											},
											actionBar: { actions: ["clear", "cancel", "accept"] },
										}}
										onChange={(newValue) => {
											formik.setFieldValue("bidOpeningDate", newValue);

											const currentVersion = formik.values.Version;
											const updatedHistory = [...(formik.values.RFQVersionHistory || [])];

											const index = updatedHistory?.findIndex(
												(entry) => entry.version === currentVersion
											);

											if (index !== -1) {
												updatedHistory[index].bidOpeningDate = newValue;
											}

											formik.setFieldValue("RFQVersionHistory", updatedHistory);
										}}
										format={getDateFormatPatteronLocale(userDetail)}
										ampm={userampm(userDetail)}
									/>
								</LocalizationProvider>
							</div>
						</>
					)}
				</div>
			</div>
		);
	}

	// Read-only preview mode
	if (!idFromURL || idFromURL === 'add') return null;

	return (
		<RFQGeneralPreview
			formik={formik}
			inputList={inputList}
			purchaseAllList={purchaseAllList}
			purchaseGroupAllList={purchaseGroupAllList}
			stagearray={stagearray}
			currentStage={currentStage}
			handletabEdit={handletabEdit}
		/>
	);
};

export default RFQGeneralTab;
