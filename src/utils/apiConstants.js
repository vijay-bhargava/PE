
import axios from "axios";
import Axios from "axios";
import { toast } from "react-toastify";
const domain = process.env.REACT_APP_API_CALL;

export const login = async (data) => {
  
    try {
      
        const res = await Axios.post(`${domain}api/auth/login`, data);
        if(res?.status=='200'){
          return res?.data;
        }
    }catch (error) {
      
        
        if(error?.response?.data?.Message){
          toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
        }
        return '';
    }
}
export const requestotp = async (data) => {
  
  try {
      const res = await Axios.post(`${domain}api/auth/requestotp`, data);
    if (res?.status == '200') {
 toast.success(`OTP has been successfully sent to your ${data?.otpFor}. Check your inbox shortly.`, {
        position: toast.POSITION.TOP_CENTER,
        toastId: "otp_info"
      });
      
        return res?.data;
      }
  }catch (error) {
      // console.log('error-- ', error);
      if(error?.response?.data?.Message){
        toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
      }
      return '';
  }
}
export const otplogin = async (data) => {
  try {
      const res = await Axios.post(`${domain}api/auth/otplogin`, data);
      //console.log('resresres', res)
      if(res?.status=='200'){
        return res?.data;
      }
  }catch (error) {
      // console.log('error-- ', error);
      if(error?.response?.data?.Message){
        toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
      }
      return '';
  }
}

export const getCustomerAssets = async (data) => {
  
  try {
      const res = await Axios.get(`${domain}api/customer/GetCustomerAssets?suffix=${data?.suffix}`);
      if(res?.status=='200'){
        return res?.data;
      }
  }catch (error) {
      if(error?.response?.data?.Message){
        toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
      }
      return '0';
  }
}

export const requestForgotPassword = async (data) => {
  
  try {
   
      const res = await Axios.put(`${domain}api/auth/forgotpassword`, data);
      console.log('resresres', res)
    
    toast.success("Password reset have been successfully sent to your email. Check your inbox shortly.", {
        position: toast.POSITION.TOP_CENTER,
      });
    return res.data;
  }catch (error) {
      // console.log('error-- ', error);
      if(error?.response?.data?.Message){
        toast(error?.response?.data?.Message, { hideProgressBar: true, autoClose: 2000, type: 'error' })
      }
      return '';
  }
}

// export const UserChangePassword = async (Data,atoken) => {
//   var data={
//             email: Data.email,
//                 password: Data?.password,
//                 newPassword: Data?.newPassword,
//                 confirmPassword: Data?.confirmPassword,
//                 userType: Data?.userType,
//                 stages:Data?.stages
// }
//   ;
//   try {
    
//       const url = `${domain}api/auth/changepassword`;
     
//       const headers = {
//         accept: "application/json",
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${atoken}`,
//       };
//       const response = await axios.post(url, data,{headers});
  
//       return response.data;
//     } catch (error) {
//       console.log(error);
//     }
// };


  
