import axios from "axios";
const domain = process.env.REACT_APP_API_CALL;

//export const customerid = 1;

let required = true;

export const getCommercialListFind = async (data,atoken) => {
 
  try {
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
     
    const url = `${domain}api/CommercialLib/FindCommercialTerms?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(url, {headers});
    if(response?.status===200){
    
      return response?.data;
    }
    else
    {
      return "";
    }
    //return response.data;
  } catch (error) {
    
    console.log(error);
  }
};


export const getCommercialList = async (data,atoken) => {
 
  try {
    
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
     
    const url = `${domain}api/CommercialLib/Find?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(url, {headers});
    if(response?.status===200){
    
      return response?.data?.result;
    }
    else
    {
      return "";
    }
    //return response.data;
  } catch (error) {
    
    console.log(error);
  }
};



export const saveCommercialList = async (Data,FormulaFieldName,atoken) => {
 
  
  let fieldNameGroup;
  // if(FormulaFieldName && Array.isArray(FormulaFieldName) && FormulaFieldName.length>0){
  //     fieldNameGroup =FormulaFieldName?.join(",")
  // }
  // else{
  //     fieldNameGroup =FormulaFieldName
  // }



  if (FormulaFieldName && Array.isArray(FormulaFieldName) && FormulaFieldName.length > 0) {
    fieldNameGroup = FormulaFieldName.join(",");
  } else {
  
    if (Array.isArray(FormulaFieldName)) {
      fieldNameGroup = ""; 
    } else {
      fieldNameGroup = FormulaFieldName || ""; 
    }
  }
  
let data={
   customerId: Data?.customerid,
  libraryName:Data?.libraryName,
  libraryEntity: Data?.libraryEntity,
  libraryId: Data?.libraryId,
  name: Data?.name,
  fieldName: Data?.fieldName,
  currencyType:Data?.currencyType,
  eventtype: Data?.eventtype,
  level: Data?.level, 
  commValue: parseFloat(Data.commValue),
  valuetype: Data?.valuetype,
  formulavalue: Data?.formulavalue,
  fieldNameGroup:fieldNameGroup,
  isdefault: Data?.isdefault,
  isActive: Data?.isActive,
  isGrandTotal:Data?.isGrandTotal,
  orderseq: Data?.orderseq,
  
}
  try {
    const url = `${domain}api/CommercialLib/Add`;
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

export const getCommLibList = async(data,atoken) => { 
 try {  
  const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
    
   const getPO_ENDPOINT = `${domain}api/CommercialLib/Find?LibraryId=${data.LibraryId}`;
   const headers = {
            accept: "application/json",
             "Content-Type": "application/json",
            Authorization: `Bearer ${atoken}`,
         };
   const response = await axios.get(getPO_ENDPOINT,{ headers });
   
   if(response?.status===200){  
    console.log("data api",response?.data?.result)
     return response?.data?.result;
   }
  
 } catch (error) { 
   console.log(error);
 }
}

export const GetTablesColumns = async (data, atoken) => {
  try { 
    const headers = {
      accept: "application/json",
       "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
   };
    const saveDocument_ENDPOINT = `${domain}api/CommercialLib/GetTableColumns?customerid=${data.customerid}&eventtype=${data.eventtype}`;
    const response = await axios.get(saveDocument_ENDPOINT, {headers});

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateCommercial = async (Data,id,FormulaFieldName,atoken) => { 
  let fieldNameGroup;

  if (FormulaFieldName && Array.isArray(FormulaFieldName) && FormulaFieldName.length > 0) {
    fieldNameGroup = FormulaFieldName.join(",");
  } else {
  
    if (Array.isArray(FormulaFieldName)) {
      fieldNameGroup = ""; 
    } else {
      fieldNameGroup = FormulaFieldName || ""; 
    }
  }
  
  let data ={
    id: id,
    libraryName: Data?.libraryName,
    libraryId: Data?.libraryId,
    libraryEntity: Data?.libraryEntity,
     name: Data?.name,
     fieldName: Data?.fieldName,
    eventtype: Data?.eventtype,
    currencyType:Data?.currencyType,
   level: Data?.level,
   commValue: parseFloat(Data?.commValue),
   valuetype: Data?.valuetype,
  formulavalue:Data?.formulavalue,
  fieldNameGroup:fieldNameGroup,
  isdefault: Data?.isdefault,
  isActive: Data?.isActive,
  isGrandTotal:Data?.isGrandTotal,
  orderseq: Data?.orderseq,
  };
  
  try {
    const url = `${domain}api/CommercialLib/Update`;
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

export const getMenuMaster =async(data,atoken) => { 
  var eventsetvalue="";
  
  if(data?.MenuType!=null && data?.MenuType!=undefined)
  {
   
  }

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
export const getPurchaseOrgList = async(data,atoken) => {
   
  try {
     
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

    const url = `${domain}api/OrgMaster/Find?${queryParams}`;

          const headers = {
            accept: "application/json",
              "Content-Type": "application/json",
             Authorization: `Bearer ${atoken}`,
          };
    const response = await axios.get(url,{ headers });
    if(response?.status===200){ 
      return response?.data?.result;
    }
   
  } catch (error) { 
    console.log(error);
  }
}
export const OrgGroupMasterList = async(data,atoken) => {
  
 try {

  const queryParams = Object.entries(data)
  .filter(([key, value]) => value !== null && value !== undefined && value !== '')
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join('&');

   const getPO_ENDPOINT = `${domain}api/OrgGroupMaster/Find?${queryParams}`;
   const headers = {
            accept: "application/json",
             "Content-Type": "application/json",
            Authorization: `Bearer ${atoken}`,
         };
   const response = await axios.get(getPO_ENDPOINT,{ headers });
   
   if(response?.status===200){ 
     
    //console.log("data api",response?.data?.result)
     return response?.data?.result;
   }
  
 } catch (error) { 
   console.log(error);
 }
}


export const UOMMasterList = async(data,atoken) => {
  
  
 try { 
  const queryParams = Object.entries(data)
  .filter(([key, value]) => value !== null && value !== undefined && value !== '')
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join('&');
  
   const getPO_ENDPOINT = `${domain}api/UOM/Find?${queryParams}`;
   const headers = {
            accept: "application/json",
             "Content-Type": "application/json",
            Authorization: `Bearer ${atoken}`,
         };
   const response = await axios.get(getPO_ENDPOINT,{ headers });
   
   if(response?.status===200){ 
     
    //console.log("data api",response?.data?.result)
     return response?.data?.result;
   }
  
 } catch (error) { 
   console.log(error);
 }
}

