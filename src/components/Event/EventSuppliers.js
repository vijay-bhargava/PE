import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip, MenuItem, Pagination, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Menu, Link, Alert } from '@mui/material';
import { HiDotsVertical, HiX } from 'react-icons/hi';
import { LoadingButton } from '@mui/lab';
import { DropdownButton } from 'react-bootstrap';
import { buildQueryParams } from '../../utils/purchaseRequest';
import { useParams,useNavigate } from 'react-router-dom';
import { ApiClient } from '../../Apiclient';
import { useStateValue } from '../../store';
import { formatDateViaLocale, formatDateViaLocale2 } from '../../utils/common/utility';
import { ExpandMore, PersonOutlined } from '@mui/icons-material';
import { CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';

const EventSuppliers = ({ selectedSupplier, stagearray, currentStage, handleSelectedSupplier, handleLoadingFactorClick, handleSupplierAction, clearSelectedSupplier, pageSS, pageCount, totalpageSS, handlePaginationSS,updatesupplieronloading,issupplierraccesslevel,CurrentVersion,versionhistory, permissionManager }) => {
  const [{ atoken, rtoken, customerid, roleClaims, customersuffix, userDetail }, dispatch] = useStateValue();    
  const { pageSlug } = useParams();
  const navigate = useNavigate();
  const apiClient = new ApiClient(customersuffix);
  const [Version,setVersion]=useState(null)
  const [supplierVersionWise, setSupplierVersionWise] = useState([]);
  const paginatedSupplierList = Array.isArray(supplierVersionWise) ? supplierVersionWise : [];
  const [anchorEl, setAnchorEl] = useState(null); 
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
	const handleClose = () => {
		setAnchorEl(null);
	};
  const handleVersionClick = (v) => {				
		setVersion(v);			
		setAnchorEl(null);
	};
 
  useEffect(()=>{
    setVersion(CurrentVersion)
  }, [CurrentVersion])
  useEffect(() => {
    
    if(Version)
    getSupplierEventWise();
  }, [issupplierraccesslevel,Version]);

   useEffect(() => {
    
    if(updatesupplieronloading==1 && Version )
    getSupplierEventWise();
  }, [updatesupplieronloading,Version]);

  const getSupplierEventWise = async () => {
    
    const reqdata = {
      RFQId: parseInt(pageSlug),
      Version: Version,
    //  AccessLevel:issupplierraccesslevel
    };
    const queryParams = buildQueryParams(reqdata);
    const res = await apiClient.getres(
      `/api/RFQVendorInvite/Find?${queryParams}`,
      atoken
    );
    if (res.status == 200) {
         
      let vendorItemAnalysisdata = Array.isArray(res.data?.result) ? res.data.result : [];
      
      setSupplierVersionWise(vendorItemAnalysisdata);
    }
  };

  const supplierstatus=(x)=>{
    
    if(x.status=="Open" && x.isTermsAccepted && x.packagePrice){
        return "In Process"
    }
    else if(x.status=="Open" && x.isTermsAccepted && !x.packagePrice){
        return "Intent to Participate"
    }
    else if(x.status != "Open"){
      return x.status 
    }
    else {
       return "Not Started"
    }

  }

  
  const supplierdate=(x)=>{
    
    if(x.status=="Open" && x.isTermsAccepted && x.packagePrice){
        return  formatDateViaLocale(x.acceptanceDate,userDetail)
    }
    else if(x.status=="Open" && x.isTermsAccepted  && !x.packagePrice){

        return  formatDateViaLocale(x.acceptanceDate,userDetail)
    }
    else if(x.status != "Open"){
      return formatDateViaLocale(x.responseDate,userDetail)
    }
    else {
       return ""
    }

  }

  const handleNavigationToSupplier = (vendorId) =>{
    const currentQuery = new URLSearchParams(window.location.search);
    const tab = currentQuery.get("tab");
    const eventid = currentQuery.get("eventid");
    const actionType = currentQuery.get("ActionType");
    const activityId = currentQuery.get("ActivityId");

    const queryString = [
        tab && `tab=${tab}`,
        eventid && `eventid=${eventid}`,
        actionType && `ActionType=${actionType}`,
        activityId && `ActivityId=${activityId}`
    ].filter(Boolean).join("&");

    // navigate(`/manage-rfq/${pageSlug}/supplier-individual-report/${vendorId}?${queryString}`);
  }

  return (
    <div className="bg-white rounded shadow-sm ">
      {(() => {
        const canRead = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false;
        const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.EDIT) ?? false;
        const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.CREATE) ?? false;
        const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;

        // Show permission status
        // if (permissionManager) {
        //   return (
        //     <div className="p-3 pb-0">
        //       <Alert severity="info" className="mb-3">
        //         <div className="d-flex align-items-center">
        //           <PersonOutlined className="me-2" />
        //           Suppliers permissions: 
        //           {canRead && <span className="badge bg-success ms-1">Read</span>}
        //           {canEdit && <span className="badge bg-warning ms-1">Edit</span>}
        //           {canCreate && <span className="badge bg-primary ms-1">Create</span>}
        //           {canRemove && <span className="badge bg-danger ms-1">Remove</span>}
        //         </div>
        //       </Alert>
        //     </div>
        //   );
        // }
        return null;
      })()}

      {(() => {
        const canRead = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false;
        
        if (!canRead) {
          return (
            <div className="p-3">
              <Alert severity="warning">
                You don't have permission to view suppliers data.
              </Alert>
            </div>
          );
        }

        return (
          <>
      
     
      <div className="col-md-12 mt-4 me-0 pe-0 d-flex justify-content-end align-items-center text-end me-0 pe-0 ">
     
      <Button
						aria-controls={Boolean(anchorEl) ? "simple-menu" : undefined}
						aria-haspopup="true"
						onClick={handleClick}
						variant="text"
						style={{ backgroundColor: "white", color: "#2182cde" }}
					>
						<Tooltip title={"Version Control"}>
							<div
								style={{
									fontSize: "0.7125rem",
									color: "#2A68D3",
									fontWeight: "500",
								}}
							>
								{`Version ${Version}`}
								<ExpandMore />
							</div>
						</Tooltip>
					</Button>
					<Menu
						id="simple-menu"
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleClose}
					>
						{versionhistory && versionhistory.map((x, i) => {
              if (x?.includes("x")) {
                return null; // Skip versions with 'x'
              }
								return (<MenuItem onClick={() => handleVersionClick(x)}>{`Version ${x}`}</MenuItem>)
							
						})}



					</Menu>
        </div>  
        <hr className="m-0" />
        
        <TableContainer 
          component={Paper} 
          className="m-0"
          sx={{
            height: '50vh', // Responsive height based on viewport
            overflow: 'auto' // Vertical scroll when data exceeds height
          }}
        >
          <Table size="small" aria-label="supplier table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Supplier Name</TableCell>             
                <TableCell align="left">Status</TableCell>
                <TableCell align="left">Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSupplierList
                .slice((pageSS - 1) * pageCount, pageSS * pageCount)
                .map((x, i) => (
                  <TableRow key={i}>
                    <TableCell align="left" padding="dense">
                      <Link
                        component="button"
                        underline="hover"
                        onClick={() => handleNavigationToSupplier(x.vendorId)}
                        sx={{ color: 'primary.main', fontWeight: 500 }}
                      >
                        {x?.contactPerson} | {x?.emailId} | {x?.companyName}
                      </Link>
                    </TableCell>
                    
                    <TableCell align="left" padding="dense">{supplierstatus(x)}</TableCell>
                    <TableCell align="left" padding="dense">
                        <Tooltip title={x.status !== "Open" ? "Response Date" : "Acceptance Date"}> 
                          {supplierdate(x)} 
                        </Tooltip>  
                      </TableCell>
                    <TableCell align="center" padding="dense">
                      {(() => {
                        const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.EDIT) ?? false;
                        const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;
                        
                        return (
                          <>
                          {currentStage != "Awarded" && (<DropdownButton
                              as={"div"}
                              key={"end7"}
                              id={`myacccmenu`}
                              className="supplieraccmenu"
                              drop={"start"}
                              variant="outlined"
                              disabled={!canEdit}
                              style={{
                                backgroundColor: "white",
                                color: "#2182cde",
                              }}
                              title={
                                <Tooltip title={"Action"}>
                                  <div
                                    style={{
                                      fontSize: "0.8125rem",
                                      color: "#2A68D3",
                                      fontWeight: "500",
                                    }}
                                  >
                                    <HiDotsVertical />
                                  </div>
                                </Tooltip>
                              }
                            >
                              <div className="shadow rounded min-width-200px">
                             
                                {!stagearray.includes(currentStage) && x.status && x.status !== "Open" && x.status !== "Regretted" && canEdit && (
                                  <MenuItem className="f12 fw500" onClick={() => handleSupplierAction(x, 'Reopen')}>
                                    Re-Open 
                                  </MenuItem>
                                )}
                                {canEdit && x.status !== "Regretted" && (
                                  <MenuItem className="f12 fw500" onClick={() => handleLoadingFactorClick(x, i)}>
                                    Loading Factor
                                  </MenuItem>
                                )}
                                {x.status && x.status != "Closed" && x.status != "Regretted" && canEdit && (
                                  <MenuItem className="f12 fw500" onClick={() => handleSupplierAction(x, 'Reminder')}>
                                    Send Reminder
                                  </MenuItem>
                                )}
                                {x.status && x.status != "Closed" && x.status != "Regretted" && canEdit && (
                                  <MenuItem className="f12 fw500" onClick={() => handleSupplierAction(x, 'Surrogate')}>
                                    Surrogate Supplier
                                  </MenuItem>
                                )}
                              </div>
                            </DropdownButton>)}
                            
                            {stagearray.includes(currentStage) && canRemove && (
                              <IconButton
                                size="medium"
                                className="bg-white ms-0 ps-0 pe-0 me-0 pb-1"
                                onClick={() => clearSelectedSupplier(x?.email, false)}
                              >
                                <HiX className="f17 text-danger" />
                              </IconButton>
                            )}
                          </>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
               
            </TableBody>
          </Table>
        </TableContainer>
      <div className="pagination_wrapper mb-3 mt-3">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 d-none d-md-block"></div>
          <div className="">
            <Stack spacing={2}>
              <Pagination
                count={totalpageSS}
                page={pageSS}
                onChange={handlePaginationSS}
              />
            </Stack>
          </div>
        </div>
      </div>
          </>
        );
      })()}
    </div>
  );
};

export default EventSuppliers;
