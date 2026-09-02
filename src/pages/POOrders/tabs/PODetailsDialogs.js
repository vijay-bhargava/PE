import React from "react";
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { fetchStates, fetchCities } from "../../../utils/common";
import { UpdatePOAddresses, GetPOCondition } from "../../../utils/purchaseOrder";

const PODetailsDialogs = ({
	// Bill To dialog
	openEditBill,
	setOpenEditBill,
	addressCountryOptions,
	billToCountryObj,
	setBillToCountryObj,
	setBillToCountry,
	billStateOptions,
	setBillStateOptions,
	billToStateObj,
	setBillToStateObj,
	billCityOptions,
	setBillCityOptions,
	billToCityObj,
	setBillToCityObj,
	setbillToState,
	setbillToCity,
	billToAddress,
	setbillToAddress,
	billToCity,
	billToState,
	billToCountry,
	atoken,
	pageSlug,
	poSpecificDetails,
	setPoSpecificDetails,
	// Ship To dialog
	openEditShip,
	setOpenEditShip,
	shipToCountryObj,
	setShipToCountryObj,
	setShipToCountry,
	shipStateOptions,
	setShipStateOptions,
	shipToStateObj,
	setShipToStateObj,
	shipCityOptions,
	setShipCityOptions,
	shipToCityObj,
	setShipToCityObj,
	setshipToState,
	setshipToCity,
	shipToAddress,
	setshipToAddress,
	shipToCity,
	shipToState,
	shipToCountry,
	// Add/Edit Condition dialog
	openEditCondition,
	setOpenEditCondition,
	isAddingCondition,
	setIsAddingCondition,
	isItemConditionMode,
	setIsItemConditionMode,
	targetItemForCondition,
	setTargetItemForCondition,
	conditionForm,
	setConditionForm,
	savingCondition,
	setSavingCondition,
	editingCondition,
	selectedVersion,
	versionControllerRef,
	apiClient,
	// Delete Condition dialog
	deleteConditionDialogOpen,
	setDeleteConditionDialogOpen,
	isDeletingCondition,
	setConditionToDelete,
	handleDeleteCondition,
	// Cancel PO dialog
	poCancelDialogOpen,
	closePOCancelDialog,
	poCancelComment,
	setPoCancelComment,
	poCancelError,
	setPoCancelError,
	poCancelSubmitting,
	handlePOCancelConfirm,
}) => {
	return (
		<>
			{/* Edit Bill To dialog */}
			<Dialog open={openEditBill} onClose={() => setOpenEditBill(false)} fullWidth maxWidth="sm">
				<DialogTitle>Edit Bill To</DialogTitle>
				<DialogContent>
					<Box component="form" sx={{ mt: 1 }}>
						{/* 1. Country */}
						<Autocomplete
							size="small"
							fullWidth
							sx={{ mt: 1 }}
							options={addressCountryOptions}
							getOptionLabel={(opt) => opt?.countryName ?? ""}
							value={billToCountryObj}
							isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
							onChange={async (e, val) => {
								setBillToCountryObj(val);
								setBillToCountry(val?.countryName ?? "");
								setBillToStateObj(null);
								setbillToState("");
								setBillToCityObj(null);
								setbillToCity("");
								setBillStateOptions([]);
								setBillCityOptions([]);
								if (val?.id) {
									const states = await fetchStates(val.id, atoken);
									if (states) setBillStateOptions(states);
								}
							}}
							renderInput={(params) => <TextField {...params} label="Country" />}
						/>
						{/* 2. State */}
						<Autocomplete
							size="small"
							fullWidth
							sx={{ mt: 1 }}
							options={billStateOptions}
							getOptionLabel={(opt) => opt?.stateName ?? ""}
							value={billToStateObj}
							isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
							onChange={async (e, val) => {
								setBillToStateObj(val);
								setbillToState(val?.stateName ?? "");
								setBillToCityObj(null);
								setbillToCity("");
								setBillCityOptions([]);
								if (val?.id) {
									const cities = await fetchCities(val.id, atoken);
									if (cities) setBillCityOptions(cities);
								}
							}}
							renderInput={(params) => <TextField {...params} label="State" />}
						/>
						{/* 3. City */}
						<Autocomplete
							size="small"
							fullWidth
							sx={{ mt: 1 }}
							options={billCityOptions}
							getOptionLabel={(opt) => opt?.cityName ?? ""}
							value={billToCityObj}
							isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
							onChange={(e, val) => {
								setBillToCityObj(val);
								setbillToCity(val?.cityName ?? "");
							}}
							renderInput={(params) => <TextField {...params} label="City" />}
						/>
						{/* 4. Address */}
						<TextField
							label="Address"
							fullWidth
							size="small"
							value={billToAddress}
							onChange={(e) => setbillToAddress(e.target.value)}
							margin="normal"
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenEditBill(false)}>Cancel</Button>
					<Button variant="contained" onClick={async () => {
						const dataadd = {
							poId: pageSlug,
							billAddress: billToAddress,
							billCity: billToCityObj?.cityName ?? billToCity,
							billState: billToStateObj?.stateName ?? billToState,
							billToCountry: billToCountry,
							customerId: poSpecificDetails?.customerId,
							shipAddress: "",
							shipCity: "",
							shipState: "",
							shipToCountry: ""
						};
						try {
							const res = await UpdatePOAddresses(dataadd, atoken);
							if (res) {
								setPoSpecificDetails((prev) => ({ ...prev, billToAddress: billToAddress, billToCity: dataadd.billCity, billToState: dataadd.billState, billToCountry: billToCountry }));
							}
						} catch (err) {
							if (err?.response?.data?.Message) toast(err.response.data.Message, { hideProgressBar: true, autoClose: 1200, type: 'error' });
						}
						setOpenEditBill(false);
					}}>
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Ship To dialog */}
			<Dialog open={openEditShip} onClose={() => setOpenEditShip(false)} fullWidth maxWidth="sm">
				<DialogTitle>Edit Ship To</DialogTitle>
				<DialogContent>
					<Box component="form" sx={{ mt: 1 }}>
						{/* 1. Country */}
						<Autocomplete
							size="small"
							fullWidth
							sx={{ mt: 1 }}
							options={addressCountryOptions}
							getOptionLabel={(opt) => opt?.countryName ?? ""}
							value={shipToCountryObj}
							isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
							onChange={async (e, val) => {
								setShipToCountryObj(val);
								setShipToCountry(val?.countryName ?? "");
								setShipToStateObj(null);
								setshipToState("");
								setShipToCityObj(null);
								setshipToCity("");
								setShipStateOptions([]);
								setShipCityOptions([]);
								if (val?.id) {
									const states = await fetchStates(val.id, atoken);
									if (states) setShipStateOptions(states);
								}
							}}
							renderInput={(params) => <TextField {...params} label="Country" />}
						/>
						{/* 2. State */}
						<Autocomplete
							size="small"
							fullWidth
							sx={{ mt: 1 }}
							options={shipStateOptions}
							getOptionLabel={(opt) => opt?.stateName ?? ""}
							value={shipToStateObj}
							isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
							onChange={async (e, val) => {
								setShipToStateObj(val);
								setshipToState(val?.stateName ?? "");
								setShipToCityObj(null);
								setshipToCity("");
								setShipCityOptions([]);
								if (val?.id) {
									const cities = await fetchCities(val.id, atoken);
									if (cities) setShipCityOptions(cities);
								}
							}}
							renderInput={(params) => <TextField {...params} label="State" />}
						/>
						{/* 3. City */}
						<Autocomplete
							size="small"
							fullWidth
							sx={{ mt: 1 }}
							options={shipCityOptions}
							getOptionLabel={(opt) => opt?.cityName ?? ""}
							value={shipToCityObj}
							isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
							onChange={(e, val) => {
								setShipToCityObj(val);
								setshipToCity(val?.cityName ?? "");
							}}
							renderInput={(params) => <TextField {...params} label="City" />}
						/>
						{/* 4. Address */}
						<TextField label="Address" fullWidth size="small" value={shipToAddress} onChange={(e) => setshipToAddress(e.target.value)} margin="normal" />
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenEditShip(false)}>Cancel</Button>
					<Button variant="contained" onClick={async () => {
						const dataadd = {
							poId: pageSlug,
							shipAddress: shipToAddress,
							shipCity: shipToCityObj?.cityName ?? shipToCity,
							shipState: shipToStateObj?.stateName ?? shipToState,
							shipToCountry: shipToCountry,
							customerId: poSpecificDetails?.customerId,
							billAddress: "",
							billCity: "",
							billState: "",
							billToCountry: ""
						};
						try {
							const res = await UpdatePOAddresses(dataadd, atoken);
							if (res) {
								setPoSpecificDetails((prev) => ({ ...prev, shipToAddress: shipToAddress, shipToCity: dataadd.shipCity, shipToState: dataadd.shipState, shipToCountry: shipToCountry }));
							}
						} catch (err) {
							if (err?.response?.data?.Message) toast(err.response.data.Message, { hideProgressBar: true, autoClose: 1200, type: 'error' });
						}
						setOpenEditShip(false);
					}}>
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Add / Edit PO Condition dialog */}
			<Dialog open={openEditCondition} onClose={() => { setOpenEditCondition(false); setIsAddingCondition(false); setIsItemConditionMode(false); setTargetItemForCondition(null); }} fullWidth maxWidth="sm">
				<DialogTitle>
					{isAddingCondition
						? (isItemConditionMode ? 'Add Item Condition' : 'Add New Condition')
						: (isItemConditionMode ? 'Edit Item Condition' : 'Edit PO Condition')}
				</DialogTitle>
				<DialogContent>
					{/* Info Alert for mutual exclusivity */}
					<Alert severity="info" sx={{ mt: 2, mb: 2 }}>
						<strong>Note:</strong> You can enter either a <strong>numeric value</strong> OR <strong>text description</strong>, but not both.
						Clear one field to use the other.
					</Alert>
					<Box component="form" sx={{ mt: 1 }}>
						{/* Condition Category */}
						<TextField
							label="Condition Category"
							fullWidth
							size="small"
							margin="normal"
							value={conditionForm.conditionCategory}
							onChange={(e) => setConditionForm(prev => ({ ...prev, conditionCategory: e.target.value }))}
						/>
						{/* Condition Value - Disabled if Condition Text has value */}
						<TextField
							label="Condition Value (Numeric)"
							fullWidth
							size="small"
							type="text"
							margin="normal"
							value={conditionForm.conditionValue}
							onChange={(e) => {
								const value = e.target.value;
								if (value === '' || /^\d*\.?\d*$/.test(value)) {
									setConditionForm(prev => ({ ...prev, conditionValue: value }));
								}
							}}
							disabled={!!(conditionForm.conditionText && conditionForm.conditionText.trim())}
							helperText={
								conditionForm.conditionText && conditionForm.conditionText.trim()
									? "⚠️ Clear the Condition Text below to enter a numeric value here"
									: "Enter a numeric value OR use Condition Text below (not both)"
							}
							sx={{
								'& .MuiInputBase-input.Mui-disabled': {
									WebkitTextFillColor: '#999',
									cursor: 'not-allowed'
								}
							}}
						/>
						{/* Condition Text - Disabled if Condition Value has value */}
						<TextField
							label="Condition Text"
							fullWidth
							size="small"
							type="text"
							margin="normal"
							multiline
							rows={2}
							value={conditionForm.conditionText || ''}
							onChange={(e) => setConditionForm(prev => ({ ...prev, conditionText: e.target.value }))}
							disabled={!!(conditionForm.conditionValue && conditionForm.conditionValue.toString().trim())}
							helperText={
								conditionForm.conditionValue && conditionForm.conditionValue.toString().trim()
									? "⚠️ Clear the Condition Value above to enter text here"
									: "Enter text description OR use Condition Value above (not both)"
							}
							sx={{
								'& .MuiInputBase-input.Mui-disabled': {
									WebkitTextFillColor: '#999',
									cursor: 'not-allowed'
								}
							}}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => { setOpenEditCondition(false); setIsAddingCondition(false); setIsItemConditionMode(false); setTargetItemForCondition(null); }}>Cancel</Button>
					<Button
						variant="contained"
						disabled={savingCondition}
						onClick={async () => {
							const hasValue = conditionForm.conditionValue && conditionForm.conditionValue.toString().trim();
							const hasText = conditionForm.conditionText && conditionForm.conditionText.trim();

							if (hasValue && hasText) {
								toast.error('Cannot have both Condition Value and Condition Text. Please clear one field.');
								return;
							}

							if (!hasValue && !hasText) {
								toast.warning('Please enter either a Condition Value or Condition Text.');
								return;
							}

							setSavingCondition(true);
							try {
								if (isAddingCondition) {
									const isItem = isItemConditionMode && targetItemForCondition;
									const payload = {
										id: 0,
										poHeaderId: parseInt(pageSlug),
										poItemId: isItem ? targetItemForCondition.id : 0,
										conditionType: conditionForm.conditionType,
										conditionCategory: conditionForm.conditionCategory,
										conditionRate: parseFloat(conditionForm.conditionRate) || 0,
										conditionValue: parseFloat(conditionForm.conditionValue) || 0,
										currency: conditionForm.currency,
										calculationType: conditionForm.calculationType,
										conditionText: conditionForm.conditionText || "",
										isHeaderCondition: !isItem,
									};
									const res = await apiClient.postres(`/api/pocondition/Add`, payload, atoken);
									if (res) {
										toast.success('PO Condition added successfully.');
										const conds = await GetPOCondition(pageSlug, selectedVersion, atoken, { signal: versionControllerRef.current?.signal });
										if (!(conds && conds.__cancelled)) {
											setPoSpecificDetails(prev => ({
												...prev,
												poConditions: (conds ?? []).filter(c => c.isHeaderCondition === true),
												poItemConditions: (conds ?? []).filter(c => c.isHeaderCondition === false),
											}));
										}
										setOpenEditCondition(false);
										setIsAddingCondition(false);
										setIsItemConditionMode(false);
										setTargetItemForCondition(null);
									}
								} else {
									if (!editingCondition) return;
									const isItem = editingCondition.isHeaderCondition === false;
									const payload = {
										id: editingCondition.id ?? 0,
										poHeaderId: editingCondition.poHeaderId ?? parseInt(pageSlug),
										poItemId: editingCondition.poItemId ?? 0,
										conditionType: conditionForm.conditionType,
										conditionCategory: conditionForm.conditionCategory,
										conditionRate: parseFloat(conditionForm.conditionRate) || 0,
										conditionValue: parseFloat(conditionForm.conditionValue) || 0,
										currency: conditionForm.currency,
										calculationType: conditionForm.calculationType,
										conditionText: conditionForm.conditionText || "",
										isHeaderCondition: !isItem,
									};
									const res = await apiClient.postres(`/api/pocondition/Update`, payload, atoken);
									if (res) {
										toast.success('PO Condition updated successfully.');
										const conds = await GetPOCondition(pageSlug, selectedVersion, atoken, { signal: versionControllerRef.current?.signal });
										if (!(conds && conds.__cancelled)) {
											setPoSpecificDetails(prev => ({
												...prev,
												poConditions: (conds ?? []).filter(c => c.isHeaderCondition === true),
												poItemConditions: (conds ?? []).filter(c => c.isHeaderCondition === false),
											}));
										}
										setOpenEditCondition(false);
										setIsItemConditionMode(false);
										setTargetItemForCondition(null);
									}
								}
							} catch (err) {
								const msg = err?.response?.data?.Message || (isAddingCondition ? 'Failed to add PO Condition.' : 'Failed to update PO Condition.');
								toast.error(msg);
							} finally {
								setSavingCondition(false);
							}
						}}
					>
						{savingCondition ? 'Saving...' : (isAddingCondition ? 'Add' : 'Save')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete PO Condition confirmation dialog */}
			<Dialog open={deleteConditionDialogOpen} onClose={() => { if (!isDeletingCondition) { setDeleteConditionDialogOpen(false); setConditionToDelete(null); } }} maxWidth="xs" fullWidth>
				<DialogTitle>Delete Condition</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete this condition?</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => { setDeleteConditionDialogOpen(false); setConditionToDelete(null); }} disabled={isDeletingCondition}>
						Cancel
					</Button>
					<Button variant="contained" color="error" onClick={handleDeleteCondition} disabled={isDeletingCondition}>
						{isDeletingCondition ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Cancel PO dialog */}
			<Dialog open={poCancelDialogOpen} onClose={closePOCancelDialog} maxWidth="xs" fullWidth>
				<DialogTitle>Cancel Purchase Order</DialogTitle>
				<DialogContent>
					<Typography sx={{ mb: 2 }}>Are you sure you want to cancel this PO? Please provide a reason.</Typography>
					<TextField
						autoFocus
						fullWidth
						required
						multiline
						rows={3}
						label="Reason / Comment"
						value={poCancelComment}
						onChange={(e) => {
							setPoCancelComment(e.target.value);
							if (poCancelError && e.target.value.trim()) setPoCancelError(null);
						}}
						error={Boolean(poCancelError)}
						helperText={poCancelError || ""}
						disabled={poCancelSubmitting}
						placeholder="Enter reason for cancelling this PO"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={closePOCancelDialog} disabled={poCancelSubmitting}>
						Cancel
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={handlePOCancelConfirm}
						disabled={poCancelSubmitting || !poCancelComment.trim()}
					>
						{poCancelSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default PODetailsDialogs;
