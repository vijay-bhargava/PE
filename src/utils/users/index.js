import axios from "axios";
const domain = process.env.REACT_APP_API_CALL; 

let required = true;

export const getUserRoles = async (data,atoken) => {
 ;
  try {
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

    const url = `${domain}api/rolemanagement/roles?${queryParams}`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.get(url, {headers});
    return response.data;
  } catch (error) {
    
    console.log(error);
  }
};
      
export const getUserList = async(data,atoken) => {
 try { 
   
    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

   const getPO_ENDPOINT = `${domain}api/User/Find?${queryParams}`;
   const headers = {
            accept: "application/json",
             "Content-Type": "application/json",
            Authorization: `Bearer ${atoken}`,
         };

   const response = await axios.get(getPO_ENDPOINT,{ headers });
   
   if(response?.status===200){ 
     

     return response?.data?.result;
   }
  
 } catch (error) { 
   console.log(error);
 }
} 

export const FindUser = async (data,atoken) => {
 
  try {

    const queryParams = Object.entries(data)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

    const url = `${domain}api/User/Find?${queryParams}`;
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

export const AddUser = async (Data,atoken) => {
 ;
  let data={
          id: 0,
          name: Data?.name,
          managerName:Data?.managerName,
          orgId:Data?.orgId,
          orgName:Data?.orgName,
          designationId: Data?.designationId,
          designation: Data?.designation,
          busUnitId: Data?.busUnitId,
          businessUnitName: Data?.businessUnitName,
          departmentId:Data?.departmentId,
          departmentName:Data?.departmentName,
          email: Data?.email,
          phoneNumber: Data?.phoneNumber,
          dialingCode:Data?.dialingCode,
          managerId:Data?.managerId,
          isActive: Data?.isActive,
          timeZone:Data?.timeZone?.localeName,
          timezoneid:Data?.timezoneid,
          roleId:Data?.roleId,
          roleName:Data?.roleName,
          //userDepartments:Data?.userDepartments ? Data.userDepartments.toString() : '',
          userOrgGroup: typeof Data?.userOrgGroup === 'string' && Data?.userOrgGroup ? JSON.parse(Data?.userOrgGroup) : Data?.userOrgGroup,

          //userOrgGroup:  Data?.userOrgGroup=="[]"?[]:Data?.userOrgGroup,
          // userDepartments: Data?.userDepartments,
          // userAssignDepartment: Data?.userAssignDepartment,
         // userOrgGroups: Data?.userOrgGroups,
         datePattern:Data?.datePattern,
         dateLocale:Data?.dateLocale,
         timePattern:Data?.timePattern,
         timeLocale:Data?.timeLocale,
         languagePattern:Data?.languagePattern,
          legalId:Data?.legalId,
          legalEntity:Data?.legalEntity
  }
  ;
 
    try {
      const url = `${domain}api/User/Add`;
      const headers = {
        accept: "application/json", 
        Authorization: `Bearer ${atoken}`,
      };
      ;
      const response = await axios.post(url, data, { headers });

      if (response.data) {
        
        if (response.data.error === "User already exists") {
          throw new Error("User already exists");
        } else {
          return response.data;
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.log(error);
      throw new Error("User already exists.");
    }
  };

  
  export const UpdateUser = async (Data,id,atoken) => {
    
    let data={
      id: id,
      name: Data?.name,
      managerName:Data?.managerName,
      orgId:Data?.orgId,
      orgName:Data?.orgName,
      designationId: Data?.designationId,
      departmentId:Data?.departmentId,
      departmentName:Data?.departmentName,
      busUnitId:Data?.busUnitId,
      businessUnitName: Data?.businessUnitName,
      designation: Data?.designation,
      email: Data?.email,
      phoneNumber: Data?.phoneNumber,
      dialingCode:Data?.dialingCode,
      managerId:Data?.managerId,
      isActive: Data?.isActive,
      timeZone:Data?.timeZone?.localeName,
      timezoneid:Data?.timezoneid,
      roleId:Data?.roleId,
      roleName:Data?.roleName,
      // userDepartments:Data?.userDepartments,
      // userAssignDepartment: Data?.userAssignDepartment,
      legalId:Data?.legalId,
      legalEntity:Data?.legalEntity,
      userOrgGroup: typeof Data?.userOrgGroup === 'string' && Data?.userOrgGroup ? JSON.parse(Data?.userOrgGroup) : Data?.userOrgGroup,
      //userOrgGroup:  Data?.userOrgGroup=="[]"?[]:Data?.userOrgGroup,
     // userOrgGroups: Data?.userOrgGroups
     datePattern:Data?.datePattern,
        dateLocale:Data?.dateLocale,
        timePattern:Data?.timePattern,
        timeLocale:Data?.timeLocale,
        languagePattern:Data?.languagePattern
}

        try {
          const url = `${domain}api/User/Update`;
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
export const UpdateProfile = async (Data,id,atoken) => {
    
  
      let data={
        id: id,
        name: Data?.name,
        managerName:Data?.managerName,
        orgId:Data?.orgId,
        orgName:Data?.orgName,
        designationId: Data?.designationId,
        departmentId:Data?.departmentId,
        departmentName:Data?.departmentName,
        busUnitId:Data?.busUnitId,
        businessUnitName: Data?.businessUnitName,
        designation: Data?.designation,
        email: Data?.email,
        phoneNumber: Data?.phoneNumber,
        dialingCode:Data?.dialingCode,
        managerId:Data?.managerId,
        isActive: Data?.isActive,
        timeZone:Data?.timeZone,
        roleId:Data?.roleId,
        roleName:Data?.roleName,
        // userDepartments:Data?.userDepartments,
        // userAssignDepartment: Data?.userAssignDepartment,
        legalId:Data?.legalId,
        legalEntity:Data?.legalEntity,
        userOrgGroup:  Data?.userOrgGroup,
        userOrgGroups: Data?.userOrgGroups
  }
  
          try {
            const url = `${domain}api/User/Update`;
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
export const UpdateUserProfile = async (id, dialingCode, phoneNumber, timeZone, atoken) => {
  let data = {
    id: id,
    phoneNumber: phoneNumber,
    dialingCode: dialingCode,
    timeZone: timeZone,
  };

  try {
    const url = `${domain}api/User/Update`;
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${atoken}`,
    };
    const response = await axios.post(url, data, { headers });
     
    return response.data;
  } catch (error) {
    console.log(error);
    throw error; // Optionally handle or throw the error
  }
};

export const AddDesignationList = async (Data,atoken) => {
  
	// var returnresult = 0;
  // for (let i = 0; i < Data.businessUnitId.length; i++) {
  let data={
          
          id: 0,
          customerId: Data?.customerId,
          name:Data?.name,
          description:Data?.description,
          departmentId:Data?.departmentId,
          departmentName:Data?.departmentName,
          businessUnitId:  Data?.businessUnitId,
          businessUnitName: Data?.businessUnitName,
          legalEntityId:Data?.legalEntityId,
          legalEntityName:Data?.legalEntityName,
          description: Data?.description,
          isActive: Data?.isActive,
      
  }
 
    try {
      const url = `${domain}api/Designation/Add`;
      const headers = {
        accept: "application/json", 
        Authorization: `Bearer ${atoken}`,
      };
      const response = await axios.post(url, data,{headers});
  
      // if (response?.status === 200) {
      //   returnresult = 
       return response?.data; //?.result;
      
    } catch (error) {
      console.log(error);
      // returnresult = 0;
    }
    // return returnresult;
  };

  export const UpdateDesignation = async (Data,id,atoken) => {
    // var returnresult = 0;
    // for (let i = 0; i < Data.businessUnitId.length; i++) {
    let data={
            
            id: id,
            customerId: Data?.customerId,
            name:Data?.name,
            description:Data?.description,
            legalEntityId:Data?.legalEntityId,
            legalEntityName:Data?.legalEntityName,
            departmentId:Data?.departmentId,
            departmentName:Data?.departmentName,
            description: Data?.description,
            businessUnitId:  Data?.businessUnitId,
            businessUnitName: Data?.businessUnitName,
            isActive: Data?.isActive,
    }
   
      try {
        const url = `${domain}api/Designation/Update`;
        const headers = {
          accept: "application/json", 
          Authorization: `Bearer ${atoken}`,
        };
        const response = await axios.post(url, data,{headers});
   
        // if (response?.status === 200) {
        //   returnresult = 
        return  response?.data; //?.result;
        
      } catch (error) {
        console.log(error);
        // returnresult = 0;
      }
    //}
      //return returnresult;
    };
export const AddDepartmentList = async (Data,atoken) => {
	// var returnresult = 0;
  // 
	// for (let i = 0; i < Data.businessUnitId.length; i++) {
     let data={
    id: 0,
   name:Data?.name,
     description: Data?.description,
    businessUnitId:  Data?.businessUnitId,
    businessUnitName: Data?.businessUnitName,
    legalEntityId:Data?.legalEntityId,
    legalEntityName:Data?.legalEntityName,
    //departmentMapBussUnit: Data?.departmentMapBussUnit,
    isActive: Data?.isActive,
}

try {
const url = `${domain}api/Department/Add`;
const headers = {
  accept: "application/json", 
  Authorization: `Bearer ${atoken}`,
};
const response = await axios.post(url, data,{headers});

return response.data;
} catch (error) {
console.log(error);

}
// }
// return returnresult;
};




  export const UpdateDepartment = async (Data,id,atoken) => {
    
    // var returnresult = 0;
    // for (let i = 0; i < Data.businessUnitId.length; i++) {

    let data={
            
            id: id,
            customerId: Data?.customerId,
            name:Data?.name,
            legalEntityId:Data?.legalEntityId,
            legalEntityName:Data?.legalEntityName,
            description: Data?.description,
            businessUnitId:  Data?.businessUnitId,
            businessUnitName: Data?.businessUnitName,
            departmentMapBussUnit: Data?.departmentMapBussUnit,
           
            isActive: Data?.isActive,
    }
   
      try {
        const url = `${domain}api/Department/Update`;
        const headers = {
          accept: "application/json", 
          Authorization: `Bearer ${atoken}`,
        };
        const response = await axios.post(url, data,{headers});
    
        return response.data;
      } catch (error) {
        console.log(error);
      
      }
    // }
    // return returnresult;
    };
export const AddRole = async (Data,atoken) => {
  ;
   let data={
           id: 0,
           name: Data?.name,
           isActive: Data?.isActive
   }
  
     try {
       const url = `${domain}api/rolemanagement/CreateRole`;
       const headers = {
         accept: "application/json", 
         Authorization: `Bearer ${atoken}`,
       };
       const response = await axios.post(url, data,{headers});
       if (response.data) {
        // Check if the response indicates that the user already exists
        if (response.data.error === "Role already exists") {
          throw new Error("Role already exists");
        } else {
          return response.data;
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.log(error);
      throw new Error("Role already exists.");
    }
  };
   export const UpdateRole = async (Data,id,atoken) => {
    
     let data={
             id: id,
             name: Data?.name,
             isActive: Data?.isActive
     }
    
       try {
         const url = `${domain}api/rolemanagement/UpdateRole`;
         const headers = {
           accept: "application/json", 
           Authorization: `Bearer ${atoken}`,
         };
         const response = await axios.post(url, data,{headers});
     
         return response.data;
       } catch (error) {
         console.log(error);
       }
     };