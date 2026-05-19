import { Chip, IconButton, Tooltip } from "@mui/material";
import * as React from "react";
import {
  HiOutlineTrash,
  HiOutlineUserAdd,
  HiX,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiPencilAlt,
  HiOutlineEye,
  HiOutlineCash,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { Button, Dropdown, OverlayTrigger, Popover } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getvendor } from "../../../utils/manageParticipants";
import { Cookies, useCookies } from "react-cookie";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { MemoizedActionCellCompany } from "../../../utils/manageParticipants/component";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { ApiClient, api } from "../../../Apiclient";
import { useStateValue } from "../../../store";
import NotFoundPage from "../../../components/NotAllowed";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";

const ParticipantsCompanyDetails = ({
  accessLevel,
  callbackBank,
  callbackfinancial,
  item,
  callbackeditCom,
  callbackBankopen,
  callbackExtendCom,
  contactID,
  vendorSpecificData,
  handleVendorSpecificData,
  callbackSQEData,
  callbackSQEDatashow,
  movetoSQEClick
}) => {
  const [
    { atoken, rtoken, customerid,customersuffix, usertimezone, userdialingcode },
    dispatch,
  ] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [cookies] = useCookies(["patkn", "prtkn"]);
  //const [contactID, setContactID] = useState(0);
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(!open);
  };

  const location = useLocation();
  //const [rowss, setCrow] = useState([]);


  // Re-run effect when vendorSpecificData changes
  useEffect(() => {

    fetchCompany()


  }, [vendorSpecificData])

  const fetchCompany = async () => {

    const res = await apiClient.get(
      `/api/managevendors/${contactID}/getvendor`,

      atoken
    );

    //setCrow(res);
    setRecorddata(res);
  }


  const columns = [
    {
      field: 'companyName', headerName: 'Company Name', flex: 1,
      renderCell: (params) => {

        return (
          params?.row?.gstnStatus ? <>
            {params?.formattedValue}
            <Tooltip title="Tax Verified">
              <IconButton size="medium" className="bg-white me-1">
                <MdOutlineVerifiedUser className="f20 text-success" />
              </IconButton>
            </Tooltip>
          </>
            : params?.formattedValue)
      }
    },
    { field: 'address', headerName: 'Address', flex: 2 },
    {
      field: 'taxId', headerName: 'Tax Identification Number', flex: 1,
    },
    {
      field: 'sqeHeader', headerName: 'SQE Status', flex: 1,
      renderCell: (params) => (
        params.value ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSQEStatusClick(params.row.id)}
            style={{ fontSize: '13px', color: '#1976d2', textDecoration: 'underline' }}
          >
            {params.value}
          </Button>
        ) : (
          <span
            onClick={() => handlesqeclick([params.row.id])}
            style={{ fontSize: '13px', color: 'red', textDecoration: 'underline', cursor: 'pointer' }}           >
            Not Initiated
          </span>
        )
      )
    },

    {
      field: 'actions', headerName: 'Actions', flex: 2, cellClassName: 'overflow-visible justify-content-centre',
      renderCell: (params) => {

        return (
          <MemoizedActionCellCompany

            params={params}
            callbacks={{
              callbackBankopen: callbackBankopen,
              callbackFinancial: callbackfinancial,
              callbackEditCom: callbackeditCom,
              callbackExtendCom: callbackExtendCom
            }}
            accessLevel={accessLevel}
          />
        )
      }
    },
  ]

  const handlesqeclick = (ids) => {
    
    const selectedItems = recorddata.filter((x) => ids.includes(x.id));
    
    movetoSQEClick(selectedItems);
  };

  const handleSQEStatusClick = (value) => {
    const selectedItem = recorddata?.find((item) => item.id === value);
    if (selectedItem) {
      // Perform your callback with the selected item
      callbackSQEDatashow([selectedItem]);

    } else {
      console.log(`No item found with id ${value}`);
    }
  }
  const [gridloading, Gridloading] = useState(false);
  const [rowCell, setRowCell] = useState(null);
  const handleRowClick = (params) => {

    setRowCell(params?.row);
  };
  const handleCellClick = (params) => {
    if (params?.field == 'optiontype') {

    }
  }

  const [recorddata, setRecorddata] = useState([]);
  const getRowId = (row) => {

    return row?.id;
  }


  const rows = recorddata?.map((item) => ({
    id: item?.id,
    companyName: item?.companyName,
    address: item?.address,
    taxId: item?.taxId,
    sqeHeader: item?.sqeHeader[0]?.stage || "",
    tradeName: item?.tradeName,
    country: item?.country,
    countryKey: item?.countryKey,
    state: item?.state,
    regionKey: item?.regionKey,
    city: item?.city,
    zipCode: item?.zipCode,
    taxIdType: item?.taxIdType,
    taxId2: item?.taxId2,
    gstnStatus: item?.gstnStatus,
    eInvoiceStatus: item?.eInvoiceStatus,
    taxpayerType: item?.taxpayerType,
    createdByName: item?.createdByName,
    modifiedByName: item?.modifiedByName,
    phoneNumber: item?.phoneNumber,
    categories: item?.categories
  }));

  const handleChangeCom = (ids) => {
    
    const selectedItems = recorddata.filter((x) => ids.includes(x.id));
    callbackSQEData(selectedItems);
  };

  return (

    <div className="">
      <div className="row">
        <div className="col-12 mb-3 d-none d-lg-block">
          {gridloading ? (
            <>
             <GridSkeleton/>
            </>
          ):(
            <>
            <DataGrid
              // onRowClick={handleRowClick}
              onRowSelectionModelChange={(ids) => {
                handleChangeCom(ids);
              }}
              getRowId={getRowId}
              rows={rows}
              loading={gridloading}
              columns={columns}
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              rowHeight={40}
              columnHeaderHeight={40}
              className='f13 border-0 min-vh-100 containddl'
              disableRowSelectionOnClick
              checkboxSelection
              isRowSelectable={(params) => params?.row?.sqeHeader?.length === 0} // Disable selection if sqeHeader length is greater than 0
            // onCellClick={handleCellClick}
            />
            
            </>
          )}

        </div>
      </div>
    </div >
  );
};

export default ParticipantsCompanyDetails;
