import { Outlet } from 'react-router-dom';
import { useStateValue } from '../../store';
import HeaderV2 from './HeaderV2';
import LeftMenuV2 from './LeftMenuV2';
import Login from '../../pages/Login/Login';
import UserChangePassword from '../../pages/Login/UserChangePassword';
import '../../assets/css/layout-v2.css';

const MainLayoutV2 = () => {
  const [{ atoken, logincount }] = useStateValue();

  // ── Auth guards (same as original MainLayout) ──
  if (!atoken) return <Login />;
  if (atoken && logincount === 0) return <UserChangePassword />;

  return (
    <div className="v2-shell">
      {/*
       * Sidebar is self-contained — manages its own hover expand/collapse.
       * Header and main content always use sidebar-collapsed dimensions
       * so they don't shift when sidebar overlays on hover.
       */}
      <LeftMenuV2 />

      <HeaderV2 isExpanded={false} />

      <main id="mainRightContant" className="v2-main-content sidebar-collapsed">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayoutV2;
