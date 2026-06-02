import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import {
  ArticleOutlined,
  SmartToyOutlined,
  DescriptionOutlined,
  ArrowRightOutlined,
  DashboardOutlined,
  LibraryBooksOutlined,
  SettingsOutlined,
  CorporateFareOutlined,
  PeopleAltOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@mui/icons-material';
import { actionTypes, useStateValue } from '../../store';
import RaiseQueryCell from '../../pages/CommunucationHub/Cells/RaiseQueryCell';
import { goToLoginPage } from '../../utils/common';
import { getCookieDomain } from '../../utils/common/subdomainHelper';
import { ApiClient } from '../../Apiclient';
import Chatbot from '../../components/chatbot';

/*
 * V2MenuIcon — Figma-matched icons per sidebar category.
 * Kept separate from old IconComponent so zero old code is touched.
 */
const V2MenuIcon = ({ category }) => {
  const s = { sx: { fontSize: 20 } };
  const map = {
    Configure: <ArticleOutlined      {...s} />,
    Suppliers: <PeopleAltOutlined       {...s} />,
    Report: <DescriptionOutlined     {...s} />,
    Libraries: <LibraryBooksOutlined {...s} />,
    'Set Up': <SettingsOutlined     {...s} />,
    'Cust Setup': <CorporateFareOutlined {...s} />,
  };
  return map[category] ?? <DashboardOutlined {...s} />;
};

const LeftMenuV2 = () => {
  const broadcastChannel = new BroadcastChannel('auth_logout');
  const [{ customersuffix, menuList, atoken }, dispatch] = useStateValue();
  const [, , removeCookie] = useCookies(['patkn', 'prtkn', 'pcid', 'pcsu', 'pcuserDetail']);

  /* sidebar state — controlled by hover, not click */
  const [isExpanded, setIsExpanded] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const collapseTimer = useRef(null);
  const location = useLocation();

  /* ── Fetch menu on mount ── */
  useEffect(() => {
    getMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMenu = async () => {
    const res = await new ApiClient().getres('/api/auth/Customermenu', atoken);
    if (res) dispatch({ type: actionTypes.SET_MenuList, value: res?.data });
  };

  /* ── Cross-tab logout listener ── */
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data.action === 'logout') goToLoginPage(customersuffix);
    };
    broadcastChannel.addEventListener('message', handleMessage);
    return () => {
      broadcastChannel.removeEventListener('message', handleMessage);
      broadcastChannel.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Logout (same as original LeftMenu.js) ── */
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
    const opts = { path: '/', ...(cookieDomain && { domain: cookieDomain }) };
    ['patkn', 'prtkn', 'pcid', 'pcsu', 'pcuserDetail', 'pcutz', 'pcudc',
      'pcloginCount', 'pcmlDetail', 'pcrcDetail'].forEach(c => removeCookie(c, opts));
    const { protocol, hostname, port } = window.location;
    setTimeout(() => {
      window.location.href = `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }, 100);
  };

  /* ── Hover handlers with small delay to avoid flicker ── */
  const handleMouseEnter = () => {
    clearTimeout(collapseTimer.current);
    setIsExpanded(true);
  };
  const handleMouseLeave = () => {
    collapseTimer.current = setTimeout(() => {
      setIsExpanded(false);
      setOpenSubmenus({});
    }, 120); /* 120ms grace period */
  };

  /* ── Menu sort helpers (identical logic to LeftMenu.js) ── */
  const categoryOrder = ['Configure', 'Suppliers', 'Report', 'Libraries', 'Set Up', 'Cust Setup'];
  const sortedMenuList = [...menuList].sort((a, b) => {
    const ai = categoryOrder.indexOf(a.menuCategory);
    const bi = categoryOrder.indexOf(b.menuCategory);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const configureOrder = [
    'Request for Information', 'Purchase Requisition', 'Request for Quotation',
    'Auction', 'Note for Approval', 'Purchase Order', 'Invoice',
  ];
  const sortConfigureSubmenu = (items) =>
    [...items].sort((a, b) => {
      const ai = configureOrder.findIndex(i =>
        a.MenuName.toLowerCase().includes(i.toLowerCase()) ||
        i.toLowerCase().includes(a.MenuName.toLowerCase())
      );
      const bi = configureOrder.findIndex(i =>
        b.MenuName.toLowerCase().includes(i.toLowerCase()) ||
        i.toLowerCase().includes(b.MenuName.toLowerCase())
      );
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  /* ── Submenu toggle ── */
  const toggleSubmenu = (name) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  /* ── Active route helpers ── */
  const isLinkActive = (link) => {
    if (!link) return false;
    if (link === '/app') return ['/app', '/App'].includes(location.pathname);
    return location.pathname === link || location.pathname.startsWith(link + '/');
  };
  const isCategoryActive = (items) => items.some(item => isLinkActive(item.MenuLink));
  const getMenuItems = (menu) => {
    try {
      return JSON.parse(menu?.list ?? '[]');
    } catch (error) {
      return [];
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  return (
    <nav
      className={`v2-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Top bar: toggle icon only (no logo — matches Figma) ── */}
      <div className="v2-sidebar-top">
        <div className="v2-toggle-btn" aria-label="Sidebar toggle">
          {isExpanded ? <CloseOutlined sx={{ fontSize: 20 }} /> : <MenuOutlined sx={{ fontSize: 20 }} />}
        </div>
      </div>

      {/* ── Scrollable nav items ── */}
      <div className="v2-menu-scroll">

        {/* Dashboard — hardcoded (not in API menuList) */}
        <Link
          to="/app"
          className={`v2-menu-item${isLinkActive('/app') ? ' active' : ''}`}
        >
          <span className="v2-menu-icon">
            <DashboardOutlined sx={{ fontSize: 20 }} />
          </span>
          <span className="v2-menu-label">Dashboard</span>
        </Link>

        {sortedMenuList.map((m, i) => {
          const rawItems = getMenuItems(m);
          const sortedItems = m.menuCategory === 'Configure'
            ? sortConfigureSubmenu(rawItems)
            : rawItems;
          const isOpen = !!openSubmenus[m.menuCategory];
          const hasActive = isCategoryActive(sortedItems);
          const shouldOpen = isExpanded && (isOpen || hasActive);
          const showDivider = m.menuCategory === 'Set Up';

          /* Single item → direct link */
          if (sortedItems.length === 1) {
            const item = sortedItems[0];
            const active = isLinkActive(item.MenuLink);
            return (
              <React.Fragment key={`v2m-${i}`}>
                {showDivider ? <div className="v2-menu-section-divider" /> : null}
                <Link
                  to={item.MenuLink}
                  className={`v2-menu-item${active ? ' active' : ''}`}
                >
                  <span className="v2-menu-icon"><V2MenuIcon category={m.menuCategory} /></span>
                  <span className="v2-menu-label">{m.menuCategory}</span>
                </Link>
              </React.Fragment>
            );
          }

          /* Multi-item → accordion */
          return (
            <React.Fragment key={`v2m-${i}`}>
              {showDivider ? <div className="v2-menu-section-divider" /> : null}
              <button
                className={`v2-menu-item has-children${hasActive ? ' active' : ''}`}
                onClick={() => toggleSubmenu(m.menuCategory)}
                aria-expanded={shouldOpen}
              >
                <span className="v2-menu-icon"><V2MenuIcon category={m.menuCategory} /></span>
                <span className="v2-menu-label">{m.menuCategory}</span>
                <span className={`v2-menu-chevron${shouldOpen ? ' open' : ''}`}>
                  <ArrowRightOutlined sx={{ fontSize: 16 }} />
                </span>
              </button>

              <div className={`v2-submenu${shouldOpen ? ' open' : ''}`}>
                {sortedItems.map((item, idx) => (
                  <Link
                    key={`v2s-${idx}`}
                    to={item.MenuLink}
                    className={`v2-submenu-item${isLinkActive(item.MenuLink) ? ' active' : ''}`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: item.MenuName }} />
                  </Link>
                ))}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Bottom actions ── */}
      <div className="v2-sidebar-divider" />
      <div className="v2-sidebar-bottom">
        <div className="v2-sidebar-utility">
          <RaiseQueryCell isCollapsed={true} sidebarVariant key="v2-raisequery" />
        </div>
        <button
          className="v2-sidebar-action-btn v2-sidebar-utility-btn"
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          title="AI Assistant"
          aria-label="AI Assistant"
        >
          <span className="v2-action-icon">
            <SmartToyOutlined sx={{ fontSize: 20 }} />
          </span>
        </button>
      </div>

      <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
    </nav>
  );
};

export default LeftMenuV2;
