import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../../store";
import FormGroup from "@mui/material/FormGroup";
import {
	Autocomplete,
	Avatar,
	Badge,
	Checkbox,
	FormControlLabel,
	InputLabel,
	Stack,
	MenuItem,
	Select,
	CardHeader,
	CardContent,
	FormControl,
	OutlinedInput,
	Input,
	FormHelperText,
    Tooltip,
    AccordionActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Tabs,
    Tab,
} from "@mui/material";
import {
	getOrgFindById,
	getOrgSetup,
	SaveOrgisation,
	updateOrgisation,
} from "../../../utils/orgsetup";
import { format } from "date-fns";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import {  Card, DropdownButton, Modal, Table} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import {
    AccountCircle,
	CameraAltOutlined,
	ContactPage,
	Edit,
	EditAttributesOutlined,
	ExpandMore,
	FileCopyOutlined,
	Filter,
	FilterAltOutlined,
	InfoOutlined,
	InfoRounded,
	LocalLibrary,
	Phone,
	RateReviewOutlined,
	Search,
	SupervisedUserCircleRounded,
	Visibility,
	VisibilityOff,
} from "@mui/icons-material";
import { HiDocument, HiDotsVertical, HiOutlinePaperAirplane, HiOutlineX, HiPencilAlt } from "react-icons/hi";
import { FindUser, UpdateUser, UpdateUserProfile } from "../../../utils/users";
import { useCookies } from "react-cookie";
import {
	ChangePassword,
	UserChangePassword,
} from "../../../utils/apiConstants";
import { ApiClient } from "../../../Apiclient";
import { toast } from "react-toastify";
import { getCountry, getTimeZone, removeNonNumeric, toastoption } from "../../../utils/common";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { BackButton } from "../../../utils/common/component";
import { FaPaperPlane } from "react-icons/fa6";
import { FaRegPaperPlane } from "react-icons/fa";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import NewQuotation from "./NewQuotation";
const EERFQComparative = () => {
    const [openSupplier, setOpenSupplier] = useState(false);
  const handleOpenSupplier = () => setOpenSupplier(true);
  const handleCloseSupplier = () => setOpenSupplier(false);          
  
  const [openViewSupplier, setOpenViewSupplier] = useState(false);
  const handleOpenViewSupplier = () => setOpenViewSupplier(true);
  const handleCloseViewSupplier = () => setOpenViewSupplier(false); 
  
  const [openPoDetail, setOpenPoDetail] = useState(false);
  const handleOpenPoDetail = () => setOpenPoDetail(true);
  const handleClosePoDetail = () => setOpenPoDetail(false); 
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  }; 
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTable = () => {
      setIsExpanded(prev => !prev);
  };
  // const exportToPDF = (contentId) => {
  //   if (!contentId) {
  //     console.error('No PDF content ID provided');
  //     return;
  //   }
  
  //   const input = document.getElementById(contentId);
  //   if (!input) {
  //     console.error(`Element with ID '${contentId}' not found`);
  //     return;
  //   }
  
  //   const pdf = new jsPDF({
  //     orientation: 'p', // 'portrait' (default) or 'landscape'
  //     unit: 'px', // units: mm, cm, in, px
  //     format: 'a4', // default is A4
  //   });
  
  //   html2canvas(input, { scrollY: -window.scrollY }).then((canvas) => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const imgWidth = pdf.internal.pageSize.width - 20; // Adjust width if needed
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  //     let yOffset = 10; // Initial vertical offset
  //     const pageHeight = pdf.internal.pageSize.height;
  
  //     if (yOffset + imgHeight > pageHeight) {
  //       pdf.addPage();
  //       yOffset = 10; // Reset yOffset for new page
  //     }
  
  //     pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
  
  //     // Save the PDF
  //     pdf.save('tables.pdf'); 
  //   });
  //   console.log(typeof contentId, contentId)
  // };
  
  // // Example usage:
  // exportToPDF('pdfContent');
  
	return (
        <div className="container-fluid">
            <div className="row border-bottom">
                <div className="col-md-12 p-2 ms-0 ">
                    <BackButton title="Supplier Quotation"/>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-md-11">
                <div className="textblue f14 ms-2">
              RFQ ID:
              <span className="text-success f14 fw-500 ms-2">226</span>
              <span className="text-black f14 fw-500 ms-2">
                  9404 / MAINTENANCE ITEMS 0510612301
              </span>
            </div>
            
                </div>
                <div className="col-md-1 text-end">
                <DropdownButton
                                as={'div'}
                                key={'end7'}
                                id={`myacccmenu`}
                                className='sidebaraccmenu '
                                drop={'bottom'}
                                variant="outlined"
                                style={{backgroundColor:"white", color:"#2182cde"}}
                                title={  <Tooltip
                                 title={"Version Control"}>
                                 <div style={{fontSize:"0.8125rem",color:"#2A68D3", fontWeight:"500"}}>Version 1.0X <ExpandMore/> </div>
                           </Tooltip>}
                            >
                                <div className='shadow rounded min-width-200px'>
                                    <MenuItem>
                                      Version 1
                                    </MenuItem>
                                  
                                 
                                   
                                    <MenuItem >
                                        
                                       Version 2
                                    </MenuItem>
                                </div>
                            </DropdownButton>
                </div>
            </div>
            <div className="row justify-content-between align-items-baseline">
              <div className="col-md-6 mb-2">
              <Box sx={{ width: "100%" }}>
              <Tabs
                onChange={handleChange}
                value={value}
                aria-label=""
                selectionFollowsFocus
                className="ps-2"
              >
                <Tab className="text-capitalize" label="Item/Service" />
                <Tab className="text-capitalize" label="Commercial Terms" />
                <Tab className="text-capitalize" label="Vendor Remarks" />
                <Tab className="text-capitalize" label="New Item/Service" />
              </Tabs>
            </Box>
              </div>
                <div className="col-md-6 d-flex justify-content-end align-items-baseline me-0 pe-0">
                    <Button onClick={handleOpenSupplier}>        
                        <span className="f11 fw500">View Suppliers</span> 
      </Button>
      {/* <Button>
        <span className="f11 fw 500" onClick={handleOpenViewSupplier}>View Supplier</span>
      </Button> */}
      <DropdownButton
                                as={'div'}
                                key={'end7'}
                                id={`myacccmenu`}
                                className='sidebaraccmenu '
                                drop={'bottom'}
                                variant="outlined"
                                style={{backgroundColor:"white", color:"#2182cde"}}
                                title={  <Tooltip
                                 title={"Version Control"}>
                                 <div> <HiDotsVertical/> </div>
                           </Tooltip>}
                            >
                                <div className='shadow rounded min-width-200px'>
                                    <MenuItem>
                                      Export
                                    </MenuItem>
                                    <MenuItem >
                                    PDF
                                    </MenuItem>
                                    <MenuItem >
                                    Cancel RFQ
                                    </MenuItem>
                                    <MenuItem >
                                     Download
                                    </MenuItem>
                                </div>
                            </DropdownButton>
                </div>
            </div>
            {value == 0 ? (
               <div className="d-flex ms-2">
               <div className="d-flex itemTable">
                <div className="d-flex itemTable" id="pdfContent">
               <div className="detailItem"  >
         <div className="f16 fw500 border ps-2 pt-2 pb-2 pe-2 text-center fixed-header" style={{ height: "100px" }}>
           Items/Services
         </div>
         <div className="item">
         <Table striped bordered hover responsive className="mb-0 pb0 items">
           <thead >
             <tr>
               <th className="f14 fw500">SrNo.</th>
               <th className="f14 fw500">Item Name</th>
               <th className="f14 fw500">Item Code</th>
               <th className="f14 fw500">Quantity</th>
               <th className="f14 fw500">UOM</th>
               <th className="f14 fw500">Target Price</th>
             </tr>
           </thead>
           <tbody >
             <tr>
                <td className="f13 fw400">
                 1
               </td>
                <td className="f13 fw400">
                 Item 1 <Tooltip title={"Commercial Terms"}>
                 <span  onClick={toggleTable} style={{ cursor: 'pointer', color:"#1976d2" ,fontSize:"12px"}}><FileCopyOutlined className="f14"/></span>
                  </Tooltip> 


                  <Tooltip title={"Description Of The Product"}>
                 <span className="ms-2" style={{ cursor: 'pointer', color:"#1976d2" ,fontSize:"12px"}}><InfoOutlined className="f14"/></span>
                  </Tooltip> 
               </td>
               <td className="f13 fw400">
                  Cd26
               </td>
                <td className="f13 fw400">
                 20
               </td>
                <td className="f13 fw400">
                 Ton
               </td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>

               </td>
               
             </tr>
             <tr>
                <td className="f13 fw400">
                 1
               </td>
                <td className="f13 fw400">
                 Item 1  <Tooltip title={"Commercial Terms"}>
                 <span  onClick={toggleTable} style={{ cursor: 'pointer', color:"#1976d2" ,fontSize:"12px"}}><FileCopyOutlined className="f14"/></span>
                  </Tooltip>


                  <Tooltip title={"Description Of The Product"}>
                 <span className="ms-2" style={{ cursor: 'pointer', color:"#1976d2" ,fontSize:"12px"}}><InfoOutlined className="f14"/></span>
                  </Tooltip> 
               </td>
               <td className="f13 fw400">
                  Cd26
               </td>
                <td className="f13 fw400">
                 20
               </td>
                <td className="f13 fw400">
                 Ton
               </td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
             </tr>
             <tr>
                <td className="f13 fw400">
                 1
               </td>
                <td className="f13 fw400">
                 Item 1 <Tooltip title={"Commercial Terms"}>
                 <span  onClick={toggleTable} style={{ cursor: 'pointer', color:"#1976d2" ,fontSize:"12px"}}><FileCopyOutlined className="f14"/></span>
                  </Tooltip>  
                  
                  <Tooltip title={"Description Of The Product"}>
                 <span className="ms-2" style={{ cursor: 'pointer', color:"#1976d2" ,fontSize:"12px"}} ><InfoOutlined className="f14"/></span>
                  </Tooltip> 
               </td>
               <td className="f13 fw400">
                  Cd26
               </td>
                <td className="f13 fw400">
                 20
               </td>
                <td className="f13 fw400">
                 Ton
               </td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
             </tr>
             
           </tbody>
         </Table>
         {isExpanded && (
                <Table striped bordered hover responsive className="mb-0 pb-0">
                    <tbody>
                        <tr>
                            <td className="f13 fw400" style={{ width: "483px", paddingLeft:"5rem" }}>
                                Transport Charges
                            </td>
                            <td className="f13 fw400">
                                500{' '}
                                <Tooltip title={"Base Currency"}>
                                    <span> INR </span>
                                </Tooltip>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            )}
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"483px"}}>
                 Total
               </td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
               
             </tr>
             
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"369px"}}>
                 Loading Factor
               </td>
                
               
               
             </tr>
             
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"369px"}}>
                 Loaded Price
               </td>
                
               
               
             </tr>
             
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"369px"}}>
                 Amount (Including Taxes)
               </td>
                
               
               
             </tr>
             
           </tbody>
         </Table>
         
       
         </div>
         <div className="fixed-footer">
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start" >
         Commercial Rank (Excluding Taxes)
         </div>
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-start" >
         Package Value Where Supplier Is L1
         </div>
         </div>
       </div>

       <div className="lineItem mx-2 shadow" >
        <div id="pdfContent">
         <div className="f16 fw500 border ps-2 pt-2 pb-2 pe-2 text-center fixed-header" style={{ height: "100px" }}>
           Line-Wise Lowest Item
         </div>
         <div className="line">
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <thead>
             <tr>
               <th className="f14 fw500">Unit Price</th>
             </tr>
           </thead>
           <tbody>
             <tr>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
             </tr>
           </tbody>
         </Table>
         {isExpanded && (
           <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr style={{height:"37px"}}>
                
                <td className="f13 fw400">
                
               </td>
               
             </tr>
           </tbody>
         </Table>
         )}
        
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
             </tr>
           </tbody>
         </Table>
        
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr style={{height:"36px"}}>
                
                <td className="f13 fw400">
                
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr style={{height:"37px"}}>
                
                <td className="f13 fw400">
                
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr style={{height:"36px"}}>
                
                <td className="f13 fw400">
                
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr style={{height:"36px"}}>
                
                <td className="f13 fw400">
                
               </td>
               
             </tr>
           </tbody>
         </Table>  
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr style={{height:"36px"}}>
                
                <td className="f13 fw400">
                
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr style={{height:"36px"}}>
                
                <td className="f13 fw400">
                
               </td>
               
             </tr>
           </tbody>          
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr style={{height:"36px"}}>
                
                <td className="f13 fw400">
                
               </td>
               
             </tr>
           </tbody>
         </Table>
         </div>

        </div>
       </div>
       <div className="vendorDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="vendor">
           <div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
             <div className="f16 d-flex justify-content-center align-items-center fw500 text-center mb-1 pe-1"  style={{textDecoration:"underline"}}>
                 Vendor A <Tooltip title={
                  <div className="row">
                    <div className="col-md-6">
                      <div>Mobile</div>
                      <div>3489489438</div>
                    </div>
                    <div className="col-md-6">
                      <div>Submission Time</div>
                      <div>17 July 2024 <span>13:18PM</span></div>
                    </div>
                  </div>
                 }>
                   <span className="ms-2">#</span> 
                 </Tooltip>
               <span >
                 <DropdownButton
                                 as={'div'}
                                 key={'end7'}
                                 id={`myacccmenu`}
                                 className='supplieraccmenu '
                                 drop={'start'}
                                 variant="outlined"
                                 style={{backgroundColor:"white", color:"#2182cde"}}
                                 title={  <Tooltip
                                  title={"Version Control"}>
                                  <div style={{fontSize:"0.8125rem",color:"#2A68D3", fontWeight:"500"}}><HiDotsVertical/> </div>
                            </Tooltip>}
                             >
                                 <div className='shadow rounded min-width-200px'>
                                     <MenuItem  className="f12 fw500">
                                       Remove Supplier
                                     </MenuItem>
                                   
                                     <MenuItem  className="f12 fw500">
                                       Counter Offer
                                     </MenuItem>
                                       
                                     <MenuItem  className="f12 fw500">
                                       Re-Invite
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Re-Open Quote
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Surrogate
                                     </MenuItem>
                                 </div>
                             </DropdownButton></span>
             </div>
           </div>
           
           <Table striped bordered hover responsive className="mb-0 pb-0">
             <thead>
               <tr>
                 <th className="f14 fw500">Offered Price</th>
                 <th className="f14 fw500">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
             </tbody>
           </Table>
           {isExpanded && (
                <Table striped bordered hover responsive className="mb-0 pb-0">
                    <tbody>
                        <tr >
                        <td className="f13 fw400" style={{color:"#1976d2" ,width:"202px"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                            
                        </tr>
                    </tbody>
                </Table>
            )}
           <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td style={{width:"202px"}}></td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
                </td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>  0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>      </td>
                <td className="f13 fw400">
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
          
               
               
             </tr>
           </tbody>
         </Table>
         <div className="fixed-footer">

         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        L1
         </div>
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        2560
         </div>
         </div>
         </div>

        </div>
       </div>
       <div className="vendorDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="vendor">
           <div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
             <div className="f16 d-flex justify-content-center align-items-center fw500 text-center mb-1 pe-1"  style={{textDecoration:"underline"}}>
                 Vendor A <Tooltip title={
                  <div className="row">
                    <div className="col-md-6">
                      <div>Mobile</div>
                      <div>3489489438</div>
                    </div>
                    <div className="col-md-6">
                      <div>Submission Time</div>
                      <div>17 July 2024 <span>13:18PM</span></div>
                    </div>
                  </div>
                 }>
                   <span className="ms-2">#</span> 
                 </Tooltip>
               <span >
                 <DropdownButton
                                 as={'div'}
                                 key={'end7'}
                                 id={`myacccmenu`}
                                 className='supplieraccmenu '
                                 drop={'start'}
                                 variant="outlined"
                                 style={{backgroundColor:"white", color:"#2182cde"}}
                                 title={  <Tooltip
                                  title={"Version Control"}>
                                  <div style={{fontSize:"0.8125rem",color:"#2A68D3", fontWeight:"500"}}><HiDotsVertical/> </div>
                            </Tooltip>}
                             >
                                 <div className='shadow rounded min-width-200px'>
                                     <MenuItem  className="f12 fw500">
                                       Remove Supplier
                                     </MenuItem>
                                   
                                     <MenuItem  className="f12 fw500">
                                       Counter Offer
                                     </MenuItem>
                                       
                                     <MenuItem  className="f12 fw500">
                                       Re-Invite
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Re-Open Quote
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Surrogate
                                     </MenuItem>
                                 </div>
                             </DropdownButton></span>
             </div>
           </div>
           
           <Table striped bordered hover responsive className="mb-0 pb-0">
             <thead>
               <tr>
                 <th className="f14 fw500">Offered Price</th>
                 <th className="f14 fw500">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
             </tbody>
           </Table>
           {isExpanded && (
                <Table striped bordered hover responsive className="mb-0 pb-0">
                    <tbody>
                        <tr >
                        <td className="f13 fw400" style={{color:"#1976d2" ,width:"202px"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                            
                        </tr>
                    </tbody>
                </Table>
            )}
           <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td style={{width:"202px"}}></td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
                </td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>  0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>      </td>
                <td className="f13 fw400">
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
          
               
               
             </tr>
           </tbody>
         </Table>
         <div className="fixed-footer">

         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        L1
         </div>
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        2560
         </div>
         </div>
         </div>

        </div>
       </div>
       <div className="vendorDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="vendor">
           <div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
             <div className="f16 d-flex justify-content-center align-items-center fw500 text-center mb-1 pe-1"  style={{textDecoration:"underline"}}>
                 Vendor A <Tooltip title={
                  <div className="row">
                    <div className="col-md-6">
                      <div>Mobile</div>
                      <div>3489489438</div>
                    </div>
                    <div className="col-md-6">
                      <div>Submission Time</div>
                      <div>17 July 2024 <span>13:18PM</span></div>
                    </div>
                  </div>
                 }>
                   <span className="ms-2">#</span> 
                 </Tooltip>
               <span >
                 <DropdownButton
                                 as={'div'}
                                 key={'end7'}
                                 id={`myacccmenu`}
                                 className='supplieraccmenu '
                                 drop={'start'}
                                 variant="outlined"
                                 style={{backgroundColor:"white", color:"#2182cde"}}
                                 title={  <Tooltip
                                  title={"Version Control"}>
                                  <div style={{fontSize:"0.8125rem",color:"#2A68D3", fontWeight:"500"}}><HiDotsVertical/> </div>
                            </Tooltip>}
                             >
                                 <div className='shadow rounded min-width-200px'>
                                     <MenuItem  className="f12 fw500">
                                       Remove Vendor
                                     </MenuItem>
                                   
                                     <MenuItem  className="f12 fw500">
                                       Counter Offer
                                     </MenuItem>
                                       
                                     <MenuItem  className="f12 fw500">
                                       Re-Invite
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Re-Open Quote
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Surrogate
                                     </MenuItem>
                                 </div>
                             </DropdownButton></span>
             </div>
           </div>
           
           <Table striped bordered hover responsive className="mb-0 pb-0">
             <thead>
               <tr>
                 <th className="f14 fw500">Offered Price</th>
                 <th className="f14 fw500">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
             </tbody>
           </Table>
           {isExpanded && (
                <Table striped bordered hover responsive className="mb-0 pb-0">
                    <tbody>
                        <tr >
                        <td className="f13 fw400" style={{color:"#1976d2" ,width:"202px"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                            
                        </tr>
                    </tbody>
                </Table>
            )}
           <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td style={{width:"202px"}}></td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
                </td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>  0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>      </td>
                <td className="f13 fw400">
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
          
               
               
             </tr>
           </tbody>
         </Table>
         <div className="fixed-footer">

         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        L1
         </div>
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        2560
         </div>
         </div>
         </div>

        </div>
       </div>
       <div className="vendorDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="vendor">
           <div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
             <div className="f16 d-flex justify-content-center align-items-center fw500 text-center mb-1 pe-1"  style={{textDecoration:"underline"}}>
                 Vendor A <Tooltip title={
                  <div className="row">
                    <div className="col-md-6">
                      <div>Mobile</div>
                      <div>3489489438</div>
                    </div>
                    <div className="col-md-6">
                      <div>Submission Time</div>
                      <div>17 July 2024 <span>13:18PM</span></div>
                    </div>
                  </div>
                 }>
                   <span className="ms-2">#</span> 
                 </Tooltip>
               <span >
                 <DropdownButton
                                 as={'div'}
                                 key={'end7'}
                                 id={`myacccmenu`}
                                 className='supplieraccmenu '
                                 drop={'start'}
                                 variant="outlined"
                                 style={{backgroundColor:"white", color:"#2182cde"}}
                                 title={  <Tooltip
                                  title={"Version Control"}>
                                  <div style={{fontSize:"0.8125rem",color:"#2A68D3", fontWeight:"500"}}><HiDotsVertical/> </div>
                            </Tooltip>}
                             >
                                 <div className='shadow rounded min-width-200px'>
                                     <MenuItem  className="f12 fw500">
                                       Remove Vendor
                                     </MenuItem>
                                   
                                     <MenuItem  className="f12 fw500">
                                       Counter Offer
                                     </MenuItem>
                                       
                                     <MenuItem  className="f12 fw500">
                                       Re-Invite
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Re-Open Quote
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Surrogate
                                     </MenuItem>
                                 </div>
                             </DropdownButton></span>
             </div>
           </div>
           
           <Table striped bordered hover responsive className="mb-0 pb-0">
             <thead>
               <tr>
                 <th className="f14 fw500">Offered Price</th>
                 <th className="f14 fw500">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
             </tbody>
           </Table>
           {isExpanded && (
                <Table striped bordered hover responsive className="mb-0 pb-0">
                    <tbody>
                        <tr >
                        <td className="f13 fw400" style={{color:"#1976d2" ,width:"202px"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                            
                        </tr>
                    </tbody>
                </Table>
            )}
           <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td style={{width:"202px"}}></td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
                </td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>  0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>      </td>
                <td className="f13 fw400">
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
          
               
               
             </tr>
           </tbody>
         </Table>
         <div className="fixed-footer">

         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        L1
         </div>
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        2560
         </div>
         </div>
         </div>

        </div>
       </div>
       <div className="vendorDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="vendor">
           <div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
             <div className="f16 d-flex justify-content-center align-items-center fw500 text-center mb-1 pe-1"  style={{textDecoration:"underline"}}>
                 Vendor A <Tooltip title={
                  <div className="row">
                    <div className="col-md-6">
                      <div>Mobile</div>
                      <div>3489489438</div>
                    </div>
                    <div className="col-md-6">
                      <div>Submission Time</div>
                      <div>17 July 2024 <span>13:18PM</span></div>
                    </div>
                  </div>
                 }>
                   <span className="ms-2">#</span> 
                 </Tooltip>
               <span >
                 <DropdownButton
                                 as={'div'}
                                 key={'end7'}
                                 id={`myacccmenu`}
                                 className='supplieraccmenu '
                                 drop={'start'}
                                 variant="outlined"
                                 style={{backgroundColor:"white", color:"#2182cde"}}
                                 title={  <Tooltip
                                  title={"Version Control"}>
                                  <div style={{fontSize:"0.8125rem",color:"#2A68D3", fontWeight:"500"}}><HiDotsVertical/> </div>
                            </Tooltip>}
                             >
                                 <div className='shadow rounded min-width-200px'>
                                     <MenuItem  className="f12 fw500">
                                       Remove Vendor
                                     </MenuItem>
                                   
                                     <MenuItem  className="f12 fw500">
                                       Counter Offer
                                     </MenuItem>
                                       
                                     <MenuItem  className="f12 fw500">
                                       Re-Invite
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Re-Open Quote
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Surrogate
                                     </MenuItem>
                                 </div>
                             </DropdownButton></span>
             </div>
           </div>
           
           <Table striped bordered hover responsive className="mb-0 pb-0">
             <thead>
               <tr>
                 <th className="f14 fw500">Offered Price</th>
                 <th className="f14 fw500">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
             </tbody>
           </Table>
           {isExpanded && (
                <Table striped bordered hover responsive className="mb-0 pb-0">
                    <tbody>
                        <tr >
                        <td className="f13 fw400" style={{color:"#1976d2" ,width:"202px"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                            
                        </tr>
                    </tbody>
                </Table>
            )}
           <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td style={{width:"202px"}}></td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
                </td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>  0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>      </td>
                <td className="f13 fw400">
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
          
               
               
             </tr>
           </tbody>
         </Table>
         <div className="fixed-footer">

         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        L1
         </div>
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        2560
         </div>
         </div>
         </div>

        </div>
       </div>
       <div className="vendorDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="vendor">
           <div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
             <div className="f16 d-flex justify-content-center align-items-center fw500 text-center mb-1 pe-1"  style={{textDecoration:"underline"}}>
                 Vendor A <Tooltip title={
                  <div className="row">
                    <div className="col-md-6">
                      <div>Mobile</div>
                      <div>3489489438</div>
                    </div>
                    <div className="col-md-6">
                      <div>Submission Time</div>
                      <div>17 July 2024 <span>13:18PM</span></div>
                    </div>
                  </div>
                 }>
                   <span className="ms-2">#</span> 
                 </Tooltip>
               <span >
                 <DropdownButton
                                 as={'div'}
                                 key={'end7'}
                                 id={`myacccmenu`}
                                 className='supplieraccmenu '
                                 drop={'start'}
                                 variant="outlined"
                                 style={{backgroundColor:"white", color:"#2182cde"}}
                                 title={  <Tooltip
                                  title={"Version Control"}>
                                  <div style={{fontSize:"0.8125rem",color:"#2A68D3", fontWeight:"500"}}><HiDotsVertical/> </div>
                            </Tooltip>}
                             >
                                 <div className='shadow rounded min-width-200px'>
                                     <MenuItem  className="f12 fw500">
                                       Remove Vendor
                                     </MenuItem>
                                   
                                     <MenuItem  className="f12 fw500">
                                       Counter Offer
                                     </MenuItem>
                                       
                                     <MenuItem  className="f12 fw500">
                                       Re-Invite
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Re-Open Quote
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Surrogate
                                     </MenuItem>
                                 </div>
                             </DropdownButton></span>
             </div>
           </div>
           
           <Table striped bordered hover responsive className="mb-0 pb-0">
             <thead>
               <tr>
                 <th className="f14 fw500">Offered Price</th>
                 <th className="f14 fw500">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
             </tbody>
           </Table>
           {isExpanded && (
                <Table striped bordered hover responsive className="mb-0 pb-0">
                    <tbody>
                        <tr >
                        <td className="f13 fw400" style={{color:"#1976d2" ,width:"202px"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                            
                        </tr>
                    </tbody>
                </Table>
            )}
           <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td style={{width:"202px"}}></td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
                </td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>  0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>      </td>
                <td className="f13 fw400">
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
          
               
               
             </tr>
           </tbody>
         </Table>
         <div className="fixed-footer">

         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        L1
         </div>
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        2560
         </div>
         </div>
         </div>

        </div>
       </div>
       <div className="vendorDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="vendor">
           <div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
             <div className="f16 d-flex justify-content-center align-items-center fw500 text-center mb-1 pe-1"  style={{textDecoration:"underline"}}>
                 Vendor A <Tooltip title={
                  <div className="row">
                    <div className="col-md-6">
                      <div>Mobile</div>
                      <div>3489489438</div>
                    </div>
                    <div className="col-md-6">
                      <div>Submission Time</div>
                      <div>17 July 2024 <span>13:18PM</span></div>
                    </div>
                  </div>
                 }>
                   <span className="ms-2">#</span> 
                 </Tooltip>
               <span >
                 <DropdownButton
                                 as={'div'}
                                 key={'end7'}
                                 id={`myacccmenu`}
                                 className='supplieraccmenu '
                                 drop={'start'}
                                 variant="outlined"
                                 style={{backgroundColor:"white", color:"#2182cde"}}
                                 title={  <Tooltip
                                  title={"Version Control"}>
                                  <div style={{fontSize:"0.8125rem",color:"#2A68D3", fontWeight:"500"}}><HiDotsVertical/> </div>
                            </Tooltip>}
                             >
                                 <div className='shadow rounded min-width-200px'>
                                     <MenuItem  className="f12 fw500">
                                       Remove Vendor
                                     </MenuItem>
                                   
                                     <MenuItem  className="f12 fw500">
                                       Counter Offer
                                     </MenuItem>
                                       
                                     <MenuItem  className="f12 fw500">
                                       Re-Invite
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Re-Open Quote
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Surrogate
                                     </MenuItem>
                                 </div>
                             </DropdownButton></span>
             </div>
           </div>
           
           <Table striped bordered hover responsive className="mb-0 pb-0">
             <thead>
               <tr>
                 <th className="f14 fw500">Offered Price</th>
                 <th className="f14 fw500">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
             </tbody>
           </Table>
           {isExpanded && (
                <Table striped bordered hover responsive className="mb-0 pb-0">
                    <tbody>
                        <tr >
                        <td className="f13 fw400" style={{color:"#1976d2" ,width:"202px"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                            
                        </tr>
                    </tbody>
                </Table>
            )}
           <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td style={{width:"202px"}}></td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
                </td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>  0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>      </td>
                <td className="f13 fw400">
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
          
               
               
             </tr>
           </tbody>
         </Table>
         <div className="fixed-footer">

         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        L1
         </div>
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        2560
         </div>
         </div>
         </div>

        </div>
       </div>
       <div className="vendorDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="vendor">
           <div className=" ps-2 pt-2 pb-2 pe-2 border  fixed-header">
             <div className="f16 d-flex justify-content-center align-items-center fw500 text-center mb-1 pe-1"  style={{textDecoration:"underline"}}>
                 Vendor A <Tooltip title={
                  <div className="row">
                    <div className="col-md-6">
                      <div>Mobile</div>
                      <div>3489489438</div>
                    </div>
                    <div className="col-md-6">
                      <div>Submission Time</div>
                      <div>17 July 2024 <span>13:18PM</span></div>
                    </div>
                  </div>
                 }>
                   <span className="ms-2">#</span> 
                 </Tooltip>
               <span >
                 <DropdownButton
                                 as={'div'}
                                 key={'end7'}
                                 id={`myacccmenu`}
                                 className='supplieraccmenu '
                                 drop={'start'}
                                 variant="outlined"
                                 style={{backgroundColor:"white", color:"#2182cde"}}
                                 title={  <Tooltip
                                  title={"Version Control"}>
                                  <div style={{fontSize:"0.8125rem",color:"#2A68D3", fontWeight:"500"}}><HiDotsVertical/> </div>
                            </Tooltip>}
                             >
                                 <div className='shadow rounded min-width-200px'>
                                     <MenuItem  className="f12 fw500">
                                       Remove Vendor
                                     </MenuItem>
                                   
                                     <MenuItem  className="f12 fw500">
                                       Counter Offer
                                     </MenuItem>
                                       
                                     <MenuItem  className="f12 fw500">
                                       Re-Invite
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Re-Open Quote
                                     </MenuItem>
                                     <MenuItem  className="f12 fw500">
                                       Surrogate
                                     </MenuItem>
                                 </div>
                             </DropdownButton></span>
             </div>
           </div>
           
           <Table striped bordered hover responsive className="mb-0 pb-0">
             <thead>
               <tr>
                 <th className="f14 fw500">Offered Price</th>
                 <th className="f14 fw500">Amount</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
               <tr>
                  <td className="f13 fw400" style={{color:"#1976d2"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
               </tr>
             </tbody>
           </Table>
           {isExpanded && (
                <Table striped bordered hover responsive className="mb-0 pb-0">
                    <tbody>
                        <tr >
                        <td className="f13 fw400" style={{color:"#1976d2" ,width:"202px"}}>
                   500{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                 <td className="f13 fw400" style={{color:"#1976d2"}}>
                   5000{' '}
                   <Tooltip title={"Base Currency"}>
                      <span > INR </span>
                   </Tooltip>
                 </td>
                            
                        </tr>
                    </tbody>
                </Table>
            )}
           <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td style={{width:"202px"}}></td>
                <td className="f13 fw400">
                 500{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip>
                </td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>  0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
                <td className="f13 fw400">
                
               </td>
               
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                <td className="f13 fw400" style={{width:"202px"}}>      </td>
                <td className="f13 fw400">
                0{' '}
                 <Tooltip title={"Base Currency"}>
                   <span> INR </span>
                 </Tooltip></td>
          
               
               
             </tr>
           </tbody>
         </Table>
         <div className="fixed-footer">

         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        L1
         </div>
         <div className="f14 fw500 border ps-2 pt-2 pb-2 pe-2 text-center " >
        2560
         </div>
         </div>
         </div>

        </div>
       </div>
       
       <div className="poDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="f16 fw500 border ps-2 pt-2 pb-2 pe-2 text-center fixed-header">
          Last PO-Details
         </div>
         <div className="po">
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <thead>
             <tr>
               <th className="f14 fw500">PO-Detail</th>
             </tr>
           </thead>
           <tbody>
             <tr>
                <td className="f13 fw400 ms-0 ps-0" style={{paddingBottom:".35rem"}}>
                 <Button className="p-0 text-start">
                     <span className="f11 fw400 me-3" style={{color:"#1976d2"}} onClick={handleOpenPoDetail}>View</span>
                 </Button>
               </td>
             </tr>
           </tbody>
         </Table>
         {isExpanded && (
                <Table striped bordered hover responsive  className="mb-0 pb-0">
                <tbody>
                  <tr >
                     
                     <td className="f13 fw400" style={{height:"37px"}}>
                    </td>
                    
                  </tr>
                </tbody>
              </Table>
            )}
         <Table striped bordered hover responsive  className="mb-0 pb-0">
           <tbody>
             <tr >
                
             <td className="f13 fw400 ms-0 ps-0" style={{paddingBottom:".35rem"}}>
                 <Button className="p-0 text-start">
                     <span className="f11 fw400 me-3" style={{color:"#1976d2"}} onClick={handleOpenPoDetail}>View</span>
                 </Button>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"37px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"37px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"35px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"37px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"36px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"36px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>

         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"36px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         </div>

        </div>
        
       </div>
       <div className="deliveryDetail mx-2 shadow" >
        <div id="pdfContent">
         <div className="f16 fw500 border ps-2 pt-2 pb-2 pe-2 text-center fixed-header">
          Delivery Location
         </div>
         <div className="delivery">
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <thead>
             <tr>
               <th className="f14 fw500">Delivery Location</th>
             </tr>
           </thead>
           <tbody>
             <tr>
                <td className="f13 fw400 ms-0 ps-0" style={{paddingBottom:".35rem"}}>
                 <Button className="p-0 text-start">
                     <span className="f11 fw400 me-3" style={{color:"#1976d2"}}>Noida</span>
                 </Button>
               </td>
             </tr>
             <tr>
                <td className="f13 fw400 ms-0 ps-0" style={{paddingBottom:".35rem"}}>
                 <Button className="p-0 text-start">
                     <span className="f11 fw400 me-3" style={{color:"#1976d2"}}>Noida</span>
                 </Button>
               </td>
             </tr>
           </tbody>
         </Table>
         {isExpanded && (
                <Table striped bordered hover responsive  className="mb-0 pb-0">
                <tbody>
                  <tr >
                     
                     <td className="f13 fw400" style={{height:"37px"}}>
                    </td>
                    
                  </tr>
                </tbody>
              </Table>
            )}
         <Table striped bordered hover responsive  className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"37px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"37px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"37px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"35px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"37px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"36px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         <Table striped bordered hover responsive className="mb-0 pb-0">
           <tbody>
             <tr >
                
                <td className="f13 fw400" style={{height:"36px"}}>
               </td>
               
             </tr>
           </tbody>
         </Table>
         </div>

        </div>
        
       </div>
                </div>
       
               </div>
      
     </div>
            ):(
              <></>
            )}
            {value == 1 ? (
           		<div className="commercialTable">

               <Table striped bordered hover responsive className="mb-0 pb0">
                 <thead>
                   <tr>
                     <th className="f14 fw500">SrNo.</th>
                     <th className="f14 fw500">Commercial Terms</th>
                     <th className="vendorName f14 fw500">Vendor A</th>
                     <th className="vendorName f14 fw500">Vendor A</th>
                     <th className="vendorName f14 fw500">Vendor A</th>
                     <th className="vendorName f14 fw500">Vendor A</th>
                     <th className="vendorName f14 fw500">Vendor A</th>
                     <th className="vendorName f14 fw500">Vendor A</th>
                     <th className="f14 fw500">Our Requirement</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                      <td className="f13 fw400">
                       1
                     </td>
                      <td className="f13 fw400">
                       Item 1 || Id: cd26
                     </td>
                     <td className="f13 fw400">
                        Cd26
                     </td>
                      <td className="f13 fw400">
                       20
                     </td>
                      <td className="f13 fw400">
                       Ton
                     </td>
                      <td className="f13 fw400">
                       500{' '}
                       <Tooltip title={"Base Currency"}>
                         <span> INR </span>
                       </Tooltip>
                     </td>
                     <td className="f13 fw400">
                       500{' '}
                       <Tooltip title={"Base Currency"}>
                         <span> INR </span>
                       </Tooltip>
                     </td>
                     <td className="f13 fw400">
                       500{' '}
                       <Tooltip title={"Base Currency"}>
                         <span> INR </span>
                       </Tooltip>
                     </td>
                     <td className="f13 fw400">
                       500{' '}
                       <Tooltip title={"Base Currency"}>
                         <span> INR </span>
                       </Tooltip>
                     </td>
                     
                     
                   </tr>
                   
                 </tbody>
               </Table>           
                 </div>):(<></>)}
           {value == 2 ? (
          	<div className="commercialTable">

            <Table striped bordered hover responsive className="mb-0 pb0">
              <thead>
                <tr>
                  <th className="f14 fw500">SrNo.</th>
                  <th className="f14 fw500">Vendor Remarks</th>
                  <th className="vendorName f14 fw500">Vendor A</th>
                  <th className="vendorName f14 fw500">Vendor A</th>
                  <th className="vendorName f14 fw500">Vendor A</th>
                  <th className="vendorName f14 fw500">Vendor A</th>
                  <th className="vendorName f14 fw500">Vendor A</th>
                  <th className="vendorName f14 fw500">Vendor A</th>
                  <th className="f14 fw500">Our Requirement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                   <td className="f13 fw400">
                    1
                  </td>
                   <td className="f13 fw400">
                    Item 1 || Id: cd26
                  </td>
                  <td className="f13 fw400">
                     Cd26
                  </td>
                   <td className="f13 fw400">
                    20
                  </td>
                   <td className="f13 fw400">
                    Ton
                  </td>
                   <td className="f13 fw400">
                    500{' '}
                    <Tooltip title={"Base Currency"}>
                      <span> INR </span>
                    </Tooltip>
                  </td>
                  <td className="f13 fw400">
                    500{' '}
                    <Tooltip title={"Base Currency"}>
                      <span> INR </span>
                    </Tooltip>
                  </td>
                  <td className="f13 fw400">
                    500{' '}
                    <Tooltip title={"Base Currency"}>
                      <span> INR </span>
                    </Tooltip>
                  </td>
                  <td className="f13 fw400">
                    500{' '}
                    <Tooltip title={"Base Currency"}>
                      <span> INR </span>
                    </Tooltip>
                  </td>
                  
                  
                </tr>
                
              </tbody>
            </Table>           
              </div>
           ):(<></>)}

           {value == 3 ? (<>
           <NewQuotation/>
           </>):(<></>)}
            <>
            <Modal
				size="md"
				show={openSupplier}
				backdrop="static"
				// keyboard={false}
				//  className=""
				// backdropClassName=""
				centered
				contentClassName="border-0 rounded"
				className="zindex1280"
				backdropClassName="zindex1280"
				onHide={() => handleCloseSupplier()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">View Supplier</div>
					</Modal.Title>

					<IconButton onClick={() => handleCloseSupplier()} size="small" edge="start">
						<HiOutlineX className="text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
            <div className="row">
                <div className="col-md-10">

          <FormControl variant="outlined" className="w-100">
        <Input
          id="input-with-icon-adornment"
          placeholder="Search Supplier"
          startAdornment={
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <DropdownButton
                                as={'div'}
                                key={'end7'}
                                id={`myacccmenu`}
                                className='supplieraccmenu '
                                drop={'bottom'}
                                variant="outlined"
                                style={{backgroundColor:"white", color:"#2182cde"}}
                                title={  <Tooltip
                                 title={"Filter"}>
                                 <div> <FilterAltOutlined/> </div>
                           </Tooltip>}
                            >
                                <div className=' rounded '>
                                      <MenuItem className="p-2">
                                     <span className="f13 fw400">Not Quoted</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Quoted</span>
                                    </MenuItem>
                                </div>
                            </DropdownButton>
            </InputAdornment>
          }
        />
      </FormControl>
                </div>
                <div className="col-md-2 m-0 p-0">

      <DropdownButton
                                as={'div'}
                                key={'end7'}
                                className='supplieraccmenu  p-0 m-0'
                                drop={'bottom'}
                                variant="outlined"
                                title={  <Tooltip
                                 title={"Actions"}>
                                 <Button className="p-0 m-0 f11" disableOutline={true} > Actions </Button>
                           </Tooltip>}
                            >
                                <div className=' rounded '>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Re-Open Quote</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Surrogate</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Re-Invite</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Counter-Offer</span>
                                    </MenuItem>
                                </div>
                            </DropdownButton>
                </div>
            </div>
      <div className="row" style={{paddingLeft:".7rem" , paddingRight:".7rem"}}>
      <Table striped bordered hover>
      <thead>
        <tr>
          <th><FormControlLabel control={<Checkbox />}  /></th>
          <th className="pb-3 f15 fw500">Vendor Details</th>
          <th className="pb-3 f15 fw500">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><FormControlLabel control={<Checkbox />}  /></td>
          <td className="pt-3 f14 fw400">A Vendor: avendor1121@gmail.com</td>
          <td className="text-success pt-3 f14 fw400">Quoted</td>
        </tr>
        <tr>
          <td><FormControlLabel control={<Checkbox />}  /></td>
          <td className="pt-3 f14 fw400">A Vendor: avendor1121@gmail.com</td>
          <td className="text-success pt-3 f14 fw400">Quoted</td>
        </tr>
        <tr>
          <td><FormControlLabel control={<Checkbox />}  /></td>
          <td className="pt-3 f14 fw400">A Vendor: avendor1121@gmail.com</td>
          <td className="text-success pt-3 f14 fw400">Quoted</td>
        </tr>
      </tbody>
    </Table>
    <div className="text-end">
        <Button variant="contained">Add</Button>
    </div>
      </div>
					</div>
				</Modal.Body>
			</Modal>
            <Modal
				size="md"
				show={openViewSupplier}
				backdrop="static"
				// keyboard={false}
				//  className=""
				// backdropClassName=""
				centered
				contentClassName="border-0 rounded"
				className="zindex1280"
				backdropClassName="zindex1280"
				onHide={() => handleCloseViewSupplier()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">View Supplier</div>
					</Modal.Title>

					<IconButton onClick={() => handleCloseViewSupplier()} size="small" edge="start">
						<HiOutlineX className="text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
                    <FormControl variant="outlined" className="w-100">
        <Input
          id="input-with-icon-adornment"
          placeholder="Search Supplier"
          startAdornment={
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <DropdownButton
                                as={'div'}
                                key={'end7'}
                                id={`myacccmenu`}
                                className='supplieraccmenu '
                                drop={'bottom'}
                                variant="outlined"
                                style={{backgroundColor:"white", color:"#2182cde"}}
                                title={  <Tooltip
                                 title={"Filter"}>
                                 <div> <FilterAltOutlined/> </div>
                           </Tooltip>}
                            >
                                <div className=' rounded '>
                                      <MenuItem className="p-2">
                                     <span className="f13 fw400">Not Quoted</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Quoted</span>
                                    </MenuItem>
                                </div>
                            </DropdownButton>
            </InputAdornment>
          }
        />
      </FormControl>
      <div className="row" style={{paddingLeft:".7rem" , paddingRight:".7rem", paddingTop:".7rem"}}>
      <div className="table-container ms-0 ps-0 m-0 p-0">
      <div className="table-header row" style={{paddingLeft:".7rem" , paddingRight:".7rem", }}>
        <div className="col-md-8 header-cell">Vendor Details</div>
        <div className="col-md-2 header-cell">Status</div>
        <div className="col-md-2 header-cell text-end">Action</div>
      </div>
      <hr className="m-0 p-0"></hr>
      <div className="row align-items-center" style={{paddingLeft:".7rem" , paddingRight:".7rem", }}>
        <div className=" col-md-8 table-cell f14 fw400">A Vendor: avendor1121@gmail.com</div>
        <div className=" col-md-3 table-cell text-success  f14 fw400">Quoted</div>
        <div className=" col-md-1 table-cell text-end">
          <DropdownButton
                                as={'div'}
                                key={'end7'}
                                id={`myacccmenu`}
                                className='supplieraccmenu '
                                drop={'bottom'}
                                variant="outlined"
                                style={{backgroundColor:"white", color:"#2182cde"}}
                                title={  <Tooltip
                                 title={"Actions"}>
                                 <div> <HiDotsVertical/> </div>
                           </Tooltip>}
                            >
                                <div className=' rounded '>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Re-Open Quote</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Surrogate</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Re-Invite</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Counter-Offer</span>
                                    </MenuItem>
                                </div>
                            </DropdownButton></div>
      </div>
      <hr className="m-0 p-0"></hr>
      <div className="row align-items-center" style={{paddingLeft:".7rem" , paddingRight:".7rem", }}>
        <div className=" col-md-8 table-cell f14 fw400">A Vendor: avendor1121@gmail.com</div>
        <div className=" col-md-3 table-cell text-success f14 fw400">Quoted</div>
        <div className=" col-md-1 table-cell text-end">
            <DropdownButton
                                as={'div'}
                                key={'end7'}
                                id={`myacccmenu`}
                                className='supplieraccmenu '
                                drop={'bottom'}
                                variant="outlined"
                                style={{backgroundColor:"white", color:"#2182cde"}}
                                title={  <Tooltip
                                 title={"Actions"}>
                                 <div> <HiDotsVertical/> </div>
                           </Tooltip>}
                            >
                                <div className=' rounded '>
                                      <MenuItem className="p-2">
                                     <span className="f13 fw400">Re-Open Quote</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Surrogate</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Re-Invite</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Counter-Offer</span>
                                    </MenuItem>
                                </div>
                            </DropdownButton></div>
      </div>
      <hr className="m-0 p-0"></hr>
      <div className="row align-items-center" style={{paddingLeft:".7rem" , paddingRight:".7rem", }}>
        <div className="col-md-8 table-cell f14 fw400">A Vendor: avendor1121@gmail.com</div>
        <div className="col-md-3 table-cell text-danger f14 fw400">Not Quoted</div>
        <div className=" col-md-1 table-cell text-end "><DropdownButton
                                as={'div'}
                                key={'end7'}
                                id={`myacccmenu`}
                                className='supplieraccmenu '
                                drop={'bottom'}
                                variant="outlined"
                                style={{backgroundColor:"white", color:"#2182cde"}}
                                title={  <Tooltip
                                 title={"Actions"}>
                                 <div> <HiDotsVertical/> </div>
                           </Tooltip>}
                            >
                                <div className=' rounded '>
                                <MenuItem className="p-2">
                                     <span className="f13 fw400">Send Reminder</span>
                                    </MenuItem>
                                <MenuItem className="p-2">
                                     <span className="f13 fw400">Surrogate</span>
                                    </MenuItem>
                                    <MenuItem className="p-2">
                                     <span className="f13 fw400">Re-Invite</span>
                                    </MenuItem>
                                </div>
                            </DropdownButton></div>
      </div>
      <hr className="m-0 p-0"></hr>
    </div>
      </div>
					</div>
				</Modal.Body>
			</Modal>
      <Modal
				size="md"
				show={openPoDetail}
				backdrop="static"
				// keyboard={false}
				//  className=""
				// backdropClassName=""
				centered
				contentClassName="border-0 rounded"
				className="zindex1280"
				backdropClassName="zindex1280"
				onHide={() => handleClosePoDetail()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">PO Details</div>
					</Modal.Title>

					<IconButton onClick={() => handleClosePoDetail()} size="small" edge="start">
						<HiOutlineX className="text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
      <div className="row" style={{paddingLeft:".7rem" , paddingRight:".7rem", paddingTop:".7rem"}}>
      <Table striped bordered hover responsive className="mb-0 pb0">
          <thead>
            <tr>
              <th className="f12 fw500">SrNo.</th>
              <th className="f12 fw500"> PO No</th>
              <th className="f12 fw500">PO Date </th>
              <th className="f12 fw500">Vendor Name</th>
              <th className="f12 fw500">Unit Rate</th>
              <th className="f12 fw500">Po Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
               <td className="f12 fw400">
                1
              </td>
               <td className="f12 fw400">
               1528
              </td>
              <td className="f12 fw400">
                20 July 2024
              </td>
               <td className="f12 fw400">
                A Vendor
              </td>
               <td className="f12 fw400">
                500
              </td>
               <td className="f12 fw400">
                500{' '}
                <Tooltip title={"Base Currency"}>
                  <span> INR </span>
                </Tooltip>
              </td>
              
            </tr>
            
          </tbody>
        </Table>
      </div>
					</div>
				</Modal.Body>
			</Modal>
            </> 
        </div>
        
	);
};


export default EERFQComparative;

const countryDialCodes = [
  { code: '+1', country: 'United States' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+91', country: 'India' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  // Add more entries as needed
];
const timeZones = [
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'ECT', label: 'ECT (European Central Time)' },
    { value: 'EET', label: 'EET (Eastern European Time)' },
    { value: 'ART', label: 'ART (Egypt Standard Time)' },
    { value: 'EAT', label: 'EAT (Eastern African Time)' },
    { value: 'MET', label: 'MET (Middle East Time)' },
    { value: 'NET', label: 'NET (Near East Time)' },
    { value: 'PLT', label: 'PLT (Pakistan Lahore Time)' },
    { value: 'IST', label: 'IST (India Standard Time)' },
    { value: 'BST', label: 'BST (Bangladesh Standard Time)' },
    { value: 'VST', label: 'VST (Vietnam Standard Time)' },
    { value: 'CTT', label: 'CTT (China Taiwan Time)' },
    { value: 'JST', label: 'JST (Japan Standard Time)' },
    { value: 'ACT', label: 'ACT (Australia Central Time)' },
    { value: 'AET', label: 'AET (Australia Eastern Time)' },
    { value: 'SST', label: 'SST (Solomon Standard Time)' },
    { value: 'NST', label: 'NST (New Zealand Standard Time)' },
  ];
  