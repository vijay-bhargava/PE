import React from 'react';
import EventCommercialScreen from '../../../components/Event/EventCommercialScreen';

const RFQCommercialTab = ({
  effectivePermissionManager,
  idFromURL,
  formik,
  stagearray,
  currentStage,
  currencyList,
  EventCommercialScreenRef,
  iscomercialeditDisabled,
}) => {
  return (
    <div>
      <EventCommercialScreen
        EventType="RFQ"
        EventId={idFromURL}
        LibraryType="CommercialLibrary"
        EventGeneralDetails={formik?.values}
        ref={EventCommercialScreenRef}
        Action={stagearray.includes(currentStage)}
        Version={formik?.values?.Version}
        currencyList={currencyList}
        commercialedit={iscomercialeditDisabled}
        permissionManager={effectivePermissionManager}
      />
    </div>
  );
};

export default RFQCommercialTab;
