import React from "react";

import {IconButton} from "@mui/material";
import {HiPencilAlt} from "react-icons/hi";

const SubCatResultCell = ({ itemin, callbackedit }) => {

  return (
    <>
      <div className="row align-items-center pt-1 pb-1 border-bottom">
        <div className="col-12 col-md-10">
          <div className="row align-items-center text-left f12 lingh14 text-muted">
            <div className="col-lg-5">
              <div className="text-truncate ms-1">{itemin?.questioncategory}</div>
            </div>
            <div className="col-lg-5 text-center">
              <div className=""> {itemin?.questionsubcategory}</div>
            </div>
            
            <div className="col-lg-2 text-end">
              <div className="text-success ms-5">{itemin?.isactive ? "Active" : "InActive"}</div>
            </div>
          </div>
        </div>
        <div className="d-flex col-12 col-md-2 align-items-center justify-content-center">
          <IconButton
            size="small"
            className="bg-white ms-5"
            onClick={() => callbackedit(itemin)}
        
          >
            <HiPencilAlt className="f17 text-primary" />
          </IconButton>

        </div>
      </div>
       
    </>
  );
};

export default SubCatResultCell;
