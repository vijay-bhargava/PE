import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	Checkbox, FormControl, Select, FormControlLabel,
	MenuItem, TextField, Autocomplete, Avatar,
	IconButton, InputAdornment, Typography,
} from "@mui/material";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import "../../../assets/css/base.css";
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';
import '../../../assets/css/rfq-detail-v2.css';
import { useFormik } from "formik";
import { Form } from "react-bootstrap";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../../store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RegisterCustomer, UpdateCustomer, getSingleCustomer } from "../../../utils/customerSetup";
import {
	findObjByValueFromArray, fetchCities, fetchStates,
	fetchMasters, getApiErrorMessage,
} from "../../../utils/common";
import validator from "validator";
import { HiOutlineX } from "react-icons/hi";
import { uploadFilesOnAzureURL } from "../../../utils/manageParticipants";
import { FindUser } from "../../../utils/users";
import { filteroptionDialingCode } from "../../../utils/common/utility";

const AddCustomer = ({
	callbackstep, editRecordData,
	handleChangeTab, handleCustomerId,
	selectedCustomerId, handleEditrecorddata, resetRef
}) => {
	const [{ atoken, customerid, usertimezone, userdialingcode }, dispatch] = useStateValue();

	//master usestate for fetching country,city,state,dialcode,timezone
	const [country_list, setCountryList] = useState([]);
	const [timezone_list, setTimezoneList] = useState([]);
	const [currency_list, setCurrencyList] = useState([]);
	const [state_list, setStateList] = useState([]);
	const [city_list, setCityList] = useState([]);

	const [loading, setLoading] = useState(false);
	const [customerName, SetCustomerName] = useState("");
	const [, setCustomerEmail] = useState("");
	const [accountManagerEmail, setAccountManagerEmail] = useState("");
	const [contactPersonName, setcontactPersonName] = useState("");
	const [address, setAddress] = useState("");
	const [country, setCountry] = useState(null);
	const [Cstate, setCState] = useState(null);
	const [city, setCity] = useState(null);
	const [zipCode, setZipCode] = useState("");
	const [website, setWebsite] = useState("");
	const [phoneNo, setPhoneNo] = useState("");
	const [description, setdescription] = useState("");
	const [adminEmail, setAdminEmail] = useState("");
	const [dialingCode, setDialingCode] = useState("");
	const [isActive, setisActive] = useState(true);
	const [isAiEnable, setisAiEnable] = useState(false);
	const [isMsmeEnable, setisMsmeEnable] = useState(false);
	const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(true);
	const [loginUrlSuffix, setLoginUrlSuffix] = useState("");
	const [defaultCurrency, setDefaultCurrency] = useState("");
	const [timeZone, setTimeZone] = useState("");
	const [imgLogo, setimgLogo] = useState("");
	const [imgBG1, setimgBG1] = useState("");
	const [imgBG2, setimgBG2] = useState("");
	const [imgBG3, setimgBG3] = useState("");
	const [errorLogo, setErrorLogo] = useState('');
	const [errorBG1, setErrorBG1] = useState('');
	const [errorBG2, setErrorBG2] = useState('');
	const [errorBG3, setErrorBG3] = useState('');
	const [logoFileName, setLogoFileName] = useState('');
	const [bg1FileName, setBg1FileName] = useState('');
	const [bg2FileName, setBg2FileName] = useState('');
	const [bg3FileName, setBg3FileName] = useState('');
	const logoRef = useRef(null);
	const bg1Ref = useRef(null);
	const bg2Ref = useRef(null);
	const bg3Ref = useRef(null);

	//to validate website
	const [isValidUrl, setIsValidUrl] = useState(true);
	const [userList, setUserList] = useState([]);

	const pullUsersList = useCallback(async () => {
		const data = {
			CustomerId: customerid,
			IsActive: "true",
		};
		try {
			setLoading(true);
			const res = await FindUser(data, atoken);
			if (res && res.length) {
				setUserList(res);
			} else {
				setUserList([]);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: "user_list_error" });
		} finally {
			setLoading(false);
		}
	}, [atoken, customerid]);

	const handleStates = useCallback(async (countryKey, company) => {
		try {
			const res = await fetchStates(countryKey, atoken);
			if (res) {
				setStateList(res);
				if (company) {
					setCState(findObjByValueFromArray(res, company?.state, "stateName") || null);
				}
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error) || "Failed to load states", { toastId: "states_error" });
		}
	}, [atoken]);

	const handleCity = useCallback(async (stateId, company) => {
		try {
			const res = await fetchCities(stateId, atoken);
			if (res) {
				setCityList(res);
				if (company) {
					setCity(findObjByValueFromArray(res, company?.city, "cityName") || null);
				}
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error) || "Failed to load cities", { toastId: "cities_error" });
		}
	}, [atoken]);

	const prefilledCutomerInfo = useCallback((company = editRecordData) => {
		if (company) {
			SetCustomerName(company?.customerName);
			setCustomerEmail(company?.customerEmail);
			setAccountManagerEmail(company?.accountManagerEmail || "");
			setcontactPersonName(company?.contactPersonName);
			setAddress(company?.address);
			setZipCode(company?.zipCode);
			setWebsite(company?.website);
			setPhoneNo(company?.phoneNo);
			setAdminEmail(company?.adminEmail);
			setisActive(company?.isActive);
			setIsWhatsAppEnabled(company?.isWhatsAppEnabled);
			setLoginUrlSuffix(company?.loginUrlSuffix);
			setdescription(company?.description);
			setCountry(
				findObjByValueFromArray(country_list, company?.country, "countryName") || null
			);
			handleStates(company?.countrykey, company);
			handleCity(company?.regionkey, company);
			setDialingCode(
				company?.dialingCode
					? findObjByValueFromArray(country_list, company?.dialingCode, "dialingCode")
					: findObjByValueFromArray(country_list, userdialingcode, "dialingCode")
			);

			setTimeZone(
				findObjByValueFromArray(timezone_list, company?.timeZone || usertimezone, "localeName")
			);
			setDefaultCurrency(
				company?.defaultCurrency
					? findObjByValueFromArray(currency_list, company?.defaultCurrency, "currencyNm")
					: findObjByValueFromArray(currency_list, defaultCurrency, "currencyNm")
			);
			setimgLogo(company?.imgLogo ? `${company?.imgLogo}` : '');
			setimgBG1(company?.imgBG1 ? `${company?.imgBG1}` : '');
			setimgBG2(company?.imgBG2 ? `${company?.imgBG2}` : '');
			setimgBG3(company?.imgBG3 ? `${company?.imgBG3}` : '');
			setisAiEnable(company?.isAIEnable);
			setisMsmeEnable(company?.isMsmeEnable);
		}
	}, [country_list, currency_list, defaultCurrency, editRecordData, handleCity, handleStates, timezone_list, userdialingcode, usertimezone]);

	useEffect(() => {
		fetchMasters(atoken, customerid).then((res) => {
			if (res) {
				setCountryList(res.countryList);
				setTimezoneList(res.timezoneList);
				setCurrencyList(res.currencyList);
			}
		});
	}, [atoken, customerid]);

	useEffect(() => {
		pullUsersList();
	}, [pullUsersList]);

	useEffect(() => {
		if (editRecordData) {
			prefilledCutomerInfo(editRecordData);
		} else if (selectedCustomerId) {
			getSingleCustomer(selectedCustomerId, atoken).then((res) => {
				if (res) {
					handleEditrecorddata(res);
					prefilledCutomerInfo(res);
				}
			});
		}
	}, [atoken, editRecordData, handleEditrecorddata, prefilledCutomerInfo, selectedCustomerId]);

	const Constraint = "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$";

	const validationSchema = yup.object({
		customerName: yup.string().required("Please Enter Customer Name"),
		customerEmail: yup.string().matches(Constraint, 'please enter valid email').required("Please Enter Customer Email"),
		loginUrlSuffix: yup.string().required("Please Enter Url Suffix"),
		address: yup.string().required("Please Enter Address"),
		contactPersonName: yup
			.string()
			.required("Please Enter Contact Person Name"),
		adminEmail: yup.string().matches(Constraint, 'please enter valid email').required("Please Enter Email"),
		country: yup.object().required("Please Select Country"),
		state: yup.object().required("Please Select State"),
		city: yup.object().required("Please Select City"),
		phoneNo: yup.string().required("Please Enter Phone No."),
		accountManagerEmail: yup.string().required("Please Select Account manager Email."),
	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			customerName: customerName,
			customerEmail: adminEmail,
			accountManagerEmail: accountManagerEmail,
			contactPersonName: contactPersonName,
			address: address,
			country: country,
			state: Cstate,
			city: city,
			zipCode: zipCode,
			website: website,
			dialingCode: dialingCode,
			phoneNo: phoneNo,
			description: description,
			adminEmail: adminEmail,
			loginUrlSuffix: loginUrlSuffix,
			defaultCurrency: defaultCurrency,
			isWhatsAppEnabled: isWhatsAppEnabled,
			timeZone: timeZone,
			imgLogo: imgLogo,
			imgBG1: imgBG1,
			imgBG2: imgBG2,
			imgBG3: imgBG3,
			isActive: isActive,
			isAiEnable: isAiEnable,
			isMsmeEnable: isMsmeEnable,
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
			setLoading(true);
			try {
				const data = {
					customerName: customerName,
					customerEmail: adminEmail,
					accountManagerEmail: accountManagerEmail,
					contactPersonName: contactPersonName,
					address: address,
					country: country,
					state: Cstate,
					city: city,
					zipCode: zipCode,
					website: website,
					dialingCode: dialingCode,
					phoneNo: phoneNo,
					description: description,
					adminEmail: adminEmail,
					loginUrlSuffix: loginUrlSuffix,
					defaultCurrency: defaultCurrency,
					isWhatsAppEnabled: isWhatsAppEnabled,
					timeZone: timeZone,
					imgLogo: imgLogo,
					imgBG1: imgBG1,
					imgBG2: imgBG2,
					imgBG3: imgBG3,
					isActive: isActive,
					isAiEnable: isAiEnable,
					isMsmeEnable: isMsmeEnable,
				};
				if (editRecordData?.id > 0) {
					const res = await UpdateCustomer(data, editRecordData?.id, atoken);
					if (res) {
						dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
						dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
						dispatch({ type: actionTypes.SET_MSGALERT, value: true });
						toast.success("Customer updated successfully!", { toastId: "customer_update_success" });
						clearfilledCS();
						callbackstep("update");
					}
				} else {
					const res = await RegisterCustomer(data, atoken);
					if (res) {
						dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
						dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
						dispatch({ type: actionTypes.SET_MSGALERT, value: true });
						toast.success("Customer created successfully!", { toastId: "customer_add_success" });
						handleCustomerId(res);
						handleChangeTab(2);
						clearfilledCS();
					}
				}
			} catch (error) {
				toast.error(getApiErrorMessage(error), { toastId: "customer_save_error" });
			} finally {
				setLoading(false);
			}
		},
	});

	const clearfilledCS = useCallback(() => {
		SetCustomerName("");
		setCustomerEmail("");
		setAccountManagerEmail("");
		setcontactPersonName("");
		setAddress("");
		setCountry(null);
		setCState(null);
		setCity(null);
		setZipCode("");
		setWebsite("");
		setPhoneNo("");
		setAdminEmail("");
		setDialingCode(null);
		setIsWhatsAppEnabled(false);
		setLoginUrlSuffix("");
		setTimeZone(null);
		setDefaultCurrency(null);
		setimgLogo("");
		setimgBG1("");
		setimgBG2("");
		setimgBG3("");
		setLogoFileName(''); setBg1FileName(''); setBg2FileName(''); setBg3FileName('');
		if (logoRef.current) logoRef.current.value = '';
		if (bg1Ref.current) bg1Ref.current.value = '';
		if (bg2Ref.current) bg2Ref.current.value = '';
		if (bg3Ref.current) bg3Ref.current.value = '';
		setisActive(false);
		setisAiEnable(false);
		setisMsmeEnable(false);
	}, []);

	useEffect(() => {
		if (resetRef) resetRef.current = clearfilledCS;
	}, [resetRef, clearfilledCS]);

	const handleWebsite = (event) => {
		const { value } = event?.target;
		setWebsite(value);
		setIsValidUrl(validator.isURL(value));
	};

	const handleZipCode = (e) => {
		let value = e?.target?.value;
		value = value.replace(/[^\d]/g, "");

		// Limit to 6 characters
		if (value.length > 6) {
			value = value.slice(0, 6); // Limit zip code length to 6
		}
		setZipCode(value);
	};

	const handlePNum = (e) => {
		let value = e?.target?.value;
		value = value.replace(/[^\d.]/g, "");
		const decimalCount = (value.match(/\./g) || []).length;
		if (decimalCount > 1) {
			value = value.slice(0, value.lastIndexOf("."));
		}
		if (/^0\d/.test(value)) {
			value = value.slice(1);
		}
		setPhoneNo(value);
	};

	const handledescriptionChange = (event) => {
		setdescription(event?.target?.value);
	};

	//to handle file into base64String
	const handleFileInputChange = async (event, setImageSetter, setErrorSetter, setFileNameSetter) => {
		const file = event.target.files[0];
		if (file) {
			const maxSize = 2 * 1024 * 1024;
			if (file.size > maxSize) {
				setErrorSetter('Please make sure your image is below 2 MB');
				if (setFileNameSetter) setFileNameSetter('');
			} else {
				setErrorSetter('');
				if (setFileNameSetter) setFileNameSetter(file.name);
				const Data = {
					RequestedBy: "customer",
					EventType: "setup",
					CustomerId: customerid,
					Description: "CustomerSetup",
				};
				const fileurl = await uploadFilesOnAzureURL(Data, file, atoken);
				if (fileurl) {
					setImageSetter(fileurl);
				} else {
					setImageSetter(null);
				}
			}
		} else {
			setImageSetter(null);
			setErrorSetter('');
			if (setFileNameSetter) setFileNameSetter('');
		}
	};

	const handleRemoveImage = (setImageSetter, setErrorSetter, inputRef, setFileNameSetter) => {
		setImageSetter(null);
		setErrorSetter('');
		if (setFileNameSetter) setFileNameSetter('');
		if (inputRef?.current) inputRef.current.value = '';
	};

	const handleManageId = (e) => {
		const selectedId = e.target.value;
		setAccountManagerEmail(selectedId);

		if (selectedId === "") {
			// SetmanagerId(0);
			setAccountManagerEmail("");  // Clear the manager name if "None" is selected
		} else {
			const selectedManager = userList.find(user => user.id === selectedId);
			if (selectedManager) {
				setAccountManagerEmail(selectedManager.email);
			}
		}
	};

	return (
		<Form id="customer-setup-form" onSubmit={formik.handleSubmit} autoComplete="off">
			<div className="row">
				<div className="col-12 col-md-4 mb-3">
					<input type="text" style={{ display: 'none' }} name="customerName" />
					<label className="pe-field-label" htmlFor="customerName">Customer Name <span className="rfq-required-star">*</span></label>
					<TextFieldCell
						id="customerName"
						name="customerName"
						placeholder=""
						value={customerName}
						maxLength={50}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
										{customerName?.length}/50
									</Typography>
								</InputAdornment>
							),
							autoComplete: "off",
						}}
						onChange={(e) => SetCustomerName(e?.target?.value)}
						autoComplete="off"
					/>
					{formik?.errors?.customerName && formik?.touched?.customerName && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.customerName}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="adminEmail">Admin Email <span className="rfq-required-star">*</span></label>
					<TextFieldCell
						id="adminEmail"
						name="adminEmail"
						placeholder=""
						maxLength={50}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
										{adminEmail?.length}/50
									</Typography>
								</InputAdornment>
							),
							autoComplete: "off"
						}}
						value={adminEmail}
						onChange={(e) => setAdminEmail(e?.target?.value.replace(/[^a-zA-Z0-9@.]/g, ""))}
						autoComplete="off"
					/>
					{formik.errors.adminEmail && formik.touched.adminEmail && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik.errors.adminEmail}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="loginUrlSuffix">Login URL Suffix <span className="rfq-required-star">*</span></label>
					<TextFieldCell
						id="loginUrlSuffix"
						name="loginUrlSuffix"
						placeholder=""
						maxLength={50}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
										{loginUrlSuffix?.length}/50
									</Typography>
								</InputAdornment>
							),
							autoComplete: "off",
						}}
						value={loginUrlSuffix}
						onChange={(e) => {
							if (!editRecordData) setLoginUrlSuffix(e?.target?.value);
						}}
						autoComplete="off"
						disabled={!!editRecordData}
					/>
					{formik?.errors?.loginUrlSuffix && formik?.touched?.loginUrlSuffix && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.loginUrlSuffix}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="website">Website</label>
					<TextFieldCell
						id="website"
						name="website"
						placeholder=""
						maxLength={50}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
										{website?.length}/50
									</Typography>
								</InputAdornment>
							),
							autoComplete: "off",
						}}
						value={website}
						onChange={handleWebsite}
						autoComplete="off"
					/>
					{!isValidUrl && <div className="error error-red" style={{ fontSize: "9px" }}>Please enter a valid URL.</div>}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label">Phone Number <span className="rfq-required-star">*</span></label>
					<div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 8 }}>
						<Autocomplete
							freeSolo disableClearable disablePortal
							id="dialingCode" size="small"
							options={country_list} name="dialingCode" fullWidth
							renderInput={(params) => (
								<TextField {...params} variant="outlined" size="small" placeholder="Code" />
							)}
							defaultValue={findObjByValueFromArray(country_list, dialingCode ?? userdialingcode, "dialingCode")}
							getOptionLabel={(option) => option.dialingCode ?? ""}
							filterOptions={filteroptionDialingCode}
							value={dialingCode}
							onChange={(event, newValue) => setDialingCode(newValue)}
							autoComplete="off"
						/>
						<div>
							<input type="text" style={{ display: 'none' }} name="phoneNo" />
							<TextFieldCell
								id="phoneNo" name="phoneNo" placeholder=""
								maxLength={15} value={phoneNo}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<Typography variant="body2" color="textSecondary">{phoneNo?.length}/15</Typography>
										</InputAdornment>
									),
									autoComplete: "off",
								}}
								onChange={handlePNum}
								autoComplete="off"
							/>
							{formik.errors.phoneNo && formik.touched.phoneNo && (
								<div className="error error-red" style={{ fontSize: "9px" }}>{formik?.errors?.phoneNo}</div>
							)}
						</div>
					</div>
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="contactPersonName">Contact Person Name <span className="rfq-required-star">*</span></label>
					<TextFieldCell
						id="contactPersonName"
						name="contactPersonName"
						placeholder=""
						value={contactPersonName}
						maxLength={50}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">{contactPersonName?.length}/50</Typography>
								</InputAdornment>
							),
							autoComplete: "off"
						}}
						onChange={(e) => setcontactPersonName(e?.target?.value)}
						autoComplete="off"
					/>
					{formik.errors.contactPersonName && formik.touched.contactPersonName && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik.errors.contactPersonName}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<input type="text" style={{ display: 'none' }} name="address" />
					<label className="pe-field-label" htmlFor="address">Address <span className="rfq-required-star">*</span></label>
					<TextFieldCell
						id="address"
						name="address"
						placeholder=""
						value={address}
						maxLength={150}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">{address?.length}/150</Typography>
								</InputAdornment>
							),
							autoComplete: "off",
						}}
						onChange={(e) => setAddress(e?.target?.value)}
						autoComplete="off"
					/>
					{formik.errors.address && formik.touched.address && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik.errors.address}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="country">Country <span className="rfq-required-star">*</span></label>
					<Autocomplete
						disablePortal
						id="country"
						size="small"
						options={country_list || []}
						fullWidth
						renderInput={(params) => (
							<TextField {...params} variant="outlined" size="small" placeholder="" />
						)}
						defaultValue={findObjByValueFromArray(country_list, country, "countryName")}
						getOptionLabel={(option) => option.countryName ?? ""}
						value={country}
						onChange={(e, newvalue) => {
							setCountry(newvalue);
							if (newvalue) {
								const selectedCountry = country_list.find(item => item.countryName === newvalue.countryName);
								setDialingCode(selectedCountry || '');
								handleStates(newvalue?.id, null);
							} else {
								setCState(null);
								setCity(null);
								setCityList(null);
								setStateList(null);
							}
						}}
						autoComplete="off"
					/>
					{formik.errors.country && formik.touched.country && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik.errors.country}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<input type="text" style={{ display: 'none' }} name="state" />
					<label className="pe-field-label" htmlFor="state">State <span className="rfq-required-star">*</span></label>
					<Autocomplete
						disablePortal
						id="state"
						size="small"
						options={state_list || []}
						fullWidth
						renderInput={(params) => (
							<TextField {...params} variant="outlined" size="small" placeholder="" />
						)}
						defaultValue={findObjByValueFromArray(state_list, Cstate, "stateName")}
						getOptionLabel={(option) => option.stateName ?? ""}
						value={Cstate}
						onChange={(e, newvalue) => {
							if (newvalue) {
								setCState(newvalue);
								handleCity(newvalue?.id, null);
							}
						}}
						autoComplete="off"
					/>
					{formik.errors.state && formik.touched.state && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik.errors.state}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<input type="text" style={{ display: 'none' }} name="city" />
					<label className="pe-field-label" htmlFor="city">City <span className="rfq-required-star">*</span></label>
					<Autocomplete
						disablePortal
						id="city"
						size="small"
						options={city_list ?? []}
						fullWidth
						renderInput={(params) => (
							<TextField {...params} variant="outlined" size="small" placeholder="" />
						)}
						defaultValue={findObjByValueFromArray(city_list, city, "cityName")}
						getOptionLabel={(option) => option.cityName ?? ""}
						value={city}
						onChange={(e, newvalue) => setCity(newvalue)}
						autoComplete="off"
					/>
					{formik?.errors?.city && formik?.touched?.city && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.city}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="timeZone">Preferred Time Zone</label>
					<Autocomplete
						disablePortal
						id="timeZone"
						name="timeZone"
						size="small"
						options={timezone_list}
						fullWidth
						renderInput={(params) => (
							<TextField {...params} variant="outlined" size="small" placeholder="" />
						)}
						defaultValue={findObjByValueFromArray(timezone_list, timeZone ?? usertimezone, "localeName")}
						getOptionLabel={(option) => option?.timezonelong ?? ""}
						value={timeZone}
						onChange={(event, newValue) => setTimeZone(newValue)}
						autoComplete="off"
					/>
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="defaultCurrency">Currency</label>
					<Autocomplete
						disablePortal
						id="defaultCurrency"
						size="small"
						options={currency_list}
						fullWidth
						renderInput={(params) => (
							<TextField {...params} variant="outlined" size="small" placeholder="" />
						)}
						defaultValue={findObjByValueFromArray(currency_list, defaultCurrency, "currencyList")}
						getOptionLabel={(option) => option.currencyNm ?? ""}
						value={defaultCurrency}
						onChange={(e, newvalue) => setDefaultCurrency(newvalue)}
						autoComplete="off"
					/>
					{formik?.errors?.defaultCurrency && formik?.touched?.defaultCurrency && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.defaultCurrency}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="zipCode">Zip Code</label>
					<TextFieldCell
						id="zipCode"
						name="zipCode"
						placeholder=""
						maxLength={6}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">{zipCode?.length}/6</Typography>
								</InputAdornment>
							),
							autoComplete: "off"
						}}
						value={zipCode}
						onChange={handleZipCode}
						autoComplete="off"
					/>
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="accountManagerEmail">Account Manager Email <span className="rfq-required-star">*</span></label>
					<FormControl fullWidth>
						<Select
							id="accountManagerEmail"
							name="accountManagerEmail"
							variant="outlined"
							value={accountManagerEmail || ""}
							className="w-100"
							size="small"
							onBlur={formik.handleBlur}
							onChange={handleManageId}
							displayEmpty
						>
							<MenuItem value=""><em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Select</em></MenuItem>
							{userList?.map((option) => (
								<MenuItem key={option?.id} value={option?.email}>{option?.email}</MenuItem>
							))}
						</Select>
						{formik?.errors?.accountManagerEmail && formik?.touched?.accountManagerEmail && (
							<div className="error error-red" style={{ fontSize: "9px" }}>
								{formik?.errors?.accountManagerEmail}
							</div>
						)}
					</FormControl>
				</div>
				<div className="col-12 mb-3">
					<label className="pe-field-label" htmlFor="description">Description</label>
					<TextField
						fullWidth
						variant="outlined"
						size="small"
						className="f14"
						multiline={true}
						rows={3}
						id="description"
						name="description"
						placeholder=""
						value={description}
						onChange={handledescriptionChange}
						autoComplete="off"
						inputProps={{ maxLength: 300 }}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">{description?.length}/300</Typography>
								</InputAdornment>
							),
							autoComplete: "off"
						}}
					/>
				</div>

				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label">Logo</label>
					<Form.Group controlId="formFile">
						<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
							<Form.Control
								ref={logoRef}
								type="file"
								size="sm"
								accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								onChange={(e) => handleFileInputChange(e, setimgLogo, setErrorLogo, setLogoFileName)}
								style={{ paddingRight: logoFileName || imgLogo ? 28 : undefined }}
							/>
							{(logoFileName || imgLogo) && (
								<IconButton size="small" onClick={() => handleRemoveImage(setimgLogo, setErrorLogo, logoRef, setLogoFileName)}
									style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', padding: 2, background: '#fff', zIndex: 1 }}>
									<HiOutlineX style={{ fontSize: 14, color: '#b8232f' }} />
								</IconButton>
							)}
						</div>
						{errorLogo && <div className="text-danger" style={{ fontSize: 11 }}>{errorLogo}</div>}
						{imgLogo && (
							<div style={{ marginTop: 4 }}>
								<Avatar alt="Logo" src={imgLogo} sx={{ width: 35, height: 35 }} imgProps={{ style: { width: '100%', height: '100%', objectFit: 'fill' } }} />
							</div>
						)}
					</Form.Group>
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label">Background Image 1</label>
					<Form.Group controlId="formFileBg1">
						<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
							<Form.Control
								ref={bg1Ref}
								type="file"
								size="sm"
								accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								onChange={(e) => handleFileInputChange(e, setimgBG1, setErrorBG1, setBg1FileName)}
								style={{ paddingRight: bg1FileName || imgBG1 ? 28 : undefined }}
							/>
							{(bg1FileName || imgBG1) && (
								<IconButton size="small" onClick={() => handleRemoveImage(setimgBG1, setErrorBG1, bg1Ref, setBg1FileName)}
									style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', padding: 2, background: '#fff', zIndex: 1 }}>
									<HiOutlineX style={{ fontSize: 14, color: '#b8232f' }} />
								</IconButton>
							)}
						</div>
						{errorBG1 && <div className="text-danger" style={{ fontSize: 11 }}>{errorBG1}</div>}
						{imgBG1 && (
							<div style={{ marginTop: 4 }}>
								<Avatar alt="BG1" src={imgBG1} sx={{ width: 35, height: 35 }} imgProps={{ style: { width: '100%', height: '100%', objectFit: 'fill' } }} />
							</div>
						)}
					</Form.Group>
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label">Background Image 2</label>
					<Form.Group controlId="formFileBg2">
						<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
							<Form.Control
								ref={bg2Ref}
								type="file"
								size="sm"
								accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								onChange={(e) => handleFileInputChange(e, setimgBG2, setErrorBG2, setBg2FileName)}
								style={{ paddingRight: bg2FileName || imgBG2 ? 28 : undefined }}
							/>
							{(bg2FileName || imgBG2) && (
								<IconButton size="small" onClick={() => handleRemoveImage(setimgBG2, setErrorBG2, bg2Ref, setBg2FileName)}
									style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', padding: 2, background: '#fff', zIndex: 1 }}>
									<HiOutlineX style={{ fontSize: 14, color: '#b8232f' }} />
								</IconButton>
							)}
						</div>
						{errorBG2 && <div className="text-danger" style={{ fontSize: 11 }}>{errorBG2}</div>}
						{imgBG2 && (
							<div style={{ marginTop: 4 }}>
								<Avatar alt="BG2" src={imgBG2} sx={{ width: 35, height: 35 }} imgProps={{ style: { width: '100%', height: '100%', objectFit: 'fill' } }} />
							</div>
						)}
					</Form.Group>
				</div>
				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label">Background Image 3</label>
					<Form.Group controlId="formFileBg3">
						<div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
							<Form.Control
								ref={bg3Ref}
								type="file"
								size="sm"
								accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								onChange={(e) => handleFileInputChange(e, setimgBG3, setErrorBG3, setBg3FileName)}
								style={{ paddingRight: bg3FileName || imgBG3 ? 28 : undefined }}
							/>
							{(bg3FileName || imgBG3) && (
								<IconButton size="small" onClick={() => handleRemoveImage(setimgBG3, setErrorBG3, bg3Ref, setBg3FileName)}
									style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', padding: 2, background: '#fff', zIndex: 1 }}>
									<HiOutlineX style={{ fontSize: 14, color: '#b8232f' }} />
								</IconButton>
							)}
						</div>
						{errorBG3 && <div className="text-danger" style={{ fontSize: 11 }}>{errorBG3}</div>}
						{imgBG3 && (
							<div style={{ marginTop: 4 }}>
								<Avatar alt="BG3" src={imgBG3} sx={{ width: 35, height: 35 }} imgProps={{ style: { width: '100%', height: '100%', objectFit: 'fill' } }} />
							</div>
						)}
					</Form.Group>
				</div>
				<div className="col-12 col-md-4 mb-3 mt-3">
					<FormControlLabel
						control={
							<Checkbox
								name="isActive"
								id="isActive"
								checked={isActive}
								onChange={(e) => setisActive(e?.target?.checked)}
							/>
						}
						label="Active"
					/>
				</div>
				<div className="col-12 col-md-4 mb-3 mt-3">
					<FormControlLabel
						control={
							<Checkbox
								name="isMsmeEnable"
								id="isMsmeEnable"
								checked={isMsmeEnable}
								onChange={(e) => setisMsmeEnable(e?.target?.checked)}
							/>
						}
						label="MSME Enabled"
					/>
				</div>
				<div className="col-12 col-md-4 mb-3 mt-3">
					<FormControlLabel
						control={
							<Checkbox
								name="isAiEnable"
								id="isAiEnable"
								checked={isAiEnable}
								onChange={(e) => setisAiEnable(e?.target?.checked)}
							/>
						}
						label="AI Enabled"
					/>
				</div>
				<div className="col-12 col-md-4 mb-3 mt-3">
					<FormControlLabel
						control={
							<Checkbox
								name="isWhatsAppEnabled"
								id="isWhatsAppEnabled"
								checked={isWhatsAppEnabled}
								onChange={(e) => setIsWhatsAppEnabled(e?.target?.checked)}
							/>
						}
						label="WhatsApp Enabled"
					/>
				</div>
			</div>
		</Form>
	);
};

export default AddCustomer;
