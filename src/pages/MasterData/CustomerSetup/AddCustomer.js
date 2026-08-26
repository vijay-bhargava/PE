import React, { useState, useEffect } from "react";
import {
	Button,
	Checkbox,
	FormControl,
	InputLabel,
	Select,
	FormControlLabel,
	FormHelperText,
	MenuItem,
	TextField,
	Autocomplete,
	Avatar,
	Stack,
	Divider,
	Chip,
	IconButton,
	InputAdornment,
	Typography,
} from "@mui/material";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { LoadingButton } from "@mui/lab";
import "../../../assets/css/base.css";
import { useFormik } from "formik";
import { Form } from "react-bootstrap";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../../store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RegisterCustomer, UpdateCustomer, getCustomerList, getSingleCustomer } from "../../../utils/customerSetup";
import {
	findObjByValueFromArray,
	fetchCities,
	fetchStates,
	fetchMasters,
	getApiErrorMessage,
} from "../../../utils/common";
import validator from "validator";
import { HiOutlineX } from "react-icons/hi";
import { uploadFilesOnAzureURL } from "../../../utils/manageParticipants";
import { FindUser } from "../../../utils/users";
import { filteroptionDialingCode } from "../../../utils/common/utility";

const AddCustomer = ({ callbackstep, editRecordData, handleChangeTab, handleCustomerId, selectedCustomerId, handleEditrecorddata }) => {
	useEffect(() => {
		fetchMasters(atoken, customerid).then((res) => {
			if (res) {
				setCountryList(res.countryList);
				setTimezoneList(res.timezoneList);
				setCurrencyList(res.currencyList);
			}
		});
	}, []);

	useEffect(() => {
        pullUsersList(); 
       }, []);

	//master usestate for fetching country,city,state,dialcode,timezone
	const [country_list, setCountryList] = useState([]);
	const [timezone_list, setTimezoneList] = useState([]);
	const [currency_list, setCurrencyList] = useState([]);
	const [state_list, setStateList] = useState([]);
	const [city_list, setCityList] = useState([]);

	const [loading, setLoading] = useState(false);
	const [
		{ atoken, rtoken, customerid, usertimezone, userdialingcode },
		dispatch,
	] = useStateValue();
	const [customerName, SetCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
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

	//to validate website
	const [isValidUrl, setIsValidUrl] = useState(true);

	useEffect(() => {
		if (editRecordData) {
			prefilledCutomerInfo(editRecordData);
		}
		else {
			if (selectedCustomerId) {
				getSingleCustomer(selectedCustomerId, atoken).then((res) => {
					if (res) {
						handleEditrecorddata(res);
						prefilledCutomerInfo(res);
					}
				})
			}
		}
	}, [country_list,timezone_list]);

	const [userList, setUserList] = useState([]);
    const pullUsersList = async () => {
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
    }; 

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
		accountManagerEmail:yup.string().required("Please Select Account manager Email."),
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
			description:description,
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
						clearfilledCS();
						callbackstep("update");
					}
				} else {
					const res = await RegisterCustomer(data, atoken);
					if (res) {
						dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
						dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
						dispatch({ type: actionTypes.SET_MSGALERT, value: true });
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

	const prefilledCutomerInfo = () => {
   
		if (editRecordData) {
			SetCustomerName(editRecordData?.customerName);
			setCustomerEmail(editRecordData?.customerEmail);
			setAccountManagerEmail(editRecordData?.accountManagerEmail || "");
			// setAccountManagerEmail(
			// 	editRecordData?.accountManagerEmail
			// 		? findObjByValueFromArray(
			// 			userList,
			// 			editRecordData?.accountManagerEmail,
			// 			"accountManagerEmail"
			// 		)
			// 		: findObjByValueFromArray(
			// 			userList,
			// 			editRecordData?.accountManagerEmail,
			// 			"accountManagerEmail"
			// 		)
			// );
			setcontactPersonName(editRecordData?.contactPersonName);
			setAddress(editRecordData?.address);
			setZipCode(editRecordData?.zipCode);
			setWebsite(editRecordData?.website);
			setPhoneNo(editRecordData?.phoneNo);
			setAdminEmail(editRecordData?.adminEmail);
			setisActive(editRecordData?.isActive);
			setIsWhatsAppEnabled(editRecordData?.isWhatsAppEnabled);
			setLoginUrlSuffix(editRecordData?.loginUrlSuffix);
            setdescription(editRecordData?.description);
			console.log(
				findObjByValueFromArray(
					country_list,
					editRecordData?.country,
					"countryName"
				)
			);
			setCountry(
				findObjByValueFromArray(
					country_list,
					editRecordData?.country,
					"countryName"
				) || null
			);
			handleStates(editRecordData?.countrykey, editRecordData);
			handleCity(editRecordData?.regionkey, editRecordData);
			setDialingCode(
				editRecordData?.dialingCode
					? findObjByValueFromArray(
						country_list,
						editRecordData?.dialingCode,
						"dialingCode"
					)
					: findObjByValueFromArray(
						country_list,
						userdialingcode,
						"dialingCode"
					)
			);
			
			setTimeZone(
				findObjByValueFromArray(timezone_list,editRecordData?.timeZone || usertimezone, "localeName")
			);
			setDefaultCurrency(
				editRecordData?.defaultCurrency
					? findObjByValueFromArray(
						currency_list,
						editRecordData?.defaultCurrency,
						"currencyNm"
					)
					: findObjByValueFromArray(
						currency_list,
						defaultCurrency,
						"currencyNm"
					)
			);
			// setimgLogo(`data:image/jpeg;base64,${editRecordData?.imgLogo}`);
			// setimgBG1(`data:image/jpeg;base64,${editRecordData?.imgBG1}`);
			// setimgBG2(`data:image/jpeg;base64,${editRecordData?.imgBG2}`);
			// setimgBG3(`data:image/jpeg;base64,${editRecordData?.imgBG3}`);
			setimgLogo(
				editRecordData?.imgLogo
					? `${editRecordData?.imgLogo}`
					: ''
			);
			setimgBG1(
				editRecordData?.imgBG1
					? `${editRecordData?.imgBG1}`
					: ''
			);
			setimgBG2(
				editRecordData?.imgBG2
					? `${editRecordData?.imgBG2}`
					: ''
			);
			setimgBG3(
				editRecordData?.imgBG3
					? `${editRecordData?.imgBG3}`
					: ''
			);

			setisActive(editRecordData?.isActive);
			setisAiEnable(editRecordData?.isAIEnable);
			setisMsmeEnable(editRecordData?.isMsmeEnable);
		}
	};

	const clearfilledCS = () => {
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
		setisActive(false);
		setisAiEnable(false);
		setisMsmeEnable(false);
	};

	const handleWebsite = (event) => {
		const { value } = event?.target;
		setWebsite(value);
		setIsValidUrl(validator.isURL(value));
	};



	// const handleNameChange = (event) => {
	// 	const { value } = event.target;
	// 	const cleanedValue = removeSpecialCharactersAndNumbers(value);
	// 	SetCustomerName(cleanedValue);
	// };

	const handleCustomerEmailChange = (e) => {
		const input = e?.target?.value;
		const sanitizedInput = input.replace(/[^a-zA-Z0-9@.]/g, "");
		setCustomerEmail(sanitizedInput);
	};
	const handleCustomerAccountEmailChange = (e) => {
		const input = e?.target?.value;
		const sanitizedInput = input.replace(/[^a-zA-Z0-9@.]/g, "");
		setAccountManagerEmail(sanitizedInput);
	};
	// const handleCPNameChange = (event) => {
	// 	const { value } = event.target;
	// 	const cleanedValue = removeSpecialCharactersAndNumbers(value);
	// 	setcontactPersonName(cleanedValue);
	// };

	// const handleZipCode = (e) => {
	// 	let value = e?.target?.value;
	// 	value = value.replace(/[^\d]/g, "");
		
	// 	const decimalCount = (value.match(/\./g) || []).length;
	// 	if (decimalCount > 1) {
	// 		value = value.slice(0, value.lastIndexOf("."));
	// 	}
	// 	if (/^0\d/.test(value)) {
	// 		value = value.slice(1);
	// 	}

	// 	setZipCode(value);
	// };
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
	
	//handling masters
	const handleStates = async (countryKey, company) => {
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
	};

	const handleCity = async (stateId, company) => {
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
	};

	//to handle file into base64String
	const handleFileInputChange =async (event, setImageSetter, setErrorSetter) => {
		

		const file = event.target.files[0];

		if (file) {
			const maxSize = 2 * 1024 * 1024; // Maximum size in bytes (2MB in this example)
			if (file.size > maxSize) {
				setErrorSetter('Please make sure your image is below 2 MB');
			} else {

				setErrorSetter('');
                const Data = {
					RequestedBy: "customer",
					EventType:"setup" ,
					CustomerId: customerid,
					Description: "CustomerSetup",
				};

				const fileurl = await uploadFilesOnAzureURL(Data, file, atoken)
				if (fileurl) {
						setImageSetter(fileurl);
				}
				else {
					setImageSetter(null);
				}
				
			}
		} else {
			setImageSetter(null);
			setErrorSetter('');

		}
	};

	const handleRemoveImage = (setImageSetter, setErrorSetter) => {
		setImageSetter(null);
		setErrorSetter('');
	};


	const handleImage = (state) => {

		if (state) return state.split(",")[1];

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
		<Form onSubmit={formik.handleSubmit} autoComplete="off">
			<div className="row mt-3">
				<div className="col-12 col-md-4 mb-4">
				<input type="text" style={{ display: 'none' }} name="customerName" />
					<TextFieldCell
						id="customerName"
						name="customerName"
						label="Customer Name *"
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
							autoComplete : "off",
						  }}
						onChange={(e) => {
							SetCustomerName(e?.target?.value);
						}}
						autoComplete = "off"
					//onChange={handleNameChange}
					/>
					{formik?.errors?.customerName && formik?.touched?.customerName && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.customerName}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-4">
					<TextFieldCell
						id="adminEmail"
						name="adminEmail"
						label="Admin Email *"
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
							autoComplete : "off"
						  }}
						value={adminEmail}
						onChange={(e) => {
							setAdminEmail(e?.target?.value);
						}}
						autoComplete= "off"
					/>
					{formik.errors.adminEmail && formik.touched.adminEmail && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik.errors.adminEmail}
						</div>
					)}
				</div>

				<div className="col-12 col-md-4 mb-4">
					<TextFieldCell
						id="loginUrlSuffix"
						name="loginUrlSuffix"
						label="Login Url Suffix *"
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
							autoComplete : "off",
						  }}
						value={loginUrlSuffix}
					
						onChange={(e) => {
							if (!editRecordData) { // Only allow changes if editRecordData is not present
								setLoginUrlSuffix(e?.target?.value);
							}
						}}
				
						autoComplete = "off"
						disabled={!!editRecordData} 
					/>
					{formik?.errors?.loginUrlSuffix && formik?.touched?.loginUrlSuffix && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.loginUrlSuffix}
						</div>
					)}
				</div>
			

				

				<div className="col-12 col-md-4 mb-4">
					<TextFieldCell
						id="website"
						name="website"
						label="Website"
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
							autoComplete : "off",
						  }}
						value={website}
						onChange={handleWebsite}
						autoComplete = "off"
				
					/>
					{!isValidUrl && (
						<p style={{ color: "red", fontSize: 9 }}>
							Please enter a valid URL.
						</p>
					)}
				</div>
				<div className="col-12 col-md-4 mb-4 focus d-flex justify-content-between">
					<div className="row">
						<div className="col-md-4">
						<Autocomplete
						freeSolo
						disableClearable
						disablePortal
						id="dialingCode"
						size="small"
						options={country_list}
						name="dialingCode"
						fullWidth
						renderInput={(params) => (
							<TextField
								{...params}
								InputLabelProps={{
									shrink: true,
								}}
								label="Dial Code"
							/>
						)}
						defaultValue={findObjByValueFromArray(
							country_list,
							dialingCode ?? userdialingcode,
							"dialingCode"
						)}
						getOptionLabel={(option) => option.dialingCode ?? ""}
						filterOptions={filteroptionDialingCode}
						value={dialingCode}
						onChange={(event, newValue) => {
							setDialingCode(newValue);
						}}
						autoComplete = "off"
					/>
						</div>
						<div className="col-md-8">
						<input type="text" style={{ display: 'none' }} name="phoneNo" />
					<TextFieldCell
						id="phoneNo"
						name="phoneNo"
						label="Phone Number *"
						placeholder=""
						maxLength={15}
						value={phoneNo}
						InputProps={{
							endAdornment: (
							  <InputAdornment position="end">
								<Typography variant="body2" color="textSecondary">
								  {phoneNo?.length}/15
								</Typography>
							  </InputAdornment>
							),
							autoComplete : "off"
						  }}
						onChange={handlePNum}
						autoComplete = "off"
					
					/>
					{formik.errors.phoneNo && formik.touched.phoneNo && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.phoneNo}
						</div>
					)}
						</div>
					</div>
				
					
				</div>
                   
				<div className="col-12 col-md-4 mb-4">
					<TextFieldCell
						id="contactPersonName"
						name="contactPersonName"
						label="Contact Person Name *"
						placeholder=""
						value={contactPersonName}
						maxLength={50}
						InputProps={{
							endAdornment: (
							  <InputAdornment position="end">
								<Typography variant="body2" color="textSecondary">
								  {contactPersonName?.length}/50
								</Typography>
							  </InputAdornment>
							),
							autoComplete:"off"
						  }}
						onChange={(e) => {
							setcontactPersonName(e?.target?.value);
						}}
						autoComplete = "off"
					//onChange={handleCPNameChange}
					/>
					{formik.errors.contactPersonName &&
						formik.touched.contactPersonName && (
							<div className="error error-red" style={{ fontSize: "9px" }}>
								{formik.errors.contactPersonName}
							</div>
						)}
				</div>
				<div className="col-12 col-md-4 mb-4">
				<input type="text" style={{ display: 'none' }} name="address" />
					<TextFieldCell
						id="address"
						name="address"
						label="Address *"
						placeholder=""
						value={address}
						maxLength={150}
						InputProps={{
							endAdornment: (
							  <InputAdornment position="end">
								<Typography variant="body2" color="textSecondary">
								  {address?.length}/150
								</Typography>
							  </InputAdornment>
							),
							autoComplete : "off",
						  }}
						//onChange={handleAddressChange}
						onChange={(e) => {
							setAddress(e?.target?.value);
						}}
						autoComplete = "off"
					/>
					{formik.errors.address && formik.touched.address && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik.errors.address}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-4">
    <Autocomplete
        disablePortal
        id="country"
        size="small"
        options={country_list || []}
        fullWidth
        renderInput={(params) => (
            <TextField
                {...params}
                InputLabelProps={{
                    shrink: true,
                }}
                label="Country *"
            />
        )}
        defaultValue={findObjByValueFromArray(
            country_list,
            country,
            "countryName"
        )}
        getOptionLabel={(option) => option.countryName ?? ""}
        value={country}
        onChange={(e, newvalue) => {
            setCountry(newvalue);
            if (newvalue) {
				;
                const selectedCountry = country_list.find(item => item.countryName === newvalue.countryName);
                setDialingCode(selectedCountry || ''); // Assuming setDialingCode is a function to update the state
                handleStates(newvalue?.id, null);
            } else { 
                setCState(null); 
                setCity(null); 
                setCityList(null); 
                setStateList(null); 
            }
        }}
		autoComplete = "off"
    />
    {formik.errors.country && formik.touched.country && (
        <div className="error error-red" style={{ fontSize: "9px" }}>
            {formik.errors.country}
        </div>
    )}
</div>
<div className="col-12 col-md-4 mb-4">
				<input type="text" style={{ display: 'none' }} name="state" />
					<Autocomplete
						disablePortal
						id=""
						size="small"
						options={state_list || []}
						fullWidth
						renderInput={(params) => (
							<TextField
								{...params}
								InputLabelProps={{
									shrink: true,
								}}
								label="State *"
							/>
						)}
						defaultValue={findObjByValueFromArray(
							state_list,
							Cstate,
							"stateName"
						)}
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
				<div className="col-12 col-md-4 mb-4">
				<input type="text" style={{ display: 'none' }} name="city" />
					<Autocomplete
						disablePortal
						id=""
						size="small"
						options={city_list ?? []}
						fullWidth
						renderInput={(params) => (
							<TextField
								{...params}
								InputLabelProps={{
									shrink: true,
								}}
								label="City *"
							/>
						)}
						defaultValue={findObjByValueFromArray(city_list, city, "cityName")}
						getOptionLabel={(option) => option.cityName ?? ""}
						value={city}
						onChange={(e, newvalue) => {
							setCity(newvalue);
						}}
						autoComplete = "off"
					/>
					{formik?.errors?.city && formik?.touched?.city && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.city}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-4 focus">
					<Autocomplete
						disablePortal
						id="timeZone"
						name="timeZone"
						size="small"
						options={timezone_list}
						fullWidth
						renderInput={(params) => (
							<TextField
								{...params}
								InputLabelProps={{
									shrink: true,
								}}
								label="Preferred Time/Zone"
							/>
						)}
						defaultValue={findObjByValueFromArray(
							timezone_list,
							timeZone ?? usertimezone,
							"localeName"
						)}
						getOptionLabel={(option) => option?.timezonelong ?? ""}
						value={timeZone}
						onChange={(event, newValue) => {
							// Corrected parameter names
							setTimeZone(newValue);
						}}
						autoComplete = "off"
					/>
				</div>
				<div className="col-12 col-md-4 mb-4">
					<Autocomplete
						disablePortal
						id="defaultCurrency"
						size="small"
						options={currency_list}
						fullWidth
						renderInput={(params) => (
							<TextField
								{...params}
								InputLabelProps={{
									shrink: true,
								}}
								label="Currency"
							/>
						)}
						defaultValue={findObjByValueFromArray(
							currency_list,
							defaultCurrency,
							"currencyList"
						)}
						getOptionLabel={(option) => option.currencyNm ?? ""}
						value={defaultCurrency}
						onChange={(e, newvalue) => {
							setDefaultCurrency(newvalue);
						}}
						autoComplete = "off"
					/>
					{formik?.errors?.defaultCurrency && formik?.touched?.defaultCurrency && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.defaultCurrency}
						</div>
					)}
				</div>
				<div className="col-12 col-md-4 mb-4">
					<TextFieldCell
						id="zipCode"
						name="zipCode"
						label="Zip Code"
						placeholder=""
						maxLength={6}
						InputProps={{
							endAdornment: (
							  <InputAdornment position="end">
								<Typography variant="body2" color="textSecondary">
								  {zipCode?.length}/6
								</Typography>
							  </InputAdornment>
							),
							autoComplete:"off"
						  }}
						value={zipCode}
						onChange={handleZipCode}
						autoComplete="off"
					// onChange={(e) => {
					// 	setZipCode(e?.target?.value);
					// }}
					/>
				</div>
				<div className="col-12 col-md-4 mb-4">
  <FormControl fullWidth error={formik.touched.managerId && Boolean(formik.errors.managerId)}>
    <InputLabel id="AccountManagerEmail">Account Manager Email *</InputLabel>
    <Select
      labelId="accountManagerEmail"
      InputLabelProps={{
        shrink: true,
      }}
      label="Manager"
      id="accountManagerEmail"
      name="accountManagerEmail"
      variant="outlined"
      value={accountManagerEmail || ""}  // Default to "" if managerId is undefined
      className="w-100"
      size="small"
      onBlur={formik.handleBlur}
      onChange={handleManageId}
    >
      {userList?.map((option) => (
        <MenuItem key={option?.id} value={option?.email}>
          {option?.email}
        </MenuItem>
      ))}
    </Select>
	{formik?.errors?.accountManagerEmail && formik?.touched?.accountManagerEmail && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.accountManagerEmail}
						</div>
					)}
  </FormControl>
</div>

				{/* <div className="col-12 col-md-4 mb-4">
											<Autocomplete
												multiple={false}
												id="accountManagerEmail"
												name="accountManagerEmail"
												className="mb-4 mt-0"
												sx={{ width: "100%" }}
												size="small"
												options={userList ?? []}
												getOptionLabel={(option) =>
													`${option.name} - ${option.email}`
												}
												defaultValue={findObjByValueFromArray(userList, accountManagerEmail, "accountManagerEmail")}
												value={accountManagerEmail}
												onChange={handleUserChange}
												filterSelectedOptions
												renderInput={(params) => (
													<TextField
														{...params}
														variant="outlined"
														placeholder=""
														label="Account Manager *"
														value={formik?.values?.accountManagerEmail}
													/>
												)}
											/>
										</div> */}
				{/* <div className="col-12 col-md-4 mb-4">
					<TextFieldCell
						id="AccountManagerEmail"
						name="AccountManagerEmail"
						label="Account Manager Email Id *"
						placeholder=""
						value={AccountManagerEmail}
						maxLength={50}
						InputProps={{
							endAdornment: (
							  <InputAdornment position="end">
								<Typography variant="body2" color="textSecondary">
								  {AccountManagerEmail?.length}/50
								</Typography>
							  </InputAdornment>
							),
							autoComplete : "off",
						  }}
						onChange={handleCustomerAccountEmailChange}
						autoComplete = "off"
					/>
					{formik?.errors?.AccountManagerEmail && formik?.touched?.AccountManagerEmail && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik?.errors?.AccountManagerEmail}
						</div>
					)}
				</div> */}
				<div className='col-12 col-md-12 mb-4'>
    <TextField
        fullWidth
        variant="outlined"
        InputLabelProps={{
            shrink: true,
        }}
        size="small"
        className='f14'
        multiline={true}
        rows={3}
        id="description"
        name="description"
        label="Description *"
        value={description}
        onChange={handledescriptionChange}
		autoComplete="off"
        inputProps={{ maxLength: 300 }}
		InputProps={{
			endAdornment: (
			  <InputAdornment position="end">
				<Typography variant="body2" color="textSecondary">
				  {description?.length}/300
				</Typography>
			  </InputAdornment>
			),
			autoComplete:"off"
		  }}
        error={formik?.touched?.description && Boolean(formik?.errors?.description)}
        helperText={formik?.touched?.description && formik?.errors?.description}
    />
</div>

				<div className="col-12 col-md-4 mb-4">
					<div className="f12 mb-1">Logo</div>
					<Form.Group controlId="formFile" className="">
						<Form.Control
							type="file"
							size="sm"
							accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							onChange={(e) => handleFileInputChange(e, setimgLogo, setErrorLogo)}
						/>

						{errorLogo && <div className="text-danger" style={{ fontSize: "15px" }}>{errorLogo}</div>}
						{imgLogo && (
							<div style={{ position: 'relative', top: "5px" }}>
								<Stack>
									<Avatar
										alt="Logo"
										src={imgLogo}
										sx={{
											width: 35,
											height: 35,
										}}
										imgProps={{
											style: {
												width: '100%',
												height: '100%',
												objectFit: 'fill',
											},
										}}
									/>
								</Stack>
								{/* <button
									className="btn btn-link"
									style={{
										position: 'absolute',
										top: '-5px',
										left: '20px',
										padding: '0px 10px',
										zIndex: '1',
									}}
									onClick={() => handleRemoveImage(setimgLogo, setErrorLogo)}
								>
									<span aria-hidden="true">&times;</span>
								</button> */}
								<IconButton
									onClick={() => handleRemoveImage(setimgLogo, setErrorLogo)}
									style={{
										position: 'absolute',
										top: '7px',
										left: '30px',
										padding: '0px 10px',
										zIndex: '1',
										color: "rgba(220, 53, 69)"
									}}
									size="small"
									//edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20" />
								</IconButton>
							</div>
						)}
					</Form.Group>
				</div>

				<div className="col-12 col-md-4 mb-4">
					<div className="f12 mb-1">Background Image 1</div>
					<Form.Group controlId="formFile" className="">
						<Form.Control
							type="file"
							size="sm"
							accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							onChange={(e) => handleFileInputChange(e, setimgBG1, setErrorBG1)}
						/>
						{errorBG1 && <div className="text-danger" style={{ fontSize: "15px" }}>{errorBG1}</div>}
						{imgBG1 && (
							<div style={{ position: 'relative', top: "5px" }}>
								<Stack>
									<Avatar
										alt="BG1"
										src={imgBG1}
										sx={{
											width: 35,
											height: 35,
										}}
										imgProps={{
											style: {
												width: "100%",
												height: "100%",
												objectFit: "fill",
											},
										}}
									/>
								</Stack>
								<IconButton
									onClick={() => handleRemoveImage(setimgBG1, setErrorLogo)}
									style={{
										position: 'absolute',
										top: '7px',
										left: '30px',
										padding: '0px 10px',
										zIndex: '1',
										color: "rgba(220, 53, 69)"
									}}
									size="small"
									//edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20" />
								</IconButton>
							</div>
						)}
					</Form.Group>
				</div>
				<div className="col-12 col-md-4 mb-4">
					<div className="f12 mb-1">Background Image 2</div>
					<Form.Group controlId="formFile" className="">
						<Form.Control
							type="file"
							size="sm"
							accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							onChange={(e) => handleFileInputChange(e, setimgBG2, setErrorBG2)}
						/>
						{errorBG2 && <div className="text-danger" style={{ fontSize: "15px" }}>{errorBG2}</div>}
						{imgBG2 && (
							<div style={{ position: 'relative', top: "5px" }}>
								<Stack>
									<Avatar
										alt="BG2"
										src={imgBG2}
										sx={{
											width: 35,
											height: 35,
										}}
										imgProps={{
											style: {
												width: "100%",
												height: "100%",
												objectFit: "fill",
											},
										}}
									/>
								</Stack>
								<IconButton
									onClick={() => handleRemoveImage(setimgBG2, setErrorLogo)}
									style={{
										position: 'absolute',
										top: '7px',
										left: '30px',
										padding: '0px 10px',
										zIndex: '1',
										color: "rgba(220, 53, 69)"
									}}
									size="small"
									//edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20" />
								</IconButton>
							</div>
						)}
					</Form.Group>
				</div>
				<div className="row">
					<div className="col-12 col-md-4 mb-4">
						<div className="f12 mb-1">Background Image 3</div>
						<Form.Group controlId="formFile" className="">
							<Form.Control
								type="file"
								size="sm"
								accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								onChange={(e) => handleFileInputChange(e, setimgBG3, setErrorBG3)}
							/>
							{errorBG3 && <div className="text-danger" style={{ fontSize: "15px" }}>{errorBG3}</div>}
							{imgBG3 && (
								<div style={{ position: 'relative', top: "5px" }}>
									<Stack>
										<Avatar
											alt="BG3"
											src={imgBG3}
											sx={{
												width: 35,
												height: 35,
											}}
											imgProps={{
												style: {
													width: "100%",
													height: "100%",
													objectFit: "fill",
												},
											}}
										/>
									</Stack>
									<IconButton
										onClick={() => handleRemoveImage(setimgBG3, setErrorLogo)}
										style={{
											position: 'absolute',
											top: '7px',
											left: '30px',
											padding: '0px 10px',
											zIndex: '1',
											color: "rgba(220, 53, 69)"
										}}
										size="small"
										//edge="start"
										sx={{ mr: 1 }}
									>
										<HiOutlineX className="f20" />
									</IconButton>

								</div>
							)}
						</Form.Group>
					</div>
					<div className="col-12 col-md-4 mt-3">
						<FormControlLabel
							control={
								<Checkbox
									name="isActive"
									id="isActive"
									checked={isActive}
									onChange={(e) => {
										setisActive(e?.target?.checked);
									}}
								/>
							}
							label="Active "
						/>
					</div>
				</div>

				<div className="col-12 text-end">
					{/* {!loading ? (
						<> */}
					<Button
						color="primary"
						variant="outlined"
						size="small"
						onClick={clearfilledCS}
					>
						Reset
					</Button>

					<span style={{ margin: "0 5px" }}></span>
					<Button
						color="success"
						variant="outlined"
						size="small"
						type="submit"

					>
						{editRecordData?.id ? 'Update' : 'Save & Continue'}
					</Button>
					{/* </>
					) : (
						<LoadingButton className="" loading variant="contained">
							Submit ...
						</LoadingButton>
					)} */}
				</div>
			</div>
		</Form>
	);
};

export default AddCustomer;
