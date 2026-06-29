﻿import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { ApiClient } from '../../Apiclient';
import { buildQueryParams, cleanAndConvertToArray } from '../../utils/common/utility';
import { useStateValue } from '../../store';
import { Autocomplete, Alert, Box, Button, Checkbox, Drawer, FormControlLabel, IconButton, Input, InputAdornment, MenuItem, Radio, RadioGroup, TextField, Tooltip, Typography } from '@mui/material';
import { Close, PersonOutlined } from '@mui/icons-material';
import FunctionsIcon from '@mui/icons-material/Functions';
import { toast } from 'react-toastify';
import WhiteTooltip from '../whitetooltip';
import { HiOutlineX, HiPencilAlt, HiPlusSm, HiInformationCircle } from 'react-icons/hi';
import { Modal } from 'react-bootstrap';
import EventCommercialDrawer from './EventCommercialDrawer';
import { CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';
import AddEditCurrency from '../../utils/common/AddEditCurrency';
import '../../assets/css/manage-rfq-v2.css';

const EventCommercialScreen = forwardRef(({ EventType, EventId, LibraryType, Action, EventGeneralDetails, Version, currencyList, permissionManager }, EventCommercialScreenRef) => {
	const [{ atoken, customerid, customersuffix }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	const [CommercialLibrary, setCommercialLibrary] = useState([]);
	const [PackageCommercialLibrary, setPackageCommercialLibrary] = useState([]);
	const [SelectedCommercialLibrary, setSelectedCommercialLibrary] = useState(null);
	const [LibraryTermsList, setLibraryTermsList] = useState([]);
	const [modal1, setModal1] = useState(false);
	const [editRecordData, setEditRecordData] = useState(null)

	const handleCloseModal1 = () => {
		setModalCurrencyIndex(null)
		setModal1(false);
		setModalCurrency({
			id: "0",
			baseCurrency: EventGeneralDetails?.baseCurrency,
			currencyConversion: "1",
			rfqId: EventId
		})
	}
	const [modalCurrency, setModalCurrency] = useState({
		id: "0",
		baseCurrency: EventGeneralDetails?.baseCurrency,
		currencyConversion: "1",
		rfqId: EventId
	})

	const [modalCurrencyindex, setModalCurrencyIndex] = useState(null)

	const [commcurrencyList, setcommcurrencyList] = useState([
		{ id: "0", baseCurrency: EventGeneralDetails.baseCurrency, currencyConversion: "1", rfqId: EventId },
	]);
	const [OpenCurrencyModal, setOpenCurrencyModal] = useState(false);

	const CloseCurrencyModal = () => {
		setOpenCurrencyModal(false);
	};
	const handleCurrencyList = () => {
		// Currency list is managed by parent component
		// Parent should refresh their currency list after modal closes
	};
	useEffect(() => {
		getCommercialLibrary();
	}, []);

	useEffect(() => {
		if (EventId) {
			getRFQItemCommercialTerms();
		}
	}, [EventId, Version]);

	const getRFQItemCommercialTerms = async () => {

		let libraryid = 0;
		let grandTotalTermName = "";
		const ver = parseInt(Version);
		// undefined is excluded from query params â†’ server uses default. Avoid sending
		// Version=1 as a fallback because that filters to version-1 items only.
		const data = { RFQId: parseInt(EventId), Version: isNaN(ver) ? undefined : ver };
		const queryparams = buildQueryParams(data);
		const resitemlevel = await apiClient.getres(`/api/RFQCommLibrary/Find?${queryparams}`, atoken);
		const resrfqlevel = await apiClient.getres(`/api/RFQPackageCommercial/Find?${queryparams}`, atoken);
		// API may return direct array or { result: [...] }
		const extractResult = (res) => { const d = res?.data; return Array.isArray(d) ? d : (Array.isArray(d?.result) ? d.result : []); };
		const itemLevelResults = extractResult(resitemlevel);
		const rfqLevelResults = extractResult(resrfqlevel);


		if (itemLevelResults.length > 0) {
			libraryid = itemLevelResults[0].libraryId;
			grandTotalTermName = itemLevelResults[0].grandTotalTermName;
		}
		else if (rfqLevelResults.length > 0) {
			libraryid = rfqLevelResults[0].libraryId;
			grandTotalTermName = rfqLevelResults[0].grandTotalTermName;
		}
		else {
			return
		}

		const payload = { CustomerId: customerid, LibraryId: libraryid, IsActive: true, SortingColumn: "Id" };
		const queryparams2 = buildQueryParams(payload);

		const Commercialterms = await apiClient.getres(`/api/CommercialLib/Find?${queryparams2}`, atoken);
		const CommercialLibdata = [...(Commercialterms?.data?.result || [])].sort((a, b) => a.id - b.id);

		let CommercialTermModal = CommercialLibdata.map((item) => {
			const isSelectedItemlevel = itemLevelResults.some((term) => term?.termsId === item.id);
			const itemLevelTerm = itemLevelResults.find((term) => term?.termsId === item.id);
			//rfq
			const isSelectedRFQLevel = rfqLevelResults.some((term) => term?.termsId === item.id);
			const rfqLevelTerm = rfqLevelResults.find((term) => term?.termsId === item.id);

			if (isSelectedItemlevel) {
				return {
					...item,
					id: 0,
					isSelected: isSelectedItemlevel,
					rfqId: EventId,
					termsId: item.id,
					level: "item",
					grandTotalTermName: grandTotalTermName ?? "",
					isGrandTotalTerm: item.name == grandTotalTermName,
					requirement: itemLevelTerm?.requirement ?? "",
					AcceptedCurrency: itemLevelTerm?.acceptedCurrency || (EventGeneralDetails?.IsMultiCurrency ? "" : EventGeneralDetails?.baseCurrency),
					currencyConversion: itemLevelTerm?.currencyConversion || (EventGeneralDetails?.IsMultiCurrency ? "" : "1"),
					Version: parseFloat(Version)
				};
			} else if (isSelectedRFQLevel) {
				return {
					...item,
					id: 0,
					isSelected: isSelectedRFQLevel,
					rfqId: EventId,
					termsId: item.id,
					level: "rfq",
					grandTotalTermName: grandTotalTermName ?? "",
					isGrandTotalTerm: item.name === grandTotalTermName,
					requirement: rfqLevelTerm?.requirement ?? "",
					AcceptedCurrency: rfqLevelTerm?.acceptedCurrency ?? "",
					currencyConversion: rfqLevelTerm?.currencyConversion ?? "1",
					Version: parseFloat(Version)
				};
			}
		});

		CommercialTermModal = CommercialTermModal.filter(item => item !== undefined);

		//other term

		const itemlevelterm = itemLevelResults.some(item => item.termsId == 0)
		let eventitemterm = []
		if (itemlevelterm) {
			eventitemterm = itemLevelResults.filter(item => item.termsId == 0)
			eventitemterm.forEach((item, index) => {
				eventitemterm[index] = {
					...item,
					id: 0,
					isSelected: true,
					rfqId: EventId,
					termsId: 0,
					level: "item",
					grandTotalTermName: grandTotalTermName ?? "",

					requirement: item?.requirement ?? "",
					AcceptedCurrency: item?.acceptedCurrency ||
						(EventGeneralDetails?.IsMultiCurrency ? "" : EventGeneralDetails?.baseCurrency),
					currencyConversion: item?.currencyConversion ||
						(EventGeneralDetails?.IsMultiCurrency ? "" : "1"),
					Version: parseFloat(Version)
				};
			});



		}
		const rfqlevelterm = rfqLevelResults.some(item => item.termsId == 0)
		let eventrfqterm = []
		if (rfqlevelterm) {
			eventrfqterm = rfqLevelResults.filter(item => item.termsId == 0)
			eventrfqterm.forEach((item, index) => {
				eventrfqterm[index] = {
					...item,
					id: 0,
					isSelected: true,
					rfqId: EventId,
					termsId: 0,
					level: "rfq",
					grandTotalTermName: grandTotalTermName ?? "",
					isGrandTotalTerm: item.name === grandTotalTermName,
					requirement: item?.requirement ?? "",
					AcceptedCurrency: item?.acceptedCurrency ||
						(EventGeneralDetails?.IsMultiCurrency ? "" : EventGeneralDetails?.baseCurrency),
					currencyConversion: item?.currencyConversion ||
						(EventGeneralDetails?.IsMultiCurrency ? "" : "1"),
					Version: parseFloat(Version)
				};
			});
		}

		setLibraryTermsList([...CommercialTermModal, ...eventitemterm, ...eventrfqterm]);
	}

	useEffect(() => {
		if (!SelectedCommercialLibrary && CommercialLibrary.length > 0 && LibraryTermsList.length > 0) {
			const libraryId = LibraryTermsList[0]?.libraryId;
			const obj = CommercialLibrary.find(x => x.id == libraryId);
			setSelectedCommercialLibrary({
				...obj,
				grandTotalTermName: LibraryTermsList[0].grandTotalTermName
			})

		}
	}, [LibraryTermsList, CommercialLibrary]);

	// Auto-select Net Price if there's only one available Net Price term
	useEffect(() => {
		if (LibraryTermsList.length > 0 && SelectedCommercialLibrary) {
			const potentialNetPriceTerms = LibraryTermsList.filter(term =>
				isPotentialNetPriceTerm(term) && term.isSelected
			);

			// If there's exactly one potential Net Price term and no grandTotalTermName is set
			if (potentialNetPriceTerms.length === 1 && !SelectedCommercialLibrary.grandTotalTermName) {
				const singleNetPriceTerm = potentialNetPriceTerms[0];

				// Automatically set it as the Net Price term
				setSelectedCommercialLibrary(prev => ({
					...prev,
					grandTotalTermName: singleNetPriceTerm.name
				}));

				// Update the term's isGrandTotalTerm flag
				setLibraryTermsList(prev =>
					prev.map((term) => ({
						...term,
						isGrandTotalTerm: term.name === singleNetPriceTerm.name,
						grandTotalTermName: singleNetPriceTerm.name
					}))
				);
			}
		}
	}, [LibraryTermsList, SelectedCommercialLibrary]);

	useImperativeHandle(EventCommercialScreenRef, () => ({

		saveRFQCommercialLibrary: async () => {
			const isSelectedTermPresent = LibraryTermsList.some(s => s.isSelected === true);
			// if (!isSelectedTermPresent) {
			//     toast.error("Please select at least one Commercial term", { toastId: "selectcommercialtermerror" });
			//     return;
			// }

			const isTermPresent = LibraryTermsList.some(s => s.isSelected === true && !s.level);
			if (isTermPresent) {
				toast.error("Please select level for all selected Terms", { toastId: "selectcommercialtermerror" });
				return;
			}

			const res1 = await saveRFQCommercialLibrary();
			const res2 = await saveRFQCommercialPackageLibrary();
			if (res1 && res2) {
				toast.success("RFQ Commercial Saved Successfully", { toastId: "RFQCommercialSuccess" });
				return true;
			}
		}
	}));

	// Helper function to check if a term is required by other selected terms' formulas
	const isTermRequiredByFormula = (termFieldName, currentIndex) => {
		return LibraryTermsList.some((listItem, listIndex) => {
			if (listIndex === currentIndex) return false; // Don't check against itself
			if (!listItem.isSelected || !listItem.formulavalue || !listItem.fieldNameGroup) return false;

			// Check if the term's fieldName is in the formula's fieldNameGroup
			const fieldNameGroup = listItem.fieldNameGroup.split(',').map(field => field.trim());
			return fieldNameGroup.includes(termFieldName);
		});
	};

	// Helper function to check if a term is the selected Net Price (Grand Total Term)
	const isNetPriceTerm = (termName) => {
		return termName === SelectedCommercialLibrary?.grandTotalTermName;
	};

	// Helper function to check if a term is a potential Net Price term (Currency type with formula)
	const isPotentialNetPriceTerm = (term) => {
		return term.valuetype === "Currency" && term.formulavalue;
	};

	// Helper function to check if this is the only available Net Price term
	const isOnlyNetPriceTerm = (termName) => {
		const potentialNetPriceTerms = LibraryTermsList.filter(term =>
			isPotentialNetPriceTerm(term) && term.isSelected
		);
		return potentialNetPriceTerms.length === 1 && isNetPriceTerm(termName);
	};

	const handleCommercialItemCheck = (index, value, item, fieldName) => {
		const list = [...LibraryTermsList];

		if (fieldName === "check") {
			// Prevent deselection if this term is required by other selected terms' formulas
			if (!value && isTermRequiredByFormula(item.fieldName, index)) {
				toast.warning(`Cannot deselect "${item.name}" as it is required by other selected formula terms.`, {
					toastId: "term-required-by-formula"
				});
				return;
			}

			// Prevent deselection if this term is the selected Net Price (Grand Total Term)
			if (!value && isNetPriceTerm(item.name)) {
				toast.warning(`Cannot deselect "${item.name}" as it is selected as the Net Price term.`, {
					toastId: "net-price-term-required"
				});
				return;
			}

			// Prevent deselection if this is the only available Net Price term
			if (!value && isOnlyNetPriceTerm(item.name)) {
				toast.warning(`Cannot deselect "${item.name}" as it is the only available Net Price term. At least one Net Price term must be selected.`, {
					toastId: "only-net-price-term-required"
				});
				return;
			}

			// If deselecting a term that has a formula, warn about its dependencies
			if (!value && item.formulavalue && item.fieldNameGroup) {
				const dependentFields = item.fieldNameGroup.split(',').map(field => field.trim());
				const dependentTermNames = LibraryTermsList
					.filter(term => dependentFields.includes(term.fieldName) && term.isSelected)
					.map(term => term.name);

				if (dependentTermNames.length > 0) {
					toast.info(`Note: "${item.name}" uses the following terms in its formula: ${dependentTermNames.join(', ')}`, {
						toastId: "formula-dependencies-info",
						autoClose: 3000
					});
				}
			}

			list[index]["isSelected"] = value;
			list[index]["grandTotalTermName"] = SelectedCommercialLibrary?.grandTotalTermName;

			if (!value) {
				list[index]["level"] = "";
			} else {

				list[index]["level"] = list[index]["level"] || ((["Currency", "Percentage"].includes(item.valuetype) || item?.commValue > 0) ? "item" : "rfq");
			}
		}

		if (fieldName === "requirement") {
			list[index]["requirement"] = value;
		}

		if (fieldName === "level") {
			// Prevent level change if this term is required by other selected terms' formulas
			if (isTermRequiredByFormula(item.fieldName, index)) {
				toast.warning(`Cannot change level for "${item.name}" as it is required by other selected formula terms.`, {
					toastId: "level-change-blocked"
				});
				return;
			}

			// Check if changing this term's level would break formula dependencies
			if (item.formulavalue && item.fieldNameGroup) {
				const dependentFields = item.fieldNameGroup.split(',').map(field => field.trim());
				const dependentTermsAtDifferentLevel = LibraryTermsList.filter(term =>
					dependentFields.includes(term.fieldName) &&
					term.isSelected &&
					term.level &&
					term.level !== value
				);

				if (dependentTermsAtDifferentLevel.length > 0) {
					const termNames = dependentTermsAtDifferentLevel.map(t => t.name).join(', ');
					toast.warning(`Changing level to "${value}" will require dependent terms (${termNames}) to also be at "${value}" level for formula compatibility.`, {
						toastId: "formula-level-mismatch",
						autoClose: 3000
					});
				}
			}

			list[index]["isSelected"] = true;
			list[index]["level"] = value;
			list[index]["grandTotalTermName"] = SelectedCommercialLibrary?.grandTotalTermName;

			const selectedFieldGroup = list[index]?.fieldNameGroup.split(',');
			list?.forEach(item => {
				if (selectedFieldGroup.includes(item?.fieldName)) {
					item.isSelected = true;
					item.level = list[index]["level"];
					item.grandTotalTermName = SelectedCommercialLibrary?.grandTotalTermName;
				}
			});
		}

		setLibraryTermsList(list);
	};

	const handleCommercialCurrencyCheck = useCallback(() => {
		const list = [...LibraryTermsList];

		list[modalCurrencyindex]["AcceptedCurrency"] = modalCurrency.baseCurrency;
		list[modalCurrencyindex]["currencyConversion"] = modalCurrency.currencyConversion;

		setLibraryTermsList(list);
		setModal1(false);
	}, [modalCurrency, modalCurrencyindex]);

	const handleSelectAll = (checked) => {
		const list = [...LibraryTermsList];

		if (checked) {
			// When selecting all, just select everything
			list?.forEach(x => {
				x.isSelected = checked;
			});
		} else {
			// When deselecting all, check for formula dependencies and Net Price terms
			list?.forEach((x, index) => {
				const termIndex = list.findIndex(term => term.fieldName === x.fieldName);
				if (!isTermRequiredByFormula(x.fieldName, termIndex) &&
					!isNetPriceTerm(x.name) &&
					!isOnlyNetPriceTerm(x.name)) {
					x.isSelected = checked;
				}
			});

			// Show warning if some terms couldn't be deselected
			const remainingSelected = list.filter(x => x.isSelected);
			if (remainingSelected.length > 0) {
				toast.warning(`Some terms could not be deselected as they are required by formula terms, selected as Net Price, or are the only available Net Price term.`, {
					toastId: "some-terms-required"
				});
			}
		}
		setLibraryTermsList(list);
	}

	const getCommercialLibrary = async () => {
		const data = { CustomerId: customerid, LibraryType: LibraryType, EventType: EventType, IsActive: true };
		const queryParams = buildQueryParams(data);
		const res = await apiClient.getres(`/api/LibraryOrgEntity/Find?${queryParams}`, atoken);
		if (res) {
			setCommercialLibrary(res?.data?.result);
		}
	};

	const getLibraryTermsList = async (SelectedCommercialLibrary) => {
		if (!SelectedCommercialLibrary) {
			setLibraryTermsList([]);
			return;
		}

		// Clear the grandTotalTermName when selecting a new library to allow auto-selection
		if (SelectedCommercialLibrary.grandTotalTermName) {
			setSelectedCommercialLibrary(prev => ({
				...prev,
				grandTotalTermName: ""
			}));
		}

		const data = { CustomerId: customerid, LibraryId: SelectedCommercialLibrary?.id, IsActive: true, SortingColumn: "Id" };
		const queryParams = buildQueryParams(data);
		const res = await apiClient.getres(`/api/CommercialLib/Find?${queryParams}`, atoken);
		if (res && res?.data?.result.length > 0) {
			const sortedResults = [...res.data.result].sort((a, b) => a.id - b.id);
			const CommercialTermModal = sortedResults.map(item => ({
				...item,
				id: 0,
				isSelected: true,
				rfqId: EventId,
				termsId: item.id,
				Version: Version,
				level: item.level || (["Currency", "Percentage"].includes(item.valuetype) || item?.commValue > 0 ? "item" : "rfq"),
			}));

			setLibraryTermsList(CommercialTermModal);
		}
	};

	const saveRFQCommercialLibrary = async () => {

		const selectedCommTerms = LibraryTermsList.filter(s => s.isSelected === true && s.level === "item");
		if (selectedCommTerms.length < 1) {
			return true;
		}

		const commercialfieldlist = selectedCommTerms.map(x => x.fieldName);
		const isValid = selectedCommTerms.some(x => {
			if (x?.formulavalue) {
				const fieldNameGroup = Array.from(x.fieldNameGroup.split(","));
				let notIncluded = [...new Set(fieldNameGroup.filter(element => !commercialfieldlist.includes(element)))];
				if (notIncluded.length == 1) {
					if (notIncluded[0]?.trim() === "") {
						notIncluded = [];
					}
				}
				if (notIncluded.length > 0) {
					toast.error(
						<>
							<strong>The following required formula fields are missing:</strong>
							<ul>
								{notIncluded.map((field, index) => (
									<li key={index}>{field}</li>
								))}
							</ul>
							<p>Please ensure all the required fields are included in the formula for <strong>{x.name?.replace(/_/g, " ")}</strong> at the same level .</p>
						</>,
						{
							toastId: "commercialtermerror",
							hideProgressBar: true,
							autoClose: false
						}
					);
					return true;
				}
			}
			return false;
		});

		if (isValid) {
			return;
		}

		// if (
		//     !SelectedCommercialLibrary?.grandTotalTermName ||
		//     !selectedCommTerms?.some(term => term.name === SelectedCommercialLibrary.grandTotalTermName)
		// ) {
		//     
		//     toast.error("Please ensure that a Net Price term is selected at item level", {
		//         toastId: "grandtotalterm-required"
		//     });
		//     return;
		// }

		selectedCommTerms?.forEach(item => {

			if (item.valuetype === "Currency") {
				item.AcceptedCurrency = item?.AcceptedCurrency || EventGeneralDetails?.baseCurrency;
				item.currencyConversion = item?.currencyConversion?.toString()?.trim() ? item?.currencyConversion : "1";
				item.grandTotalTermName = SelectedCommercialLibrary?.grandTotalTermName || "";
			}
			else {
				item.currencyConversion = item?.currencyConversion?.toString()?.trim() ? item?.currencyConversion : "0";
			}
		});

		if (selectedCommTerms?.length) {
			const res = await apiClient?.postres(`/api/RFQCommLibrary/${EventId}/Add`, selectedCommTerms, atoken);
			if (res) {
				return true;
			}
		}
	};


	const saveRFQCommercialPackageLibrary = async () => {
		const selectedCommTerms = LibraryTermsList.filter(s => s.isSelected === true && s.level === "rfq");
		if (selectedCommTerms.length < 1) {
			return true;
		}

		const commercialfieldlist = selectedCommTerms.map(x => x.fieldName);
		const isValid = selectedCommTerms.some(x => {
			if (x?.formulavalue) {
				const fieldNameGroup = Array?.from(x?.fieldNameGroup.split(","));
				let notIncluded = [...new Set(fieldNameGroup.filter(element => !commercialfieldlist.includes(element)))];
				if (notIncluded.length === 1 && notIncluded[0]?.trim() === "") {
					notIncluded = [];
				}
				if (notIncluded.length > 0) {
					toast.error(
						<>
							<strong>The following required formula fields are missing:</strong>
							<ul>
								{notIncluded.map((field, index) => (
									<li key={index}>{field}</li>
								))}
							</ul>
							<p>Please ensure all the required fields are included in the formula for <strong>{x.name?.replace(/_/g, " ")}</strong> at the same level .</p>

						</>,
						{
							toastId: "commercialtermerror",
							hideProgressBar: true,
							autoClose: false
						}
					);
					return true;
				}
			}
			return false;
		});

		if (isValid) {
			return;
		}

		selectedCommTerms.forEach(item => {
			if (item.valuetype === "Currency") {

				item.AcceptedCurrency = item.AcceptedCurrency?.trim() ? item.AcceptedCurrency : EventGeneralDetails?.baseCurrency;
				item.currencyConversion = item?.currencyConversion?.toString()?.trim() ? item?.currencyConversion : "1";
			}
			else {
				item.currencyConversion = item?.currencyConversion?.toString()?.trim() ? item?.currencyConversion : "0";
			}
		});

		if (selectedCommTerms.length) {
			const hasEmptyLevel = selectedCommTerms.some(s => !s.level);
			if (hasEmptyLevel) {
				toast.error("Please select Type for selected terms", { toastId: "rfqmanage_terms" });
				return;
			}

			const res = await apiClient.postres(`/api/RFQPackageCommercial/${EventId}/Add`, selectedCommTerms, atoken);

			if (res) {
				return true;
			}
		}
	};

	const [openDrawer, setOpenDrawer] = useState({ AddNewTerm: false });
	const toggleOpenDrawer = (anchor, open) => {
		setOpenDrawer({ ...openDrawer, [anchor]: open });
	};

	const handleGrandTotalCheck = (index, isChecked, item) => {

		if (isChecked) {
			// Set this in global library state
			setSelectedCommercialLibrary(prev => ({
				...prev,
				grandTotalTermName: item.name
			}));

			// Update isGrandTotalTerm flag in list
			setLibraryTermsList(prev =>
				prev.map((term, idx) => ({
					...term,
					isGrandTotalTerm: idx === index
				}))
			);
		} else {
			// Check if this is the only available Net Price term
			const potentialNetPriceTerms = LibraryTermsList.filter(term =>
				isPotentialNetPriceTerm(term) && term.isSelected
			);

			if (potentialNetPriceTerms.length === 1) {
				toast.warning(`Cannot deselect Net Price for "${item.name}" as it is the only available Net Price term. At least one Net Price term must be selected.`, {
					toastId: "only-net-price-term-cannot-deselect"
				});
				return;
			}

			// Deselecting Grand Total (clear selection)
			setSelectedCommercialLibrary(prev => ({
				...prev,
				grandTotalTermName: ""
			}));

			// Reset isGrandTotalTerm flag
			setLibraryTermsList(prev =>
				prev.map((term) => ({
					...term,
					isGrandTotalTerm: false
				}))
			);
		}
	};


	const CommercialTermModal = (data) => {

		return {
			"id": 0,
			"customerId": customerid,
			"libraryName": null,
			"libraryId": SelectedCommercialLibrary?.id,
			"libraryEntity": SelectedCommercialLibrary?.libraryEntity,
			"name": data?.name,
			"fieldName": data?.fieldName,
			"eventtype": "RFQ",
			"level": ((["Currency", "Percentage"].includes(data.valuetype) || (data?.commValue > 0)) ? "item" : "rfq"),
			"valuetype": data?.valuetype,
			"currencyType": "",
			"commValue": data?.commValue,
			"formulavalue": data?.formulavalue,
			"fieldNameGroup": cleanAndConvertToArray(data?.formulavalue),
			"isdefault": true,
			"orderseq": 0,
			"isActive": true,
			"requirement": null,
			"isSelected": true,
			"rfqId": EventId,
			"termsId": 0,
			"Version": Version
		}
	}

	const DefaultCommercialTermModal = (editrecorddata, data) => {
		return {
			...editrecorddata,
			"name": data?.name,
			"fieldName": data?.fieldName,
			"valuetype": data?.valuetype,
			"commValue": data?.commValue,
			"formulavalue": data?.formulavalue,
			"fieldNameGroup": cleanAndConvertToArray(data?.formulavalue),
		}
	}

	return (
		<>
			<div className="mb-5" style={{ overflow: 'hidden' }}>
				<div className="p-3 pt-0">
					<div className="d-flex justify-content-between align-items-center">
						<div className="flex-grow-1">
							{(() => {
								const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.READ) ?? false;

								if (!hasReadPermission) {
									return null; // Don't show Action controls if no read permission
								}

								return Action && (
									<div className="rfq-question-toolbar">
										<div className="rfq-question-toolbar-left">
											<div className="rfq-question-library-field">
												<Autocomplete
													disablePortal
													id="combo-box-demo"
													size="small"
													className="rfq-question-library-select"
													options={CommercialLibrary || [{ label: "Loading...", id: 0 }]}
													getOptionLabel={(option) => option?.libraryEntity ?? ""}
													fullWidth
													value={SelectedCommercialLibrary}
													renderOption={(props, option) => (
														<div {...props}><div style={{ padding: "4px 8px" }}>{option?.libraryEntity || "No selection"}</div></div>
													)}
													onChange={(e, values) => { setSelectedCommercialLibrary(values); getLibraryTermsList(values); }}
													renderInput={(params) => <TextField {...params} label="" placeholder="Add from Commercial Library" InputLabelProps={{ shrink: false }} size="small" />}
													disabled={!Action}
												/>
											</div>
										</div>
										<button
											type="button"
											className="pe-btn pe-btn--primary"
											onClick={() => toggleOpenDrawer("AddNewTerm", true)}
											disabled={!SelectedCommercialLibrary || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.CREATE) ?? false)}
										>
											<HiPlusSm /> Add More
										</button>
									</div>
								);
							})()}
							<div className="row mt-2">
								<div className="col-12 col-md-12">
									<div className="">
										<div className="row">
											<div className="col-12 zebracolor">
												{(() => {
													const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.READ) ?? false;

													if (!hasReadPermission) {
														return (
															<div className="d-flex justify-content-center align-items-center p-4">
																<Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
																	You do not have permission to view Commercial Terms data.
																</Alert>
															</div>
														);
													}

													return LibraryTermsList.length > 0 ? (
														<div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "65vh", borderRadius: 8, border: "1px solid #e5e7eb" }}>
															<table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
																<thead>
																	<tr style={{ background: "#f9fafb", position: "sticky", top: 0, zIndex: 2 }}>
																		<th style={{ width: "22%", padding: "10px 16px", borderBottom: "1px solid #e5e7eb", fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "left", whiteSpace: "nowrap" }}>
																			<Checkbox size="small" checked={LibraryTermsList?.every(term => term?.isSelected === true)} onChange={(e) => handleSelectAll(e.target.checked)} disabled={!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false)} sx={{ p: "2px", mr: "4px" }} />
																			Name
																		</th>
																		<th style={{ width: "8%", padding: "10px 16px", borderBottom: "1px solid #e5e7eb", fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "left", whiteSpace: "nowrap" }}>Net Price</th>
																		<th style={{ width: "18%", padding: "10px 16px", borderBottom: "1px solid #e5e7eb", fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "left", whiteSpace: "nowrap" }}>Level</th>
																		<th style={{ width: "12%", padding: "10px 16px", borderBottom: "1px solid #e5e7eb", fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "left", whiteSpace: "nowrap" }}>UOM</th>
																		<th style={{ width: "46%", padding: "10px 16px", borderBottom: "1px solid #e5e7eb", fontSize: 12, fontWeight: 600, color: "#6b7280", textAlign: "left" }}>Requirement</th>
																	</tr>
																</thead>
																<tbody>
																	{LibraryTermsList && LibraryTermsList.length > 0 && LibraryTermsList?.map((item, index) => {
																		return (
																			<tr key={index} style={{ background: "#fff" }}>
																				<td style={{ padding: "6px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 13, color: "#1f2937", verticalAlign: "middle" }}>
																					<div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
																						{(item?.isSelected && (isTermRequiredByFormula(item.fieldName, index) || isNetPriceTerm(item.name) || isOnlyNetPriceTerm(item.name))) ? (
																							<WhiteTooltip
																								title={
																									isOnlyNetPriceTerm(item.name)
																										? "This term cannot be deselected as it is the only available Net Price term. At least one Net Price term must be selected."
																										: isNetPriceTerm(item.name)
																											? "This term cannot be deselected as it is selected as the Net Price term"
																											: "This term cannot be deselected as it is required by other selected formula terms"
																								}
																							>
																								<span>
																									<Checkbox
																										checked={item?.isSelected}
																										onChange={(e) => handleCommercialItemCheck(index, e.target.checked, item, "check")}
																										disabled={!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false) || (item?.isSelected && (isTermRequiredByFormula(item.fieldName, index) || isNetPriceTerm(item.name) || isOnlyNetPriceTerm(item.name)))}
																									/>
																								</span>
																							</WhiteTooltip>
																						) : (
																							<Checkbox
																								checked={item?.isSelected}
																								onChange={(e) => handleCommercialItemCheck(index, e.target.checked, item, "check")}
																								disabled={!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false) || (item?.isSelected && (isTermRequiredByFormula(item.fieldName, index) || isNetPriceTerm(item.name) || isOnlyNetPriceTerm(item.name)))}
																							/>
																						)}
																						<span>{item?.name}</span>
																						{item?.isSelected && isTermRequiredByFormula(item.fieldName, index) && (
																							<span className="comm-required-chip">REQUIRED</span>
																						)}
																						{item?.formulavalue && (
																							<Tooltip
																								title={
																									<span style={{ fontSize: '12px', fontWeight: '500' }}>
																										Formula: {item?.formulavalue}
																									</span>
																								}
																								arrow
																							>
																								<span style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", color: "#1976d2", marginLeft: "5px" }}>
																									<FunctionsIcon style={{ fontSize: 15, color: "#B0B0B0" }} />
																									<span style={{ fontSize: 12, fontWeight: 600, textDecoration: "underline" }}>View Formula</span>
																								</span>
																							</Tooltip>
																						)}
																						{item?.isSelected && isNetPriceTerm(item.name) && !isOnlyNetPriceTerm(item.name) && (
																							<WhiteTooltip title="Selected as Net Price term">
																								<span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "#dcfce7", color: "#166534", marginLeft: 4 }}>Net Price</span>
																							</WhiteTooltip>
																						)}
																						{item?.termsId == 0 && Action && (permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false) && <IconButton
																							size="small"
																							onClick={() => { setEditRecordData(item); toggleOpenDrawer("AddNewTerm", true); }}
																						>
																							<HiPencilAlt className="f17 text-primary" />
																						</IconButton>}
																						{item?.termsId == 0 && Action && (permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.REMOVE) ?? false) && <IconButton
																							size="small"
																							onClick={() => { setLibraryTermsList(prev => prev.filter((_, i) => i !== index)); }}
																						>
																							<HiOutlineX className="f17 text-primary" />
																						</IconButton>}
																					</div>
																				</td>
																				<td style={{ padding: "6px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 13, color: "#1f2937", verticalAlign: "middle" }}>
																					{item?.valuetype === "Currency" && item?.formulavalue && (
																						<Checkbox
																							checked={item.name == SelectedCommercialLibrary?.grandTotalTermName}
																							onChange={(e) => handleGrandTotalCheck(index, e.target.checked, item)}
																							disabled={!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false) || (item.name == SelectedCommercialLibrary?.grandTotalTermName && isOnlyNetPriceTerm(item.name))}
																						/>
																					)}
																				</td>

																				<td style={{ padding: "6px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 13, color: "#1f2937", verticalAlign: "middle" }}>

																					{item?.isSelected && isTermRequiredByFormula(item.fieldName, index) ? (
																						<div>
																							<WhiteTooltip title="Level cannot be changed as this term is required by other selected formula terms">
																								<span>
																									<RadioGroup
																										row
																										aria-labelledby="rqflbl"
																										name="level"
																										value={
																											item?.isSelected
																												? (item?.level || (["Currency", "Percentage"].includes(item?.valuetype) || item?.commValue > 0 ? "item" : "rfq"))
																												: ""
																										}
																										onChange={(e) => handleCommercialItemCheck(index, e.target.value, item, "level")}
																									>
																										<FormControlLabel
																											value="rfq"
																											control={<Radio size="medium" />}
																											label={<span className="f14">RFQ</span>}
																											disabled={!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false) || isTermRequiredByFormula(item.fieldName, index)}
																										/>
																										<FormControlLabel
																											value="item"
																											control={<Radio size="medium" />}
																											label={<span className="f14">Item</span>}
																											disabled={!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false) || isTermRequiredByFormula(item.fieldName, index)}
																										/>
																									</RadioGroup>
																								</span>
																							</WhiteTooltip>
																						</div>
																					) : (
																						<RadioGroup
																							row
																							aria-labelledby="rqflbl"
																							name="level"
																							value={
																								item?.isSelected
																									? (item?.level || ((["Currency", "Percentage"].includes(item?.valuetype) || item?.commValue > 0) ? "item" : "rfq"))
																									: ""
																							}
																							onChange={(e) => handleCommercialItemCheck(index, e.target.value, item, "level")}
																						>
																							<FormControlLabel
																								value="rfq"
																								control={<Radio size="medium" />}
																								label={<span className="f14">RFQ</span>}
																								disabled={!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false)}
																							/>
																							<FormControlLabel
																								value="item"
																								control={<Radio size="medium" />}
																								label={<span className="f14">Item</span>}
																								disabled={!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false)}
																							/>
																						</RadioGroup>
																					)}

																				</td>
																				<td style={{ padding: "6px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 13, color: "#1f2937", verticalAlign: "middle" }}>
																					{item?.valuetype === "Currency" && item?.name !== item?.grandTotalTermName && (
																						<div className="d-flex align-items-center gap-1">
																							<span className="f12 fw600" style={{ color: "#1f2937" }}>
																								{(EventGeneralDetails?.IsMultiCurrency && (!item?.AcceptedCurrency || !item?.currencyConversion))
																									? "—"
																									: `${item?.AcceptedCurrency || EventGeneralDetails?.baseCurrency}/${item?.currencyConversion || "1"}`}
																							</span>
																							{Action && (
																								<button
																									type="button"
																									className="comm-uom-update-btn"
																									onClick={() => {
																										setModal1(true);
																										setModalCurrencyIndex(index);
																										const multiCurrencyData = EventGeneralDetails?.multicurrencytList?.[0];
																										if (EventGeneralDetails?.IsMultiCurrency && multiCurrencyData) {
																											setModalCurrency({ id: multiCurrencyData.id, baseCurrency: multiCurrencyData.baseCurrency, currencyConversion: multiCurrencyData.currencyConversion, rfqId: multiCurrencyData.rfqId });
																										} else {
																											setModalCurrency({ id: "0", baseCurrency: EventGeneralDetails.baseCurrency || "", currencyConversion: "1", rfqId: EventId });
																										}
																									}}
																								>
																									Update
																								</button>
																							)}
																						</div>
																					)}
																					{item?.valuetype === "Percentage" && item?.name !== item?.grandTotalTermName && (
																						<span className="f12 fw600" style={{ color: "#1f2937" }}>Percentage (%)</span>
																					)}
																				</td>
																				<td style={{ padding: "6px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 13, color: "#1f2937", verticalAlign: "middle" }}>
																					<div style={{ position: "relative", marginBottom: "-5px"}}>
																						<textarea
																							placeholder="Your requirement"
																							value={item.requirement || ""}
																							onChange={(e) => handleCommercialItemCheck(index, e.target.value, item, "requirement")}
																							maxLength={200}
																							rows={1}
																							disabled={!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false)}
																							style={{ width: "100%", resize: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#1f2937", fontFamily: "inherit", background: (!Action || !(permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false)) ? "#f9fafb" : "#fff", outline: "none", lineHeight: 1.5 }}
																						/>
																						{item.requirement && <span style={{ position: "absolute", bottom: 4, right: 6, fontSize: 10, color: "#9ca3af" }}>{item.requirement.length}/200</span>}
																					</div>
																				</td>
																			</tr>
																		)
																	}
																	)}
																</tbody>
															</table>
														</div>
													) : (
														<></>
													);
												})()}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{openDrawer.AddNewTerm && (
				<div className="rfq-v2-event-drawer-backdrop" onClick={() => toggleOpenDrawer("AddNewTerm", false)}>
					<section className="rfq-v2-event-drawer" onClick={e => e.stopPropagation()}>
						<header className="rfq-v2-event-drawer-header">
							<h2 className="rfq-v2-event-drawer-title">Manage Terms</h2>
							<div className="rfq-v2-event-drawer-actions">
								<button type="button" className="pe-btn pe-btn--ghost" onClick={() => toggleOpenDrawer("AddNewTerm", false)}>Cancel</button>
								<button type="reset" form="manage-terms-form" className="pe-btn pe-btn--secondary">Reset</button>
								<button type="submit" form="manage-terms-form" className="pe-btn pe-btn--primary">{editRecordData ? "Update" : "Submit"}</button>
							</div>
						</header>
						<div className="rfq-v2-event-drawer-body" style={{ overflowY: 'auto' }}>
							<EventCommercialDrawer
								callbackstep={(data) => {
									if (!editRecordData) {
										let libraryterm = CommercialTermModal(data)
										setLibraryTermsList((prev) => [...prev, libraryterm]);
										toggleOpenDrawer("AddNewTerm", false);
										setEditRecordData(null);
									}
									else {
										let libraryterm = DefaultCommercialTermModal(editRecordData, data)
										setLibraryTermsList((prev) => {

											const updatedList = [...prev];
											const index = updatedList.findIndex(item => item.fieldName === editRecordData.fieldName);
											if (index !== -1) {
												updatedList[index] = { ...libraryterm };
											}
											return updatedList;
										});

										toggleOpenDrawer("AddNewTerm", false);
										setEditRecordData(null);
									}
								}}
								editRecordData={editRecordData}
								LibraryTermsList={LibraryTermsList}
							/>
						</div>
					</section>
				</div>
			)}

			<Modal
				size="md"
				show={modal1}
				backdrop="static"
				keyboard={false}
				centered
				contentClassName="border-0"
				onHide={() => handleCloseModal1()}
			>
				<div className="comm-currency-modal">
					<div className="comm-currency-modal-header">
						<span className="comm-currency-modal-title">Select Currency Mode</span>
						<IconButton onClick={() => handleCloseModal1()} size="small">
							<Close style={{ fontSize: 18 }} />
						</IconButton>
					</div>
					<div className="comm-currency-modal-body">
						<div className="mb-3">
							<label className="pe-field-label">Select Currency <span className="text-danger">*</span></label>
							<TextField
								id="basecurrencymodal"
								name="baseCurrency"
								select
								fullWidth
								size="small"
								variant="outlined"
								value={modalCurrency.baseCurrency}
								onChange={(e) => {
									const newValue = e.target.value;
									if (newValue === "new") { setOpenCurrencyModal(true); return; }
									setModalCurrency((prev) => {
										const updated = { ...prev, baseCurrency: newValue };
										if (newValue === EventGeneralDetails?.baseCurrency) updated.currencyConversion = "1";
										return updated;
									});
								}}
							>
								{currencyList && currencyList.map((option) => (
									<MenuItem key={option.id} value={option?.currencyNm}>{option?.currencyNm}</MenuItem>
								))}
								<MenuItem value="new" style={{ fontStyle: 'italic', color: '#1976d2' }}>+ Add New</MenuItem>
							</TextField>
						</div>
						<div className="mb-3">
							<label className="pe-field-label">Conversion Factor</label>
							<TextField
								fullWidth
								variant="outlined"
								type="number"
								id="modalcurrencyConversion"
								value={modalCurrency.currencyConversion}
								size="small"
								name="currencyConversion"
								disabled={modalCurrency.baseCurrency === EventGeneralDetails?.baseCurrency}
								onChange={(e) => {
									const newValue = e.target.value;
									const regex = /^\d*\.?\d{0,4}$/;
									if (newValue === '' || regex.test(newValue)) {
										setModalCurrency((prev) => ({ ...prev, currencyConversion: newValue }));
									}
								}}
							/>
						</div>
					</div>
					{Action && (
						<div className="comm-currency-modal-footer">
							<button type="button" className="rfq-dv2-action-btn pe-btn--ghost" onClick={() => handleCloseModal1()}>Cancel</button>
							<button type="button" className="rfq-dv2-action-btn pe-btn--primary" onClick={handleCommercialCurrencyCheck}>Submit</button>
						</div>
					)}
				</div>
			</Modal>
			<Modal
				size="lg"
				show={OpenCurrencyModal}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => CloseCurrencyModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">
							Manage Currency
						</div>
					</Modal.Title>
					<IconButton onClick={() => CloseCurrencyModal()} size="small" edge="start">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddEditCurrency handleCurrencyList={handleCurrencyList} />
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
});

export default EventCommercialScreen;
