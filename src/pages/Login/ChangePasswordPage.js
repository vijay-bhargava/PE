import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    TextField,
    IconButton,
    InputAdornment,
    Box,
    Typography,
    Tooltip
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import * as yup from "yup";
import { useFormik } from "formik";
import LoadingButton from "@mui/lab/LoadingButton";
import { toast } from "react-toastify";
import { ApiClient } from "../../Apiclient";
import { actionTypes, useStateValue } from "../../store";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import LogoutIcon from '@mui/icons-material/Logout';
import { getCookieDomain } from "../../utils/common/subdomainHelper";



const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [passwordComplexityError, setPasswordComplexityError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [maxPasswordLengthError, setMaxPasswordLengthError] = useState(false);
    const [passwordsMatchError, setPasswordsMatchError] = useState(false);

    const [loading, setLoading] = useState(false);
    const [cookie, setCookie, removeCookie] = useCookies([
        "patkn",
        "prtkn",
        "pcid",
        "pcsu",
        "pcuserDetail",
    ]);

    const [{ atoken, rtoken, customerid, customersuffix, roleClaims, userDetail }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);
    const broadcastChannel = new BroadcastChannel('auth_logout');

    const logout = () => {
        try {
            // Get cookie domain for subdomain support
            const cookieDomain = getCookieDomain();
            const cookieOptions = {
                path: "/",
                ...(cookieDomain && { domain: cookieDomain })
            };

            // Remove all authentication cookies first
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

            // Clear localStorage and sessionStorage
            localStorage.clear();
            sessionStorage.clear();

            // Broadcast a logout message to all tabs
            broadcastChannel.postMessage({ action: 'logout' });

            // Force redirect to login page root immediately
            const protocol = window.location.protocol;
            const hostname = window.location.hostname;
            const port = window.location.port;
            const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
            
            // Use window.location.replace to prevent back button issues
            window.location.replace(baseUrl);
        } catch (error) {
            console.error("Logout error:", error);
            // Fallback - force reload to root
            window.location.href = window.location.origin;
        }
    };

    const toggleVisibility = (setter) => () => setter((prev) => !prev);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        formik.setFieldValue("password", e.target.value);
    };

    const handleNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        formik.setFieldValue("newPassword", value);

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
        setPasswordComplexityError(!regex.test(value));
        setMaxPasswordLengthError(value.length > 15);
        setPasswordError(value === password);
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        formik.setFieldValue("confirmPassword", value);
        setPasswordsMatchError(newPassword !== value);
    };

    const UserChangePassword = async (data) => {
        try {
            const res = await apiClient.putres("/api/auth/changepassword", data, atoken);
            if (res) {
                toast.success("Password changed successfully! Logging out...", {
                    autoClose: 1000
                });
                // Wait briefly to show success message, then logout
                setTimeout(() => {
                    logout();
                }, 1000);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to change password. Please try again.");
            setLoading(false);
        }
    };
    const validationSchema = yup.object({
        password: yup.string().required("Please enter your Old Password"),
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
        initialValues: {
            emailId: userDetail.email,
            password,
            newPassword,
            confirmPassword,
            userType: "User",
            stages: {
                eventType: "UM",
                currentStage: "ChangePassword",
                nextStage: "ChangePassword"
            }
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const data = {
                email: values.emailId,
                password: values.password,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
                userType: "User",
                stages: values.stages
            };
            setLoading(true);
            UserChangePassword(data);
        }
    });

    const handleClose = () => {
        setNewPassword("");
        setPassword("");
        setConfirmPassword("");
    };

    const clearData = () => {
        handleClose();
    };

    const getPasswordStrength = (pwd) => {
        let strength = 0;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[@$!%*?&]/.test(pwd)) strength++;
        if (pwd.length >= 8) strength++;
        return strength;
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            width="100vw"
            // sx={{ background: "linear-gradient(to right, #cfd9df, #e2ebf0)" }}
            sx={{
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
            }}
        >
            <Box
                position="absolute"
                top={20}
                right={40}
                zIndex={10}
            >
                <Tooltip title="Logout" arrow>
                    <IconButton
                        onClick={logout}
                        color="error"
                        size="large"
                        sx={{
                            backgroundColor: 'white',
                            border: '1px solid #f44336',
                            '&:hover': {
                                backgroundColor: '#ffe5e5',
                            },
                        }}
                    >
                        <LogoutIcon />
                    </IconButton>
                </Tooltip>
            </Box>




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
                        <Typography variant="h5" fontWeight={500} textAlign="center">
                            🔒 Change  Password
                        </Typography>
                    }
                />
                <CardContent>
                    <Typography
                        variant="body1"
                        textAlign="center"
                        fontWeight={400}
                        sx={{
                            mb: 1,
                            backgroundColor: '#fff3e0',
                            borderRadius: 1,
                            padding: '4px 6px',
                            border: '1px solid #ffb74d',
                            color: '#e65100',
                        }}
                    >
                        As you've logged in with a temporary password, you are required to set a new password to continue using your account securely.
                    </Typography>
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
                                )
                            }}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            label="New Password"
                            type={showNewPassword ? "text" : "password"}
                            // value={newPassword}
                            value={formik.values.newPassword}
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
                                )
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
                                        width: '100%',
                                        backgroundColor: '#e0e0e0',
                                        borderRadius: 10,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: '100%',
                                            width: `${getPasswordStrength(newPassword) * 20}%`,
                                            transition: '0.3s',
                                            background:
                                                getPasswordStrength(newPassword) <= 2
                                                    ? '#f44336'
                                                    : getPasswordStrength(newPassword) <= 3
                                                        ? '#ff9800'
                                                        : '#4caf50',
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
                                )
                            }}
                        />

                        <Box mt={3} display="flex" justifyContent="center">
                            <LoadingButton
                                loading={loading}
                                variant="contained"
                                type="submit"
                                sx={{
                                    borderRadius: "30px",
                                    px: 5,
                                    py: 1.5,
                                    background: "linear-gradient(to right, #42a5f5, #1e88e5)",
                                    boxShadow: "0 0 15px rgba(33,150,243,0.4)",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    mt: 4,
                                    '&:hover': {
                                        background: "linear-gradient(to right, #1e88e5, #1976d2)",
                                        boxShadow: "0 0 20px rgba(33,150,243,0.6)",
                                    }
                                }}
                            >
                                Save Password
                            </LoadingButton>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ChangePasswordPage;
