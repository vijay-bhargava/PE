import axios from "axios";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { CategoryMasterModal, createAddConModal, filequeryparam, getPayloadWithFilePath, getPayloadWithStage, removeEmptyFields } from "../common";
import { buildQueryParams } from "../purchaseRequest";


const domain = process.env.REACT_APP_API_CALL;



// to add contact details
export const register = async (Data, stagelist, currentStage, atoken) => {
  

  const comData = Data.vendorMasters;
  const companyData = {
    companyName: comData?.companyName || comData?.tradeName,
    tradeName: comData?.tradeName,
    address: comData?.address,
    country: comData?.country?.countryName,
    countryKey: comData?.country?.id.toString(),
    state: comData?.state.stateName,
    regionKey: comData?.state?.id.toString(),
    city: comData?.city?.cityName,
    zipCode: comData?.zipCode,
    taxId: comData?.taxId,
    taxIdType: comData?.taxIdType?.taxType,
    taxIdFile: comData?.taxIdFile,
    taxId2: comData?.taxId2,
    taxId2Type: comData?.taxId2Type?.taxType2,
    taxId2File: comData?.taxId2File,
    gstnStatus: comData?.gstnStatus,
    eInvoiceStatus: comData?.eInvoiceStatus,
    taxpayerType: comData?.taxpayerType,
    dialingCode: comData?.DialingCode?.dialingCode,
    phoneNumber: comData?.phoneNumber,
    vendorCategoryMappings: CategoryMasterModal(comData?.vendorCategoryMappings)
  }


  const _Data = {
    contactPerson: Data.ContactPerson,
    email: Data.Email,
    dialingCode: Data?.DialingCode?.dialingCode,
    phoneNumber: Data?.PhoneNumber,
    timeZone: Data?.TimeZone?.localeName,
    isActive: Data?.isActive,
    additionalContactDetails: Data?.additionalContactDetails.length > 0 ? Data?.additionalContactDetails : null,
    vendorMasters: [companyData]
  };
  const _data = removeEmptyFields(_Data);

  const data = getPayloadWithStage('currentStage', currentStage, stagelist, _data, 'currentStage')

  try {
    const ENDPOINT = `${domain}api/managevendors/register`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });
    toast.success("You've successfully registered!.", {
      position: toast.POSITION.TOP_CENTER,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 422) {
      toast.error("Email Id Already exist!", {
        position: toast.POSITION.TOP_CENTER,
      });
      return "";
    } else {
      // Handle other errors
      toast.error(error.response.data.Message, {
        position: toast.POSITION.TOP_CENTER,
      });
      return "";

    }
  }
};
export const editcontact = async (Data, id, cookies) => {

  const _data = {
    contactPerson: Data.ContactPerson,
    email: Data.Email,
    dialingCode: Data?.DialingCode?.dialingCode,
    phoneNumber: Data?.PhoneNumber,
    timeZone: Data?.TimeZone?.localeName,
    isActive: Data.isActive,
    additionalContactDetails: createAddConModal(Data?.additionalContactDetails)
  };
  try {

    const data = removeEmptyFields(_data);
    const ENDPOINT = `${domain}api/managevendors/${id}/editcontact`;
    const token = CryptoJS.AES.decrypt(
      cookies.patkn,
      process.env.REACT_APP_TOKEN_INCRYPT_KEY
    ).toString(CryptoJS.enc.Utf8);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.put(ENDPOINT, data, { headers });

    toast.success("Data updated successfully!", {
      position: toast.POSITION.TOP_CENTER,
    });
    return response.data;
  } catch (error) {
    console.log(error);

    if (error.response && error.response.status === 422) {
      toast.error(error.response.data.Message, {
        position: toast.POSITION.TOP_CENTER,
      });
      return "";
    } else {
      // Handle other errors
      console.error("Unexpected error:", error.message);
      //throw error; // Rethrow the error to be caught by the calling code
    }
  }
};



export const getvendor = async (data, id, cookies) => {

  try {
    console.log(data);
    const ENDPOINT = `${domain}api/managevendors/${id}/getvendor`;
    const token = CryptoJS.AES.decrypt(
      cookies.patkn,
      process.env.REACT_APP_TOKEN_INCRYPT_KEY
    ).toString(CryptoJS.enc.Utf8);
    const headers = {
      accept: "application/json",
      // "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(ENDPOINT, { headers });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const registervendor = async (Data, id, stagelist, cookies) => {
  if (Data?.taxIdType && !Data?.taxId) {
    if (Data?.taxIdType?.taxType != 'UNRG') {
      toast.error('Please fill Tax id', {
        position: toast.POSITION.TOP_CENTER,
      });
      return '';
    }
    else {
      if (!Data?.taxId2) {
        toast.error('Please fill Tax id 2', {
          position: toast.POSITION.TOP_CENTER,
        });
        return '';

      }
    }
  }

  const __data = {
    companyName: Data?.companyName,
    tradeName: Data?.tradeName,
    address: Data?.address,
    country: Data?.country?.countryName,
    countryKey: Data?.country?.id.toString(),
    state: Data?.state.stateName,
    regionKey: Data?.state?.id.toString(),
    city: Data?.city?.cityName,
    zipCode: Data?.zipCode,
    taxId: Data?.taxId,
    taxIdType: Data?.taxIdType?.taxType,
    taxIdFile: Data?.taxIdFile,
    taxId2: Data?.taxId2,
    taxId2Type: Data?.taxId2Type?.taxType2 || '',
    taxId2File: Data?.taxId2File,
    gstnStatus: Data?.gstnStatus,
    eInvoiceStatus: Data?.eInvoiceStatus,
    taxpayerType: Data?.taxpayerType,
    dialingCode: Data?.DialingCode?.dialingCode,
    phoneNumber: Data?.phoneNumber,    
    defaultCurrency: Data?.defaultCurrency,
  }
  const _data = removeEmptyFields(__data);
  // let data=getPayloadWithStage('stageName','RegistrationInitiated',stagelist,_data,'stageSeq')

  try {
    const ENDPOINT = `${domain}api/managevendors/${id}/registerSupplier`;
    const token = CryptoJS.AES.decrypt(
      cookies.patkn,
      process.env.REACT_APP_TOKEN_INCRYPT_KEY
    ).toString(CryptoJS.enc.Utf8);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(ENDPOINT, _data, { headers });
    return response.data;
  } catch (error) {

    console.log(error);
  }
};

export const updatevendor = async (Data, id, cookies) => {
  if (Data?.taxIdType && !Data?.taxId) {
    if (Data?.taxIdType?.taxType != 'UNRG') {
      toast.error('Please fill Tax id', {
        position: toast.POSITION.TOP_CENTER,
      });
      return '';
    }
    else {
      if (!Data?.taxId2) {
        toast.error('Please fill Tax id 2', {
          position: toast.POSITION.TOP_CENTER,
        });
        return '';

      }
    }



  }
  const _data = {
    companyName: Data?.companyName,
    tradeName: Data?.tradeName,
    address: Data?.address,
    country: Data?.country?.countryName,
    countryKey: Data?.country?.id.toString(),
    state: Data?.state?.stateName || null,
    regionKey: Data?.state?.id.toString() || null,
    city: Data?.city?.cityName,
    zipCode: Data?.zipCode,
    taxId: Data?.taxId,
    taxIdType: Data?.taxIdType?.taxType,
    taxIdFile: Data?.taxIdFile,
    taxId2: Data?.taxId2,
    taxId2Type: Data?.taxId2Type?.taxType2,
    taxId2File: Data?.taxId2File,
    gstnStatus: Data?.gstnStatus,
    eInvoiceStatus: Data?.eInvoiceStatus,
    taxpayerType: Data?.taxpayerType,
    dialingCode: Data?.DialingCode?.dialingCode,
    phoneNumber: Data?.phoneNumber, 
    defaultCurrency: Data?.defaultCurrency,
    // vendorCategoryMappings:CategoryModal( Data?.vendorCategoryMappings)
  } 
  const data = removeEmptyFields(_data);
  try {
    const getUpdated_ENDPOINT = `${domain}api/managevendors/${id}/updatevendor`;
    const token = CryptoJS.AES.decrypt(
      cookies.patkn,
      process.env.REACT_APP_TOKEN_INCRYPT_KEY
    ).toString(CryptoJS.enc.Utf8);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.put(getUpdated_ENDPOINT, data, { headers });

    return response.data;
  } catch (error) {
    console.log(error);
    toast.error(error?.response?.data?.Message ?? '', {
      position: toast.POSITION.TOP_CENTER,
    });

  }
};

export const BankDetailsAdd = async (Data, id, bankfile, atoken) => {


  let path;
  let data;
  if (bankfile) {
    const filedata = filequeryparam({ EventType: `bankinginfo`, EventId: id, Description: `${Data.bankAccountNumber}` });
    path = await uploadFilesOnAzure(filedata, bankfile, atoken);
    data = getPayloadWithFilePath('cancelledCheckFile', path, Data);

  }
  else {
    data = Data;
  }


  try {
    const ENDPOINT = `${domain}api/managevendors/${id}/addbank`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.post(ENDPOINT, data, { headers });
    return response.data;
  }
  catch (error) {
    console.log(error);
  }
};

export const FindParticipantAll = async (data, atoken) => {

  const queryParams = Object.entries(data)
    .filter(
      ([key, value]) => value !== null && value !== undefined && value !== ""
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  try {
    console.log(data);

    const ENDPOINT = `${domain}api/managevendors?${queryParams}`;


    const headers = {
      accept: "application/json",
      // "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.get(ENDPOINT, { headers });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const BankDetailsUpdate = async (Data, selectedcompanyId, bankfile, id, uploadedFileName, atoken) => {

  let path;
  let data;

  if (bankfile) {
    const filedata = filequeryparam({ EventType: `bankinginfo`, EventId: selectedcompanyId, Description: `${Data.bankAccountNumber}` });
    path = await uploadFilesOnAzure(filedata, bankfile, atoken);
    data = getPayloadWithFilePath('cancelledCheckFile', path, Data);

  }
  else {

    data = getPayloadWithFilePath('cancelledCheckFile', uploadedFileName ?? '', Data);



  }



  try {
    const getUpdated_ENDPOINT = `${domain}api/managevendors/${id}/updatebank`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.put(getUpdated_ENDPOINT, data, { headers });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const FinanceDetailsAdd = async (Data, id, financefile, atoken) => {

  let path;
  let data;
  if (financefile) {
    const filedata = filequeryparam({ EventType: `financeinfo`, Description: `financeturnover` });
    path = await uploadFilesOnAzure(filedata, financefile, atoken);
    data = getPayloadWithFilePath('attachmentName', path, Data);

  }
  else {
    data = Data;
  }

  try {
    const ENDPOINT = `${domain}api/managevendors/${id}/addfin`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });

    return response.data;
  } catch (error) {

    console.log(error);
  }
};

export const FinancialDetailsUpdate = async (Data, selectedcompanyId, financefile, id, uploadedFileName, atoken) => {

  let path;
  let data;
  if (financefile) {
    const filedata = filequeryparam({ EventType: `financeinfo`, Description: `financeturnover` });
    path = await uploadFilesOnAzure(filedata, financefile, atoken);
    data = getPayloadWithFilePath('attachmentName', path, Data);

  }
  else {
    data = getPayloadWithFilePath('attachmentName', uploadedFileName, Data);

  }

  try {
    const getUpdated_ENDPOINT = `${domain}api/managevendors/${id}/updatefinance`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.put(getUpdated_ENDPOINT, data, { headers });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const FindBankDetailsAll = async (id, cookies) => {
;
  try {


    const ENDPOINT = `${domain}api/managevendors/${id}/getbank`;

    const token = CryptoJS.AES.decrypt(
      cookies.patkn,
      process.env.REACT_APP_TOKEN_INCRYPT_KEY
    ).toString(CryptoJS.enc.Utf8);
    const headers = {
      accept: "application/json",
      // "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(ENDPOINT, { headers });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const FindFinancialDetailsAll = async (id, atoken) => {

  try {


    const ENDPOINT = `${domain}api/managevendors/${id}/getfinance`;
    const token = atoken;
    const headers = {
      accept: "application/json",
      // "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axios.get(ENDPOINT, { headers });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const VendorInvite = async (data, cookies) => {


  try {

    const ENDPOINT = `${domain}api/managevendors/invitevendor`;
    const token = CryptoJS.AES.decrypt(
      cookies.patkn,
      process.env.REACT_APP_TOKEN_INCRYPT_KEY
    ).toString(CryptoJS.enc.Utf8);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });

    return response.data;
  } catch (error) {
    console.log(error);

  }
};
export const replaceMultipleDotsExceptExtension = (fileName) => {
  // Split the file name into base name and extension
  const [baseName, extension] = fileName.split(".");
  const modifiedBaseName = baseName.replace(/\./g, "_");
  const modifiedFileName = `${modifiedBaseName}.${extension}`;
  return modifiedFileName;
};
export const uploadFilesOnAzure = async (data, file, atoken) => {

  try {
    //to create dynamic query
    const queryParams = Object.entries(data)
      .filter(
        ([key, value]) => value !== null && value !== undefined && value !== ""
      )
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    const filename = replaceMultipleDotsExceptExtension(file.name);
    //to append file to formData;
    const formData = new FormData();
    formData.append("file", file, filename);
    const RequestedBy = "Customer";

    const url = `${domain}api/BlobStorage/${RequestedBy}?${queryParams}`;

    const headers = {
      accept: "multipart/form-data",
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await axios.post(url, formData, { headers });

    return res.data.result?.blobName;
    // if(res?.data?.statusCode===200){
    // toast('Your file is uploaded successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
    // return res?.data?.result;
    // }
  } catch (error) {
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, {
        hideProgressBar: true,
        autoClose: 1000,
        type: "error",
      });
    }
    return "";
  }
};

export const uploadFilesOnAzureURL = async (data, file, atoken) => {

  try {
    //to create dynamic query
    const queryParams = Object.entries(data)
      .filter(
        ([key, value]) => value !== null && value !== undefined && value !== ""
      )
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    const filename = replaceMultipleDotsExceptExtension(file.name);
    //to append file to formData;
    const formData = new FormData();
    formData.append("file", file, filename);
    const RequestedBy = "Customer";

    const url = `${domain}api/BlobStorage/${RequestedBy}?${queryParams}`;

    const headers = {
      accept: "multipart/form-data",
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${atoken}`,
    };

    const res = await axios.post(url, formData, { headers });

    return res.data.result?.blobURL;
    // if(res?.data?.statusCode===200){
    // toast('Your file is uploaded successfully', { hideProgressBar: true, autoClose: 2000, type: 'success' })
    // return res?.data?.result;
    // }
  } catch (error) {
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, {
        hideProgressBar: true,
        autoClose: 1000,
        type: "error",
      });
    }
    return "";
  }
};


//to fetch Datagrid of invited vendors
// export const getInvitedvendor = async (queryParams, atoken) => {
// ;
//   try {

//     const ENDPOINT = `${domain}api/managevendors/vendorinvites?${queryParams}`;

//     const headers = {
//       accept: "application/json",
//       // "Content-Type": "application/json",
//       Authorization: `Bearer ${atoken}`,
      
//     };
//     const response = await axios.get(ENDPOINT, { headers });

//     return response.result;
//   } catch (error) {
//     console.log(error);
//   }
// };
export const getInvitedvendor = async (data, atoken, pageNumber=1, pageSize=10) => {
  ;
	try {
		// Add pagination to query params
		const paginationParams = {
			...data,
			pageNumber,
			pageSize
		};
		const queryParams = buildQueryParams(paginationParams);

		const ENDPOINT = `${domain}api/managevendors/vendorinvites?${queryParams}`;

		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${atoken}`,
		};

		const response = await axios.get(ENDPOINT, { headers });

		return response.result; // or response?.data?.result based on your API
	} catch (error) {
		console.log(error);
	}
};


// to remove Bank
export const removebank = async (vendorId, bankingId, atoken) => {
  try {
    const ENDPOINT = `${domain}api/managevendors/${vendorId}/removebank/${bankingId}`;

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
 ;
    const response = await axios.put(ENDPOINT, null, { headers });

    toast.success("Bank removed successfully!", {
      position: toast.POSITION.TOP_CENTER,
    });

    return response.data;
  } catch (error) {
    console.error("Error removing bank:", error);

    if (error.response && error.response.status === 422) {
      toast.error(error.response.data.Message, {
        position: toast.POSITION.TOP_CENTER,
      });
      return "";
    } else {
      toast.error("An unexpected error occurred.", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }
};


// export const removebank = async (vendorid, bankid, atoken) => {

//   try {
//     const ENDPOINT = `${domain}api/managevendors/${vendorid}/removebank/${bankid}`;

//     const headers = {
//       accept: "application/json",
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${atoken}`,
//     };

//     const response = await axios.put(ENDPOINT, { headers });

//     toast.success("bank details updated successfully!", {
//       position: toast.POSITION.TOP_CENTER,
//     });
//     return response.data;
//   } catch (error) {
//     console.log(error);

//     if (error.response && error.response.status === 422) {
//       toast.error(error.response.data.Message, {
//         position: toast.POSITION.TOP_CENTER,
//       });
//       return "";
//     } else {
//       // Handle other errors
//       console.error("Unexpected error:", error.message);
//       // throw error; // Rethrow the error to be caught by the calling code
//     }
//   }
// };

// to remove finance
export const removefinance = async (vendorid, financeid, atoken) => {

  try {
    const ENDPOINT = `${domain}api/managevendors/${vendorid}/removefinance/${financeid}`;


    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.put(ENDPOINT, { headers });

    toast.success("finance details removed successfully!", {
      position: toast.POSITION.TOP_CENTER,
    });
    return response.data;
  } catch (error) {
    console.log(error);

    if (error.response && error.response.status === 422) {
      toast.error(error.response.data.Message, {
        position: toast.POSITION.TOP_CENTER,
      });
      return "";
    } else {
      // Handle other errors
      console.error("Unexpected error:", error.message);
      //throw error; // Rethrow the error to be caught by the calling code
    }
  }
};

//bulkregistration
export const bulkregister = async (data, atoken) => {


  try {
    const ENDPOINT = `${domain}api/managevendors/bulkregister`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.post(ENDPOINT, data, { headers });
    toast.success("Data save successfully!", {
      position: toast.POSITION.TOP_CENTER,
    });


    return response.data;
  } catch (error) {

    console.log(error);
  }
};


export const VendorApproveReject = async (Data,  atoken) => {
;
  // let data = getPayloadWithStage( Data )
  try {

    const ENDPOINT = `${domain}api/ApprovalAction/ApprovalAction`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, Data, { headers });
    Data.isApproved == true ? toast.success("Vendor approved successfully!", {
      position: toast.POSITION.TOP_CENTER,
    }) :
      toast.success("Vendor rejected successfully!", {
        position: toast.POSITION.TOP_CENTER,
      });
    return response.data;
  } catch (error) {
    console.log(error);

  }
};
