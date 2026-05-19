import React, { useEffect, useState } from 'react';
import LoginCell from './LoginCell';
import Carousel from 'react-bootstrap/Carousel';
import { actionTypes, useStateValue } from '../../store';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Backdrop, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { getCustomerAssets } from '../../utils/apiConstants';
import logop from './../../assets/images/pelogo.png';
import { toast } from 'react-toastify';
import { Card } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { getCustomerIdentifier, isCustomerMismatch, getCookieDomain, buildLoginUrl } from '../../utils/common/subdomainHelper';

const Login = () => {
    const { pageSuffix } = useParams();
    const [loadingapi, setLoadingapi] = useState(true);
    const [loading, setLoading] = useState(true);
    const [{ atoken, rtoken, customersuffix }, dispatch] = useStateValue();
    const broadcastChannel = new BroadcastChannel('auth_logout');
    const [cookies, setCookie, removeCookie] = useCookies(["patkn", "prtkn", "pcid", "pcsu", "pcuserDetail"]);
    const navigate = useNavigate();
    const [assetData, setAssetData] = useState([]);
    const [customerId, setCustomerId] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const location = useLocation();
    
    // Get customer identifier from subdomain or path
    const currentCustomerSuffix = getCustomerIdentifier(pageSuffix);

    useEffect(() => {
       
        if (atoken) {
          
            if (isCustomerMismatch(customersuffix, currentCustomerSuffix)) {
                setOpenDialog(true);
            }
            return;
        }
        
        // Fetch customer assets based on subdomain or path parameter
        var data = {
            suffix: currentCustomerSuffix || '',
        };
        
        setLoadingapi(true);
        getCustomerAssets(data).then((res) => {
            console.log('Customer assets loaded:', res);
            setLoadingapi(false);
            
            if (res === 0 || !res) {
                setAssetData([]);
                toast.error('Customer not found. Please check the URL.');
                navigate("/404");
            } else {
                setAssetData(res);
                setCustomerId(res?.id);
                
                // Store customer suffix in global state
                dispatch({ type: actionTypes.SET_CUSTOMERSUFFIX, value: currentCustomerSuffix });
            }
        }).catch((error) => {
            console.error('Error loading customer assets:', error);
            setLoadingapi(false);
            toast.error('Failed to load customer configuration.');
            navigate("/404");
        });
    }, [location, currentCustomerSuffix]);

    useEffect(() => {
          
        if (atoken) {
            // Check for customer mismatch
            if (isCustomerMismatch(customersuffix, currentCustomerSuffix)) {
                setOpenDialog(true);
                setLoading(false);
                setLoadingapi(false);
                return;
            }
            else {
                // User is logged in to the correct customer, redirect to app
                navigate("/app");
            }

        } else {
            setLoading(false);
        }
    }, [dispatch, atoken, currentCustomerSuffix]);

    const handleDialogClose = () => {
        setOpenDialog(false);
        navigate("/app");
    };

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
        
        setOpenDialog(false);
        
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

    if (loading || loadingapi) {
        return <Backdrop
            open={loading || loadingapi}
        >
            <div className='bg-white rounded-circle p-2 pb-1'><CircularProgress color="error" className='m-0 p-0' /></div>
        </Backdrop>;
    }

    return (
        <>
            <div className='container-fluid p-0'>
                <div className='bg-gray' style={{ backgroundColor: "#F4F7FA" }}>
                    <div className='row justify-content-center'>
                        <div className='col-md-12'>
                            <div className=''>
                                 <div className='row bg-white'>
                                    <div className='col-md-6'>
                                        <div className='d-block slider'>
                                            {assetData?.imgBG1 || assetData?.imgBG2 || assetData?.imgBG3 ? <>
                                                <Carousel fade interval={3000}>
                                                    <Carousel.Item style={{ overflow: "hidden" }}>
                                                        <div className='row'>
                                                            <div className='col-md-12'>
                                                                <img src={`${assetData?.imgBG1}` || `${logop}`} className='img-fluid' alt=""
                                                                    style={{ objectFit: 'cover', width: '100%', height: '100vh', objectPosition: "center", overflow: "hidden" }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Carousel.Item>
                                                    <Carousel.Item style={{ overflow: "hidden" }}>
                                                        <div className='row'>
                                                            <div className='col-md-12'>
                                                                <img src={`${assetData?.imgBG2}` || `${logop}`} className='img-fluid' alt=""
                                                                    style={{ objectFit: 'cover', width: '100%', height: '100vh', objectPosition: "center", overflow: "hidden" }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Carousel.Item>
                                                    <Carousel.Item style={{ overflow: "hidden" }}>
                                                        <div className='row'>
                                                            <div className='col-md-12'>
                                                                <img src={`${assetData?.imgBG3}` || `${logop}`} className='img-fluid' alt=''
                                                                    style={{ objectFit: 'cover', width: '100%', height: '100vh', objectPosition: "center", overflow: "hidden" }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Carousel.Item>
                                                </Carousel>
                                            </> :
                                                <div className='text-center' style={{ marginTop: "9rem" }}>
                                                    <img src={logop} className='img-fluid rounded mx-2' alt='' />
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    <div className='col-md-6  login-column ps-0'>
                                        <div className=' m-0 m-md-5 p-2 p-md-2 d-flex flex-column flex-grow-1'>
                                            <div className='row align-items-center justify-content-center'>
                                               
                                                     <div className='col-md-12 text-center me-2'>

                                                        <img src={`${assetData?.imgLogo}` || `${logop}`} alt='' className='img-fluid ' width={"160px"} />                                                </div>
                                                <div className='col-md-12  mt-md-4'>
                                                    <p className='text-muted f13 fw500'>{assetData?.description}</p>
                                                </div>
                                                <div className='col-11 me-4'>
                                                    <LoginCell customerId={customerId} suffix={currentCustomerSuffix} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log in to a different account? Doing so will log you out of your current account.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        No
                    </Button>
                    <Button variant="contained" onClick={logout} color="primary" >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Login;