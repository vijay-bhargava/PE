import React, { useEffect, useState } from 'react'
import { Badge, Button, ButtonGroup, IconButton, Menu, Tooltip, Select, MenuItem } from '@mui/material'
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { HiOutlineX } from "react-icons/hi";
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { actionTypes, useStateValue } from '../../store';
import MessageCell from '../../pages/CommunucationHub/Cells/MessageCell';
import CustomerLogo from '../../components/customerlogo';
import { HiOutlineCog } from "react-icons/hi";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import logo from "../../assets/images/pelogo.png";
import { useLocation } from 'react-router-dom';
import { checkIf60DaysOrLessLeft, formatDateViaLocale } from '../../utils/common/utility';
import { buildQueryParams } from '../../utils/purchaseRequest';
import { ApiClient } from '../../Apiclient';
import { Filter, FilterAltOutlined } from '@mui/icons-material';
import { Modal } from 'react-bootstrap';
import { getUserRoles } from '../../utils/users';
import { getTimeZone } from '../../utils/common';
import { getCustomerAssets } from '../../utils/apiConstants';
import { getCookieDomain } from '../../utils/common/subdomainHelper';

const Header = () => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const location = useLocation();
  const broadcastChannel = new BroadcastChannel('auth_logout');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [isIndexPage, setIsIndexPage] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [assetData, setAssetData] = useState([]);
  console.log("assetData in header", assetData);
  const [cookies, setCookie, removeCookie] = useCookies(["patkn", "prtkn", "pcid", "pcsu", "pcuserDetail"]);
  const [{ userDetail, customersuffix, commid, atoken, customerid, dashboardFilter }, dispatch] = useStateValue();
  // console.log('Dashboard Filter from state:', dashboardFilter);
  // console.log('Is Index Page state:', isIndexPage);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  useEffect(() => {
    console.log('Current pathname:', location.pathname);
    const isDashboard = location.pathname === '/App' || 
                       location.pathname === '/app' || 
                       location.pathname.endsWith('/App') || 
                       location.pathname.endsWith('/app') ||
                       location.pathname.includes('/App') ||
                       location.pathname.includes('/app');
    console.log('Is Dashboard Page:', isDashboard);
    setIsIndexPage(isDashboard);
    dispatch({ type: actionTypes.SET_CommId, value: 0 });
  }, [location]);

  //below useffect is added by #Anurag_Dev to handle logo of login Buyer
  useEffect(() => {
    
    var data = {
      suffix: customersuffix === 'undefined' ? '' : customersuffix,
    };
    
    getCustomerAssets(data).then((res) => {
      
      console.log('resres', res);
      if (res === 0) {
        setAssetData([]);
        navigate("/404");
      } else {
        setAssetData(res);
      }
    });
  }, [location]);

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const [shouldShowMarquee, setShouldShowMarquee] = useState(false)
  // useEffect(() => {
  //   if (userDetail)
  //     getSubscriptiondetails()

  // }, [userDetail])
  const handleModalClose = () => {
    setShowTimeModal(false);
  };
  const logout = () => {
    // Broadcast a logout message to all tabs
    broadcastChannel.postMessage({ action: 'logout' });

    // Clear all Redux state
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

    // Get cookie domain for subdomain support
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
    const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
    
    // Use setTimeout to ensure cookies are cleared before redirect
    setTimeout(() => {
      window.location.href = baseUrl;
    }, 100);
  };
  const handleClickTimeZone = () => {
    setShowTimeModal(true);
  };
  // useEffect(() => {
  //   if (userDetail?.timeZone) {
  //     const interval = setInterval(() => {
  //       const timeInZone = new Date().toLocaleString('en-US', {
  //         timeZone: userDetail.timeZone,
  //         hour: '2-digit',
  //         minute: '2-digit',
  //         second: '2-digit',
  //       });
  //       setCurrentTime(timeInZone);
  //     }, 1000);

  //     return () => clearInterval(interval);
  //   }
  // }, [userDetail?.timeZone]);
  // const getSubscriptiondetails = async () => {

  //   const subscriptions = await getSubscriptionData();
  //   const subscriptionEndDate = subscriptions?.endDate;
  //   let isCheck;
  //   if (subscriptionEndDate) {
  //     isCheck = checkIf60DaysOrLessLeft(subscriptionEndDate);
  //     setShouldShowMarquee(isCheck)
  //   }

  // }
  const firstCharacter = userDetail?.name?.charAt(0);
  // const getSubscriptionData = async () => {

  //   let dataCustomer = {
  //     CustomerId: customerid,
  //   };
  //   const queryParams = buildQueryParams(dataCustomer)
  //   const pullCustomerList = await new ApiClient().getres(`/api/customer/Find?${queryParams}`, atoken)
  //   if (pullCustomerList) {

  //     const data = pullCustomerList?.data[0]?.subscriptions ?? []
  //     const length = data?.length - 1

  //     return data[length]
  //   }
  //   return '';
  // }

  const [showMarquee, setShowMarquee] = useState(true);

  const handleRemoveMarquee = () => {
    setShowMarquee(false);
  };
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    if (userDetail?.roleId) {
      getUserRoles({ id: userDetail.roleId }, atoken).then(roles => {
        if (Array.isArray(roles) && roles.length > 0) {
          const matchedRole = roles.find(role => role.id === userDetail.roleId);
          if (matchedRole) {
            setRoleName(matchedRole.name);
            console.log('Setting roleName:', matchedRole.name);
          }
        }
      });
    }
  }, [userDetail?.roleId, atoken]);

  const [timeZoneLong, setTimeZoneLong] = useState('');

  useEffect(() => {
    const fetchTimeZone = async () => {
      const timeZones = await getTimeZone(atoken);
      const matchedZone = timeZones?.find(
        (zone) => zone?.localeName === userDetail?.timeZone
      );

      if (matchedZone) {
        setTimeZoneLong(matchedZone?.timezonelong);
      } else {
        setTimeZoneLong('Timezone not set');
      }
    };

    if (userDetail?.timeZone) {
      fetchTimeZone();
    }
  }, [userDetail, atoken]);

  return (
    <div className='header pe-header'>
      <div className='headerContainer'>

        <div className='headerItem'>
          <div className='header-logo-wrapper' style={{ width: '180px', height: 'auto' }}>
            <Link to={`/${customersuffix}`}>
              <img
                src={assetData?.imgLogo ? assetData?.imgLogo : logo}
                alt='logo'
                className='img-fluid logo-img'
                style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '50px' }}
              />
            </Link>
          </div>

        </div>
        <div className='headerItem'>
          {isIndexPage && shouldShowMarquee && (
            <div className="marquee-container">
              {showMarquee && (
                <div className={`marquee ${isPaused ? 'paused' : ''}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  <button className="close-icon" onClick={handleRemoveMarquee}>
                    <HiOutlineX className='text-danger' />
                  </button>
                  <span className='text' style={{ color: "#2a86d3", fontWeight: "600", width: "100%" }}>
                    Your subscription will expire in 2 months.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className='headerItem'>
          <div className='d-flex align-items-center gap-3'>

            <div className="f14 fw500 text-primary text-start">
              {timeZoneLong || 'Timezone not set'}
            </div>

            {isIndexPage && (
              <>
                <span style={{ color: '#d0d0d0', fontSize: '20px' }}>|</span>

                <Select
                  size="small"
                  value={dashboardFilter || 'Last 7 days'}
                  onChange={(evt) => dispatch({ type: actionTypes.SET_DASHBOARD_FILTER, value: evt.target.value })}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="Today">Today</MenuItem>
                  <MenuItem value="Last 7 days">Last 7 days</MenuItem>
                  <MenuItem value="Last 30 days">Last 30 days</MenuItem>
                  <MenuItem value="All time">All time</MenuItem>
                </Select>

                <span style={{ color: '#d0d0d0', fontSize: '20px' }}>|</span>
              </>
            )}

            <MessageCell />

            <span style={{ color: '#d0d0d0', fontSize: '20px' }}>|</span>

            {/* Name (NOT clickable) */}
            <div className="d-flex flex-column align-items-start">
              <span className="user-info-name mb-0">{userDetail?.name}</span>
              <span className="user-info-role">{roleName}</span>
            </div>

            {/* Profile Image ONLY triggers dropdown */}
            <DropdownButton
              as={'div'}
              key={'user-menu'}
              id="user-new-menu"
              className="sidebaraccmenu ps-0 custom-dropdown-button"
              drop="down"
              variant="standard"
              title={
                <Tooltip
                  title={userDetail?.email || ''}
                  disableInteractive
                  enterTouchDelay={0}
                >
                  <div className="user-info-circle d-flex align-items-center justify-content-center" style={{ cursor: 'pointer' }}>
                    <span className="user-info-initial">
                      {userDetail?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </Tooltip>
              }
            >
              <div className="shadow rounded min-width-200px custom-user-dropdown-menu">
                <Dropdown.Item as={Link} to="/settings/OrgSetup" className="custom-dropdown-item">
                  <HiOutlineCog className="me-2" />
                  My Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={logout} className="custom-dropdown-item">
                  <HiOutlineCog className="me-2" />
                  Logout
                </Dropdown.Item>
              </div>
            </DropdownButton>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Header

