
import axios from "axios";
import CryptoJS from "crypto-js";
import { Cookies } from "react-cookie";
const domain = process.env.REACT_APP_API_CALL;
  

export const GetActivities =async(data,atoken) => {
   
    try {   
     const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
   
      const url = `${domain}api/activitydetail/Find?${queryParams}`;
      const headers = {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${atoken}`,
      };
      const response = await axios.get(url, {headers});
    if(response?.status===200){
        return response?.data.result;
      }
      
    } catch (error) {
        console.log(error)
    }
  }

  export const GetDashboardActivities =async(atoken, data = {}) => {
   
    try {   
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
   
      const url = queryParams
        ? `${domain}api/activitydetail/GetDashboardActivities?${queryParams}`
        : `${domain}api/activitydetail/GetDashboardActivities`;
      const headers = {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${atoken}`,
      };
      const response = await axios.get(url, {headers});
    if(response?.status===200){
       
        return response?.data;
      }
      
    } catch (error) {
        console.log(error)
    }
  }

  