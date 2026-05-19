// src/DetailsReport.js
import React, { useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Typography, Button, Collapse, Tooltip, Menu, MenuItem, IconButton, Box, Drawer, TextField, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BackButton } from '../../../utils/common/component'; // Adjust the path as needed
import { Card } from 'react-bootstrap';
import { ExpandLess, ExpandMore, InfoOutlined } from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, ApiClient } from '../../../Apiclient';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { useStateValue } from '../../../store';
import { formatDateViaLocale, formatDateViaTime, formattimeoption, renderHtmlAsText } from '../../../utils/common/utility';
import { downloadFilesOnAzure, getFileName, getPayloadWithStage, menuactionlist } from '../../../utils/common';
import { GrAttachment } from 'react-icons/gr';
import SupplierAttachmentCell from './SupplierAttachmentCell';
import { HiOutlineX } from 'react-icons/hi';
import AttachmentWorkFlow from '../../BaseCells/attachmentworkflow';
import WhiteTooltip from '../../../components/whitetooltip';
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { StageFindAll } from '../../../utils/stagemaster';

const   DetailsReport = () => {
  const navigate = useNavigate();
  const [{ atoken, rtoken, customerid,customersuffix,roleClaims, userDetail }, dispatch,thousands_separators] =
  useStateValue();
	const apiClient = new ApiClient(customersuffix);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const { eventid,supplierid } = useParams();
  const [expanded, setExpanded] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);  // Track expanded rows
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [version, setVersion] = useState(1);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

	const [activityId, setActvityId] = useState(0);
  const [stageValue, setStageValue] = useState('');
  const [actionType, setActionType] = useState("");
  const [stagelist, setStageList] = useState(null);
    //
  const [rfqheader,setRFQHeader]=useState(null)
  useEffect(() => {

		const params = new URLSearchParams(searchParams);
		const actionType = params.get("ActionType");
    const ActivityId = params.get("ActivityId");
    const StageValue = params.get("Stage");
    setActvityId(ActivityId ?? 0);
		setActionType(actionType);
    setStageValue(StageValue ?? '');
  }, [searchParams]);

  useEffect(() => {
		StageFindAll(
			{
				EventType: "RFQ",
				CustomerId: customerid,
				EventId: eventid ?? 0,
				OrgId: rfqheader?.purchOrgId?.id ?? 0,
				OrgGroupId: rfqheader?.purchGrpId?.id ?? 0,
			},
			atoken
		).then((res) => {

			setStageList(res);
		



		});
	}, [rfqheader, eventid]);



  const toggleDrawer = (open) => {
    setOpen(open);
  };

  useEffect(()=>{
    if(eventid){
      getRFQHeader()
      getRFQSupplierDetails()
    }
    
  },[eventid,version])


  const getRFQHeader=async()=>{
    var data = {
			Id: eventid,
		};
    
		const queryParams = buildQueryParams(data);
		const res = await apiClient.getres(
			`/api/RFQManage/FindById?${queryParams}`,
			atoken
		);
    if(res){
       const data =res?.data?.result[0];
       setRFQHeader(data)
       setCurrentVersion(res?.data?.result[0]?.version)
    }

  }
   
 
  const [supplierdetails,setSupplierDetails] =useState(null)
  const getRFQSupplierDetails=async()=>{
    var data = {
			Id: supplierid
      //,Version:version
		};
     
		const queryParams = buildQueryParams(data);
		const res = await apiClient.getres(
			`api/RFQVendorInvite/FindById?${queryParams}`,
			atoken
		);
    if(res){
        
       const data =res?.data?.result[0];
       setSupplierDetails(data)
       }
  }



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRowExpansion = (rowId) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);  // Toggle expansion
  };


  const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

  const handleVersionClick = (v) => {
		setVersion(v ?? 0);
		setAnchorEl(null);
		console.log(`Selected Version: ${v}`);
	};
  const [currentVersion,setCurrentVersion]= useState(0);
  
  const [state, setState] = useState({
		openInvoiceApproved: false,
	});

  const toggleApprover = (anchor, open) => {
	
    setState({ ...state, [anchor]: open });
		
	};

  const validationSchemaApprover = yup.object().shape({
		status: yup.string().required("status is required"),
	});
  const [loading, setLoading] = useState(false);
	const formik_ApproveReject = useFormik({
		enableReinitialize: true,
		initialValues: {
			rfqId: parseInt(eventid),
			status: "Approved",
			approveComment: "",
			activityId: parseInt(activityId),
			startDate: null,
			endDate: null
		},
		validationSchema: validationSchemaApprover,
		onSubmit: async (values) => {
            setLoading(true)
			//no need to send startdate and enddate in other case
			delete values?.startDate
			delete values?.endDate
			const currentDate = new Date();
			
		
			
			 
			
	

				const datapayload = getPayloadWithStage(
					"currentStage",
					stageValue,
					stagelist,
					values,
					"currentStage"
				);

				const res = await apiClient.postres(
					`/api/RFQManage/${eventid}/RFQEventApproval`,
					datapayload,
					atoken
				);
				if (res) {
					toast.success(`Action taken successfully`, {
						toastId: "supplieraction_error"
					});
					navigate(`/app`);
				}

			
		
			setLoading(false)
		},
	});

  return (
    <div>
      {/* Header with Back Button */}
      <div className="d-flex justify-content-between minh50px align-items-center bg-white p-2 border-bottom">
        <BackButton title="RFQ Report Details" />
        <div className='action-wrap'>
        {actionType &&<Button type="button" size="small" className="p-2 pt-1 pb-1 me-2" variant="contained" onClick={()=>toggleApprover("openInvoiceApproved", true)}>
												<span className="text-capitalize">Action</span>
											</Button>}
     
        <AttachmentWorkFlow
										eventtype={`RFQ`}
										eventid={eventid}
										action={false}
										handleattachmentforevent={()=>{

                    }}
									/>
        </div>
      </div>

      {/* Accordion Component */}
      <div className='custom-fix'>
      <Card className='mt-2 mx-1'>
        <Card.Header className="d-flex justify-content-between bgheaderCards align-items-center">
          <div className="col-md-9">
            <div className="row justify-content-between">
              <div className="text-lg col-md-12 text-white font-bold">RFQ Report Details</div>
            </div>
          </div>
          <div className="col-md-3 ps-5 text-end d-flex justify-content-end align-items-center">
          <div className="  me-0 pe-0 d-flex justify-content-end align-items-center text-end me-0 pe-0 ">
					
					<Button
						aria-controls={Boolean(anchorEl) ? "simple-menu" : undefined}
						aria-haspopup="true"
						onClick={handleClick}
						variant="text"
						style={{ color: "white" }}
					>
						<Tooltip title={"Version Control"}>
							<div
								style={{
									fontSize: "0.7125rem",
									color: "white",
									fontWeight: "500",
								}}
							>
								{version != 0 ? `Version ${version} X ` : `Final Version`}
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
						{Array?.from({ length: currentVersion+1 }).map((_, i) => {
							
							if (i != 0) {
								return (<MenuItem onClick={() => handleVersionClick(i)}>Version {i}</MenuItem>)
							}
						
						})}
						
						
						
					</Menu>
				</div>
          <Button
                                        variant="standard"
                                        className="cardBtn"
                                        onClick={() => setExpanded(!expanded)}
                                    >
                                        {expanded ? <ExpandLess className="text-white" /> : <ExpandMore className="text-white" />}
                                    </Button>
          </div>
        </Card.Header>

        {/* Collapse to Show Expanded Information */}
        <Collapse  in={expanded}>
        <Card.Body>
                                    <div className='row mx-1'>
                                        <div className='col-md-3 ms-0 ps-0'>
                                            <div className='f14 fw500'>RFQ Subject:</div>
                                            <div className='f12 fw400'>
                                            {rfqheader?.subject ?? ""}
                                            </div>
                                        </div>
                                        <div className='col-md-3 ms-0 ps-0'>
                                            <div className='f14 fw500'>Ref No:</div>
                                            <div className='f12 fw400'>
                                           { rfqheader?.refEventType ? `${rfqheader?.refEventType}:${rfqheader?.eventRef}`  :"N/A"}
                                            </div>
                                        </div>
                                       
                                       
                                        <div className='col-md-3 ms-0 ps-0'>
                                            <div className='f14 fw500'>Currency: </div>
                                            <div className='f12 fw400'>
                                            {rfqheader?.baseCurrency}
                                            </div>
                                        </div>
                                        <div className='col-md-3 ms-0 ps-0'>
                                            <div className='f14 fw500'>Conversion Rate: </div>
                                            <div className='f12 fw400'>
                                            1
                                            </div>
                                        </div>
                                        <div className='col-md-3 ms-0 ps-0'>
                                            <div className='f14 fw500'>RFQ Start Date: </div>
                                            <div className='f12 fw400'>
                                            {rfqheader?.startDate ? formatDateViaLocale(
																		rfqheader?.startDate,
                                    userDetail
																	):""}
                                            </div>
                                        </div>
                                        <div className='col-md-3 ms-0 ps-0'>
                                            <div className='f14 fw500'>RFQ End Date:</div>
                                            <div className='f12 fw400'>
                                            {rfqheader?.endDate ? formatDateViaLocale(
																		rfqheader?.endDate,
																		userDetail
																	):""}
                                            </div>
                                        </div>
                                        
                                        {supplierdetails?.companyName && <div className='col-md-3 ms-0 ps-0'>
                                            <div className='f14 fw500'>Supplier Company: </div>
                                            <div className='f12 fw400'>
                                              {supplierdetails?.companyName}
                                            </div>
                                        </div>}
                                        <div className='col-md-3 ms-0 ps-0'>
                                            <div className='f14 fw500'>Supplier User: </div>
                                            <div className='f12 fw400'>
                                              {supplierdetails?.emailId}
                                            </div>
                                        </div>
                                        <div className='col-md-3 ms-0 ps-0'>
                                            <div className='f14 fw500'>Supplier Remark: </div>
                                            <div className='f12 fw400'>
                                            {supplierdetails?.remarks?.length > 20 ? 
                                            <Tooltip title={supplierdetails.remarks}>
                                            {supplierdetails.remarks.slice(0, 20) + '...'}
                                            </Tooltip> : supplierdetails?.remarks ?? "N/A"}
                                            </div>
                                        </div>
                                        <div className='col-md-12 ms-0 ps-0'>
                                            <div className='f14 fw500'>Description: </div>
                                            <div className='f12 fw400'>
                                              {renderHtmlAsText(rfqheader?.description)}
                                            </div>
                                        </div>
                                        <div className='col-md-12 ms-0 ps-0'>
                                            <div className='f14 fw500'>Terms & Condition: </div>
                                            <div className='f12 fw400'>
                                              {renderHtmlAsText(rfqheader?.termandCondition)}
                                            </div>
                                        </div>
                                       
                                    </div>
                                </Card.Body>
        </Collapse>
      </Card>
      {/* Items card */}
      <Paper className="t mx-1 rounded mt-2">
        <div className='row m-2'>
        <div className="mb-2  pt-1 pb-1 f14" > <strong>Item Details</strong></div>
        <TableContainer className='itemstable'>
        
          <Table stickyHeader>
            <TableHead className="table-header">
              <TableRow>
                <TableCell align='left'>ID</TableCell>
                <TableCell align="right">Item Name</TableCell>
                <TableCell align='left'>Quantity</TableCell>
                <TableCell align='right'>UOM</TableCell>
                <TableCell align='left'> Item Price </TableCell>
                <TableCell align='left'> Calculated Total Price </TableCell>
                {/* <TableCell>Amount (Inc. Taxes)</TableCell> */}
                <TableCell align='right'>Description</TableCell>
                <TableCell align="right">Remarks</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rfqheader?.rfqParameters?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => 
              {
                
                const sq = supplierdetails?.rfqVendorParameters?.find(sq => sq.parameterId === row.id);
                return (
                  <React.Fragment key={row.id}>
                    {/* Row with striped effect */}
                    <TableRow className={index % 2 === 0 ? "striped-row" : ""}>
  <TableCell>{row.id}</TableCell>
  <TableCell align="right">{row.itemName}</TableCell>
  <TableCell align="left">{thousands_separators(row.quantity)}</TableCell>
  <TableCell align="right">{row.uom}</TableCell>
  <TableCell align="left">{thousands_separators(sq?.itemPrice)}</TableCell>
  <TableCell align="left">{thousands_separators(sq?.calculateItemValue)}</TableCell>

  <TableCell className='pointer' align="right"><WhiteTooltip title={row?.itemDesc}>{row?.itemDesc?.length > 15
    ? row?.itemDesc?.slice(0, 12) + "..."
    : row?.itemDesc}</WhiteTooltip></TableCell>
 
  <TableCell className='pointer'><WhiteTooltip title={row?.remarks}>{row?.remarks?.length > 15
    ? row?.remarks?.slice(0, 12) + "..."
    : row?.remarks}</WhiteTooltip></TableCell>
  <TableCell align='right'>
    <ExpandMoreIcon style={{ cursor: 'pointer' }} onClick={() => toggleRowExpansion(row.id)} />
  </TableCell>
</TableRow>

{/* Expanded row details */}
{expandedRow === row.id && (
  <TableRow>
    <TableCell colSpan={9} className="p-0">
      <div className="expanded-row-content">
        {/* Expanded Table for additional details */}
        <Table size="small">
          <TableBody>
            {/* Example for Basic Price */}
            <TableRow>
              <TableCell colSpan={4} align="left" className="text-muted">
                <strong>Basic Price</strong>
              </TableCell>
              <TableCell colSpan={5} align="right" className="text-muted">
                {thousands_separators(sq?.itemPrice)}
              </TableCell>
            </TableRow>

            {/* Mapping RFQ Terms & Conditions */}
            {rfqheader?.rfqTermsCondition.filter(x => x.level === "item").map((x, i) => {
              const com = sq?.rfqItemsCommercial.find(com => com.name === x.name);
              return (
                <TableRow key={i}>
                  <TableCell colSpan={4} align="left" className="text-muted">
                    {x?.name} {x.valuetype === "Percentage" && " (%)"}
                  </TableCell>
                  <TableCell colSpan={5} align="right" className="text-muted">
                    {com?.enterCommValue ? (
                      <>
                        {thousands_separators(com?.enterCommValue)}{" "}
                        <Tooltip title="Accepted Currency">
                          <span>{supplierdetails?.acceptedCurrency}</span>
                        </Tooltip>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* GST/VAT Calculation */}
            <TableRow>
              <TableCell colSpan={4} align="left" className="text-muted">GST/VAT</TableCell>
              <TableCell colSpan={5} align="right" className="text-muted">
                {thousands_separators((row.basicPrice * row.gstVat / 100).toFixed(2))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </TableCell>
  </TableRow>
)}

                  </React.Fragment>
                )

              }
             
              
              )}
            </TableBody>
          </Table>
        </TableContainer>

        </div>
   

        {/* Table Footer with Pagination */}
        <div className="table-pagination">
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rfqheader?.rfqParameters?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={<span className="pagination-text">Rows per page</span>}
          />
        </div>
      </Paper>
       {/* Other Comercial Term Card */}
      {rfqheader?.rfqTermsCondition.filter(x=>x.level!="item") && rfqheader?.rfqTermsCondition.filter(x=>x.level!="item").length>0 && <Paper className="t mx-1 rounded mt-2">
        <TableContainer className='itemstable'>
          <Table stickyHeader>
            <TableHead className="table-header">
            <TableRow>
            <TableCell align='left'><strong>Other Commercial Terms</strong></TableCell>
            <TableCell align='left'><strong>Our Requirement</strong></TableCell>
            <TableCell align='left'><strong>Your Offer</strong></TableCell>
          </TableRow>
            </TableHead>
            <TableBody>
          {rfqheader?.rfqTermsCondition.filter(x=>x.level!="item")?.map((row, index) =>
          {
            
                const sq = supplierdetails?.rfqVendorCommercial.filter(x=>x.level!="item")?.find(sq => sq.rfqtcId === row.id);
            return (
              <TableRow key={index}>
                <TableCell>{row?.name}</TableCell>
                <TableCell>{row?.requirement}</TableCell>
                <TableCell>{thousands_separators(sq?.calculateCommValue)} {rfqheader?.baseCurrency}</TableCell>
              </TableRow>
            )
          }
          )}
        </TableBody>
          </Table>
        </TableContainer>

        {/* Table Footer with Pagination */}
        <div className="table-pagination">
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rfqheader?.rfqTermsCondition?.filter(x=>x.level!="item")?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={<span className="pagination-text">Rows per page</span>}
          />
        </div>
      </Paper>}
       {/*Questions Card */}
      <Paper className="t mx-1 rounded mt-2 mb-2">
        <TableContainer className='itemstable'>
          <Table stickyHeader>
          <TableHead className="table-header">
          <TableRow>
            <TableCell align='left'><strong>Questions</strong></TableCell>
            <TableCell align='left'><strong>Score</strong></TableCell>
            <TableCell align='left'><strong>Answer</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rfqheader?.rfqQuestionMaster?.map((row, index) => 
          
          {
            
            
                const sq = supplierdetails?.rfqQuestionMaster?.find(sq => sq.questionId === row.id);
return (

              <TableRow key={index}>
                <TableCell>{row?.questionDescription}
  
                {row?.attachedFileName && <Tooltip title={getFileName(row?.attachedFileName)}><IconButton
                                      onClick={() =>
                                        downloadFilesOnAzure(
                                          row?.attachedFileName,
                                          getFileName(row?.attachedFileName),
                                          atoken
                                        )
                                      }
                                      size="small"
                                      edge="start"
                                      className="pointer"
                                    >
                                      <GrAttachment />
                                    </IconButton> </Tooltip>}
                </TableCell>
                <TableCell>{row?.weightage}</TableCell>
                <TableCell>{sq?.answer}</TableCell>
              </TableRow>
            )
          }
          )}
        </TableBody>
          </Table>
        </TableContainer>

        {/* Table Footer with Pagination */}
        <div className="table-pagination">
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rfqheader?.rfqQuestionMaster?.length ?? 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={<span className="pagination-text">Rows per page</span>}
          />
        </div>
      </Paper>
      <Paper className="t mx-1 rounded  mb-2">
<div className='row m-2'> 
 {/*supplier Attachment */}
 {<div className=" pt-1 pb-1 f14 fw500" > <strong>Supplier Attachments</strong></div>}
<SupplierAttachmentCell							  
								  eventid={eventid} 
								  eventtype={`RFQ`} 
								  satoken={atoken}
								  vendorid={supplierdetails?.vendorId}
								  action={false}
								 />
</div>
   
   </Paper>

      </div>
   <React.Fragment key="technicalapprovermodal">
				<Drawer anchor="right" open={state["openInvoiceApproved"]}>
					<form onSubmit={formik_ApproveReject.handleSubmit} autoComplete="off">
						<Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">Approval Action</div>
										<div>
											<IconButton
												onClick={()=>toggleApprover("openInvoiceApproved", false, [])}
												size="small"
												edge="start"
												sx={{ mr: 1 }}
											>
												<HiOutlineX className="f20 text-white" />
											</IconButton>
										</div>
									</div>
								</Box>
								<div className="h50px"></div>
								<div className="p-3">
									<div className="row ">
										<div className="col-12 col-md-12 col-lg-12">
											<div className="mb-4 textblue f14"></div>
											<div className="row">
												<div className="col-12 col-md-4 col-lg-12 mb-4">
													<TextField
														id="isApproved"
														InputLabelProps={{
															shrink: true,
														}}
														name="isApproved"
														select
														className="mb-2"
														fullWidth
														size="small"
														label="Status"
														variant="outlined"
														value={formik_ApproveReject.values?.status}
														onChange={(e) =>
														{
															
															formik_ApproveReject.setFieldValue(
																"status",
																e.target.value
															)
														}
															
														}

														error={
															formik_ApproveReject.touched.status &&
															Boolean(formik_ApproveReject.errors.status)
														}
														helperText={
															formik_ApproveReject.touched.status &&
															formik_ApproveReject.errors.status
														}
													>
														{menuactionlist.filter(x=>x.value!="Forwarded").map((x)=>{
															
															return (<MenuItem value={x.value}>{x.label}</MenuItem>)
														
														})
														
														}
														
														
													</TextField>
												</div>

												<div className="col-12 col-md-4 col-lg-12 mb-4">
													<TextField
														id="approveComment"
														InputLabelProps={{
															shrink: true,
														}}
														multiline
														rows={3}
														name="approveComment"
														className="w-100 f14"
														size="small"
														label="Comment "
														variant="outlined"
														inputProps={{ maxLength: 200 }}
														value={formik_ApproveReject?.values?.approveComment}
														onChange={(e) =>
															formik_ApproveReject.setFieldValue(
																"approveComment",
																e.target.value
															)
														}
														InputProps={{
															endAdornment: formik_ApproveReject?.values?.approveComment && (
																<InputAdornment position="end">
																	<Typography variant="body2" color="textSecondary">
																		{formik_ApproveReject?.values?.approveComment?.length}/200
																	</Typography>
																</InputAdornment>
															),
														}}
													/>

												</div>
												{/* {stageValue=="Under Pre Approval" && <LocalizationProvider
													dateAdapter={AdapterDateFns}
												>
													<div className="col-12 col-md-4 col-lg-12 mb-4">
														<MobileDateTimePicker
															variant="outlined"
															label="Start Date/Time "
															size="small"
															name="startDateaction"
															id="startDateaction"
															//minDate={new Date()}
															// minTime={new Date()}
															value={formik_ApproveReject.values.startDate}
															className="w-100 f14"
															slotProps={{
																textField: {
																	variant: "outlined",
																	size: "small",
																	InputLabelProps: { shrink: true },
																	error:
																		formik_ApproveReject.touched.startDate &&
																		Boolean(formik_ApproveReject.errors.startDate),
																	helperText:
																		formik_ApproveReject.touched.startDate &&
																		formik_ApproveReject.errors.startDate,
																},
																actionBar: {
																	actions: ["clear", "cancel", "accept"],
																},
															}}
															onChange={(newValue) => {
																formik_ApproveReject.setFieldValue(
																	"startDate",
																	newValue
																);
															}}
															format={getDateFormatPatteronLocale("en-GB")}
														// format="L hh:mm a"
														/>
													</div>
													<div className="col-12 col-md-4 col-lg-12 mb-4">
														<MobileDateTimePicker
															variant="outlined"
															label="End Date/Time "
															size="small"
															name="endDateaction"
															id="endDateaction"
															//minDate={new Date()}
															// minTime={new Date()}
															value={formik_ApproveReject.values.endDate}
															className="w-100 f14"
															slotProps={{
																textField: {
																	variant: "outlined",
																	size: "small",
																	InputLabelProps: { shrink: true },
																	error:
																		formik_ApproveReject.touched.endDate &&
																		Boolean(formik_ApproveReject.errors.endDate),
																	helperText:
																		formik_ApproveReject.touched.endDate &&
																		formik_ApproveReject.errors.endDate,
																},
																actionBar: {
																	actions: ["clear", "cancel", "accept"],
																},
															}}
															onChange={(newValue) => {
																formik_ApproveReject.setFieldValue(
																	"endDate",
																	newValue
																);
															}}
															format={getDateFormatPatteronLocale("en-GB")}
														// format="L hh:mm a"
														/>
													</div>
																
												</LocalizationProvider>} */}
											</div>

										</div>
									</div>
									<div className="row">
										<div className="col-12 text-end">
											<LoadingButton
                                                loading={loading}
												color="primary"
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="submit"
											>
												<span>Save</span>
											</LoadingButton>

										</div>
									</div>
								</div>
							</div>
						</Box>
					</form>
				</Drawer>
			</React.Fragment>
   

    </div>
  );
};

export default DetailsReport;
