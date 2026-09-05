import Axios from "axios";
import { toast } from "react-toastify";
const domain = process.env.REACT_APP_API_CALL;

export const GetPOHeaderList = async (data, atoken) => {

  try {
    //to create dynamic query
    const queryParams = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    //const url = `${domain}api/VendorFullfilment/GetPOHeaderList?${queryParams}`;
    //const url = `${domain}api/poconfirm/Find?${queryParams}`;
    const url = `${domain}api/poconfirm/Find?${queryParams}`;

    // const token=CryptoJS.AES.decrypt(cookies.patkn,process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(CryptoJS.enc.Utf8);
    const headers = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await Axios.get(url, { headers });

    console.log('resresres', res)
    if (res?.status === 200) {

      return res?.data;
    }
  } catch (error) {

    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
    }
    return '';
  }
}