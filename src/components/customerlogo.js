import { Tooltip } from "@mui/material";
import React from "react";
import thirdLogo from "../assets/images/aalogo.jpg";

import fifthLogo from "../assets/images/aalogo.jpg";
import sixthLogo from "../assets/images/Jakson_Logo.png";

const CustomerLogo = ({userDetail, customersuffix}) => {
  const suffixLength = customersuffix?.length ?? 0;
  const middleIndex = Math.ceil(suffixLength / 2);



  return (
    <>
      <div className="agile-aap">
        <div className="log">
           <img src={userDetail?.logo} alt='' height={"50px"}></img>
        </div>
          </div>
          
          
     
    </>
  );
};

export default CustomerLogo;