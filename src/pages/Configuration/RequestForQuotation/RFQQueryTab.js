import React from 'react';
import QueryList from '../../CommunucationHub/QueryList';

const RFQQueryTab = ({ pageSlug, accessLevel, permissionManager }) => {
  return (
    <QueryList
      pageSlug={pageSlug}
      key="QueryList"
      accessLevel={accessLevel}
      fromEventPage={true}
      EventId={pageSlug}
      EventType="RFQ"
      permissionManager={permissionManager}
    />
  );
};

export default RFQQueryTab;
