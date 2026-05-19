import axios from "axios";
//export const customerid = 1;
const domain = process.env.REACT_APP_API_CALL;

export const AddQuestion = async (Data,atoken) => {
  
  let data = {
        customerId: Data?.customerid,
        libraryId: Data?.libraryid, 
        libraryEntity: Data?.libraryEntity, 
        questionCategoryId: Data?.questioncategoryid, 
        questionCategory: Data?.questionCategory,
        questionSubcategoryId: Data?.questionsubcategoryid, 
        questionSubCategory: Data?.questionSubCategory,
        questionDescription: Data?.questiondescription,
        eventType: Data?.eventType,
        isMultipleChoice:Data?.isMultipleChoice,
        questionRequirement:Data?.questionRequirement,
        attachedFileName:Data?.attachedFileName,
        weightage: parseFloat(Data?.weightage),
        attachement: Data?.attachement,
        autoCalculated:Data?.autoCalculated,
        optionType: Data?.optiontype,
        mandatory: Data?.mandatory, 
        isActive: Data?.isActive,
  };

  try {
    const url = `${domain}api/QuestionsLib/Add`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(url, data,{headers});
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const UpdateQuestion = async (Data,id,atoken) => {
  let data ={
    id: id,
    customerId: Data?.customerid,
    libraryId: Data?.libraryid,
    libraryEntity: Data?.libraryEntity,
    questionCategoryId: Data?.questioncategoryid,
    questionRequirement: Data?.questionRequirement,
    questionCategory: Data?.questionCategory,
    questionSubcategoryId: Data?.questionsubcategoryid,
    questionSubCategory: Data?.questionSubCategory,
    questionDescription: Data?.questiondescription,
    attachement: Data?.attachement,
    isMultipleChoice:Data?.isMultipleChoice,
    autoCalculated:Data?.autoCalculated,
    attachedFileName:Data?.attachedFileName,
    eventType: Data?.eventType,
    optionType: Data?.optiontype,
    weightage:parseFloat(Data?.weightage),
    mandatory: Data?.mandatory,
    isActive: Data?.isActive,
  };
  try {
    const url = `${domain}api/QuestionsLib/Update`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(url, data,{headers});
    return response.data;
  } catch (error) {
    console.log(error);
  }
};



export const QuestionFindAll = async (data,atoken) => {
  try {

    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

    const url = `${domain}api/QuestionsLib/Find?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(url, {headers});
    if(response?.status===200){
      return response?.data?.result;
    }
  
  } catch (error) {
    console.log(error);
  }
};

export const AddQuestionOption = async (Data,atoken) => {
 
  let data = {
    customerId: Data?.customerid,
    questionId: Data?.questionid,
    options:Data?.options  
};
  try {
    const ENDPOINT = `${domain}api/QuestionsLib/AddQuestionOption`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(ENDPOINT, data, {headers});
    
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const GetQuestionOptions = async (data,atoken) => {
  try {
    const ENDPOINT = `${domain}api/QuestionsLib/GetQuestionOptions`;
    const response = await axios.post(ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const AddSubCategory = async (Data,atoken) => {
  ;
  let data = {
    customerId: Data?.customerId,
    questioncategory:Data?.questioncategory,
    questioncategoryid: Data?.questioncategoryid,
    questionsubcategory: Data?.questionsubcategory,
    isActive: Data?.isActive,
  };
 
  try {
    const url = `${domain}api/QSubCategory/Add`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.post(url, data,{ headers });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const UpdateSubCategory = async (Data,id,atoken) => {
  
  let data = {
    id:id,
    customerId: Data?.customerId,
    questioncategory:Data?.questioncategory,
    questioncategoryid: Data?.questioncategoryid,
    questionsubcategory: Data?.questionsubcategory,
    isActive: Data?.isActive,
  };
  try {
    const url = `${domain}api/QSubCategory/Update`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(url, data,{headers});
    return response.data;
  } catch (error) {
    console.log(error);
  }
};



export const SubCategoryFindAll = async (data,atoken) => {
  
  const queryParams = Object.entries(data)
  .filter(([key, value]) => value !== null && value !== undefined && value !== '')
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join('&');
  try {
    const url = `${domain}api/QSubCategory/Find?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(url,{headers});
    if(response?.status===200){
      return response?.data?.result;
    }
   
  } catch (error) {
    console.log(error);
  }
};

export const AddCategory = async (Data, atoken) => {
  ;
  let data = {
    id:0,
    customerId: Data?.customerId,
    questioncategory: Data?.questioncategory,
    libraryId:Data?.libraryId,
    isActive: Data?.isActive,
  };

  try {
    const url = `${domain}api/QCategory/Add`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const UpdateCategory = async (Data, id, atoken) => {
  
  let data = {
    id: id,
    customerId: Data?.customerid,
    questioncategory: Data?.questioncategory,
    libraryId:Data?.libraryId,
    isActive: Data?.isActive,
  };
  try {
    const url = `${domain}api/QCategory/Update`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.post(url, data, { headers });
    if (response.status === 204) {
      return { success: true, message: "Category updated successfully!" };
    } else {
      return { success: false, message: "Category update successfully!" };
    }
  } catch (error) {
    console.log(error);
    return { success: false, message: "Please fill the mandatory field" };
  }
};



export const CategoryFindAll = async (data,atoken) => {
  try {
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
    const url = `${domain}api/QCategory/Find?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(url,{headers});
    if(response?.status===200){
      return response?.data?.result;
    }
    //return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const LibraryFindAll = async (data,atoken) => {
  
  try {
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

    const ENDPOINT = `${domain}api/LibraryOrgEntity/Find?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(ENDPOINT,{headers});
  if(response?.status===200){
      return response?.data?.result;
    }
  } catch (error) {
    console.log(error);
  }
};

export const AddLibraryEntity = async (Data,atoken) => {
  var returnresult =0;
  for(let i=0;i<Data.eventType.length;i++){
  let data={
      id:0,
      customerId: Data?.customerid,
      libraryType:Data?.libraryType,
      eventType:Data?.eventType[i],
       libraryEntity: Data?.libraryentity,
      organisationId: Data?.organisationid,
      organisationName: Data?.organisationname,
      orgGroups: Data?.orgGroups,
      isActive: Data?.isactive,
  }
  try {
    
    const url = `${domain}api/LibraryOrgEntity/Add`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(url, data,{headers});
    if(response?.status===200){ 
      
      returnresult =response?.data; 
    }
  } catch (error) {
    returnresult =0;
    console.log(error);
  }
}
  return returnresult; 
};
export const UpdateLibrary = async (Data,id,atoken) => {
 
  var returnresult =0;
  for(let i=0;i<Data.eventType.length;i++){ 
  let data={
    "id": id,
    "customerId": Data?.customerid,
    "eventType":Data?.eventType[i],
    "libraryType":Data?.libraryType,
    "libraryEntity": Data?.libraryentity,
    "organisationId": Data?.organisationid,
    "organisationName": Data?.organisationname,
    "orgGroups": Data?.orgGroups,
    "isActive": Data?.isactive,
}
  try {
    const url = `${domain}api/LibraryOrgEntity/Update`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(url, data,{headers});
    return response.data;
  } catch (error) {
    console.log(error);
    returnresult=0;
  }
}
};

export const getPurchaseOrg = async (data) => {
  try {
    const getPO_ENDPOINT = `${domain}api/common/GetPurshaseOrg?customerId=${data.customerId}&isActive=${data.isActive}`;
    const response = await axios.get(getPO_ENDPOINT);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getPurchaseGrp = async (data) => {
  //let id=data?.id ? data.id : 1
  try {
    const getPG_ENDPOINT = `${domain}api/common/GetPurshaseOrgGrp?customerId=${data.customerId}&isActive=${data.isActive}&purchOrgId=${data.purchOrgId}`;
    //
    const response = await axios.get(getPG_ENDPOINT);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getMenuMaster =async(data,atoken) => { 
  var eventsetvalue="";
  ;
  if(data?.MenuType!=null && data?.MenuType!=undefined)
  {
     //eventsetvalue = "?MenuType="+data?.MenuType;
  }
 //console.log(eventsetvalue);
  try {   
    const url = `${domain}api/MenuMaster/Find`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };

    const response = await axios.get(url+eventsetvalue,{headers} );
    if(response?.status===200){
      return response?.data?.result;
    }
    
  } catch (error) {
      console.log(error)
  }
}
