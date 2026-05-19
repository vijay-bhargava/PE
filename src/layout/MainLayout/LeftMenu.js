import React, { useRef, useEffect, useState } from 'react';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { Box, Divider, MenuItem, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { actionTypes, useStateValue } from '../../store';
import RaiseQueryCell from '../../pages/CommunucationHub/Cells/RaiseQueryCell';
import { goToLoginPage, IconComponent } from '../../utils/common';
import { SupportAgentOutlined } from '@mui/icons-material';
import { getCookieDomain } from '../../utils/common/subdomainHelper';
import { ApiClient } from '../../Apiclient';
import logo from "../../assets/images/chatbotlogo.png";
import Chatbot from '../../components/chatbot';
import { HiMenuAlt2 } from "react-icons/hi";

const LeftMenu = () => {
  const broadcastChannel = new BroadcastChannel('auth_logout');
  const [{ customersuffix, menuList, userDetail, atoken }, dispatch] = useStateValue();
  const [cookies, setCookie, removeCookie] = useCookies(["patkn", "prtkn", "pcid", "pcsu", "pcuserDetail"]);
  const dropdownRefs = useRef({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    getMenu();
  }, []);

  const getMenu = async () => {
    const res = await new ApiClient().getres(`/api/auth/Customermenu`, atoken);
    if (res) {
      dispatch({ type: actionTypes.SET_MenuList, value: res?.data });
    }
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



  useEffect(() => {

    const handleMessage = (event) => {
      if (event.data.action === 'logout') {
        goToLoginPage(customersuffix)

      }
    };

    broadcastChannel.addEventListener('message', handleMessage);


    return () => {
      broadcastChannel.removeEventListener('message', handleMessage);
      broadcastChannel.close();
    };
  }, []);

  const handleDropdownToggle = (menuName) => {
    setOpenDropdowns((prev) => {
      const newOpenDropdowns = {};
      newOpenDropdowns[menuName] = !prev[menuName];
      Object.keys(prev).forEach((key) => {
        if (key !== menuName) {
          newOpenDropdowns[key] = false;
        }
      });
      return newOpenDropdowns;
    });
  };

  const handleMenuItemClick = (menuName) => {
    setOpenDropdowns((prev) => ({ ...prev, [menuName]: false }));
  };

  const handleClickOutside = (event) => {
    if (dropdownRefs.current && !Object.values(dropdownRefs.current).some(ref => ref && ref.contains(event.target))) {
      setOpenDropdowns({});
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const categoryOrder = [
    "Configure",     // 1st
    "Suppliers",     // 2nd
    "Report",        // 3rd
    "Libraries",     // 4th
    "Set Up",        // 5th
    "Cust Setup"     // 6th
  ];
  const sortedMenuList = menuList.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.menuCategory);
    const bIndex = categoryOrder.indexOf(b.menuCategory);

    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });

  // Define submenu order for Configure category
  const configureSubmenuOrder = [
    "Request for Information",
    "Purchase Requisition",
    "Request for Quotation",
    "Auction",
    "Note for Approval",
    "Purchase Order",
    "Invoice"
  ];

  // Function to sort Configure submenu items
  const sortConfigureSubmenu = (menuItems) => {
    return menuItems.sort((a, b) => {
      const aIndex = configureSubmenuOrder.findIndex(item =>
        a.MenuName.toLowerCase().includes(item.toLowerCase()) ||
        item.toLowerCase().includes(a.MenuName.toLowerCase())
      );
      const bIndex = configureSubmenuOrder.findIndex(item =>
        b.MenuName.toLowerCase().includes(item.toLowerCase()) ||
        item.toLowerCase().includes(b.MenuName.toLowerCase())
      );

      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  };

  return (

    <div className={`navbar-brand-box position-fixed collapsed pe-sidebar`}>
      <div className="d-flex flex-column navbarmenu-bg">
        <div className='d-flex justify-content-center pt-3'>
          <IconButton sx={{ color: "#ffffff" }}>
            <HiMenuAlt2 />
          </IconButton>
        </div>
        <div className="pe-top-divider" />
        <div className='logo-wrapper my-3'>
          <Link to={`/${customersuffix}`}>
            <img src={logo} alt='Logo' className='img-fluid sidebar-logo' />
          </Link>
        </div>


        <div className='flex-grow-1'>
          {sortedMenuList && sortedMenuList.map((m, i) => {
            const menulist = JSON.parse(m?.list);

            // Sort Configure submenu items
            const sortedMenuItems = m.menuCategory === "Configure"
              ? sortConfigureSubmenu(menulist)
              : menulist;

            const key = `menulist${m.MenuName}-${i}`;
            
            // If only one menu item, render as direct link
            if (sortedMenuItems && sortedMenuItems.length === 1) {
              const singleMenuItem = sortedMenuItems[0];
              return (
                <Link
                  key={key}
                  to={singleMenuItem?.MenuLink}
                  className='sidebaraccmenu myacccmenu ms-1'
                  style={{ 
                    border: "none",
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div className='icon-container'>
                    <IconComponent iconName={m.menuCategory} />
                  </div>
                  <div className='category-name text-center f10 fw500 m-1' style={{ maxWidth: '100px', wordWrap: 'break-word' }}>
                    {m.menuCategory}
                  </div>
                </Link>
              );
            }
            
            // If multiple menu items, render as dropdown
            return (
              <DropdownButton
                as={'div'}
                key={key}
                id={`dropdown-${i}`}
                className={`sidebaraccmenu myacccmenu ms-1`}
                drop={'end'}
                style={{ border: "none" }}
                variant="standard"
                title={
                  <div className='row' onClick={() => handleDropdownToggle(m.menuCategory)}>
                    <div className='col-md-12' style={{ display: "contents" }}>
                      <div className='icon-container'>

                        <IconComponent iconName={m.menuCategory} />
                      </div>
                      <div className='category-name text-center f10 fw500 col-md-10 m-1' style={{ maxWidth: '100px', wordWrap: 'break-word' }}>
                        {m.menuCategory}
                      </div>
                    </div>
                  </div>
                }
                show={openDropdowns[m.menuCategory]}
                ref={ref => dropdownRefs.current[m.menuCategory] = ref}
              >
                <div className='shadow rounded min-width-200px'>
                  {sortedMenuItems && sortedMenuItems.map((mi, index) => (
                    <React.Fragment key={mi?.MenuName + index}>
                      <MenuItem
                        as={Link}
                        to={mi?.MenuLink}
                        className='f13 fw500'

                        onClick={() => handleMenuItemClick(m.menuCategory)}
                        dangerouslySetInnerHTML={{ __html: mi?.MenuName }}
                      />
                      <Divider className='m-0' />
                    </React.Fragment>
                  ))}
                </div>
              </DropdownButton>
            );
          })}
        </div>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginTop: 'auto',
            gap: 2,
            pt: 2,
            pb: 3
          }}
        >
          <Box>
            {<RaiseQueryCell isCollapsed={true} key={"raisequery"} />}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <IconButton 
                onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                title="AI Chatbot - Get Help"
                sx={{
                  '&:hover': {
                    backgroundColor: 'transparent'
                  }
                }}
              >
                <SupportAgentOutlined className='f16pt' sx={{ color: '#ffffff' }} />
              </IconButton>
            </Box>
            <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />

            {/* <DropdownButton
            as={'div'}
            key={'user-menu'}
            id={`user-new-menu`}
            className='sidebaraccmenu mb-4 text-start ps-0 custom-dropdown-button '
            drop={'end'}
            variant="standard"
            title={
              <Tooltip title={userDetail.email}>
                <div className='d-flex align-items-center justify-content-center'>
                  <div className="circle">
                    <span className="letter">{firstCharacter}</span>
                  </div>
                </div>
              </Tooltip>
            }
            ref={ref => dropdownRefs.current['user-menu'] = ref}
          >
            <div className='shadow rounded min-width-200px'>
              <MenuItem as={Link} to='/settings/OrgSetup'>
                <ListItemIcon>
                  <HiOutlineCog fontSize="large" />
                </ListItemIcon>
               My Profile
              </MenuItem>
              <MenuItem onClick={logout}>
                <ListItemIcon>
                  <HiOutlineCog fontSize="large" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </div>
          </DropdownButton> */}
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default LeftMenu;
