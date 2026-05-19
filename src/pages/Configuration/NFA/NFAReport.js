import React, { useEffect, useState } from 'react'
import { formatDateViaLocale, formatDateViaLocale2, formatDateViaLocalet, formatDateViaTime, formatDateViaTimeZone, formattimeoption, renderHtmlAsText } from '../../../utils/common/utility'
import { useNavigate } from 'react-router-dom';
import { api, ApiClient } from '../../../Apiclient';
import { useStateValue } from '../../../store';
import IconButton from "@mui/material/IconButton";
import {
  Close,
  ExpandLess,
  ExpandMore,
  Info,
  AccessTime,
  Person,
  AttachMoney,
  Business,
  Category,
  Description,
} from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  ButtonGroup,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  createFilterOptions,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { findStringByValueFromArray, downloadFilesOnAzure ,getFileName } from '../../../utils/common';
import { getNFAManageFindById,buildQueryParams } from '../../../utils/common/utility';
import { use } from 'react';
import { HiDownload } from "react-icons/hi";
// import { downloadFilesOnAzure ,getFileName} from '../../../utils/common';
// Report tab for NFA
const NFAReport = ({props}) => {
  const navigate = useNavigate();
  const [{ atoken, rtoken, customerid,customersuffix,roleClaims, userDetail }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  //Use States for NFA General Details
  const [nfaGeneralDetails, setNfaGeneralDetails] = useState({});
  const [items, setItems] = useState([]);
  const [vendorPackages, setVendorPackages] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [basisOf, setBasisOf] = useState(""); // Track allocation basis from API
  const [expandedItems, setExpandedItems] = useState({}); // Track expanded items for item-based view
  const [allocationErrors, setAllocationErrors] = useState({}); // Track allocation validation errors
  const [valueType, setValueType] = useState(""); // State for value type dropdown
  const [totalQuantity, setTotalQuantity] = useState(0); // Total quantity for validation
  const [loading, setLoading] = useState(false); // Loading state for save operations
  const [isLoading, setIsLoading] = useState(false); // Loading state for save button
  const [hasAllocationChanges, setHasAllocationChanges] = useState(false); // Track if allocations have been modified

  // Fetch NFA General Details
  const getNFAGeneralDetails = async () => {
    var data = {
      nfaId: parseInt(props.eventId),
    };
    const queryParams = buildQueryParams(data);
    const res = await apiClient.getres(
			`/api/NFAManage/NFAReportData?${queryParams}`,
			atoken
		);
    if(res?.data){
      setNfaGeneralDetails(res?.data);
    }
  }
  // Fetch SOB Details
  const getSOBDetails = async () => {
    const params = {
        NFAId: parseInt(props.eventId),
        EventId: nfaGeneralDetails.nfaEventId,
        EventType: nfaGeneralDetails.nfaEventType,
        BasisOf: "",
        Version: nfaGeneralDetails.version ?? 1,
    };
    const queryParams = buildQueryParams(params);
    const res = await apiClient.getres(`/api/NFAManage/GetItemWiseData?${queryParams}`, atoken);
    if (res) {
        setItems(res?.data?.items || []);
        setVendorPackages(res?.data?.packageWiseData || []);

    }
  };
  // Fetch Question List
  const getQuestionList = async () => {
      const params = {
        NFAId: parseInt(props.eventId),
        Version: parseInt(nfaGeneralDetails?.version)

      };
      const queryParams = buildQueryParams(params);
      const res = await apiClient.getres(`/api/NFAQuestionLib/Find?${queryParams}`, atoken);
      if (res) {
        const data = res?.data?.result;
        setQuestionList(data || []);
      }
  }
  // Fetch NFA General Details initially and on eventId change
  useEffect(() => {
    if(props.eventId){
      getNFAGeneralDetails();
    }
  },[props.eventId])

  // Fetch SOB Details when nfaGeneralDetails is updated
  useEffect(() => {
    if(nfaGeneralDetails?.nfaEventId && nfaGeneralDetails?.nfaEventType && nfaGeneralDetails?.version){
      getSOBDetails();
      getQuestionList();
      // Reset allocation changes flag when loading fresh data
      setHasAllocationChanges(false);
    }
  },[nfaGeneralDetails])

  // Set basisOf, valueType, and totalQuantity from vendorPackages data
  useEffect(() => {
    if (vendorPackages && vendorPackages.length > 0) {
      if (vendorPackages[0]?.allocationOn) {
        setBasisOf(vendorPackages[0]?.allocationOn);
      }
      if (vendorPackages[0]?.valueType) {
        setValueType(vendorPackages[0]?.valueType);
      }
      // Calculate total quantity for validation
      const total = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setTotalQuantity(total);
    }
  }, [vendorPackages, items])

  // Helper function to format currency
  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'under approval':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'within budget':
        return 'success';
      case 'over budget':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to render question answers
  const renderQuestionAnswer = (question) => {
    if (question.optionType && question.questionOption?.length > 0) {
      const selectedOptions = question.questionOption.filter(option => option.selectYN === 'Y');
      return selectedOptions.map(option => option.questionOption).join(', ') || 'No selection';
    }
    return question.answer || 'No answer provided';
  };

  // Handle expand/collapse for items in item-based view
  const handleItemExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Helper function to format allocation based on valueType
  const formatAllocation = (allocation, valueType) => {
    if (!allocation && allocation !== 0) return '0';
    return valueType === 'percentage' ? `${allocation}%` : `${allocation}`;
  };

  // Helper function to get allocation header text based on valueType
  const getAllocationHeaderText = (valueType) => {
    return valueType === 'percentage' ? 'Allocation (%)' : 'Allocation';
  };

  // Handle allocation change for package-based allocation
  const handleAllocationChangePackage = (vendorId, value) => {
    // Allow only numbers and up to 4 decimal places
    if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
        const finalPrice = parseFloat(vendorPackages.find(pkg => pkg.vendorId === vendorId)?.finalPrice) || 0;
        const updatedPackages = vendorPackages.map(pkg =>
            pkg.vendorId === vendorId
                ? {
                    ...pkg, allocation: value,
                    totalPrice: (valueType === 'percentage' ? ((parseFloat(value || 0) / 100) * finalPrice).toFixed(4) : (parseFloat(value || 0)).toFixed(4))
                } // keep as string
                : pkg
        );

        // Calculate new total based on updated values
        const newTotal = updatedPackages.reduce((sum, v) => {
            const val = parseFloat(v.allocation);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        // Error checking based on valueType
        let errorMsg = '';
        if (valueType === 'percentage' && newTotal > 100) {
            errorMsg = 'Total allocation cannot exceed 100%';
        } else if (valueType === 'absolute' && newTotal > totalQuantity && totalQuantity != 0) {
            errorMsg = `Total allocation cannot exceed ${totalQuantity}`;
        }

        // Set error message for this vendor
        setAllocationErrors(errors => ({
            ...errors,
            [vendorId]: errorMsg
        }));

        // Prevent state update if error exists
        if (errorMsg) return;

        // Update totals for each vendor
        if (valueType == 'percentage') {

        }
        else {

        }
        // Set the updated allocations
        setVendorPackages(updatedPackages);
        
        // Mark that allocations have been changed
        setHasAllocationChanges(true);
    }
  };

  // Handle allocation change for item-based allocation
  const handleAllocationChangeItem = (itemId, vendorId, value) => {
    // Allow only numbers and up to 4 decimal places
    if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
        // Find the vendor package for this specific item and vendor
        const vendorPackage = vendorPackages.find(pkg => pkg.vendorId === vendorId && pkg.itemId === itemId);
        const finalPrice = parseFloat(vendorPackage?.finalPrice) || 0;

        // Update the specific vendor package for this item
        const updatedPackages = vendorPackages.map(pkg =>
            pkg.vendorId === vendorId && pkg.itemId === itemId
                ? {
                    ...pkg,
                    allocation: value,
                    totalPrice: (valueType === 'percentage' ?
                        ((parseFloat(value || 0) / 100) * finalPrice).toFixed(4) :
                        (parseFloat(value || 0)).toFixed(4))
                }
                : pkg
        );

        // Get the item details to check quantity for absolute allocation
        const currentItem = items.find(item => item.id === itemId);
        const itemQuantity = currentItem?.quantity || 0;

        // Calculate total allocation for this specific item across all vendors
        const itemVendorPackages = updatedPackages.filter(pkg => pkg.itemId === itemId);
        const newTotal = itemVendorPackages.reduce((sum, v) => {
            const val = parseFloat(v.allocation);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

        // Error checking based on valueType for this specific item
        let errorMsg = '';
        if (valueType === 'percentage' && newTotal > 100) {
            errorMsg = 'Total allocation for this item cannot exceed 100%';
        } else if (valueType === 'absolute' && newTotal > itemQuantity && itemQuantity != 0) {
            errorMsg = `Total allocation for this item cannot exceed ${itemQuantity}`;
        }

        // Set error message for this vendor (using a composite key for item-specific errors)
        const errorKey = `${vendorId}-${itemId}`;
        setAllocationErrors(errors => ({
            ...errors,
            [errorKey]: errorMsg
        }));

        // Prevent state update if error exists
        if (errorMsg) return;

        // Clear any existing error for this vendor-item combination
        setAllocationErrors(errors => {
            const newErrors = { ...errors };
            delete newErrors[errorKey];
            return newErrors;
        });

        // Update the vendor packages state
        setVendorPackages(updatedPackages);
        
        // Mark that allocations have been changed
        setHasAllocationChanges(true);
    }
  };

  // Handle price change for new vendors
  const handleNewSupplierPrice = (vendorId, value, itemId = null) => {
    // Allow only numbers and up to 4 decimal places
    if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
        const updatedPackages = vendorPackages.map(pkg => {
            // For item-wise view, match both vendorId and itemId
            if (basisOf === 'item' && itemId !== null) {
                return (pkg.vendorId === vendorId && pkg.itemId === itemId)
                    ? { ...pkg, finalPrice: value } // keep as string
                    : pkg;
            }
            // For package-wise view, match only vendorId
            else {
                return pkg.vendorId === vendorId
                    ? { ...pkg, finalPrice: value } // keep as string
                    : pkg;
            }
        });

        // Set the updated allocations
        setVendorPackages(updatedPackages);
    }
  };

  // Save SOB details (allocation changes)
  const saveSOBDetails = async () => {
    setIsLoading(true);
    try {
      const sobData = vendorPackages.map(vendor => ({
        id: vendor.id || null,
        vendorId: vendor.vendorId,
        companyName: vendor.companyName,
        nfaId: parseInt(props.eventId),
        nfaEventId: nfaGeneralDetails.nfaEventId,
        nfaEventType: nfaGeneralDetails.nfaEventType,
        packageRank: vendor.packageRank,
        initialPrice: vendor.initialPrice,
        finalPrice: vendor.finalPrice,
        allocation: vendor.allocation,
        itemId: basisOf === 'item' ? (vendor.itemId || 0) : 0,
        newVendor: vendor.newVendor,
        allocationOn: basisOf,
        valueType: vendor.valueType,
        totalPrice: vendor.totalPrice,
        customerId: customerid,
        version: nfaGeneralDetails?.version || 1
      }));

      const queryParams = buildQueryParams({ data: sobData });
      const res = await apiClient.postres(`/api/NFASOBDetails/${parseInt(props.eventId)}/Add`, sobData, atoken);
      
      if (res?.success) {
        // Refresh SOB data after successful save
        getSOBDetails();
        // Reset the allocation changes flag
        setHasAllocationChanges(false);
        // Show success message if you have toast notifications
        // toast.success('Allocation saved successfully!');
      }
    } catch (error) {
      console.error('Error saving SOB details:', error);
      // toast.error('Failed to save allocation details');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can edit (you may need to add permission logic here)
  const canEdit = true; // Replace with actual permission check
  // const isDraftStage = nfaGeneralDetails?.stage?.toLowerCase() === 'draft';
  const canEditAllocations = canEdit;

  return (
    <Box sx={{ padding: 0, minHeight: '100vh' }}>
      {/* NFA Summary Accordion */}
      <Accordion sx={{ marginBottom: 1, boxShadow: 1 }} defaultExpanded>
        <AccordionSummary 
          expandIcon={<ExpandMore />}
          sx={{ 
            backgroundColor: '#f9f9f9', 
            color: 'black',
            minHeight: '44px !important',
            maxHeight: '44px !important',
            height: '44px !important',
            '& .MuiAccordionSummary-content': { 
              margin: '6px 0 !important',
              '&.Mui-expanded': { margin: '6px 0 !important' }
            },
            '& .MuiAccordionSummary-expandIconWrapper': { color: 'black' }
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'black' }}>
            NFA Summary
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 3 }}>
          {/* First Row */}
          <Grid item xs={12}>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                <strong>Subject : </strong> {nfaGeneralDetails?.nfaSubject || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                <strong>Description : </strong>
                <Box sx={{ padding: 2, borderRadius: 1, border: '1px solid #e0e0e0', marginTop: 1 }}>
                  <div dangerouslySetInnerHTML={{ 
                    __html: nfaGeneralDetails?.nfaDescription || 'No description available'
                  }} />
                </Box>
              </Typography>
              
            </Grid>
          {/* Second Row */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  <strong>Event Code : </strong> {nfaGeneralDetails?.eventCode || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  <strong>Created Date : </strong>{nfaGeneralDetails?.createdOn 
                      ? formatDateViaLocale(nfaGeneralDetails.createdOn)
                      : 'N/A'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  <strong>Status : </strong>{nfaGeneralDetails?.stage || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          {/* Third Row */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  <strong>Purchase Org : </strong> {nfaGeneralDetails?.purchaseOrg || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  <strong>Purchase Group : </strong>{nfaGeneralDetails?.purchaseGroup || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  <strong>Type of Spend : </strong>{nfaGeneralDetails?.spend || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          {/* Fourth Row */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  <strong>Category : </strong> {nfaGeneralDetails?.category || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  <strong>Project Name : </strong>{nfaGeneralDetails?.project || nfaGeneralDetails?.projectName || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  <strong>Exception : </strong>{nfaGeneralDetails?.exception || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          {/* Fifth Row */}
          {nfaGeneralDetails?.remarks && <Grid item xs={12}>
                  <Typography variant="body1"><strong>Remarks : </strong> 
                  <Box sx={{ padding: 2, borderRadius: 1, border: '1px solid #e0e0e0', marginTop: 1 }}>
                    <div dangerouslySetInnerHTML={{ 
                        __html: nfaGeneralDetails?.remarks || 'No remarks available'
                      }} />
                  </Box>
                  </Typography>
              </Grid>
          }
          
        </AccordionDetails>
      </Accordion>

      {/* Description Accordion */}
      {/* <Accordion sx={{ marginBottom: 1, boxShadow: 1 }} defaultExpanded>
        <AccordionSummary 
          expandIcon={<ExpandMore />}
          sx={{ 
            backgroundColor: '#f9f9f9', 
            color: 'black',
            minHeight: '44px !important',
            maxHeight: '44px !important',
            height: '44px !important',
            '& .MuiAccordionSummary-content': { 
              margin: '6px 0 !important',
              '&.Mui-expanded': { margin: '6px 0 !important' }
            },
            '& .MuiAccordionSummary-expandIconWrapper': { color: 'black' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: 'black' }}>
            <Description sx={{ fontSize: '1.1rem', color: 'black' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'black' }}>
              Description
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                <strong>Subject : </strong> {nfaGeneralDetails?.nfaSubject || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                <strong>Description : </strong>
                <Box sx={{ backgroundColor: '#f9f9f9', padding: 2, borderRadius: 1, border: '1px solid #e0e0e0', marginTop: 1 }}>
                  <div dangerouslySetInnerHTML={{ 
                    __html: nfaGeneralDetails?.nfaDescription || 'No description available'
                  }} />
                </Box>
              </Typography>
              {nfaGeneralDetails?.remarks && (
                <>
                  <Typography variant="body1"><strong>Remarks : </strong> 
                  <Box sx={{ backgroundColor: '#f9f9f9', padding: 2, borderRadius: 1, border: '1px solid #e0e0e0', marginTop: 1 }}>
                    <div dangerouslySetInnerHTML={{ 
                        __html: nfaGeneralDetails?.remarks || 'No remarks available'
                      }} />
                  </Box>
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion> */}

      {/* Questions & Responses Accordion */}
      {questionList && questionList.length > 0 && (
        <Accordion sx={{ marginBottom: 1, boxShadow: 1 }} defaultExpanded>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ 
              backgroundColor: '#f9f9f9', 
              color: 'black',
              minHeight: '44px !important',
              maxHeight: '44px !important',
              height: '44px !important',
              '& .MuiAccordionSummary-content': { 
                margin: '6px 0 !important',
                '&.Mui-expanded': { margin: '6px 0 !important' }
              },
              '& .MuiAccordionSummary-expandIconWrapper': { color: 'black' }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'black' }}>
              Questions & Responses ({questionList.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 3 }}>
            {questionList.map((question, index) => (
              <Box key={question.id} sx={{ marginBottom: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' ,marginBottom: 1}}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flex: 1 }}>
                        {question.questionDescription}
                      </Typography>
                      {question.attachedFileName && (
                        <div 
                          title={getFileName(question.attachedFileName)}
                          style={{ 
                            cursor: 'pointer', 
                            fontSize: '14px', 
                            color: '#1976d2',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <HiDownload
                            onClick={() => downloadFilesOnAzure(question.attachedFileName,getFileName(question.attachedFileName),atoken)} 
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      )}
                      {question.libraryEntity && (
                        <Chip label={question.libraryEntity} size="small" color="primary" variant="outlined" />
                      )}
                  </Box>
                  <Box sx={{ padding: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                    {question.questionRequirement && (
                      <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 2 }}>
                        <strong>Requirement : </strong>{question.questionRequirement}
                      </Typography>
                    )}
                    <Typography variant="body1" sx={{ marginBottom: 2 }}>
                      <strong>Response : </strong> {renderQuestionAnswer(question)}
                    </Typography>                    
                    {question.ansAttachements && (
                      <div 
                        title={getFileName(question.ansAttachements)}
                        style={{ 
                          cursor: 'pointer', 
                          fontSize: '14px', 
                          color: '#1976d2',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <HiDownload
                          onClick={() => downloadFilesOnAzure(question.ansAttachements,getFileName(question.ansAttachements),atoken)} 
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    )}
                  </Box>
              </Box>

            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Items and Vendor Data Accordion */}
      {(items.length > 0 || vendorPackages.length > 0) && (
        <Accordion sx={{ boxShadow: 1 }} defaultExpanded>
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            sx={{ 
              backgroundColor: '#f9f9f9', 
              color: 'black',
              minHeight: '44px !important',
              maxHeight: '44px !important',
              height: '44px !important',
              '& .MuiAccordionSummary-content': { 
                margin: '6px 0 !important',
                '&.Mui-expanded': { margin: '6px 0 !important' }
              },
              '& .MuiAccordionSummary-expandIconWrapper': { color: 'black' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: 'black' }}>
              <Business sx={{ fontSize: '1.1rem', color: 'black' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'black' }}>
                SOB Details
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 3 }}>
            {/* Display allocation basis info */}
            {basisOf && (
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                <strong>Allocation Basis : </strong> {` ${basisOf.charAt(0).toUpperCase() + basisOf.slice(1)}`}
              </Typography>
            )}

            {/* Item-based view */}
            {basisOf === 'item' && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                  Item-wise Vendor Allocation ({items.length} items)
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Item Code</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Item / Service</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Target Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>UOM</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Plant</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => [
                        <TableRow key={item.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.itemCode || '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>{item.itemName}</TableCell>
                          <TableCell>{item.quantity} {item.uom && `(${item.uom})`}</TableCell>
                          <TableCell>{item.targetPrice ? formatCurrency(item.targetPrice, nfaGeneralDetails?.nfaCurrency) : 'N/A'}</TableCell>
                          <TableCell>{item.uom}</TableCell>
                          <TableCell>{item.plant}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleItemExpand(item.id)}
                              sx={{
                                transform: expandedItems[item.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                              }}
                            >
                              <ExpandMore />
                            </IconButton>
                          </TableCell>
                        </TableRow>,
                        expandedItems[item.id] && (
                          <TableRow key={`${item.id}-expanded`}>
                            <TableCell colSpan={8} sx={{ padding: 0, backgroundColor: '#f8f9fa' }}>
                              <Box sx={{ padding: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', marginBottom: 1, color: '#1976d2' }}>
                                  Vendor Quotes for {item.itemName}
                                </Typography>
                                <TableContainer>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                        <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '250px' }}>Vendor Details</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Item Rank</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Initial Price</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Final Price</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '130px' }}>Price Reduction</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>
                                          {getAllocationHeaderText(vendorPackages.find(vp => vp.itemId === item.id)?.valueType)}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Total</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {vendorPackages && vendorPackages.filter(vp => vp.itemId === item.id).length > 0 ? (
                                        vendorPackages
                                          .filter(vp => vp.itemId === item.id)
                                          .map((vendorItem, vendorIndex) => (
                                            <TableRow key={vendorItem.vendorId} hover>
                                              <TableCell>{vendorIndex + 1}</TableCell>
                                              <TableCell sx={{ fontWeight: 'medium', wordBreak: 'break-word' }}>
                                                {vendorItem.companyName}
                                              </TableCell>
                                              <TableCell>
                                                {vendorItem.packageRank}
                                              </TableCell>
                                              <TableCell>
                                                {vendorItem.initialPrice !== 0 ? formatCurrency(vendorItem.initialPrice, nfaGeneralDetails?.nfaCurrency) : 'Not Quoted'}
                                              </TableCell>
                                              <TableCell>
                                                {vendorItem.finalPrice !== 0 ? formatCurrency(vendorItem.finalPrice, nfaGeneralDetails?.nfaCurrency) : 'Not Quoted'}
                                              </TableCell>
                                              <TableCell>
                                                {vendorItem.initialPrice && vendorItem.finalPrice ? 
                                                  `${(vendorItem.finalPrice - vendorItem.initialPrice)}` : 
                                                  '-'
                                                }
                                              </TableCell>
                                              <TableCell>
                                                {canEditAllocations ? (
                                                  <TextField
                                                    size="small"
                                                    type="number"
                                                    value={vendorItem.allocation !== undefined && vendorItem.allocation !== null ? vendorItem.allocation : ''}
                                                    onChange={(e) => handleAllocationChangeItem(item.id, vendorItem.vendorId, e.target.value)}
                                                    error={Boolean(allocationErrors[`${vendorItem.vendorId}-${item.id}`])}
                                                    helperText={allocationErrors[`${vendorItem.vendorId}-${item.id}`]}
                                                    sx={{ width: 100 }}
                                                    disabled
                                                    inputProps={{
                                                      min: 0,
                                                      step: vendorItem.valueType === 'percentage' ? 0.01 : 1
                                                    }}
                                                  />
                                                ) : (
                                                  <Chip 
                                                    label={formatAllocation(vendorItem.allocation, vendorItem.valueType)}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                  />
                                                )}
                                              </TableCell>
                                              <TableCell sx={{ fontWeight: 'bold' }}>
                                                {vendorItem.totalPrice ? formatCurrency(vendorItem.totalPrice, nfaGeneralDetails?.nfaCurrency) : '-'}
                                              </TableCell>
                                            </TableRow>
                                          ))
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={8} sx={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: 3 }}>
                                            No vendor quotes available for this item
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      ])}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Package-based view */}
            {basisOf === 'package' && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                  Package-wise Vendor Allocation ({vendorPackages.length} vendors)
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '250px' }}>Vendor Details</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Package Rank</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Initial Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Final Price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '130px' }}>Price Reduction</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>
                          {getAllocationHeaderText(vendorPackages[0]?.valueType)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vendorPackages.map((vendor, index) => (
                        <TableRow key={vendor.vendorId} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 'medium', wordBreak: 'break-word' }}>
                            {vendor.companyName}
                          </TableCell>
                          <TableCell>
                            {vendor.packageRank}
                          </TableCell>
                          <TableCell>
                            {vendor.initialPrice !== 0 ? formatCurrency(vendor.initialPrice, nfaGeneralDetails?.nfaCurrency) : 'Not Quoted'}
                          </TableCell>
                          <TableCell>
                            {vendor.finalPrice !== 0 ? formatCurrency(vendor.finalPrice, nfaGeneralDetails?.nfaCurrency) : 'Not Quoted'}
                          </TableCell>
                          <TableCell>
                            {vendor.initialPrice && vendor.finalPrice ? 
                              `${(vendor.finalPrice - vendor.initialPrice)}` : 
                              '-'
                            }
                          </TableCell>
                          <TableCell>
                            {canEditAllocations ? (
                              <TextField
                                size="small"
                                variant="outlined"
                                value={vendor.allocation || ''}
                                onChange={(e) => handleAllocationChangePackage(vendor.vendorId, e.target.value)}
                                error={vendor.allocationError}
                                helperText={vendor.allocationError ? 'Invalid allocation' : ''}
                                disabled
                                sx={{ 
                                  minWidth: 80,
                                  '& .MuiOutlinedInput-root': {
                                    height: '32px'
                                  }
                                }}
                                inputProps={{
                                  style: { textAlign: 'center' }
                                }}
                              />
                            ) : (
                              <Chip
                                label={formatAllocation(vendor.allocation, vendor.valueType)}
                                variant="outlined"
                                size="small"
                                color={vendor.allocationError ? 'error' : 'default'}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {vendor.totalPrice ? formatCurrency(vendor.totalPrice, nfaGeneralDetails?.nfaCurrency) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Fallback when no basisOf or no data */}
            {(!basisOf || (items.length === 0 && vendorPackages.length === 0)) && (
              <Box sx={{ textAlign: 'center', padding: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No vendor or item data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please check if the event has associated items and vendor quotes.
                </Typography>
              </Box>
            )}

            {/* Save Button - Only show when can edit allocations and there are changes */}
            {canEditAllocations && hasAllocationChanges && ((basisOf === 'item' && items.length > 0) || (basisOf === 'package' && vendorPackages.length > 0)) && (
              <Box sx={{ padding: 2, textAlign: 'right', borderTop: '1px solid #e0e0e0' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={saveSOBDetails}
                  disabled={isLoading}
                  sx={{ minWidth: 100 }}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  )
}

export default NFAReport