import Routes from './routes';
import ScrollTop from "./components/ScrollTop";
import { useCookies } from 'react-cookie';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { actionTypes, useStateValue } from './store';
import CryptoJS from 'crypto-js';
import React, { useEffect, useState } from 'react';
import { Backdrop, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Popover } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from "@mui/material";
import { theme } from './theme';
import { isTokenExpired } from './utils/common';
import { Button } from 'react-bootstrap';
import { api, ApiClient } from './Apiclient';
import { buildQueryParams } from './utils/common/utility';
import { useSleepDetector } from './hooks/useSleepDetector';
import { useInternetChecker } from './hooks/useInternetChecker';


function App() {
  // useSleepDetector();
  //useInternetChecker();
  const [{ atoken, rtoken, customerid, customersuffix, userDetail }, dispatch] = useStateValue();
  const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
  const [loading, setLoading] = useState(true);
  const apiClient = new ApiClient(customersuffix);


  useEffect(() => {

    const setToken = () => {
      const { patkn, prtkn, pcid, pcsu, pcutz, pcudc, pcuserDetail, pcrcDetail, pcbt, pcmlDetail, pcloginCount } = cookie;
      console.log(patkn);
      if (patkn) {
        const temp_xID = CryptoJS.AES.decrypt(patkn, process.env.REACT_APP_TOKEN_INCRYPT_KEY);
        const xID = temp_xID.toString(CryptoJS.enc.Utf8);
        dispatch({ type: actionTypes.SET_ATOKEN, value: xID });
      }
      if (prtkn) {
        const temp_uType = CryptoJS.AES.decrypt(prtkn, process.env.REACT_APP_TOKEN_INCRYPT_KEY);
        const xUType = temp_uType.toString(CryptoJS.enc.Utf8);
        dispatch({ type: actionTypes.SET_RTOKEN, value: xUType });
      }
      if (pcid) {
        const temp_uType = CryptoJS.AES.decrypt(pcid, process.env.REACT_APP_TOKEN_INCRYPT_KEY);
        const xUType = temp_uType.toString(CryptoJS.enc.Utf8);
        dispatch({ type: actionTypes.SET_CUSTOMERID, value: xUType });
      }

      if (pcuserDetail) {
        const decryptedValue = CryptoJS.AES.decrypt(pcuserDetail, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(CryptoJS.enc.Utf8);
        dispatch({ type: actionTypes.SET_USERDETAIL, value: JSON.parse(decryptedValue) });
      }


      if (pcbt) {
        const decryptedValue = CryptoJS.AES.decrypt(pcbt, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(CryptoJS.enc.Utf8);
        dispatch({ type: actionTypes.SET_Bidtype, value: JSON.parse(decryptedValue) });
      }

      // if (pcrcDetail) {
      //   const decryptedValue = CryptoJS.AES.decrypt(pcrcDetail, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(CryptoJS.enc.Utf8);
      //   dispatch({ type: actionTypes.SET_RoleClaims, value: JSON.parse(decryptedValue) });
      // }
      if (pcmlDetail) {
        const decryptedValue = CryptoJS.AES.decrypt(pcmlDetail, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(CryptoJS.enc.Utf8);
        dispatch({ type: actionTypes.SET_MenuList, value: JSON.parse(decryptedValue) });
      }

      if (pcsu) {
        dispatch({ type: actionTypes.SET_CUSTOMERSUFFIX, value: pcsu });
      }
      if (pcutz) {
        dispatch({ type: actionTypes.SET_USERTIMEZONE, value: pcutz });
      }
      if (pcudc) {
        dispatch({ type: actionTypes.SET_USERDIALINGCODE, value: pcudc });
      }

      if (pcloginCount) {
        //const decryptedLoginCount = CryptoJS.AES.decrypt(pcloginCount, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(CryptoJS.enc.Utf8);
        dispatch({ type: actionTypes.SET_LOGINCOUNT, value: parseInt(pcloginCount) });
      }
      else {
        dispatch({ type: actionTypes.SET_LOGINCOUNT, value: 0 });
      }


      setLoading(false);

    };
    const updateToken = async () => {
      const res = await isTokenExpired(atoken, rtoken, customerid);
      if (res) {
        if (res?.accessToken != '') {
          dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken });
          var userAccessToken = CryptoJS.AES.encrypt(`${res.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
          setCookie("patkn", userAccessToken, { path: '/', maxAge: 86400 });
        }
        if (res?.refreshToken != '') {
          dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken });
          var userRefreshToken = CryptoJS.AES.encrypt(`${res.refreshToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
          setCookie("prtkn", userRefreshToken, { path: '/', maxAge: 86400 });
        }
      }
    }
    if (atoken === null) {
      setToken();
    }
    else {
      if (atoken !== '') updateToken();
    }
  }, [dispatch, atoken, cookie]);

  if (loading) {
    // Show a loading indicator until the token is fetched
    return <Backdrop
      open={loading}
    >
      <div className='bg-white rounded-circle p-2 pb-1'><CircularProgress color="error" className='m-0 p-0' /></div>
    </Backdrop>
  }
  return (
    <ScrollTop>
      <ThemeProvider theme={theme}>

        <Routes />
        <ToastContainer position="top-center" limit={1} hideProgressBar={true} progress={undefined} autoClose={2000} />

      </ThemeProvider>
    </ScrollTop>
  );
}

export default App;
