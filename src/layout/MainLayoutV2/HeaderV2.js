import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Select, MenuItem, Tooltip } from '@mui/material';
import { ArrowRightOutlined, TimerOutlined } from '@mui/icons-material';
import { HiOutlineCog, HiOutlineLogout, HiOutlineX } from 'react-icons/hi';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useCookies } from 'react-cookie';

import { actionTypes, useStateValue } from '../../store';
import MessageCell from '../../pages/CommunucationHub/Cells/MessageCell';
import { getTimeZone } from '../../utils/common';
import { getCustomerAssets } from '../../utils/apiConstants';
import { getUserRoles } from '../../utils/users';
import { getCookieDomain } from '../../utils/common/subdomainHelper';
import pelogo from '../../assets/images/pelogo.png';

const HeaderV2 = ({ isExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const broadcastChannel = new BroadcastChannel('auth_logout');

  const [{ userDetail, customersuffix, atoken, customerid, dashboardFilter }, dispatch] =
    useStateValue();
  const [, , removeCookie] = useCookies(['patkn', 'prtkn', 'pcid', 'pcsu', 'pcuserDetail']);

  const [isIndexPage, setIsIndexPage] = useState(false);
  const [assetData, setAssetData] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [timeZoneLong, setTimeZoneLong] = useState('');
  const [shouldShowMarquee, setShouldShowMarquee] = useState(false);
  const [showMarquee, setShowMarquee] = useState(true);

  /* ── Detect dashboard route ── */
  useEffect(() => {
    const isDashboard =
      location.pathname === '/App' ||
      location.pathname === '/app' ||
      location.pathname.endsWith('/App') ||
      location.pathname.endsWith('/app') ||
      location.pathname.includes('/App') ||
      location.pathname.includes('/app');
    setIsIndexPage(isDashboard);
    dispatch({ type: actionTypes.SET_CommId, value: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  /* ── Fetch customer logo on route change ── */
  useEffect(() => {
    const data = {
      suffix: customersuffix === 'undefined' ? '' : customersuffix,
    };
    getCustomerAssets(data).then((res) => {
      if (res === 0) {
        setAssetData([]);
        navigate('/404');
      } else {
        setAssetData(res);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  /* ── Fetch role name ── */
  useEffect(() => {
    if (userDetail?.roleId) {
      getUserRoles({ id: userDetail.roleId }, atoken).then((roles) => {
        if (Array.isArray(roles) && roles.length > 0) {
          const matched = roles.find((r) => r.id === userDetail.roleId);
          if (matched) setRoleName(matched.name);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetail?.roleId, atoken]);

  /* ── Fetch timezone label ── */
  useEffect(() => {
    const fetchTimeZone = async () => {
      const zones = await getTimeZone(atoken);
      const matched = zones?.find((z) => z?.localeName === userDetail?.timeZone);
      setTimeZoneLong(matched ? matched?.timezonelong : 'Timezone not set');
    };
    if (userDetail?.timeZone) fetchTimeZone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetail, atoken]);

  /* ── Logout ── */
  const logout = () => {
    broadcastChannel.postMessage({ action: 'logout' });
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
    const cookieOptions = { path: '/', ...(cookieDomain && { domain: cookieDomain }) };
    removeCookie('patkn', cookieOptions);
    removeCookie('prtkn', cookieOptions);
    removeCookie('pcid', cookieOptions);
    removeCookie('pcsu', cookieOptions);
    removeCookie('pcuserDetail', cookieOptions);
    removeCookie('pcutz', cookieOptions);
    removeCookie('pcudc', cookieOptions);
    removeCookie('pcloginCount', cookieOptions);
    removeCookie('pcmlDetail', cookieOptions);
    removeCookie('pcrcDetail', cookieOptions);

    const { protocol, hostname, port } = window.location;
    setTimeout(() => {
      window.location.href = `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }, 100);
  };

  const sidebarState = isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed';
  const logoSrc = assetData?.imgLogo ? assetData.imgLogo : pelogo;
  const userInitial = userDetail?.name?.charAt(0)?.toUpperCase() || 'U';
  const profileImage = userDetail?.profileImage || userDetail?.imageUrl || userDetail?.photoUrl || '';

  /* ─────────────────────────────────────────────────────────── */
  return (
    <header className={`v2-header ${sidebarState}`}>

      {/* ── Logo ── */}
      <div className="v2-header-logo">
        <Link to={`/${customersuffix}`}>
          <img src={logoSrc} alt="ProcurEngine" />
        </Link>
      </div>

      {/* ── Subscription marquee (dashboard only) ── */}
      {isIndexPage && shouldShowMarquee && showMarquee && (
        <div className="v2-marquee-bar">
          <button
            className="v2-marquee-close"
            onClick={() => setShowMarquee(false)}
            aria-label="Dismiss"
          >
            <HiOutlineX size={12} />
          </button>
          <span>Your subscription will expire soon.</span>
        </div>
      )}

      {/* ── Right section ── */}
      <div className="v2-header-right">

        {/* Timezone */}
        <div className="v2-timezone-wrapper">
          <TimerOutlined className="v2-timezone-icon" />
          <span className="v2-timezone">{timeZoneLong || 'Timezone not set'}</span>
        </div>

        <div className="v2-header-divider" />

        {/* Dashboard date filter (dashboard page only) */}
        {isIndexPage && (
          <>
            <Select
              size="small"
              value={dashboardFilter || 'Last 7 days'}
              onChange={(e) =>
                dispatch({ type: actionTypes.SET_DASHBOARD_FILTER, value: e.target.value })
              }
              className="v2-dashboard-filter"
              sx={{ fontSize: 13 }}
            >
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Last 7 days">Last 7 days</MenuItem>
              <MenuItem value="Last 30 days">Last 30 days</MenuItem>
              <MenuItem value="All time">All time</MenuItem>
            </Select>

            <div className="v2-header-divider" />
          </>
        )}

        {/* Notification bell */}
        <div className="v2-bell-wrapper">
          <MessageCell />
        </div>

        <div className="v2-header-divider" />

        {/* User section — avatar + name + role + chevron → single dropdown trigger */}
        <DropdownButton
          as="div"
          id="v2-user-dropdown"
          className="v2-user-menu-btn"
          drop="down"
          variant="standard"
          title={
            <div className="v2-user-section">
              <Tooltip
                title={userDetail?.email || ''}
                disableInteractive
                enterTouchDelay={0}
                placement="bottom"
              >
                {profileImage ? (
                  <img src={profileImage} alt={userDetail?.name} className="v2-avatar v2-avatar-image" />
                ) : (
                  <div className="v2-avatar" aria-label={userDetail?.name}>
                    {userInitial}
                  </div>
                )}
              </Tooltip>
              <div className="v2-user-info">
                <span className="v2-user-name">{userDetail?.name}</span>
                <span className="v2-user-role">{roleName || 'User'}</span>
              </div>
              <ArrowRightOutlined className="v2-user-chevron" />
            </div>
          }
        >
          <div className="v2-profile-dropdown">
            <Dropdown.Item as={Link} to="/settings/OrgSetup" className="v2-profile-dropdown-item">
              <HiOutlineCog className="v2-profile-dropdown-icon" />
              My Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={logout} className="v2-profile-dropdown-item v2-profile-dropdown-item--danger">
              <HiOutlineLogout className="v2-profile-dropdown-icon" />
              Logout
            </Dropdown.Item>
          </div>
        </DropdownButton>

      </div>
    </header>
  );
};

export default HeaderV2;
