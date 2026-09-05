import React from 'react';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { HiPlusSm } from 'react-icons/hi';
import { PETableSimple } from '../../../components/RFQ/PETable';
import { ACTIONS, CLAIM_TYPES } from '../../../utils/permissionManager';
import '../../../assets/css/rfq-detail-v2.css';

const AuctionCommercialTab = ({
	generaltermsDDl,
	selectedCommercalDll,
	setSelectedCommercalDll,
	getLibraryTermsList,
	setSelectedCommercialLibrary,
	SelectedCommercialLibrary,
	stagearray,
	currentStage,
	commercialLibFind,
	LibraryTermsList,
	handleComItemAllCheck,
	handleComItemCheck,
	handleChangeCom,
	formik,
	toggleOpenDrawer,
	permissionManager,
}) => {
	const canEdit = stagearray.includes(currentStage);

	const isTermRequiredByFormula = (termFieldName, currentIndex) => {
		return (commercialLibFind || []).some((listItem, listIndex) => {
			if (listIndex === currentIndex) return false;
			if (!listItem.isSelected || !listItem.formulavalue || !listItem.fieldNameGroup) return false;
			const fieldNameGroup = listItem.fieldNameGroup.split(',').map(f => f.trim());
			return fieldNameGroup.includes(termFieldName);
		});
	};

	const columns = [
		{
			key: '__select__',
			label: '',
			width: 56,
			renderHeader: () => (
				<Checkbox
					checked={LibraryTermsList?.every(term => term?.isSelected === true)}
					size="small"
					onChange={(e) => handleComItemAllCheck(e.target.checked)}
				/>
			),
			renderCell: (_, item, index) => (
				<Checkbox
					size="small"
					checked={item?.isSelected}
					onChange={(e) => handleComItemCheck(index, e.target.checked)}
				/>
			),
		},
		{
			key: 'name',
			label: 'Name',
			width: 200,
			renderCell: (_, item, index) => (
				<div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
					<span>{item?.name}</span>
					{item?.isSelected && isTermRequiredByFormula(item?.fieldName, index) && (
						<span className="comm-required-chip">REQUIRED</span>
					)}
					<div className="text-muted f12 w-100">{item?.libraryEntity}</div>
				</div>
			),
		},
		{
			key: 'valuetype',
			label: 'UOM',
			width: 120,
			renderCell: (_, item, index) =>
				item?.valuetype === "Currency" ? (
					<span
						style={{ cursor: "pointer", color: "#1769BB", textDecoration: "underline" }}
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
					<span>{item?.valuetype}</span>
				),
		},
		...(commercialLibFind.some(i => i.commValue)
			? [{ key: 'commValue', label: 'Fixed Value', width: 200, renderCell: (v) => v || "" }]
			: []),
		...(commercialLibFind.some(i => i.formulavalue)
			? [{ key: 'formulavalue', label: 'Formula value', width: 200, renderCell: (v) => v || "" }]
			: []),
		{ key: '__action__', label: 'Actions', width: 80, renderCell: () => null },
	]

	return (
		<div className="p-3 pt-2 pb-0">
			<div className="d-flex align-items-flex-end gap-3 mt-2">
				<div style={{ maxWidth: 420, flex: '0 0 auto' }}>
					<label className="pe-field-label">Select Commercial Terms</label>
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
						style={{ width: 420 }}
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
								label=""
							/>
						)}
						disabled={!canEdit}
					/>
				</div>
				{canEdit && (
					<div style={{ paddingTop: 20, marginLeft: 'auto' }}>
						<button
							type="button"
							className="pe-btn pe-btn--primary"
							onClick={() => toggleOpenDrawer("AddNewTerm", true)}
							disabled={!SelectedCommercialLibrary || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.CREATE) ?? false)}
						>
							<HiPlusSm /> Add More
						</button>
					</div>
				)}
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
						<div className="col-12">
							{commercialLibFind && commercialLibFind.length > 0 ? (
								<PETableSimple
									wrapperStyle={{ maxHeight: 420 }}
									getRowKey={(item, index) => index}
									columns={columns}
									rows={commercialLibFind}
								/>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuctionCommercialTab;
