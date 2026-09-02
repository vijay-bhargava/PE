import React from "react";
import POPreview from '../POPreview';

const PreviewTab = ({
  poSpecificDetails,
  allPOItems,
  atoken,
  requestCell,
  stagelist,
  customerid,
  customersuffix,
}) => {
  return (
    <div className="p-3">
      <POPreview
        poDetails={poSpecificDetails}
        poItems={allPOItems}
        atoken={atoken}
        requestCell={requestCell}
        stagelist={stagelist}
        customerid={customerid}
        customersuffix={customersuffix}
      />
    </div>
  );
};

export default PreviewTab;
