import React, { useEffect, useState } from 'react';
import LoginCell from './LoginCell';
import Carousel from 'react-bootstrap/Carousel';
import { actionTypes, useStateValue } from '../../store';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Backdrop, CircularProgress } from '@mui/material';
import PEModal from '../../components/PEModal';
import { getCustomerAssets } from '../../utils/apiConstants';
import logop from './../../assets/images/pelogo.png';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { getCustomerIdentifier, isCustomerMismatch, getCookieDomain } from '../../utils/common/subdomainHelper';

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
			<style>{`
                .login-carousel,
                .login-carousel .carousel-inner,
                .login-carousel .carousel-item {
                    height: 100vh;
                    width: 100%;
                }
                .login-carousel .carousel-item img {
                    width: 100%;
                    height: 100vh;
                    object-fit: cover;
                    object-position: top center;
                    display: block;
                }
            `}</style>
			<div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f3f4f6' }}>
				{/* Left — image carousel */}
				<div style={{ flex: '0 0 55%', height: '100vh', position: 'relative', overflow: 'hidden' }} className="d-none d-md-block">
					{assetData?.imgBG1 || assetData?.imgBG2 || assetData?.imgBG3 ? (
						<Carousel fade interval={3000} indicators={false} controls={false} className="login-carousel">
							{[assetData?.imgBG1, assetData?.imgBG2, assetData?.imgBG3].filter(Boolean).map((src, i) => (
								<Carousel.Item key={i}>
									<img src={src} alt="" />
								</Carousel.Item>
							))}
						</Carousel>
					) : (
						<div style={{ height: '100vh', background: 'linear-gradient(135deg, #03172b 0%, #0d2e53 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
							<img src={logop} alt="" style={{ maxWidth: 200, opacity: 0.8 }} />
						</div>
					)}
					{/* Overlay gradient at bottom */}
					<div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
				</div>

				{/* Right — login panel */}
				<div style={{ flex: 1, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', overflowY: 'auto' }}>
					<div style={{ width: '100%', maxWidth: 420, padding: '32px' }}>
						{/* Logo */}
						<div className="text-center mb-4">
							<img src={assetData?.imgLogo || logop} alt="" style={{ maxHeight: 56, maxWidth: 180, objectFit: 'contain' }} />
						</div>
						{/* Description */}
						{assetData?.description && (
							<p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
								{assetData.description}
							</p>
						)}
						<LoginCell customerId={customerId} suffix={currentCustomerSuffix} />
					</div>
				</div>
			</div>
			<PEModal
				open={openDialog}
				onClose={handleDialogClose}
				title="Confirm Logout"
				size="xs"
				footer={
					<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={handleDialogClose}>No</button>
						<button type="button" className="pe-btn pe-btn--primary" onClick={logout}>Yes, Logout</button>
					</>
				}
			>
				<p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
					Are you sure you want to log in to a different account? Doing so will log you out of your current account.
				</p>
			</PEModal>
		</>
	);
};

export default Login;