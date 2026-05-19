import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NoInternet = () => {
  const [isBackOnline, setIsBackOnline] = useState(false);
  const navigate = useNavigate();

  // Check for reconnection
  useEffect(() => {
    const checkOnlineStatus = () => {
      if (navigator.onLine) {
        setIsBackOnline(true);
      }
    };

    window.addEventListener('online', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
    };
  }, []);

  // Optional: Redirect after a short delay if back online
  useEffect(() => {
    if (isBackOnline) {
      const timer = setTimeout(() => {
        navigate(-1); // Go back to the previous page
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isBackOnline, navigate]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>No Internet Connection</h1>
      <p style={styles.message}>Please check your network and try again.</p>
      {isBackOnline && <p style={styles.reconnecting}>Reconnected! Redirecting...</p>}
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#dc3545',
  },
  message: {
    fontSize: '1.2rem',
    color: '#333',
  },
  reconnecting: {
    marginTop: '1rem',
    fontSize: '1rem',
    color: 'green',
  },
};

export default NoInternet;
