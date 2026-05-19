//#Description : common components defined for reuse in manageparticipants module
import { Chip, IconButton, Tooltip } from "@mui/material";
import { FaChalkboardUser } from "react-icons/fa6";
import * as React from "react";
import {
 
  HiPencilAlt,
 
  HiOutlineCash,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineUserAdd,
  HiOutlineDocumentAdd,
} from "react-icons/hi";
import { useStateValue } from "../../store";
import { RiBuildingFill } from "react-icons/ri";
import { MdAddBusiness, MdCheck, MdCheckBoxOutlineBlank, MdOutlineAddBusiness } from "react-icons/md";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const ActionCellCompany = ({ params, callbacks,accessLevel }) => {
     const location = useLocation();
    const [{ customerid }, dispatch] = useStateValue();
    const queryParams = new URLSearchParams(location.search);

  const [isExtend,setIsExtend] = useState(queryParams.get("isExtend"));
    const { callbackBankopen, callbackFinancial, callbackEditCom,callbackExtendCom } = callbacks;
  
    return (
      <>
        {accessLevel?.bankdetails?.readed !='None'?<><Tooltip title="Bank Details">
          <IconButton
            size="medium"
            className="bg-white me-1"
            onClick={() => callbackBankopen(params?.row)}
          >
            <HiOutlineOfficeBuilding className={`f20  ${params?.row.vendorBankingDetails?.length > 0 ? "text-success" : "text-muted"
              } `} />
          </IconButton>
        </Tooltip></>:<></>}
        {accessLevel?.financialdetails?.readed !='None'?<><Tooltip title="Financial Details">
          <IconButton
            size="medium"
            className="bg-white me-1"
            onClick={() => callbackFinancial(params?.row)}
          >
            <HiOutlineCash className={`f20  ${params?.row.vendorFinacialDetails?.length > 0 ? "text-success" : "text-muted"
              } `} />
          </IconButton>
        </Tooltip></>:<></>}
                        <Tooltip title="Supplier Details">
                          <IconButton size="medium" className="bg-white me-1">
                            <HiOutlineUserGroup 
                            className="f20 text-success"
                            onClick={() => callbackEditCom(params?.row)}
                            />
                          </IconButton>
                        </Tooltip>
        {isExtend=='Y' && params?.row.isMapped==false?<></>:<IconButton size="medium" className="bg-white">
          <HiPencilAlt
            className="f20 text-primary"
            onClick={() => callbackEditCom(params?.row)}
          />
        </IconButton>}

        {isExtend=='Y' && params?.row.isMapped==false ?<Tooltip title="Extend Company">
          <IconButton size="medium" className="bg-white me-1">
            <MdOutlineAddBusiness

              className="f20 text-success"
              onClick={() => callbackExtendCom(params?.row)}
            />
          </IconButton>
        </Tooltip> :isExtend=='Y' ?
        <Tooltip title="Company already extended">
          <IconButton size="medium" className="bg-white me-1">
            <MdCheck

              className="f20 text-success"
             
            />
          </IconButton>
        </Tooltip>:<></>
        }
                       </>
    )
  }
  
  // Memoized version 
  export const MemoizedActionCellCompany= React.memo(ActionCellCompany);



const ActionCellBank=({ params, callbacks })=>{
  const { callbackeditbank} = callbacks;
  return(
    <>
    <Tooltip title="Edit Bank">
        <IconButton color="primary" onClick={()=>callbackeditbank(params?.row)}>
            <HiPencilAlt className="f14"/>
        </IconButton>
    </Tooltip>
    
</>
  )
 

}
// Memoized version 
export const MemoizedActionCellBank = React.memo(ActionCellBank);



const ActionCellFinance=({ params, callbacks })=>{
  const { callbackeditfinance} = callbacks;
  return(
    <>
    <Tooltip title="Edit Finance">
        <IconButton color="primary" onClick={()=>callbackeditfinance(params?.row)}>
            <HiPencilAlt  className="f14"/>
        </IconButton>
    </Tooltip>
    
</>
  )
 

}
// Memoized version 
export const MemoizedActionCellFinance = React.memo(ActionCellFinance);