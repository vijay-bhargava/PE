import React, { useCallback, useEffect, useState } from 'react'
import { useFormik } from "formik";
import * as yup from 'yup';
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineMail } from 'react-icons/hi';
import {
	login, otplogin, requestotp,
	requestForgotPassword
} from '../../utils/apiConstants';
import CryptoJS from 'crypto-js';
import { useCookies } from 'react-cookie';
import { actionTypes, useStateValue } from "../../store";
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa6';
import OTPInput from 'react-otp-input';
import { ApiClient } from '../../Apiclient';
import PEModal from '../../components/PEModal';
import { toast } from 'react-toastify';
import { Visibility, VisibilityOff } from "@mui/icons-material";
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

	const [{ atoken, logincount }, dispatch] = useStateValue();
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
				if (res?.token?.accessToken) {
					if (res.token.accessToken !== '') {
						dispatch({ type: actionTypes.SET_ATOKEN, value: res.token.accessToken });
						var userAccessToken = CryptoJS.AES.encrypt(`${res.token.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
						setCookie("patkn", userAccessToken, cookieOptions);
					}
					if (res?.token?.refreshToken !== '') {
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
						dispatch({
							type: actionTypes.SET_LOGINCOUNT, value: res.logincount?.loginCount
						});

						setCookie("pcloginCount", res.logincount.loginCount, cookieOptions);
					}

					if (res.token.userDetail) {
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

		const res = await apiclient.putres(`/api/auth/changepassword`, data, atoken);

		if (res) {
			toast.success(`Password changed successfully`, {
				toastId: "selectPassword"
			});

			//clearData();
		} else {
			toast.error(
				`Failed to change password. Please check your  password and try again.`,
				{ toastId: "checkPassword" }
			);
			handleClose();
			// Optionally, return something or handle this case further
			return;
		}
	};

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

		if (value === null) {
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
				setLoading(true);
				requestForgotPassword(data).then((res) => {

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
						if (res?.token?.accessToken !== '') {
							dispatch({ type: actionTypes.SET_ATOKEN, value: res?.token?.accessToken });
							var userAccessToken = CryptoJS.AES.encrypt(`${res?.token?.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
							setCookie("patkn", userAccessToken, cookieOptions);
						}
						if (res?.token?.refreshToken !== '') {
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
	const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

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
	};

	return (
		<>
			<div>
				<h5 style={{ fontWeight: 600, fontSize: 20, color: '#111827', marginBottom: 4 }}>Welcome back</h5>
				<p style={{ color: '#6b7280', fontSize: 13, marginBottom: 28 }}>Sign in to your account to continue</p>

				{index === 0 ? <>
					<form onSubmit={formik.handleSubmit} autoComplete="off">
						<div className="mb-3">
							<label className="pe-field-label">Email  <span className="rfq-required-star"><span className="rfq-required-star">*</span></span></label>
							<TextField
								fullWidth
								size="small"
								variant="outlined"
								id="emailId"
								name="emailId"
								autoComplete="email"
								placeholder="Enter your email"
								value={formik.values.emailId}
								onChange={(e) => formik.setFieldValue("emailId", e.target.value)}
								error={formik.touched.emailId && Boolean(formik.errors.emailId)}
								helperText={formik.touched.emailId && formik.errors.emailId}
							/>
						</div>
						<div className="mb-1">
							<label className="pe-field-label">Password  <span className="rfq-required-star"><span className="rfq-required-star">*</span></span></label>
							<TextField
								id="password"
								name="password"
								fullWidth
								size="small"
								placeholder="Enter your password"
								type={toggleeye ? 'password' : 'text'}
								value={formik.values.password}
								onChange={(e) => formik.setFieldValue('password', e.target.value.trim())}
								error={formik.touched.password && Boolean(formik.errors.password)}
								helperText={formik.touched.password && formik.errors.password}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton size="small" onClick={() => setToggleeye(!toggleeye)}>
												{toggleeye ? <HiOutlineEye /> : <HiOutlineEyeOff />}
											</IconButton>
										</InputAdornment>
									),
								}}
								variant="outlined"
							/>
						</div>
						<div className="text-end mb-4">
							<button type="button" style={{
								background: 'none', border: 'none', color: '#2388d9',
								fontSize: 12, cursor: 'pointer', padding: 0
							}}
								onClick={() => manageForgotPass('Email *')}
							>
								Forgot password?
							</button>
						</div>
						<button
							type="submit"
							loading={loading}
							fullWidth
							className='pe-btn pe-btn--primary'
							style={{ width: '100%' }}
						>
							Sign In
						</button>
					</form>

					<div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12 }}>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
						<span style={{ color: '#9ca3af', fontSize: 12, whiteSpace: 'nowrap' }}>or login with OTP</span>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
						<button
							type="button"
							onClick={() => manageOtp('Email')}
							style={{
								display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
								border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 0',
								background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500
							}}
						>
							<HiOutlineMail style={{ fontSize: 16, color: '#2388d9' }} /> Email
						</button>
						<button
							type="button"
							onClick={() => manageOtp('WhatsApp')}
							style={{
								display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
								border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 0', background: '#fff',
								cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500
							}}
						>
							<FaWhatsapp style={{ fontSize: 16, color: '#25D366' }} /> WhatsApp
						</button>
					</div>
				</> : <></>}
				{index === 1 ? <>
					<form onSubmit={formik2.handleSubmit} autoComplete="off">
						<div className="mb-3">
							<label className="pe-field-label">{selectType?.replace(' *', '')} <span className="rfq-required-star">*</span></label>
							<TextField
								fullWidth
								size='small'
								placeholder="Please enter your email"
								variant="outlined"
								disabled={isOTP}
								id="emailIdOtp"
								name="emailId"
								value={formik2.values.emailId}
								onChange={formik2.handleChange}
								error={formik2.touched.emailId && Boolean(formik2.errors.emailId)}
								helperText={formik2.touched.emailId && formik2.errors.emailId}
								autoComplete="username"
							/>
						</div>

						{isOTP && (
							<div className="mb-3">
								<label className="pe-field-label">Verification Code</label>
								<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
									<OTPInput
										value={formik2.values.otp}
										onChange={(value) => formik2.setFieldValue('otp', value)}
										numInputs={4}
										renderSeparator={<span style={{ color: '#9ca3af', margin: '0 2px' }}>-</span>}
										renderInput={(props) => (
											<input {...props} style={{
												width: 44, height: 44, textAlign: 'center', border: '1px solid #d1d5db',
												borderRadius: 8, fontSize: 18, fontWeight: 600, outline: 'none'
											}} />
										)}
										shouldAutoFocus
									/>
								</div>
								{formik2.touched.otp && formik2.errors.otp && (
									<p style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{formik2.errors.otp}</p>
								)}
								<div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
									{timer > 0 ? (
										<span style={{ fontSize: 12, color: '#6b7280' }}>
											Resend in
											<span style={{ color: '#49a052', fontWeight: 600 }}>{timer}s</span>
										</span>
									) : <span />}
									<button type="button" disabled={timer > 0} onClick={() => resendOTP()}
										style={{
											background: 'none', border: 'none', color: timer > 0 ? '#9ca3af' : '#2388d9',
											fontSize: 12, cursor: timer > 0 ? 'default' : 'pointer', padding: 0
										}}>
										Resend OTP
									</button>
								</div>
							</div>
						)}

						{!isOTP && isPassword && (
							<div className="mb-3">
								<label className="pe-field-label">Password <span className="rfq-required-star">*</span></label>
								<TextField
									fullWidth size='small' variant="outlined"
									id="Password2" name="Password2"
									value={formik2.values.otp}
									onChange={formik2.handleChange}
									error={formik2.touched.otp && Boolean(formik2.errors.otp)}
									helperText={formik2.touched.otp && formik2.errors.otp}
								/>
							</div>
						)}

						<button
							type="submit"
							loading={loading}
							fullWidth
							disabled={isOTP ? !timer : false}
							className='pe-btn pe-btn--primary'
							style={{ width: '100%' }}
							onClick={() => {
								if (isOTP && !formik2.values.otp) {
									formik2.setFieldError('otp', 'Please enter the verification code.');
									toast.error('Please enter the verification code to verify your identity.', { toastId: 'verificationcode' });
								}
							}}
						>
							{isForgotPassword ? 'Send Password' : isOTP ? 'Verify OTP' : 'Send OTP'}
						</button>
					</form>

					<div style={{ display: 'flex', alignItems: 'center', margin: '8px 0 16px', gap: 12 }}>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
						<span style={{ color: '#9ca3af', fontSize: 12, whiteSpace: 'nowrap' }}>or</span>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
					</div>

					<button type="button" onClick={() => handleSelect(0)}
						style={{
							width: '100%', border: '1px solid #d1d5db', borderRadius: 8,
							padding: '10px 0', background: '#fff', cursor: 'pointer',
							fontSize: 13, color: '#374151', fontWeight: 500
						}}>
						← Back to Login
					</button>
				</> : <></>}
			</div>
			<div className='row mt-3'>
				<div className='col-12 text-center f14'>
					{/* <span className='text-muted '>New on our platform?</span> <span className='text-danger'>Register as new vendor</span> */}
				</div>
			</div>
			<PEModal
				open={show}
				onClose={handleClose}
				title="Change Password"
				size="sm"
				footer={
					<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={handleClose}>Cancel</button>
						<button type="submit"
							loading={loading}
							form="change-password-form"
							className="pe-btn pe-btn--primary"
							onClick={handleClose}
						>
							Submit
						</button>
					</>
				}
			>
				<form id="change-password-form" onSubmit={formikchange.handleSubmit} autoComplete="off">
					<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
						<div>
							<label className="pe-field-label">Old Password</label>
							<TextField
								fullWidth size="small" variant="outlined"
								type={showPassword ? 'text' : 'password'}
								value={password}
								onChange={handlePasswordChange}
								inputProps={{ maxLength: 15 }}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton size="small" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
												{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
											</IconButton>
										</InputAdornment>
									)
								}}
							/>
						</div>
						<div>
							<label className="pe-field-label">New Password</label>
							<TextField
								fullWidth size="small" variant="outlined"
								type={showNewPassword ? 'text' : 'password'}
								value={newPassword}
								onChange={handleNewPasswordChange}
								inputProps={{ maxLength: 15 }}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton size="small" onClick={handleClickShowNewPassword} onMouseDown={handleMouseDownPassword}>
												{showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
											</IconButton>
										</InputAdornment>
									)
								}}
							/>
							{passwordComplexityError && <p style={{ color: '#d32f2f', fontSize: 11, marginTop: 4 }}>Create a strong password with uppercase, lowercase, special character, and number. Max 15 chars.</p>}
							{passwordError && <p style={{ color: '#d32f2f', fontSize: 11, marginTop: 4 }}>You cannot use your previous password.</p>}
							{maxPasswordLengthError && <p style={{ color: '#d32f2f', fontSize: 11, marginTop: 4 }}>Password must be 15 characters or less.</p>}
						</div>
						<div>
							<label className="pe-field-label">Confirm Password</label>
							<TextField
								fullWidth size="small" variant="outlined"
								type={showConfirmPassword ? 'text' : 'password'}
								value={confirmPassword}
								onChange={handleConfirmPasswordChange}
								inputProps={{ maxLength: 15 }}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton size="small" onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownPassword}>
												{showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
											</IconButton>
										</InputAdornment>
									)
								}}
							/>
							{passwordsMatchError && <p style={{ color: '#d32f2f', fontSize: 11, marginTop: 4 }}>Passwords do not match.</p>}
						</div>
					</div>
				</form>
			</PEModal>
		</>
	)
}

export default LoginCell;
