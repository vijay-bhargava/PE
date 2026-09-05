// PR-specific BOQ screen — re-exports the shared BoqScreen with eventType="PR" hardcoded
import React from 'react';
import BoqScreen from '../RequestForQuotation/BoqScreen';

const PRBoqScreen = ({ idFromURL, CurrentVersion, readOnly, onUploadSuccess, stage, boqReq }) => (
  <BoqScreen
    idFromURL={idFromURL}
    eventType="PR"
    CurrentVersion={CurrentVersion}
    readOnly={readOnly}
    onUploadSuccess={onUploadSuccess}
    stage={stage}
    boqReq={boqReq}
  />
);

export default PRBoqScreen;
