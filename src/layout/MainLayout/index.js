import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStateValue } from '../../store';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import LeftMenu from './LeftMenu';
import Header from './Header';
import Login from '../../pages/Login/Login';
import UserChangePassword from '../../pages/Login/UserChangePassword';


const MainLayout = () => {
  const [{ atoken, logincount }] = useStateValue();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Add any side effects if needed
  }, [atoken, logincount, location]);

  if (!atoken) return <Login />;
  if (atoken && logincount === 0) return <UserChangePassword />;

   return (
    <div className="pe-shell normal">
      <Header />
      <div className="d-flex">
        {atoken ? (
          <>
            <LeftMenu isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div
              id='mainRightContant'
              className={`flex-grow-1 collapsed pe-main-content`} // Adjust class for styling
            >
              <Outlet />
            </div>
          </>
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
};

export default MainLayout;

// Styled Components

const MainLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
`;

const HeaderSection = styled.div`
  height: 10dvh;
  flex-shrink: 0;
`;

const ContentSection = styled.div`
  display: flex;
  height: 90dvh;
  flex-grow: 1;
  overflow: hidden;
`;

const MainContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #ffffff; /* Optional background */
`;
