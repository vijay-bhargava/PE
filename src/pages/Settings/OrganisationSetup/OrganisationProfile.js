import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import LoadingButton from "@mui/lab/LoadingButton";
import { actionTypes, useStateValue } from "../../../store";
import FormGroup from "@mui/material/FormGroup";
import {
	Autocomplete,
	Avatar,
	Badge,
	Checkbox,
	FormControlLabel,
	InputLabel,
	Stack,
	MenuItem,
	Select,
	CardHeader,
	CardContent,
	FormControl,
	OutlinedInput,
	Input,
	FormHelperText,
	Box,
	Typography,
	CircularProgress,
} from "@mui/material";
import {
	getOrgFindById,
	getOrgSetup,
	SaveOrgisation,
	updateOrgisation,
} from "../../../utils/orgsetup";
import { format } from "date-fns";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Card, Modal, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { getCookieDomain, buildLoginUrl } from '../../../utils/common/subdomainHelper';
// import HeaderAccount from '../BaseComponent/HeaderAccount';
// import PageMainHeading from '../BaseComponent/PageMainHeading';
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
// import ManageSearchIcon from '@mui/icons-material/ManageSearch';
// import EditIcon from '@mui/icons-material/Edit';
import IconButton from "@mui/material/IconButton";
// import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
// // import PersonIcon from '@mui/icons-material/Person';
// import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
// import BusinessIcon from '@mui/icons-material/Business';
// import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import TextField from "@mui/material/TextField";
// import FullPageLodingCell from '../../BaseComponent/FullPageLodingCell';
import Chip from "@mui/material/Chip";
import {
	CameraAltOutlined,
	ContactPage,
	Edit,
	EditAttributesOutlined,
	LocalLibrary,
	Phone,
	RateReviewOutlined,
	SupervisedUserCircleRounded,
	Visibility,
	VisibilityOff,
} from "@mui/icons-material";
import { HiOutlineX, HiPencilAlt } from "react-icons/hi";
import AddNewEmailTemplate from "../ManageEmailTemplate/AddNewEmailTemplate";
import { FindUser, UpdateProfile, UpdateUser, UpdateUserProfile } from "../../../utils/users";
import { useCookies } from "react-cookie";
import {
	ChangePassword,
	UserChangePassword,
} from "../../../utils/apiConstants";
import { ApiClient } from "../../../Apiclient";
import { toast } from "react-toastify";
import { getCountry, getTimeZone, removeNonNumeric, toastoption } from "../../../utils/common";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { BackButton } from "../../../utils/common/component";
import { filteroptionDialingCode } from "../../../utils/common/utility";

// import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';

const OrganisationProfile = () => {
	;
	const navigate = useNavigate();
	const [{ atoken, customersuffix, customerid, userdialingcode,userDetail,usertimezone }, dispatch] =
		useStateValue();
		  const apiClient = new ApiClient(customersuffix);
		const broadcastChannel = new BroadcastChannel('auth_logout');
		
	const [cookie, setCookie, removeCookie] = useCookies([
		"patkn",
		"prtkn",
		"pcid",
		"pcsu",
		"pcuserDetail",
	]);
	const logout = () => {
		// Broadcast a logout message to all tabs
		broadcastChannel.postMessage({ action: 'logout' });

		// Clear global state first
		dispatch({ type: actionTypes.SET_ATOKEN, value: null });
		dispatch({ type: actionTypes.SET_RTOKEN, value: null });
		dispatch({ type: actionTypes.SET_CUSTOMERID, value: null });
		dispatch({ type: actionTypes.SET_CUSTOMERSUFFIX, value: null });
		dispatch({ type: actionTypes.SET_USERDETAIL, value: [] });
		dispatch({ type: actionTypes.SET_RoleClaims, value: [] });
		dispatch({ type: actionTypes.SET_MenuList, value: [] });
		dispatch({ type: actionTypes.SET_USERTIMEZONE, value: null });
		dispatch({ type: actionTypes.SET_USERDIALINGCODE, value: null });
		dispatch({ type: actionTypes.SET_LOGINCOUNT, value: 0 });

		const cookieDomain = getCookieDomain();
		const cookieOptions = { 
			path: "/",
			...(cookieDomain && { domain: cookieDomain })
		};

		// Remove all authentication cookies
		removeCookie("patkn", cookieOptions);
		removeCookie("prtkn", cookieOptions);
		removeCookie("pcid", cookieOptions);
		removeCookie("pcsu", cookieOptions);
		removeCookie("pcuserDetail", cookieOptions);
		removeCookie("pcutz", cookieOptions);
		removeCookie("pcudc", cookieOptions);
		removeCookie("pcloginCount", cookieOptions);
		removeCookie("pcmlDetail", cookieOptions);
		removeCookie("pcrcDetail", cookieOptions);

		// Force redirect to login page root
		const protocol = window.location.protocol;
		const hostname = window.location.hostname;
		const port = window.location.port;
		
		// Build the base URL (root of current domain/subdomain)
		const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
		
		// Use setTimeout to ensure cookies are cleared before redirect
		setTimeout(() => {
			window.location.href = baseUrl;
		}, 100);
	};
	useEffect(() => {
		pullUsersList();
        pullDialCodeList();
        PullTimezone();
	}, []);
    const [timeZone, setTimeZone] = useState(usertimezone); 
    const [phoneNumber, setphoneNumber] = useState(userDetail.phoneNumber);
    const [dialingCode, setDialingCode] = useState(userdialingcode);
    const [DialCodeList, setDialCodeList] = useState([]);

    const pullDialCodeList = () => {
      
      setLoading(true);
      getCountry(atoken)
        .then((res) => {
          if (res && res?.length > 0) {
            setDialCodeList(res);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching user list:", error);
          setLoading(false);
        });
    };


    const [TimezoneList, setTimezoneList] = useState([]);
    const PullTimezone = () => {
      var data = {
        CustomerId: customerid
      };
  
      getTimeZone(atoken).then((res) => {
        // console.log(res);
        setTimezoneList(res);
      });
    };
	  const [timeLocalelist,setTimeLocaleList]= useState(null);
	  //pull timelocale data 
	  useEffect(()=>{
		getTimeLocale()
	  },[])
	
	  const getTimeLocale=async ()=>{
			 ;
			 const res =await  apiClient.getres(`/api/TimeLocale/FindAll`,atoken)
			 if(res){
			  setTimeLocaleList(res?.data)
			 }
	  }
	const [show, setShow] = useState(false);

	const handleClose = () => {
		
		setnewPassword(null);
		setpassword(null);
		setconfirmPassword(null);
		setShow(false);
	};

	const handleShow = () => setShow(true);


// 		  const [showChangePassword, setShowChangePassword] = useState(false);

// const handleShow = () => {
//   setShowChangePassword(true);
// };

	
	const [showPassword, setShowPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [password, setpassword] = useState("");
	const [newPassword, setnewPassword] = useState("");
	const [confirmPassword, setconfirmPassword] = useState("");
	const [passwordsMatchError, setPasswordsMatchError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const [departmentName, setDepartmentName] = useState("");
	const [orgGroupNames, setOrgGroupNames] = useState("");
	const [fullPhoneNumber, setFullPhoneNumber] = useState("");
	const [passwordComplexityError, setPasswordComplexityError] = useState(false);
	const [maxPasswordLengthError, setMaxPasswordLengthError] = useState(false);
	const [touched, setTouched] = useState({
		newPassword: false,
		confirmPassword: false,
	});
	const handleClickShowPassword = () => setShowPassword((show) => !show);

	const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
	const handleClickShowConfirmPassword = () =>
		setShowConfirmPassword((show) => !show);

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};

	const [userList, setUserList] = useState([]);
	const pullUsersList = () => {
		var data = {
			Id: userDetail?.id,
			//EditYN : "Y"
			// managerId:managerId
		};
		
		setLoading(true);
		FindUser(data, atoken).then((res) => {
			console.log(res);
               
			if (res != "" && res != undefined) {
				setUserList(res);
			}
			setLoading(false);
		});
	};
	const firstCharacter = userDetail?.name?.charAt(0);
	useEffect(() => {
		
		if (userList[0]?.userDepartments) {
			try {
				const departments = JSON.parse(userList[0].userDepartments);
				if (Array.isArray(departments) && departments?.length > 0) {
					const names = departments
						.map((department) => department.departmentName)
						.join(", ");
					setDepartmentName(names);
				}
			} catch (error) {
				console.error("Error parsing userDepartments:", error);
			}
		}

		// if (userList[0]?.userOrgGroup) {
		// 	try {
		// 		const orgGroups = JSON.parse(userList[0].userOrgGroup);
		// 		if (Array.isArray(orgGroups) && orgGroups.length > 0) {
		// 			const names = orgGroups
		// 				.map((orgGroup) => orgGroup.orgGroupName)
		// 				.join(", ");
		// 			setOrgGroupNames(names);
		// 		}
		// 	} catch (error) {
		// 		console.error("Error parsing userOrgGroups:", error);
		// 	}
		// }
		if (userList[0]?.userOrgGroup) {
			try {
			  // Check if userOrgGroup is a string, if yes, parse it, else use it directly
			  const orgGroups = typeof userList[0].userOrgGroup === 'string'
				? JSON.parse(userList[0].userOrgGroup) // Parse if it's a string
				: userList[0].userOrgGroup; // Otherwise use it directly
			  
			  // Now check if it's an array and contains data
			  if (Array.isArray(orgGroups) && orgGroups?.length > 0) {
				const names = orgGroups
				  .map((orgGroup) => orgGroup.orgGroupName)
				  .join(", ");
				setOrgGroupNames(names);
			  }
			} catch (error) {
			  console.error("Error parsing userOrgGroups:", error);
			}
		  }
		  
		if (userList[0]?.phoneNumber && userList[0]?.dialingCode) {
			const phoneNumberWithCode = `${userList[0]?.dialingCode}  ${userList[0]?.phoneNumber}`;
			setFullPhoneNumber(phoneNumberWithCode);
			setphoneNumber(userList[0]?.phoneNumber);
			setDialingCode(userList[0]?.dialingCode);
		}
		setTimeZone(userList[0]?.timeZone);
	}, [userList]);

	const validationSchema = yup.object({
		password: yup.string().required("Please enter your Old Password"),
		// newPassword: yup
		// 	.string()
		// 	.required("Please enter your New Password")
		// 	.max(8, "New Password must be at most 8 characters"),


			newPassword: yup.string()
			.min(6, "New password must be at least 6 characters")
			.max(15, "New password must be 15 characters or less")
			.matches(/[A-Z]/, "New password must contain at least one uppercase letter")
			.matches(/[a-z]/, "New password must contain at least one lowercase letter") 
			.matches(/[0-9]/, "New password must contain at least one number")
			.matches(/[!@#$%^&*(),.?":{}|<>]/, "New password must contain at least one special character")
			.required("Please enter your New Password"),
		confirmPassword: yup
			.string()
			.required("Please enter your Confirm Password"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			emailId: userDetail.email,
			password: password,
			newPassword: newPassword,
			confirmPassword: confirmPassword,
			userType: "User",
			stages: {
				eventType: "UM",
				currentStage: "ChangePassword",
				nextStage: "ChangePassword",
			},
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {
			var data = {
				email: userDetail.email,
				password: values?.password,
				newPassword: values?.newPassword,
				confirmPassword: values?.confirmPassword,
				userType: "User",
				stages: {
					eventType: "UM",
					currentStage: "ChangePassword",
					nextStage: "ChangePassword",
				},
			};

			setLoading(true);
			UserChangePassword(data);
		},
	});
	const apiclient = new ApiClient();

	const UserChangePassword = async (Data) => {
		var data = {
			email: Data?.email,
			password: Data?.password,
			newPassword: Data?.newPassword,
			confirmPassword: Data?.confirmPassword,
			userType: Data?.userType,
			stages: Data?.stages,
		};

		const res = await apiclient.putres(
			`/api/auth/changepassword`,
			data,
			atoken
		);

		if (res) {
			toast.success(`Password changed successfully`, {
			 toastId: "selectPassword"
			});
			logout();
			clearData();
		} else {
			toast.error(
				`Failed to change password. Please check your  password and try again.`,
				{
					 toastId: "checkPassword"
				}
			);
			handleClose();
			// Optionally, return something or handle this case further
			return;
		}
	};

	
	const handlePasswordChange = (event) => {
		// Remove spaces from the password input
		let value = event.target.value.replace(/\s/g, ""); // Remove all spaces
	  
		setpassword(value);
	  };
	  const toggleVisibility = (setter) => () => setter((prev) => !prev);

	const handleNewPasswordChange = (event) => {
		let { value } = event.target;
		value = value.replace(/\s/g, "");

		if (value == null) {
			setnewPassword("");
			setTouched({ ...touched, newPassword: true });
			setPasswordError(false);
			setMaxPasswordLengthError(false);
			setPasswordComplexityError(false);
			return;
		}
		setnewPassword(value);
		setTouched({ ...touched, newPassword: true });

		if (value === password) {
			setPasswordError(true);
		} else {
			setPasswordError(false);
		}

		const hasUpperCase = /[A-Z]/.test(value);
		const hasLowerCase = /[a-z]/.test(value);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
		const hasNumber = /[0-9]/.test(value);
		const isLengthValid = value?.length <= 15;

		if (value?.length > 15) {
			setMaxPasswordLengthError(true);
		} else {
			setMaxPasswordLengthError(false);
		}

		if (!hasUpperCase || !hasLowerCase || !hasSpecialChar || !hasNumber || !isLengthValid) {
			setPasswordComplexityError(true);
		} else {
			setPasswordComplexityError(false);
		}
	};

    // const handlePhoneChange = (e) => {

    //     const { value } = e.target;
    //     const cleanedValue = removeNonNumeric(value);
    //     setphoneNumber(cleanedValue);
    //   };

	  const handlePhoneChange = (e) => {
		const { value } = e.target;

		
	  
		// Step 1: Remove all non-numeric characters except for digits
		let cleanedValue = value.replace(/\D/g, ''); // This will remove non-digits like letters and symbols
	  
		// Step 2: Prevent entering decimal points
		if (value.includes(".")) {
		  return; // Do nothing if decimal is entered
		}
	  
		// Step 3: Prevent entering consecutive zeros (00)
		// if (cleanedValue.includes('00')) {
		//   return; 
		// }
		
		// Step 4: Check for minimum length (10 digits)
		if (cleanedValue?.length < 10) {
		  setphoneNumber(cleanedValue); // Update Formik or state with the cleaned value
		  return;
		}
	    if (cleanedValue?.length < 7) {
			setphoneNumber(cleanedValue); // Update Formik or state with the cleaned value
			return;
		  }
		// Step 5: Check for maximum length (15 digits)
		if (cleanedValue?.length > 15) {
		  return; // Do nothing if the length exceeds 15 digits
		}
	  
		// Update phone number if all conditions are met
		setphoneNumber(cleanedValue);
	  };
	  
	const handleConfirmPasswordChange = (event) => {
		let { value } = event.target;
		value = value.replace(/\s/g, "");
		setconfirmPassword(value);
		setTouched({ ...touched, confirmPassword: true });

		// Check if passwords match when confirm password changes
		if (newPassword !== value && touched.newPassword) {
			setPasswordsMatchError(true);
		} else {
			setPasswordsMatchError(false);
		}
	};
	const handleTimezoneChange = (newValue) => {
		
		if (newValue) {
		  const selectedLocaleName = newValue
		  setTimeZone(selectedLocaleName); // Update local state with selected timezone
		   
		}
	  };
	  
    
	const clearData = () => {
		//    setpassword("");
		//    setnewPassword("");
		//    setconfirmPassword("")

		// Close modal
		handleClose();
	};
	//##
   
// 	 const handleDialChange = () => {
// 		
//     // Find the country object with dialingCode "+852"
//     const selectedCountry = DialCodeList.find(country => country.dialingCode === dialingCode);

//     // If country is found, set its dialing code
//     if (selectedCountry) {
//       setDialingCode(selectedCountry.dialingCode);
//     }
//   };
const getPasswordStrength = (pwd) => {
	let strength = 0;
	if (/[a-z]/.test(pwd)) strength++;
	if (/[A-Z]/.test(pwd)) strength++;
	if (/\d/.test(pwd)) strength++;
	if (/[@$!%*?&]/.test(pwd)) strength++;
	if (pwd.length >= 8) strength++;
	return strength;
};
const handleDialChange = (e, value) => {
	
	if (value) {
	  setDialingCode(value.dialingCode);
	}
  };
  const handleSubmit = () => {
	if (!phoneNumber || phoneNumber.trim() === '') {
        toast.error("Please fill the phone number before updating!", {
            toastId: "checkPasswordfill"
        });
        return; 
    }

	if (!dialingCode || dialingCode.trim() === '') {
        toast.error("Please select a dialing code before updating!", {
           toastId: "checkPassworddialing"
        });
        return; 
    }

    if (!timeZone || timeZone.trim() === '') {
        toast.error("Please select a time zone before updating!", {
             toastId: "checktime"
        });
        return; 
    }
    setLoading(true);
  
  


   
    const data = {
        id: userDetail?.id,
        name: userDetail?.name,
        email: userDetail?.email,
        timeZone: timeZone,
        dialingCode: dialingCode,
        phoneNumber: phoneNumber,
		managerId: userList[0]?.managerId,
		managerName: userList[0]?.managerName,
        roleId: userList[0]?.roleId,
		
        roleName: userList[0]?.roleName,
		legalEntity :userList[0]?.legalEntity,
		legalId:userList[0]?.legalId,
		isActive: userList[0]?.isActive,
        designationId: userList[0]?.designationId,
        designation: userList[0]?.designation,
        userOrgGroups:userList[0]?.userOrgGroups,
		userDepartments: userList[0]?.userDepartments,
		userAssignDepartment: userList[0]?.userAssignDepartment,
		//userDepartments: userDepartments,
		userOrgGroup: userList[0]?.userOrgGroup,
        orgId: userList[0]?.orgId,
        orgName: userList[0]?.orgName,
    };

    if (userDetail?.id > 0) {
        // Assuming UpdateUser is an asynchronous function that updates user data
        UpdateProfile(data, userDetail?.id, atoken)
            .then((res) => {
                setLoading(false);
				setphoneNumber(res?.data?.phoneNumber); 
				 dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
                dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
                dispatch({ type: actionTypes.SET_MSGALERT, value: true });
                pullUsersList();
                toast.success("User updated successfully!", {
                    toastId: "Userchecktime"
                });
            })
            .catch((error) => {
                setLoading(false);
                console.error("Error updating user:", error);
                // Handle error if necessary
            });
    }
};
const getTimePatternFormat = (userTimePattern, timeLocalelist) => {
	// Ensure timeLocalelist and timeLocalelist.timePattern are arrays
	if (!Array.isArray(timeLocalelist?.timePattern)) {
	  console.error("Error: timeLocalelist.timePattern is not an array");
	  return "Not Selected";
	}
  
	// Loop through the timeLocalelist.timePattern and find the matching format
	const matchedPattern = timeLocalelist.timePattern.find(
	  (item) => item?.options === userTimePattern
	);
  
	return matchedPattern ? matchedPattern.format : "N/A";
  };
  
  // Usage in your component
  const timePattern = getTimePatternFormat(userDetail?.timePattern, timeLocalelist);
  const getDatePatternFormat = (userDatePattern, timeLocalelist) => {
	// Ensure timeLocalelist and timeLocalelist.datePattern are arrays
	if (!Array.isArray(timeLocalelist?.datePattern)) {
	  console.error("Error: timeLocalelist.datePattern is not an array");
	  return "N/A";
	}
  
	// Loop through the timeLocalelist.datePattern and find the matching format
	const matchedPattern = timeLocalelist.datePattern.find(
	  (item) => item?.options === userDatePattern
	);
  
	return matchedPattern ? matchedPattern.format : "N/A";
  };
  
  // Usage in your component
  const datePattern = getDatePatternFormat(userDetail?.datePattern, timeLocalelist);
  
  const getLanguageFormat = (userLanguagePattern, timeLocalelist) => {
	// Ensure timeLocalelist and timeLocalelist.languagePattern are arrays
	if (!Array.isArray(timeLocalelist?.languagePattern)) {
	  console.error("Error: timeLocalelist.languagePattern is not an array");
	  return "N/A";
	}
  
	// Loop through the timeLocalelist.languagePattern and find the matching language format
	const matchedLanguage = timeLocalelist.languagePattern.find(
	  (item) => item?.options === userLanguagePattern && item?.isActive
	);
  
	return matchedLanguage ? matchedLanguage.format : "N/A";
  };
  const languagePatt= getLanguageFormat(userDetail?.languagePattern, timeLocalelist);
  
  
	return (
		<>
			<div className="container-scroller">
				<div className="page-body-wrapper bgGray">
					<div className="container-fluid">
					{/* Main Content - Single Card */}
					<div className="row">
						<div className="col-md-12 mb-4">
			<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
								<div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
									<div className="d-flex align-items-center">
										<BackButton title="User Profile" />
									</div>
									<div className="d-flex gap-2">
										<Button 
											variant="contained" 
											color="primary"
											onClick={handleSubmit}
											className="text-capitalize"
											size="small"
										>
											Update Profile
										</Button>
										<Button 
											variant="outlined" 
											color="primary"
											onClick={handleShow}
											className="text-capitalize"
											size="small"
										>
											Change Password
										</Button>
									</div>
								</div>
								<div className="details-content">
									{/* Basic Details Section */}
									<div className="mb-4">
										<h6 className="content-text fw-medium text-primary mb-3">Basic Details</h6>
										<div className="table-responsive">
											<Table hover className="mb-0 border">
												<tbody>
													{/* First Row: Name, Email, Designation, Mobile */}
													<tr>
														<td className="content-text fw-medium text-muted border-end" style={{ width: '12%', paddingRight: '8px' }}>Name:</td>
														<td className="content-text border-end" style={{ width: '23%', paddingLeft: '8px' }}>{userList[0]?.name}</td>
														<td className="content-text fw-medium text-muted border-end" style={{ width: '12%', paddingRight: '8px' }}>Email:</td>
														<td className="content-text border-end" style={{ width: '23%', paddingLeft: '8px' }}>{userList[0]?.email}</td>
														<td className="content-text fw-medium text-muted border-end" style={{ width: '15%', paddingRight: '8px' }}>Designation:</td>
														<td className="content-text" style={{ width: '15%', paddingLeft: '8px' }}>{userList[0]?.designation}</td>
													</tr>
													
													{/* Second Row: Department, Manager, Role, Mobile */}
													<tr>
														<td className="content-text fw-medium text-muted border-end" style={{ paddingRight: '8px' }}>Department:</td>
														<td className="content-text border-end" style={{ paddingLeft: '8px' }}>{userList[0]?.departmentName}</td>
														<td className="content-text fw-medium text-muted border-end" style={{ paddingRight: '8px' }}>Manager:</td>
														<td className="content-text border-end" style={{ paddingLeft: '8px' }}>{userList[0]?.managerName}</td>
														<td className="content-text fw-medium text-muted border-end" style={{ paddingRight: '8px' }}>Role:</td>
														<td className="content-text" style={{ paddingLeft: '8px' }}>{userList[0]?.roleName}</td>
													</tr>

													{/* Third Row: Legal Entity, Time Pattern, Date Pattern */}
													<tr>
														<td className="content-text fw-medium text-muted border-end" style={{ paddingRight: '8px' }}>Legal Entity:</td>
														<td className="content-text border-end" style={{ paddingLeft: '8px' }}>{userList[0]?.legalEntity}</td>
														<td className="content-text fw-medium text-muted border-end" style={{ paddingRight: '8px' }}>Time Pattern:</td>
														<td className="content-text border-end" style={{ paddingLeft: '8px' }}>{timePattern}</td>
														<td className="content-text fw-medium text-muted border-end" style={{ paddingRight: '8px' }}>Date Pattern:</td>
														<td className="content-text" style={{ paddingLeft: '8px' }}>{getDatePatternFormat(userList[0]?.datePattern, timeLocalelist)}</td>
													</tr>

													{/* Fourth Row: Mobile, Time Zone, and Language */}
													<tr>
														<td className="content-text fw-medium text-muted border-end" style={{ paddingRight: '8px', verticalAlign: 'top' }}>Mobile:</td>
														<td className="border-end" style={{ paddingLeft: '8px' }}>
															<div className="d-flex flex-column">
																<div className="d-flex align-items-center gap-2">
																	<Autocomplete
																		id="dialingCode"
																		options={DialCodeList}
																		getOptionLabel={(option) => option.dialingCode}
																		filterOptions={filteroptionDialingCode}
																		value={DialCodeList.find((option) => option.dialingCode === dialingCode) || null}
																		onChange={handleDialChange}
																		className="dial-code-select"
																		size="small"
																		sx={{ width: 120, minWidth: 120 }}
																		renderInput={(params) => (
																			<TextField
																				{...params}
																				variant="outlined"
																				size="small"
																			/>
																		)}
																	/>
																	<TextFieldCell
																		id="phoneNumber"
																		name="phoneNumber"
																		placeholder="Enter mobile number"
																		value={phoneNumber}
																		maxLength={15}
																		minLength={7}
																		size="small"
																		sx={{ width: 200, minWidth: 200 }}
																		onChange={handlePhoneChange}
																		error={phoneNumber?.length < 7}
																	/>
																</div>
																{phoneNumber?.length < 7 && (
																	<div className="text-danger" style={{ fontSize: '12px', marginTop: '4px' }}>
																		Minimum length must be 7 digits
																	</div>
																)}
															</div>
														</td>
														<td className="content-text fw-medium text-muted border-end" style={{ paddingRight: '8px', verticalAlign: 'top' }}>Time Zone:</td>
														<td className="border-end" style={{ paddingLeft: '8px' }}>
															<div className="d-flex flex-column">
																<Autocomplete
																	id="timeZoneAutocomplete"
																	options={TimezoneList}
																	getOptionLabel={(option) => option.timezonelong}
																	value={TimezoneList?.find((option) => option?.localeName === timeZone) || null}
																	onChange={(event, newValue) => {
																		handleTimezoneChange(newValue?.localeName);
																	}}
																	size="small"
																	sx={{ width: '100%', maxWidth: 400 }}
																	renderInput={(params) => (
																		<TextField
																			{...params}
																			variant="outlined"
																			size="small"
																			placeholder="Select timezone"
																			onBlur={formik.handleBlur}
																			error={formik.touched.timeZone && Boolean(formik.errors.timeZone)}
																		/>
																	)}
																/>
																{formik.touched.timeZone && formik.errors.timeZone && (
																	<div className="text-danger" style={{ fontSize: '12px', marginTop: '4px' }}>
																		{formik.errors.timeZone}
																	</div>
																)}
															</div>
														</td>
														<td className="content-text fw-medium text-muted border-end" style={{ paddingRight: '8px' }}>Language:</td>
														<td className="content-text" style={{ paddingLeft: '8px' }}>{languagePatt}</td>
													</tr>
												</tbody>
											</Table>
										</div>
									</div>

									{/* Organization Details Section */}
									<div className="mb-4">
										<h6 className="content-text fw-medium text-primary mb-3">Organization Details</h6>
										<div className="table-responsive">
											<Table hover className="mb-0 border">
												<tbody>
													<tr>
														<td className="content-text fw-medium text-muted border-end" style={{ width: '12%', paddingRight: '8px' }}>Organization:</td>
														<td className="content-text border-end" style={{ width: '38%', paddingLeft: '8px' }}>{userList[0]?.orgName}</td>
														<td className="content-text fw-medium text-muted border-end" style={{ width: '12%', paddingRight: '8px' }}>Group:</td>
														<td className="content-text" style={{ width: '38%', paddingLeft: '8px' }}>{orgGroupNames}</td>
													</tr>
												</tbody>
											</Table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Change Password Modal */}
				<Modal
					size="sm"
					show={show}
					backdrop="static"
					centered
					// contentClassName="border-0 "
					className="zindex1280"
					backdropClassName="zindex1280"
					onHide={() => handleClose()}
				>
<Modal.Header className="bgheaderNotificationCards pt-2 pb-2 d-flex justify-content-between align-items-center">

  <IconButton
    onClick={handleClose}
    size="small"
    className="ms-auto"
    sx={{ color: "white" }}
  >
    <HiOutlineX />
  </IconButton>
</Modal.Header>


  <Modal.Body className="p-0">
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
  
      sx={{ background: "linear-gradient(to right, #cfd9df, #e2ebf0)" }}
    >
      <Card
        sx={{
          width: 450,
          p: 3,
          borderRadius: 4,
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.6)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <CardHeader
          title={
            <Typography variant="h6" fontWeight={500} textAlign="center">
              🔒 Change Password
            </Typography>
          }
        />
        <CardContent>
          <form onSubmit={formik.handleSubmit} autoComplete="off">
            <TextField
              fullWidth
              margin="normal"
              label="Old Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleVisibility(setShowPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={handleNewPasswordChange}
              error={passwordComplexityError || passwordError || maxPasswordLengthError}
              helperText={
                passwordComplexityError
                  ? "Must include upper, lower, number & special char"
                  : passwordError
                  ? "New password cannot be same as old"
                  : maxPasswordLengthError
                  ? "Password must be under 15 characters"
                  : ""
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleVisibility(setShowNewPassword)}>
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* 💪 Password Strength Meter */}
            {newPassword && (
              <Box mt={1} mb={2}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Password Strength:
                </Typography>
                <Box
                  sx={{
                    height: 10,
                    width: "100%",
                    backgroundColor: "#e0e0e0",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${getPasswordStrength(newPassword) * 20}%`,
                      transition: "0.3s",
                      background:
                        getPasswordStrength(newPassword) <= 2
                          ? "#f44336"
                          : getPasswordStrength(newPassword) <= 3
                          ? "#ff9800"
                          : "#4caf50",
                    }}
                  />
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={passwordsMatchError}
              helperText={passwordsMatchError ? "Passwords do not match" : ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleVisibility(setShowConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

      <Box mt={4} display="flex" justifyContent="center">
  <Button
    variant="outlined"
    color="primary"
    type="submit"
    className="text-capitalize"
    size="small"
    disabled={loading}
    startIcon={loading ? <CircularProgress size={16} /> : null}
  >
    {loading ? "Saving..." : "Save Password"}
  </Button>
</Box>


          </form>
        </CardContent>
      </Card>
    </Box>
  </Modal.Body>
</Modal>
					</div>
				</div>
			
	</>
	)
};


export default OrganisationProfile;

const countryDialCodes = [
  { code: '+1', country: 'United States' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+91', country: 'India' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  // Add more entries as needed
];
const timeZones = [
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'ECT', label: 'ECT (European Central Time)' },
    { value: 'EET', label: 'EET (Eastern European Time)' },
    { value: 'ART', label: 'ART (Egypt Standard Time)' },
    { value: 'EAT', label: 'EAT (Eastern African Time)' },
    { value: 'MET', label: 'MET (Middle East Time)' },
    { value: 'NET', label: 'NET (Near East Time)' },
    { value: 'PLT', label: 'PLT (Pakistan Lahore Time)' },
    { value: 'IST', label: 'IST (India Standard Time)' },
    { value: 'BST', label: 'BST (Bangladesh Standard Time)' },
    { value: 'VST', label: 'VST (Vietnam Standard Time)' },
    { value: 'CTT', label: 'CTT (China Taiwan Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' },
    { value: 'ACT', label: 'ACT (Australia Central Time)' },
    { value: 'AET', label: 'AET (Australia Eastern Time)' },
    { value: 'SST', label: 'SST (Solomon Standard Time)' },
    { value: 'NST', label: 'NST (New Zealand Standard Time)' },
  ];
  