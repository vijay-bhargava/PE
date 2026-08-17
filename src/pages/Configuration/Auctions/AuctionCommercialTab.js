import React from 'react';
import { Autocomplete, Checkbox, TextField } from '@mui/material';

const AuctionCommercialTab = ({
	generaltermsDDl,
	selectedCommercalDll,
	setSelectedCommercalDll,
	getLibraryTermsList,
	setSelectedCommercialLibrary,
	stagearray,
	currentStage,
	commercialLibFind,
	LibraryTermsList,
	handleComItemAllCheck,
	handleComItemCheck,
	handleChangeCom,
	formik,
}) => {
	const canEdit = stagearray.includes(currentStage);

	return (
		<div className="mb-5 custom-fix">
			<div className="p-3 pt-0 ps-2 pe-2">
				<div className="d-flex justify-content-between align-items-center">
					<div className="flex-grow-1">
						<div className="row mt-2">
							<div className="col-12 col-md-10 col-lg-6">
								<Autocomplete
									disablePortal
									id="combo-box-demo"
									size="small"
									options={
										!generaltermsDDl
											? [{ label: "Loading...", id: 0 }]
											: generaltermsDDl
									}
									getOptionLabel={(option) => option?.libraryEntity ?? ""}
									className="w-100"
									fullWidth
									value={selectedCommercalDll}
									renderOption={(props, option) => (
										<div {...props} className="d-block">
											<div className="p-1">
												<div className="ms-2">
													{option?.libraryEntity ? option.libraryEntity : "No selection"}
												</div>
											</div>
										</div>
									)}
									onChange={(e, values) => {
										setSelectedCommercalDll(values);
										getLibraryTermsList(values);
										setSelectedCommercialLibrary(values);
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											InputLabelProps={{ shrink: true }}
											label="Select Commercial Terms"
										/>
									)}
									disabled={!canEdit}
								/>
							</div>
						</div>
					</div>
				</div>
				<div
					className="row mt-2"
					style={{
						pointerEvents: !canEdit ? "none" : "auto",
						opacity: !canEdit ? 0.6 : 1,
						backgroundColor: !canEdit ? "#f5f5f5" : "transparent",
					}}
				>
					<div className="col-12 col-md-12">
						<div className="row">
							<div className="col-12 zebracolor">
								{commercialLibFind && commercialLibFind.length > 0 ? (
									<div className="table-responsive">
										<table className="itemstable">
											<thead>
												<tr>
													<th className="text-white fw500 f14">
														<Checkbox
															checked={LibraryTermsList?.every(term => term?.isSelected === true)}
															className="text-white"
															size="medium"
															onChange={(e) => handleComItemAllCheck(e.target.checked)}
														/>
													</th>
													<th className="text-white fw500 f14">Name</th>
													<th className="text-white fw500 f14">UOM</th>
													{commercialLibFind.some(item => item.commValue) && (
														<th className="text-white fw500 f14">Fixed Value</th>
													)}
													{commercialLibFind.some(item => item.formulavalue) && (
														<th className="text-white fw500 f14" style={{ width: 100 }}>Formula value</th>
													)}
													<th className="text-white fw500 f14" style={{ width: 100 }} />
												</tr>
											</thead>
											<tbody>
												{commercialLibFind.map((item, index) => (
													<tr className={index % 2 === 0 ? "even" : "odd"} key={index}>
														<td className="f14">
															<Checkbox
																size="medium"
																checked={item?.isSelected}
																onChange={(e) => handleComItemCheck(index, e.target.checked)}
															/>
														</td>
														<td className="f14">
															{item?.name}
															<div className="text-muted f12">{item?.libraryEntity}</div>
														</td>
														<td className="f14">
															{item?.valuetype === "Currency" ? (
																<span
																	style={{
																		cursor: "pointer",
																		position: "relative",
																		left: "-20px",
																		color: "#007bff",
																		textDecoration: "underline",
																	}}
																	onClick={(e) => handleChangeCom(index, e.target.value, item)}
																>
																	{item?.valuetype}
																	<span className="f12 fw600">
																		{item?.bidTermCurrency?.length
																			? `(${item?.bidTermCurrency[0]?.baseCurrency ?? ""}/${item?.bidTermCurrency[0]?.currencyConversion ?? ""})`
																			: `(${formik?.values?.baseCurrency}/${item?.currencyConversion || "1"})`}
																	</span>
																</span>
															) : (
																<div>{item?.valuetype}</div>
															)}
														</td>
														{commercialLibFind.some(i => i.commValue) && (
															<td className="f14">{item.commValue || ""}</td>
														)}
														{commercialLibFind.some(i => i.formulavalue) && (
															<td className="f14">{item.formulavalue || ""}</td>
														)}
														<td className="f14 d-flex" />
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuctionCommercialTab;
