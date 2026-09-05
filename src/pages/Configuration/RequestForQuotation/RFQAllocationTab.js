import React from 'react';
import EventAllocationScreen from '../../../components/Event/EventAllocationScreen';

const RFQAllocationTab = ({ idFromURL, formik, effectivePermissionManager, NFASOBRFQRef }) => {
  return (
    <EventAllocationScreen
      props={{
        eventId: idFromURL,
        nfaEventId: idFromURL,
        nfaEventType: 'RFQ',
        Version: formik?.values?.Version,
        nfaEventVersion: formik?.values?.Version,
        currentStage: 'Allocation',
        permissionManager: effectivePermissionManager,
      }}
      ref={NFASOBRFQRef}
    />
  );
};

export default RFQAllocationTab;
