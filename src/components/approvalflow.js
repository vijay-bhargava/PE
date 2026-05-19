import React, { useEffect, useMemo, useState } from 'react';
import CustomTable from './customTable';
import { CLAIM_TYPES, ACTIONS } from '../utils/permissionManager';
 // Import the custom table component

 const EventApprovalWorkFlow = ({ approverlist, pushDeleteEventApprover, action, accessLevel, permissionManager,stagelist,eventCode,eventSubject,startDate, endDate}) => {
  const [data, setData] = useState([]);

  const handleDelete = (approverToDelete) => {
    const updatedApprovers = data.filter(item => item.uniqueId !== approverToDelete.uniqueId);
     
    // Push the delete event but keep the accordion open
    pushDeleteEventApprover(approverToDelete);
    
    // Update state with the remaining approvers
    setData(updatedApprovers);
  };

  useEffect(() => {
    if (approverlist.length > 0) {
      
      setData(approverlist);
    }
  }, [approverlist]);

  // Check REMOVE permission for delete functionality
  
  const canDelete = (permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.REMOVE) ?? false) && action;
  
  // Check EDIT permission for drag functionality
  const canDrag = (permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.EDIT) ?? false) && action;

  return (
    <CustomTable
      data={data}
      onDelete={canDelete ? handleDelete : null}
      canDrag={canDrag}
      accessLevel={accessLevel}
      stagelist={stagelist}
      eventCode={eventCode}
      eventSubject={eventSubject}
      startDate={startDate}
      endDate={endDate}
    />
  );
};
export default EventApprovalWorkFlow;
