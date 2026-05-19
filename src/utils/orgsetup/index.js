import axios from "axios";
const domain = process.env.REACT_APP_API_CALL;

export const customerid = 1;

let required = true;

export const getOrgFindById= async (data) => { 
  try { 
    const getDL_ENDPOINT = `${domain}api/customer/${customerid}`;
    const response = await axios.get(getDL_ENDPOINT);
    return response.data;
  } catch (error) {
    
    console.log(error);
  }
};


export const getOrgSetup= async (data) => {
     
    try { 
      const getDL_ENDPOINT = `${domain}api/customer/Orgsetup`;
      const response = await axios.post(getDL_ENDPOINT, data);
      return response.data;
    } catch (error) {
      
      console.log(error);
    }
  };

export const SaveOrgisation = async (data) => {
  try {
    const saveDocument_ENDPOINT = `${domain}api/customer/RegisterCustomer`;
    const response = await axios.post(saveDocument_ENDPOINT, data);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateOrgisation = async (data) => {
  
  try {
    const getUpdated_ENDPOINT = `${domain}api/customer/updateOrgisation`;
    const response = await axios.post(getUpdated_ENDPOINT, data);
    // 
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
 

