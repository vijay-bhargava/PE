import axios from "axios";
import { toast } from "react-toastify";
import { getPayloadWithStage } from "../common";
const domain = process.env.REACT_APP_API_CALL;

export const PRManageAdd = async (data, currentStage, stagelist, atoken) => {

  let Data = getPayloadWithStage('currentStage', currentStage, stagelist, data, 'currentStage')

  try {
    const ENDPOINT = `${domain}api/PRManage/Add`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, Data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
    return error?.response?.data;
  }
}

export const PRManageUpdate = async (data, currentStage, stagelist, atoken) => {

  let Data = getPayloadWithStage('currentStage', currentStage, stagelist, data, 'currentStage')

  try {
    const ENDPOINT = `${domain}api/PRManage/Update`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, Data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error);
    return error?.response?.data;
  }
}

export const PRFinalSubmit = async (data, currentStage, stagelist, atoken) => {

  let Data = getPayloadWithStage('currentStage', currentStage, stagelist, data, 'currentStage')

  try {
    const ENDPOINT = `${domain}api/PRManage/PRSubmit`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, Data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
  }
}

export const getPRManageFind = async (data, atoken, pageNumber = 1, pageSize = 10) => {

  const paramString = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '' && value !== 0)
    .map(([key, value]) => `parameters[${key}]=${encodeURIComponent(value)}`)
    .join('&');
  try {
    const ENDPOINT = `${domain}api/PRManage/Find?${paramString}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(ENDPOINT, { headers });
    if (response?.status === 200) {
      return response?.data;
    }

  } catch (error) {
    console.log(error)
  }
}
export const getPRAdvanceFind = async (data, atoken) => {
  const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '' && value !== 0)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  try {
    const ENDPOINT = `${domain}api/PRManage/FindAdvnceSearch?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(ENDPOINT, { headers });
    if (response?.status === 200) {
      return response?.data?.result;
    }

  } catch (error) {
    console.log(error)
  }
}
export const PRItemServiceAdd = async (data, atoken) => {

  try {
    const ENDPOINT = `${domain}api/PRItemService/Add`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
  }
}

export const PRMultipleAdd = async (data, prId, atoken) => {

  try {
    const updatedData = data.map(entry => ({
      ...entry,
      prId: prId,
    }));

    const ENDPOINT = `${domain}api/PRItemService/${prId}/AddItems`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.post(ENDPOINT, updatedData, { headers });
    //const response = await axios.post(ENDPOINT, data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
  }
}

export const PRItemServiceUpdate = async (data, atoken) => {

  try {
    const ENDPOINT = `${domain}api/PRItemService/Update`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
  }
}

export const getPRItemServiceFind = async (data, atoken) => {

  const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  try {
    const ENDPOINT = `${domain}api/PRItemService/Find?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(ENDPOINT, { headers });
    if (response?.status === 200) {
      return response?.data?.result;
    }

  } catch (error) {
    console.log(error)
  }
}

export const PRItemServiceDelete = async (data, atoken) => {

  try {
    const ENDPOINT = `${domain}api/PRItemService/Delete`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
  }
}

// item category and plant api end

export const getItemCategory = async (data, atoken) => {

  const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  try {
    const ENDPOINT = `${domain}api/PRManage/GetItemCategory?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(ENDPOINT, { headers });
    if (response?.status === 200) {
      return response?.data?.result;
    }

  } catch (error) {
    console.log(error)
  }
}
export const FindItemCategory = async (data, atoken) => {

const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  try {
    const ENDPOINT = `${domain}api/ItemCategory/Find?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(ENDPOINT, { headers });
    if (response?.status === 200) {
      return response?.data?.result;
    }

  } catch (error) {
    console.log(error)
  }
}

export const FindItemType = async (data, atoken) => {
  
  const queryParams = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    try {
      const ENDPOINT = `${domain}api/ItemType/Find?${queryParams}`;
      const headers = {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${atoken}`,
      };
      
      const response = await axios.get(ENDPOINT, { headers });
      
      if (response?.status === 200) {
        return response?.data?.result;
      }

    } catch (error) {
      console.log(error)
    }
}


export const ItemCategoryAdd = async (data, atoken) => {

  try {
    const ENDPOINT = `${domain}api/ItemCategory/Add`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
  }
}



export const UpdateItemCategory = async (Data, id, atoken) => {

  try {
    const url = `${domain}api/ItemCategory/Update`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(url, Data, { headers });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

//Plant ADD
export const PlantAdd = async (data, atoken) => {

  try {
    const ENDPOINT = `${domain}api/StorageLocation/Add`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
  }
}

export const UpdatePlant = async (Data, id, atoken) => {

  try {
    const url = `${domain}api/StorageLocation/Update`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(url, Data, { headers });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}
export const getPlantStorage = async (data, atoken) => {

  const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  try {
    const ENDPOINT = `${domain}api/PRManage/GetStorageLoc?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(ENDPOINT, { headers });
    if (response?.status === 200) {
      return response?.data?.result;
    }

  } catch (error) {
    console.log(error)
  }
}
export const FindPlantStorage = async (data, atoken) => {

  const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  try {
    
    const ENDPOINT = `${domain}api/StorageLocation/Find?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(ENDPOINT, { headers });
    if (response?.status === 200) {
      return response?.data?.result;
    }

  } catch (error) {
    console.log(error)
  }
}
// item category and plant api end


//add attachement
export const PRAttachementAdd = async (data, atoken) => {
  try {
    const ENDPOINT = `${domain}api/PRAttachment/Add`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
  }
}


export const AddMultiplePRAttachments = async (data, prId, atoken) => {

  let datapost = {
    attachments: data
  }

  try {
    const ENDPOINT = `${domain}api/PRAttachment/${prId}/AddMultiple`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.post(ENDPOINT, datapost, { headers });
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(error)
  }
}

export const approvePR = async (Data, prId, stagelist, currentStage, atoken) => {

  let data = getPayloadWithStage('currentStage', currentStage, stagelist, Data, 'currentStage')
  try {

    const ENDPOINT = `${domain}api/PRManage/${prId}/PurchaseRequestApproval`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, { headers });
    Data?.status === 'Approved' ? toast.success("PR approved successfully!", {
      position: toast.POSITION.TOP_CENTER,
    }) :
      toast.success("PR rejected successfully!", {
        position: toast.POSITION.TOP_CENTER,
      });
    return response?.data;
  } catch (error) {
    console.log(error);

  }
};


export const buildQueryParams = (data) => {
  const filteredData = Object.entries(data)
    .filter(
      ([key, value]) => value !== null && value !== undefined && value !== ""
    );

  const queryParams = filteredData
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return queryParams;
};

export const buildMultiParamQueryParams = (data) => {
  const queryParams = Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined && value !== "")
    .flatMap(([key, value]) => 
      Array.isArray(value)
        ? value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
        : [`${encodeURIComponent(key)}=${encodeURIComponent(value)}`]
    )
    .join("&");

  return queryParams;
};

export const buildQueryParamsNullDefined = (data) => {
  const filteredData = Object.entries(data)
    .filter(
      ([key, value]) => value !== null && value !== undefined
    );

  const queryParams = filteredData
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return queryParams;
};

export const replaceMultipleDotsExceptExtension = (fileName) => {
  // Split the file name into base name and extension
  const [baseName, extension] = fileName.split(".");
  const modifiedBaseName = baseName.replace(/\./g, "_");
  const modifiedFileName = `${modifiedBaseName}.${extension}`;
  return modifiedFileName;
};

export const uploadFilesOnAzurePR = async (data, file, atoken) => {

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
    ;
    console.log("response file ", res);
    if (res?.status === 200) {

      return res?.data?.result?.blobName;
    }
    else {
      return "";
    }
  } catch (error) {
    // console.log('error-- ', error);
    if (error?.response?.data?.Message) {
      toast(error?.response?.data?.Message, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "error",
      });
    }
    return "";
  }
};