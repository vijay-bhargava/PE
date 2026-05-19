import axios from "axios";
import CryptoJS from "crypto-js";
import { convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { StringFromArray } from "../common";
import { toast } from "react-toastify";
const domain = process.env.REACT_APP_API_CALL;
export const customerid = 1;

let required = true;

export const saveEmailDetails = async (Data,atoken) => {
  
  // const contentString = JSON.stringify(convertToRaw(Data?.emailbody1));
  // const contentStringhtml=draftToHtml(convertToRaw(Data?.emailbody1));
  // const contentStringfooter = JSON.stringify(convertToRaw(Data?.footer));
  // const contentStringhtmlfooter =draftToHtml(convertToRaw(Data?.footer));
  const mailto=StringFromArray(Data?.mailto);
  const mailcc=StringFromArray(Data?.mailcc);
  const mailbcc =StringFromArray(Data?.mailbcc);


  try {
   
    let data = {
      id: 0,
      emailevent: Data?.emailevent,
      emailsubject: Data?.emailsubject,
      templateid: 0,
      mailto: mailto,
      mailcc: mailcc,
      mailbcc:mailbcc,
      subvarid: 0,
      eventType: Data?.eventType||"",
      stageId: parseInt(Data?.stageId),
      emailbody1:Data?.emailbody1,
      emailbody2:Data?.emailbody1,
      footer: Data?.footer,
      footer1:Data?.footer,
      isactive: Data?.isactive,

    };
    ;
    const saveEmail_ENDPOINT = `${domain}api/EmailMaster/Add`;
 
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(saveEmail_ENDPOINT, data, { headers });
    ;
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getEmailDetails = async (data, atoken) => {
  try {
    ;
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
    const getEmail_ENDPOINT = `${domain}api/EmailMaster/Find?${queryParams}`;

   
    const headers = {
      accept: "application/json",
       "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.get(getEmail_ENDPOINT, { headers });
    if (response?.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }
};

export const UpdateEmailDetails = async (Data,id,atoken) => {


 const mailto=StringFromArray(Data?.mailto);
  const mailcc=StringFromArray(Data?.mailcc);
  const mailbcc =StringFromArray(Data?.mailbcc);



  try {
    
    let data={
        
      id:id,
      // customerId:Data?.customerId ,
      emailevent:Data?.emailevent,
      emailsubject: Data?.emailsubject,
      eventType:Data?.eventType,
      stageId:parseInt(Data?.stageId),
      mailto:mailto,
      mailcc:mailcc,
      mailbcc: mailbcc,
      isactive: Data?.isactive,
      emailbody1:Data?.emailbody1,
      emailbody2:Data?.emailbody1,
      footer: Data?.footer,
      footer1:Data?.footer,
      
    
    }
    
    const saveEmail_ENDPOINT = `${domain}api/EmailMaster/Update`;
 
    const headers = {
     accept: "application/json",
       "Content-Type": "application/json",
       Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(saveEmail_ENDPOINT, data,{headers});
    //;

  } catch (error) {
    // Check if the error response matches your condition
    if (error.response && error.response.status === 422 && error.response.data.Message === "Email is associated with stage, Can not be deactive") {
      toast.error("Email is associated with stage, cannot be deactivated."); // Show toast message
    } else {
      console.log(error);
      toast.error("An unexpected error occurred."); // Handle other errors
    }
  }
};
//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// };

export const getPrefilledEmail = async (id) => {
  try {
    const getPrefilled_ENDPOINT = `${domain}api/EmailMaster/FindById?Id=${id}`;
    const response = await axios.get(getPrefilled_ENDPOINT);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};


export const getEmailEvent = async (eventtype) => {
  try {
    const getEE_ENDPOINT = `${domain}api/EmailMaster/Find?mailtype=${eventtype}`;
    
    const response = await axios.get(getEE_ENDPOINT);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};


export const getEmailVariable =async(data,atoken) => { 
  try { 
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');  
    const ENDPOINT = `${domain}api/EmailMaster/FindVariable?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.get(ENDPOINT,{headers}); 
    if(response?.status===200){
      return response?.data;
    }
    
  } catch (error) {
      console.log(error)
  }
}