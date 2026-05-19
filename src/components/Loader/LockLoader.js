// LockLoader.jsx
import '../../assets/css/lockloader.css'; // Import CSS styles
import React, { useState, useEffect } from 'react';

const LockLoader = ({ loaderCallback, actiontext, actionlocktype }) => {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const messageTimer = setTimeout(() => setUnlocked(true), 2000);
    const navigateTimer = setTimeout(() => {
      loaderCallback();
    }, 4000);

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(navigateTimer);
    };
  }, [loaderCallback]);

const renderSVG = () => {
  switch (actionlocktype) {
    case 'sealedbid':
      return (
        <svg className="loader-svg" viewBox="0 0 100 120">
          <rect x="30" y="50" width="40" height="50" rx="6" className="lock-body" />
          <path
            d="M40 50 V30 A10 10 0 0 1 60 30 V50"
            className={`shackle ${unlocked ? 'unlocked' : ''}`}
          />
        </svg>
      );

    case 'updateenddate':
      return (
        <svg className="loader-svg" viewBox="0 0 100 100">
          {/* Calendar outline */}
          <rect x="20" y="20" width="60" height="60" rx="5" ry="5" className="calendar-body" />
          {/* Calendar header */}
          <rect x="20" y="20" width="60" height="15" className="calendar-header" />
          {/* Clock or refresh symbol */}
          <circle cx="70" cy="70" r="10" className="clock-face" />
          <line x1="70" y1="70" x2="70" y2="64" className="clock-hand" />
          <line x1="70" y1="70" x2="75" y2="70" className="clock-hand" />
        </svg>
      );

    default:
      return null;
  }
};


  return (
    <div className="lock-loader">
      {renderSVG()}
      {actiontext && <div className={`message ${unlocked ? 'visible' : ''}`}>
        {actiontext}
      </div>}
    </div>
  );
};

export default LockLoader;
