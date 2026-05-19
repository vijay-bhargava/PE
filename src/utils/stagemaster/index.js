import axios from "axios"; 
import { saveWorkflow } from "../workflow";
import { toast } from "react-toastify";
const domain = process.env.REACT_APP_API_CALL;


export const StageFindAll = async (data,atoken) => {

    try {
  
      const queryParams = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

      const url = `${domain}api/EventStage/EventStageFind?${queryParams}`;
      const headers = {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${atoken}`,
      };
      const response = await axios.get(url, {headers});
      if(response?.status===200){
        return response?.data?.result;
      }
      //return response.data;
    } catch (error) {
      console.log(error);
    }
};
  
export const stageMaster = async (data,atoken) => {

    try {
  
      const queryParams = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

      const url = `${domain}api/EventStage/find?${queryParams}`;
      const headers = {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${atoken}`,
      };
      const response = await axios.get(url, {headers});
      if(response?.status===200){
        return response?.data?.result;
      }
      //return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const AddStage = async (Data,atoken) => {
   
    let data={
            id: 0,
            stageName: Data?.stageName,
            stageSeq: parseInt(Data?.stageSeq),
            eventType: Data?.eventType,
            parentId: Data?.parentId,
            emailId: Data?.emailId,
            wfId: Data?.wfId,
            mandatory: Data?.mandatory,
            isActive: Data?.isActive
    }
      try {
        const url = `${domain}api/EventStage/Add`;
        const headers = {
          accept: "application/json",
         // "Content-Type": "application/json",
          Authorization: `Bearer ${atoken}`,
        };
        const response = await axios.post(url, data,{headers});
    
        return response.data;
      } catch (error) {
        console.log(error);
      }
    };
  
  
    //export const AddWorkflowStage = async (Data,WFData, atoken) => {
      export const AddWorkflowStage = async (Data, WFData, atoken, actionType) => {
      
      let data={
              id: 0,
              stageName: Data?.stageName,
              stageSeq: parseInt(Data?.stageSeq),
              eventType: Data?.eventType,
              parentId: Data?.parentId,
              emailId: Data?.emailId,
              rejectedEmailId: Data?.rejectedEmailId,
              rejectedEmailEvent:Data?.rejectedEmailEvent,
              mandatory: Data?.mandatory,
              orgPurchGroup: Data?.orgPurchGroup,
              isActive: Data?.isActive
      }
        try {

          const url = `${domain}api/EventStage/Add`;
          const headers = {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${atoken}`,
          };

          const response = await axios.post(url, data,{headers});
       
          if (response?.data && actionType === "workflow") 
        //  if(response?.data)
          {
         
         // return response.data;

          /* work flow add */ 
                let datawf={
                
          //        "customerId": 1,
                  stageId: response?.data,
                  wfname: WFData?.wfname,
                  eventtype:WFData?.eventtype || '',
         
                currencyType:WFData?.currencyType,
                  emailevent:WFData?.emailevent,
                  isactive: WFData?.isactive,
                  purchorggroup: WFData?.purchorggroup,
                 // "wfapproverusers":WFData?.wfapproverusers,
                 // "approverusertype":WFData?.approverusertype,
                  wfRuleCriteria : WFData?.wfRuleCriteria
              }
                const saveWorkFlow_ENDPOINT = `${domain}api/WorkFlow/Add`;
                 
                const responseWF = await axios.post(saveWorkFlow_ENDPOINT, datawf,{headers});
               
               
            return responseWF?.data;
          }
          
          else
          {
            return response?.data;
            
          }  
           
        } catch (error) {
          console.log(error);
          // if (error.response && error.response.status === 500) {
            
          //   toast.error("Failed to add workflow stage: Entry already exists");
          // }
        }
      };
    

      export const AddOnlyWorkflow = async ( WFData, atoken) => {
        
          try {
              let datawf = {
                  stageId: WFData?.stageId, 
                  wfname: WFData?.wfname,
                  eventtype: WFData?.eventtype || '',
                  currencyType: WFData?.currencyType,
                  emailevent: WFData?.emailevent,
                  isactive: WFData?.isactive,
                  purchorggroup: WFData?.purchorggroup,
                  wfRuleCriteria: WFData?.wfRuleCriteria
              };
              const saveWorkFlow_ENDPOINT = `${domain}api/WorkFlow/Add`;
              const headers = { 
                  Authorization: `Bearer ${atoken}`
              };
              const responseWF = await axios.post(saveWorkFlow_ENDPOINT, datawf, { headers });
              return responseWF.data;
          } catch (error) {
            console.log(error);
            ;
            // if (error.response && error.response.status === 500) {
            //    // toast.error("Stage workflow already exists.");
            // } else if (error.response && error.response.status === 403) {
            //     toast.error("Permission denied. Unable to add item.");
            // } else {
            //     console.log(error);
            //     toast.error("An error occurred while adding the item.");
            // }
        }
        
      };
      
      export const UpdateWorkflowStage = async (Data,id,atoken) => {
      
        let data={
                id: id,
                customerId:Data?.customerId,
                wfname: Data?.wfname,
                //approverusertype: Data?.approverusertype,
                eventtype: Data?.eventtype,
                stageId: Data?.stageId,
                wfoverride: Data?.wfoverride,
                currencyType: Data?.currencyType,
                required: Data?.required,
                isactive: Data?.isactive,
                purchorggroup: Data?.purchorggroup,
               // wfapproverusers: Data?.wfapproverusers,
                wfRuleCriteria: Data?.wfRuleCriteria,
              }
                    
          try {
            const url = `${domain}api/Workflow/Update`;
            const headers = {
              accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${atoken}`,
            };
            
            const response = await axios.post(url, data,{headers});
             console.log("updateddata",data);
            return response.data;
          } catch (error) {
            console.log(error);
          }
};
  //created modal for workflow approver post data
 export const PostwfapproverData = (data,wfRuleId,wfid,approverType) => {
  
   if(approverType=="U"){
    return data?.map(group => {
      
      return group?.users?.map(user => {
          return {
              wfRuleId: wfRuleId, 
              wfid: wfid, 
              customerId: user.customerId,
              budgetstatus: "", 
              seqno: parseInt(group.seqno, 10),
              userid: user.designation?.id,
              username: user.name,
              useremailid: user.email,
              department: user.department?.name || "", 
              designationId: user?.designation?.id || 0,
              departmentId: user?.department?.id|| 0,
              sequenceType: group.seqType
          };
      });
  }).flat();

   }
   else{
      return data.map((group)=>{
        return {
          wfRuleId: wfRuleId, 
          wfid: wfid, 
          customerId: group?.department?.customerId,
          budgetstatus: "", 
          seqno: parseInt(group.seqno, 10),
          userid: group?.department?.id,
          username:  group?.designation?.name,
          useremailid: '',
          department: group.department?.name || "", 
          designationId: group?.designation?.id,
          departmentId: group?.department?.id,
          sequenceType: group.seqType
      }
      })
   }
   
};


    export const UpdateStage = async (Data,id,atoken) => {
    
        let data={
                id: id,
                stageName: Data?.stageName,
                stageSeq: Data?.stageSeq,
                eventType: Data?.eventType,
                parentId: Data?.parentId,
                emailId: Data?.emailId,
                wfId: Data?.wfId,
                rejectedEmailId: Data?.rejectedEmailId,
                rejectedEmailEvent:Data?.rejectedEmailEvent,
                mandatory: Data?.mandatory,
                orgPurchGroup: Data?.orgPurchGroup || [],
                isActive: Data?.isActive
        }
          try {
            const url = `${domain}api/EventStage/Update`;
            const headers = {
              accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${atoken}`,
            };
            const response = await axios.post(url, data,{headers});
          console.log("onlystageupdate",data);
            return response.data;
          } catch (error) {
            console.log(error);
          }
  };
 
  export const ReversePostwfapproverData = (flatData) => {
    // Create a map to aggregate users by their group sequence number
    const groupMap = new Map();
  
    flatData.forEach(item => {
        const { seqno, userid, username, useremailid, department, designationId, departmentId, sequenceType } = item;
  
        // Ensure there's an array for the group in the map
        if (!groupMap.has(seqno)) {
            groupMap.set(seqno, {
                seqno: seqno,
                seqType: sequenceType,
                users: []
            });
        }
  
        groupMap.get(seqno).users.push({
            id: userid,
            name: username,
            email: useremailid,
            departmentName: department,
            designationId: designationId,
            departmentId: departmentId
        });
    });
  
    // Convert the map values to an array
    const groupedData = Array.from(groupMap.values());
  
    // Sort by sequence number if needed
    groupedData.sort((a, b) => a.seqno - b.seqno);
  
    return groupedData;
  };
//stages for an event
  export const StageEventFindAll = async (data,atoken) => {

    try {
  
      const queryParams = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  
      const url = `${domain}api/EventStage/EventStageFind?${queryParams}`;
      const headers = {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${atoken}`,
      };
      const response = await axios.get(url, {headers});
      if(response?.status===200){
        return response?.data?.result;
      }
      //return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  export const GetRulesColumn = async (data,atoken) => {

    try {
  
      const queryParams = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
     
      const url = `${domain}api/customer/GetEventColumns?${queryParams}`;
      const headers = {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${atoken}`,
      };
      const response = await axios.get(url, {headers});
      if(response?.status===200){
        return response.data;
      }
      //return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  