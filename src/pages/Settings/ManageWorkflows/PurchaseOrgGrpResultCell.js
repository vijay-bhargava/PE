import React from "react";
import {IconButton} from "@mui/material";
import {HiPencilAlt} from "react-icons/hi";

const PurchaseOrgGrpResultCell = ({ itemin, callbackedit }) => {

  return (
    <>
      <div className="row align-items-center pt-1 pb-1 border-bottom">
        <div className="col-12 col-md-10">
          <div className="row align-items-center text-left f12 lingh14 text-muted">
          {/* <div className="col-lg-5 ms-1">
              <div className="text-truncate ms-1">{itemin?.orgName}</div>
        </div> */}
            <div className="col-lg-5">
              <div className="text-truncate ms-1">{itemin?.groupName}</div>
            </div>
            <div className="col-lg">
              <div className="text-success">{itemin?.isActive ? "Active" : "InActive"}</div>
            </div>
          </div>
        </div>
        <div className="d-flex col-12 col-md-2 align-items-center justify-content-center">
          <IconButton
            size="small"
            className="bg-white"
            onClick={() => callbackedit(itemin)}
        
          >
            <HiPencilAlt className="f17 text-primary" />
          </IconButton>

        </div>
      </div>
       
    </>
  );
};

export default PurchaseOrgGrpResultCell;
