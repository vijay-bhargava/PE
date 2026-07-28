import React from 'react';
import ERFQComparative from './ERFQComparative';

const RFQComparativeTab = ({
  idFromURL,
  accessLevel,
  handleTab,
  headerActionsRef,
  onSubTabChange,
  // actions object props
  categoryList,
  selectedSupplier,
  formik,
  activityId,
  actionType,
  handleDraftEvent,
  openQuotes,
  EventHeaderDetails,
  approvershow,
  handleApprover,
  purchaseAllList,
  purchaseGroupAllList,
  currentStage,
  handlefilteredSupplier,
  stagelist,
  inputList,
  updatesupplieronloading,
  stagearray,
  handleSelectedSupplier,
  handleLoadingFactorClick,
  handleSupplierAction,
  clearSelectedSupplier,
  pageSS,
  pageCount,
  totalpageSS,
  handlePaginationSS,
  issupplierraccesslevel,
  handleLoadingFactorNew,
  isUpdated,
  permissionManager,
}) => {
  return (
    <ERFQComparative
      key="ERFQComparative"
      accessLevel={accessLevel}
      handleTab={handleTab}
      headerActionsRef={headerActionsRef}
      onSubTabChange={onSubTabChange}
      actions={{
        rfqid: idFromURL,
        categoryList: categoryList,
        selectedsupplier: selectedSupplier,
        enddate: formik?.values?.endDate?.toISOString(),
        activityId: activityId,
        actionType: actionType,
        handleDraftEvent: handleDraftEvent,
        rfqtype: formik?.values?.RFQType,
        sealedBid: openQuotes,
        EventHeaderDetails: EventHeaderDetails,
        approvershow: approvershow,
        handleApprover: handleApprover,
        rfqheaderversion: formik?.values?.Version,
        purchaseAllList: purchaseAllList,
        purchaseGroupAllList: purchaseGroupAllList,
        currentStage: currentStage,
        filteredSupplier: handlefilteredSupplier,
        stagelist: stagelist,
        eventSubject: formik?.values?.subject,
        inputList: inputList,
        purchOrgId: formik?.values?.purchOrgId,
        purchGrpId: formik?.values?.purchGrpId,
        updatesupplieronloading: updatesupplieronloading,
        stagearray: stagearray,
        handleSelectedSupplier: handleSelectedSupplier,
        handleLoadingFactorClick: handleLoadingFactorClick,
        handleSupplierAction: handleSupplierAction,
        clearSelectedSupplier: clearSelectedSupplier,
        pageSS: pageSS,
        pageCount: pageCount,
        totalpageSS: totalpageSS,
        handlePaginationSS: handlePaginationSS,
        issupplierraccesslevel: issupplierraccesslevel,
        versionhistory: EventHeaderDetails?.versionhistory,
        RFQVersionHistory: formik?.values?.RFQVersionHistory,
        handleLoadingFactorNew: handleLoadingFactorNew,
        isUpdated: isUpdated,
        permissionManager: permissionManager,
        isNFA: false,
      }}
    />
  );
};

export default RFQComparativeTab;
