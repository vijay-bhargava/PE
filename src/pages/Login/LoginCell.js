import React, { useCallback, useEffect, useState } from 'react'
import { useFormik } from "formik";
import * as yup from 'yup';
import { Button, Divider, IconButton, InputAdornment, TextField ,FormControl,InputLabel,Input,FormHelperText} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail, HiOutlineStar,HiOutlineX } from 'react-icons/hi';
import { login, otplogin, requestotp, requestForgotPassword } from '../../utils/apiConstants';
import CryptoJS from 'crypto-js'; 
import { Card, Modal, Table } from "react-bootstrap";
import { useCookies } from 'react-cookie';
import { actionTypes, useStateValue } from "../../store";
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa6';
import OTPInput from 'react-otp-input';
import { ApiClient } from '../../Apiclient';
import { buildQueryParams } from '../../utils/common/utility';
import { toast } from 'react-toastify';
import {

    Visibility,
    VisibilityOff,
} from "@mui/icons-material";
import { goToLoginPage } from '../../utils/common';
import { getCookieDomain, getSubdomain } from '../../utils/common/subdomainHelper';
const LoginCell = ({ customerId, suffix }) => {
    const broadcastChannel = new BroadcastChannel('auth_login');
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const handleSelect = (value) => {
        setIndex(value);
    };

    // Get cookie domain for cross-subdomain support
    const cookieDomain = getCookieDomain();
    const cookieOptions = {
        path: '/',
        maxAge: 86400,
        ...(cookieDomain && { domain: cookieDomain })
    };

    useEffect(() => {

        const handleMessage = (event) => {
            if (event.data.action === 'login') {
                goToLoginPage(suffix)

            }
        };

        broadcastChannel.addEventListener('message', handleMessage);

        // Cleanup the event listener on component unmount
        return () => {
            broadcastChannel.removeEventListener('message', handleMessage);
            broadcastChannel.close();
        };
    }, []);
    const [{ atoken ,logincount}, dispatch] =useStateValue();
    const [isOTP, setIsOTP] = useState(false);
    const [cookies, setCookie] = useCookies(["patkn", "prtkn"]);
    
    const [toggleeye, setToggleeye] = useState(true)
    const [loading, setLoading] = useState(false)
    const [tempdata, setTempData] = useState(null)
    const [otpType, setOtpType] = useState('')
    const [selectType, setSelectType] = useState('');

    const manageOtp = (val) => {

        setSelectType(val);
        setOtpType(val)
        handleSelect(1)
        setIsForgotPassword(false)
        setIsPassword(false);
    };

    const [isPassword, setIsPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
            const [password, setpassword] = useState("");
                const [newPassword, setnewPassword] = useState("");
                    const [confirmPassword, setconfirmPassword] = useState("");
                    const [passwordsMatchError, setPasswordsMatchError] = useState(false);
                    const [passwordError, setPasswordError] = useState(false);
        const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [passwordComplexityError, setPasswordComplexityError] = useState(false);
        const [maxPasswordLengthError, setMaxPasswordLengthError] = useState(false);
        const [userchangeEmail, setUserchangeEmail] = useState('');
        const [touched, setTouched] = useState({
            newPassword: false,
            confirmPassword: false,
        });
    const manageForgotPass = (val) => {
        // 
        setSelectType(val);
        setOtpType(val)
        setIsForgotPassword(true);
        handleSelect(1)
    };

    const validationSchema = yup.object({
        emailId: yup
            .string('Enter email')
            .required('Please enter your email')
            .email('Enter a valid email'),
        password: yup
            .string()
            .required('Please enter your password')
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {

            emailId: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            // Dynamically determine userType based on subdomain
            const subdomain = getSubdomain();
            const userType = subdomain === 'supplier' ? 'Vendor' : 'User';
            
            var data = {
                email: values?.emailId,
                password: values?.password,
                userType: userType,
                customerId: customerId,
                deviceType: "Web"
            };

            setLoading(true);
            login(data).then(async (res) => {
               
                // if (res?.logincount?.emailId) {
                //     setUserchangeEmail(res?.logincount?.emailId);
                // }
                // console.log('res ', res?.token?.accessToken)
               
                
                if (res?.token?.accessToken) {

                    if (res.token.accessToken != '') {
                        dispatch({ type: actionTypes.SET_ATOKEN, value: res.token.accessToken });
                        var userAccessToken = CryptoJS.AES.encrypt(`${res.token.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                        setCookie("patkn", userAccessToken, cookieOptions);
                    }
                    if (res?.token?.refreshToken != '') {
                        dispatch({ type: actionTypes.SET_RTOKEN, value: res.token.refreshToken });
                        var userRefreshToken = CryptoJS.AES.encrypt(`${res.token.refreshToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                        setCookie("prtkn", userRefreshToken, cookieOptions);
                    }
                    const userCustomerID = CryptoJS.AES.encrypt(`${customerId}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();

                    dispatch({ type: actionTypes.SET_CUSTOMERID, value: customerId });
                    setCookie("pcid", userCustomerID, cookieOptions);

                    //customersuffix

                    dispatch({ type: actionTypes.SET_CUSTOMERSUFFIX, value: suffix });
                    setCookie("pcsu", suffix, cookieOptions);

                    dispatch({ type: actionTypes.SET_USERTIMEZONE, value: res.token.userDetail.timeZone });
                    setCookie("pcutz", res.token.userDetail.timeZone, cookieOptions);

                    dispatch({ type: actionTypes.SET_USERDIALINGCODE, value: res.token.userDetail.dialingCode });
                    setCookie("pcudc", res.token.userDetail.dialingCode, cookieOptions);
               
                    if (res?.logincount?.loginCount) {
                        dispatch({ type: actionTypes.SET_LOGINCOUNT, value: res.logincount?.loginCount
                        });
                        
                        setCookie("pcloginCount", res.logincount.loginCount, cookieOptions);
                    }
                    

                    if (res.token.userDetail) {

                        // const subscriptions= await getSubscriptionData();
                        //res.token.userDetail['subscriptions']=subscriptions
                        var jsonStringTemp = JSON.stringify(res.token.userDetail);
                        var userOtherCookie = CryptoJS.AES.encrypt(`${jsonStringTemp}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                        setCookie("pcuserDetail", userOtherCookie, cookieOptions);
                        dispatch({ type: actionTypes.SET_USERDETAIL, value: res.token.userDetail });
                    }


                    if (res.menuList) {
                        var jsonStringTemp = JSON.stringify(res.menuList);
                        var userOtherCookie = CryptoJS.AES.encrypt(`${jsonStringTemp}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                        setCookie("pcmlDetail", userOtherCookie, cookieOptions);
                        dispatch({ type: actionTypes.SET_MenuList, value: res.menuList });
                    }
                    // Broadcast a logout message to all tabs
                    broadcastChannel.postMessage({ action: 'login' });
                    setLoading(false);
                }
                else {
                    setLoading(false);
                }

            });
        }
    });

        const formikchange = useFormik({
            enableReinitialize: true,
            initialValues: {
                emailId: userchangeEmail,
                password: password,
                newPassword: newPassword,
                confirmPassword: confirmPassword,
                userType: getSubdomain() === 'supplier' ? 'Vendor' : 'User',
                stages: {
                    eventType: "UM",
                    currentStage: "ChangePassword",
                    nextStage: "ChangePassword",
                },
            },
           // validationSchema: validationSchema,
            onSubmit: (values) => {
             
                var data = {
                    email: userchangeEmail,
                    password: values?.password,
                    newPassword: values?.newPassword,
                    confirmPassword: values?.confirmPassword,
                    userType: getSubdomain() === 'supplier' ? 'Vendor' : 'User',
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
                    
                    //clearData();
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
    // const getSubscriptionData=async (res)=>{

    //     let dataCustomer = {
    //         CustomerId: customerId,
    //     };  
    //     const  queryParams=buildQueryParams(dataCustomer)
    //     const pullCustomerList=await new ApiClient().getres(`/api/customer/Find?${queryParams}`,res?.token?.accessToken)
    //      if(pullCustomerList){

    //            const data= pullCustomerList?.data[0]?.subscriptions ?? []
    //            const length=data?.length -1

    //            return data[length]
    //      }
    //      return '';
    // }
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

	const handlePasswordChange = (event) => {
		// Trim leading/trailing spaces and remove any inline spaces
		let value = event.target.value.trim().replace(/\s/g, "");
		setpassword(value);
	  };
	  const handleConfirmPasswordChange = (event) => {
       
		let { value } = event.target;
		value = value.trim().replace(/\s/g, "");
		setconfirmPassword(value);
		setTouched({ ...touched, confirmPassword: true });

		// Check if passwords match when confirm password changes
		if (newPassword !== value && touched.newPassword) {
			setPasswordsMatchError(true);
		} else {
			setPasswordsMatchError(false);
		}
	};
	const handleNewPasswordChange = (event) => {
      
		let { value } = event.target;
		value = value.trim().replace(/\s/g, "");

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
    const validationSchemaemailotp = yup.object({
        emailId: yup
            .string('Enter email')
            .required('Please enter your email')
            .email('Enter a valid email'),
    });

    const validationSchemaOtp = yup.object({
        emailId: yup
            .string('Enter mobile number')
            .required('Please enter your mobile number')
            .email('Enter a valid mobile number'),
        otp: yup
            .string('Enter your OTP')
            .min(4, 'Min 4 Digit')
            .max(4, 'Max 4 Digit')
            .matches(/^[0-9]+$/, "Must be only digits")
            .required('You must specify a 4 Digit OTP')

    });

    const formik2 = useFormik({
        enableReinitialize: true,
        initialValues: {
            emailId: '',
            otp: ''
        },
        validationSchema: isOTP ? validationSchemaOtp : validationSchemaemailotp,
        onSubmit: (values) => {
            if (!isOTP && !isForgotPassword) {
                var data = {
                    email: values?.emailId,
                    otpFor: otpType,
                    customerId: customerId,
                    userType: getSubdomain() === 'supplier' ? 'Vendor' : 'User'
                };
                console.log('data', data)
                setLoading(true);
                requestotp(data).then((res) => {

                    setLoading(false);
                    if (res?.id > 0) {
                        setTempData(res)
                        setIsOTP(true);
                        setIsForgotPassword(false);
                        setTimer(60)
                        setLoading(false);
                    }
                    else {
                        setLoading(false);
                    }
                });
            }
            else if (isForgotPassword) {
                const data = {
                    email: values?.emailId,
                    customerId: customerId,
                    userType: getSubdomain() === 'supplier' ? 'Vendor' : 'User'
                };
                console.log('data', data)
                setLoading(true);
                requestForgotPassword(data).then((res) => {
                    console.log('resres', res);

                    setLoading(false);
                    if (res) {
                        setIsForgotPassword(false);
                        setLoading(false);
                        setIndex(0);
                        data?.email ? formik.setFieldValue('emailId', data?.email) : formik.setFieldValue('emailId', '');
                        formik.setFieldValue('password', '');
                    }
                    else {
                        setLoading(false);
                    }
                });
            }
            else {
                var data = {
                    userId: tempdata?.id,
                    email: tempdata?.email,
                    otp: values?.otp,
                    customerId: customerId,
                    userType: getSubdomain() === 'supplier' ? 'Vendor' : 'User'



                };
                setLoading(true);
                otplogin(data).then((res) => {
                    console.log('resres', res);
                    setLoading(false);
                    setIsForgotPassword(false);
                    if (res?.token?.accessToken) {
                        if (res?.token?.accessToken != '') {
                            dispatch({ type: actionTypes.SET_ATOKEN, value: res?.token?.accessToken });
                            var userAccessToken = CryptoJS.AES.encrypt(`${res?.token?.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                            setCookie("patkn", userAccessToken, cookieOptions);
                        }
                        if (res?.token?.refreshToken != '') {
                            dispatch({ type: actionTypes.SET_RTOKEN, value: res?.token?.refreshToken });
                            var userRefreshToken = CryptoJS.AES.encrypt(`${res?.token?.refreshToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                            setCookie("prtkn", userRefreshToken, cookieOptions);
                        }
                        const userCustomerID = CryptoJS.AES.encrypt(`${customerId}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                        dispatch({ type: actionTypes.SET_CUSTOMERID, value: customerId });
                        setCookie("pcid", userCustomerID, cookieOptions);

                        //customersuffix

                        dispatch({ type: actionTypes.SET_CUSTOMERSUFFIX, value: suffix });
                        setCookie("pcsu", suffix, cookieOptions);


                        dispatch({ type: actionTypes.SET_USERTIMEZONE, value: res.token.userDetail?.timeZone });
                        setCookie("pcutz", res.token.userDetail?.timeZone, cookieOptions);
                        dispatch({ type: actionTypes.SET_USERDIALINGCODE, value: res.token.userDetail?.dialingCode });
                        setCookie("pcudc", res.token.userDetail?.dialingCode, cookieOptions);

                        if (res.roleClaims) {
                            var jsonStringTemp = JSON.stringify(res.roleClaims);
                            var userOtherCookie = CryptoJS.AES.encrypt(`${jsonStringTemp}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                            setCookie("pcrcDetail", userOtherCookie, cookieOptions);
                            dispatch({ type: actionTypes.SET_RoleClaims, value: res.roleClaims });
                        }
                        if (res.menuList) {
                            var jsonStringTemp = JSON.stringify(res.menuList);
                            var userOtherCookie = CryptoJS.AES.encrypt(`${jsonStringTemp}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                            setCookie("pcmlDetail", userOtherCookie, cookieOptions);
                            dispatch({ type: actionTypes.SET_MenuList, value: res.menuList });
                        }

                        navigate("/app");
                        setLoading(false);
                    }
                    else {
                        setLoading(false);
                    }
                });
            }
        },
    });
	const handleClickShowPassword = () => setShowPassword((show) => !show);

	const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
	const handleClickShowConfirmPassword = () =>
		setShowConfirmPassword((show) => !show);

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};

    const [timer, setTimer] = useState(0);
    const timeOutCallback = useCallback(() => setTimer(currTimer => currTimer - 1), []);
    useEffect(() => {
        //directLogin(); 
        timer > 0 && setTimeout(timeOutCallback, 1000);

    }, [timer, timeOutCallback]);
    const resendOTP = () => {
        setTempData(null)
        setIsOTP(false);
        setIsForgotPassword(false);
        formik2.setFieldValue("otp", '');
        setTimeout(() => {

            formik2.submitForm()
        }, 1000);
    }

    const directLogin = () => {
        var data = {
            email: 'bijendra.singh@agileapt.com',
            password: 'Bs@1234',
            userType: "E",
            deviceType: "Web"
        };
        
        setLoading(true);
        login(data).then((res) => {
            // console.log('resres', res); 
            if (res?.token?.accessToken) {
                if (res.token.accessToken != '') {
                    dispatch({ type: actionTypes.SET_ATOKEN, value: res.token.accessToken });
                    var userAccessToken = CryptoJS.AES.encrypt(`${res.token.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                    setCookie("patkn", userAccessToken, cookieOptions);
                }
                if (res?.token?.refreshToken != '') {
                    dispatch({ type: actionTypes.SET_RTOKEN, value: res.token.refreshToken });
                    var userRefreshToken = CryptoJS.AES.encrypt(`${res.token.refreshToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                    setCookie("prtkn", userRefreshToken, cookieOptions);
                }
                navigate("/");
                setLoading(false);
            }
            else {
                setLoading(false);
            }
        });
    }


    return (
        <>
            <div className='row '>
                <div className='col-md-12 pt-3 ps-0'>

                    <h3 className='f14pt  fw400'>User Login</h3>
                    {index == 0 ? <>  <form onSubmit={formik.handleSubmit} autoComplete="off">
                        <div className='row'>
                                                         <div className='col-6 mt-2'>
                                                                <TextField
    fullWidth
    size="small"
    variant="outlined"
    label="Email *"
    id="emailId"
    name="emailId"
    autoComplete="email"
    InputLabelProps={{ shrink: true }}
    value={formik.values.emailId}
    onChange={(e) => formik.setFieldValue("emailId", e.target.value)}
    error={formik.touched.emailId && Boolean(formik.errors.emailId)}
    helperText={formik.touched.emailId && formik.errors.emailId}
/> 

                             
                            </div>
                              <div className='col-6 mt-2'>
                                <TextField
                                    id="password"
                                    name="password"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    className='w-100 f14'
                                    size="small"
                                    label="Password *"
                                    type={toggleeye ? 'password' : 'text'}
                                    value={formik.values.password}
                                    onChange={(e) => formik.setFieldValue('password', e.target.value.trim())}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => setToggleeye(!toggleeye)}>
                                                {toggleeye ? <HiOutlineEye /> : <HiOutlineEyeOff />}
                                            </IconButton>
                                        </InputAdornment>,
                                    }}
                                    variant="outlined" />
                            </div>
                            
                                                            <div className='col-10 col-md-12 ms-2 mt-5 p-1 pe-3'>

                                <LoadingButton
                                    loading={loading}
                                    fullWidth
                                    color="info"
                                    className='text-white text-capitalize p1'
                                    variant="contained"
                                    type="submit">
                                    <span className='f13'>Sign In</span>
                                </LoadingButton>
                            </div>
                        </div>
                        <div className='row d-flex align-items-center'>


                            <div className='col-12 col-md-12 text-end '>
                                <IconButton size="small" className='f12' onClick={() => manageForgotPass('Email *')}>Forgot password?</IconButton>
                            </div>
                        </div>
                    </form>
                        <div className='row mt-2 '>
                            <div className='col-12 col-md-12'>
                                <Divider>Login with OTP</Divider>
                            </div>
                        </div>
                       
                                                     <div className='row d-flex align-items-center mt-5'>
                            <div className='col-12 col-md-6 text-end'>
                                <LoadingButton
                                    loading={loading}
                                    fullWidth
                                    color='primary'
                                    className='text-capitalize'
                                    variant='outlined'
                                    onClick={() => manageOtp('Email')}
                                // type="submit"
                                >
                                    <div className='f12 align-items-center d-flex '><HiOutlineMail className='f16 me-2' /> Email </div>
                                </LoadingButton>
                            </div>
                             <div className='col-12 col-md-6 text-end'>
                                <LoadingButton
                                    loading={loading}
                                    fullWidth
                                    color='success'
                                    className='text-capitalize '
                                    variant='outlined'
                                    onClick={() => manageOtp('WhatsApp')}
                                // type="submit"
                                >
                                    <div className='f12 align-items-center d-flex'><FaWhatsapp className='f14 me-2' />Whatsapp </div>
                                </LoadingButton>
                            </div>
                        </div></> : <></>}
                    {index == 1 ? <>
                        <form onSubmit={formik2.handleSubmit} autoComplete="off">
                            <div className='row'>
                                <div className='col-12 mb-4 mt-2'>
                                    <TextField
                                        fullWidth
                                        size='small'
                                        placeholder={`Please enter your email`}
                                        variant="outlined"
                                        disabled={isOTP}
                                        label={selectType}
                                        id="emailIdOtp"
                                        name="emailId"
                                        InputLabelProps={{ shrink: true }}
                                        value={formik2.values.emailId}
                                        onChange={formik2.handleChange}
                                        error={formik2.touched.emailId && Boolean(formik2.errors.emailId)}
                                        helperText={formik2.touched.emailId && formik2.errors.emailId}
                                        autoComplete="username"
                                    />
                                </div>
                                <div className='col-12 mb-3'>

                                    {isOTP ? <>
                                        <p>Enter verification code</p>
                                        <div className="d-flex">
                                            <OTPInput


                                                value={formik2.values.otp}
                                                onChange={(value) => formik2.setFieldValue('otp', value)}
                                                error={formik2.touched.otp && Boolean(formik2.errors.otp)}
                                                helperText={formik2.touched.otp && formik2.errors.otp}
                                                numInputs={4}
                                                renderSeparator={<span>-</span>}
                                                renderInput={(props) => <input {...props} style={{ width: '30px' }} />}
                                                shouldAutoFocus
                                            />

                                        </div>

                                        {/* <TextField
                                    label="OTP *"
                                    fullWidth
                                    size='small'
                                    inputProps={{
                                        maxLength: 4
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    variant="outlined"
                                    id="otp"
                                    name="otp"
                                    // placeholder={`4 Digit OTP sent to ${formik?.values?.mobile}`}
                                    value={formik2.values.otp}
                                    onChange={formik2.handleChange}
                                    error={formik2.touched.otp && Boolean(formik2.errors.otp)}
                                    helperText={formik2.touched.otp && formik2.errors.otp}
                                /> */}
                                    </> :
                                        <>
                                            {isPassword ?
                                                <TextField
                                                    label="Password *"
                                                    fullWidth
                                                    size='small'
                                                    inputProps={{
                                                        maxLength: 4
                                                    }}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    variant="outlined"
                                                    id="Password2"
                                                    name="Password2"
                                                    // placeholder={`4 Digit OTP sent to ${formik?.values?.mobile}`}
                                                    value={formik2.values.otp}
                                                    onChange={formik2.handleChange}
                                                    error={formik2.touched.otp && Boolean(formik2.errors.otp)}
                                                    helperText={formik2.touched.otp && formik2.errors.otp}
                                                />
                                                :
                                                <></>
                                            }
                                        </>
                                    }
                                </div>
                            </div>
                            <div className='row d-flex align-items-center'>
                                <div className='col-12 col-md-12 text-end mb-3'>
                                    <div className='row align-items-center'>
                                        <div className='col-12 col-md-6 f12 text-muted text-start'>
                                            {timer && timer > 0 ? <>
                                                Resend OTP in <span className='text-success fw-bold'>{timer}</span> Sec
                                            </> : <></>}
                                        </div>
                                        {isOTP ? <>
                                            <div className='col-12 col-md-6 f12  mt-0 text-end'>Not received your code?
                                                <Button color="error" disabled={timer > 0} variant="text" className='f14' onClick={() => resendOTP()}>
                                                    Resend otp
                                                </Button></div>
                                        </> : <></>}
                                    </div>

                                </div>
                                <div className='col-12 col-md-12 text-end'>
                                    <LoadingButton
                                        loading={loading}
                                        fullWidth
                                        color="info"
                                        className='text-white text-capitalize ps-4 pe-4'
                                        variant="contained"
                                        disabled={isOTP ? timer ? false : true : false}
                                        type="submit"
                                        onClick={() => {

                                            if (isOTP && !formik2.values.otp) {
                                                formik2.setFieldError('otp', 'Please enter the verification code to verify your identity.');
                                                toast.error(` Please enter the verification code to verify your identity.`, {
                                                    toastId: "verificationcode",
                                                });

                                            }
                                        }}
                                    >
                                        <span>
                                            {isForgotPassword ?
                                                <>Send Password</>
                                                : <>
                                                    {isOTP ? <>Verify OTP</> : <>Send OTP</>}
                                                </>
                                            }
                                        </span>
                                    </LoadingButton>
                                </div>
                            </div>
                        </form>
                        <div className='row mt-3 mb-3'>
                            <div className='col-12'>
                                <Divider>Login with Password</Divider>
                            </div>
                        </div>
                        <div className='row d-flex align-items-center'>
                            <div className='col-12 col-md-12 text-end'>
                                <LoadingButton
                                    fullWidth
                                    color='info'
                                    className=''
                                    variant='outlined'
                                    onClick={() => handleSelect(0)}
                                >
                                    <div className='f12 align-items-center d-flex'>GO BACK</div>
                                </LoadingButton>
                            </div>
                        </div>
                    </> : <></>}
                </div>
            </div>
            <div className='row mt-3'>
                <div className='col-12 text-center f14'>
                    {/* <span className='text-muted '>New on our platform?</span> <span className='text-danger'>Register as new vendor</span> */}
                </div>
            </div>
                <Modal
                            size="sm"
                            show={show}
                            backdrop="static"
                            
                            centered
                            contentClassName="border-0 rounded"
                            className="zindex1280"
                            backdropClassName="zindex1280"
                            onHide={() => handleClose()}
                        >
                            <Modal.Header className="bgheaderCards pt-2 pb-2">
                                <Modal.Title id="modal-heading">
                                    <div className="d-flex align-items-center f14 text-white">
                                        Change Password
                                    </div>
                                </Modal.Title>
            
                                <IconButton onClick={() => handleClose()} size="small" edge="start">
                                    <HiOutlineX className="text-white" />
                                </IconButton>
                            </Modal.Header>
                            <Modal.Body className="p-0">
                                <form
                                    onSubmit={formikchange.handleSubmit}
                                    autoComplete="off"
                                    className="col-12 col-md-12 col-lg-12 p-0"
                                >
                                  
                                    <div className="p-3">
                                        <div className="pass">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <FormControl
                                                        sx={{ m: 1, width: "25ch" }}
                                                        variant="standard"
                                                    >
                                                        <InputLabel htmlFor="standard-adornment-password">
                                                            Old Password
                                                        </InputLabel>
                                                        <Input
                                                            id="password"
                                                            type={showPassword ? "text" : "password"}
                                                            value={password}
                                                            onChange={handlePasswordChange}
                                                            // error={formik.touched.password && Boolean(formik.errors.password)}
                                                            // helperText={formik.touched.password && formik.errors.password}
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        aria-label="toggle password visibility"
                                                                        onClick={handleClickShowPassword}
                                                                        onMouseDown={handleMouseDownPassword}
                                                                        edge="end"
                                                                    >
                                                                        {showPassword ? (
                                                                            <VisibilityOff />
                                                                        ) : (
                                                                            <Visibility />
                                                                        )}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                            label="Password"
                                                            inputProps={{ maxLength: 15 }}
                                                        />
                                                        {formikchange.errors.password && formikchange.touched.password && (
                                                            <div
                                                                className="error error-red"
                                                                style={{ fontSize: "9px" }}
                                                            >
                                                                {formikchange.errors.password}
                                                            </div>
                                                        )}
                                                    </FormControl>
                                                </div>
                                                <div className="col-md-12">
                                                    <FormControl
                                                        sx={{ m: 1, width: "25ch" }}
                                                        variant="standard"
                                                    >
                                                        <InputLabel htmlFor="standard-adornment-password">
                                                            New Password
                                                        </InputLabel>
                                                        <Input
                                                            id="newPassword"
                                                            type={showNewPassword ? "text" : "password"}
                                                            value={newPassword}
                                                            onChange={handleNewPasswordChange}
                                                            // error={passwordComplexityError || passwordError || maxPasswordLengthError}
                                                            error={
                                                                formikchange.touched.newPassword &&
                                                                Boolean(formikchange.errors.newPassword)
                                                            }
                                                            helperText={
                                                                formikchange.touched.newPassword &&
                                                                formikchange.errors.newPassword
                                                            }
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        aria-label="toggle password visibility"
                                                                        onClick={handleClickShowNewPassword}
                                                                        onMouseDown={handleMouseDownPassword}
                                                                        edge="end"
                                                                    >
                                                                        {showNewPassword ? (
                                                                            <VisibilityOff />
                                                                        ) : (
                                                                            <Visibility />
                                                                        )}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                            label="Password"
                                                            inputProps={{ maxLength: 15 }}
                                                        />
                                                        {passwordComplexityError && (
                                                            <FormHelperText error>
                                                                Create a strong password with at least one uppercase
                                                                letter,at least one lowercase letter, one special character, and one number. Max
                                                                length 15.
                                                            </FormHelperText>
                                                        )}
                                                        {passwordError && (
                                                            <FormHelperText error>
                                                                You cannot use your previous password.
                                                            </FormHelperText>
                                                        )}
                                                        {maxPasswordLengthError && (
                                                            <FormHelperText error>
                                                                Password must be 15 characters or less.
                                                            </FormHelperText>
                                                        )}
                                                        {formikchange.errors.newPassword &&
                                                            formikchange.touched.newPassword && (
                                                                <div
                                                                    className="error error-red"
                                                                    style={{ fontSize: "9px" }}
                                                                >
                                                                    {formikchange.errors.newPassword}
                                                                </div>
                                                            )}
                
                                                    </FormControl>
                                                </div>
                                                <div className="col-md-12">
                                                    <FormControl
                                                        sx={{ m: 1, width: "25ch" }}
                                                        variant="standard"
                                                    >
                                                        <InputLabel htmlFor="standard-adornment-password">
                                                            Confirm Password
                                                        </InputLabel>
                                                        <Input
                                                            id="confirmPassword"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={confirmPassword}
                                                            //value={formikchange.values.confirmPassword}
                                                            onChange={handleConfirmPasswordChange}
                                                            error={
                                                                formikchange.touched.confirmPassword &&
                                                                Boolean(formikchange.errors.confirmPassword)
                                                            }
                                                            helperText={
                                                                formikchange.touched.confirmPassword &&
                                                                formikchange.errors.confirmPassword
                                                            }
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        aria-label="toggle password visibility"
                                                                        onClick={handleClickShowConfirmPassword}
                                                                        onMouseDown={handleMouseDownPassword}
                                                                        edge="end"
                                                                    >
                                                                        {showConfirmPassword ? (
                                                                            <VisibilityOff />
                                                                        ) : (
                                                                            <Visibility />
                                                                        )}
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            }
                                                            label="Password"
                                                            inputProps={{ maxLength: 15 }}
                                                        />
                                                        {passwordsMatchError && (
                                                            <FormHelperText error>
                                                                Passwords do not match
                                                            </FormHelperText>
                                                        )}
                                                        {formikchange.errors.confirmPassword &&
                                                            formikchange.touched.confirmPassword && (
                                                                <div
                                                                    className="error error-red"
                                                                    style={{ fontSize: "9px" }}
                                                                >
                                                                    {formikchange.errors.confirmPassword}
                                                                </div>
                                                            )}
                                                    </FormControl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
            
                                    <div className="passbutton d-flex justify-content-end p-2">
                                        <LoadingButton
                                            loading={loading}
                                            color="success"
                                            variant="outlined"
                                            size="small"
                                            type="submit"
                                        >
                                            Submit
                                        </LoadingButton>
                                    </div>
                                </form>
                            </Modal.Body>
                        </Modal>
        </>
        
    )
    
}
   

export default LoginCell;