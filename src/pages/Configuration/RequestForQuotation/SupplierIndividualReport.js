// RFQAccordionModal.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, Box, Accordion, AccordionSummary, AccordionDetails, Typography, IconButton
} from '@mui/material';
import { HiUserGroup, HiOutlineX, HiX } from "react-icons/hi";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import EventFinancialComparativeScreen from '../../../components/Event/EventFinancialComparativeScreen';
import EventCommercialComparativeScreen from '../../../components/Event/EventCommercialComparativeScreen';
import EventQuestionScreen from '../../../components/Event/EventQuestionScreen';
import SupplierAttachmentCell from './SupplierAttachmentCell';
import { ApiClient } from '../../../Apiclient';
import { useStateValue } from '../../../store';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { getPayloadWithStage, menuactionlist, sumArray } from '../../../utils/common';
import { set } from 'date-fns';
import EventApprovalBoxRFQ from "../../BaseCells/EventApprovalBoxRFQ";
import QueryList from "../../CommunucationHub/QueryList";
import ItemDetails from "./SupplierIndividualData/ItemDetails"
import CommercialDetails from "./SupplierIndividualData/CommercialDetails"
import QuestionDetails from "./SupplierIndividualData/QuestionDetails"
import HistoryCell from "../../BaseCells/HistoryCell";



const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  p: 0,
};


const SupplierIndividualReport = ({ open, onClose, vendorId, rfqid, version, permissionManager, isBoq }) => {
  const [expanded, setExpanded] = React.useState(false);
  const handleAccordionChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const navigate = useNavigate();
  const [{ atoken, rtoken, customerid, customersuffix, roleClaims, userDetail }, dispatch, thousands_separators] =
    useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [anchorEl, setAnchorEl] = useState(null);

  const { pageSlug } = useParams();
  const [expandedRow, setExpandedRow] = useState(null);  // Track expanded rows

  // const [version, setVersion] = useState(version);
  // const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams(window.location.search);

  const [activityId, setActvityId] = useState(0);
  const [stageValue, setStageValue] = useState('');
  const [actionType, setActionType] = useState("");
  const [stagelist, setStageList] = useState(null);
  const [versionhistory, setVersionhistory] = useState(null)
  const [rfqheader, setRFQHeader] = useState(null)
  const [supplierdetails, setSupplierDetails] = useState(null)
  const [rfqItemsList, setrfqItemsList] = useState([]);
  const [totalItemSum, setTotalItemSum] = useState(0)
  const [rfqItemCommercialList, setRfqItemCommercialList] = useState([]);
  const [rfqOthersCommercialList, setrfqOthersCommercialList] = useState([]);
  const [QuestionResponses, setQuestionResponses] = useState([])
  const [linewiseItemLowest, setLineWiseItemLowest] = useState([]);
  const [rfqQuestionList, setRFQQuestionList] = useState([])
  const [openLoadingF, SetLoadingF] = useState(false);
  const handleCloseLoadingF = () => SetLoadingF(false);
  const [selectedLoadingF, SetSelectedLoadingF] = useState(null);
  const handleOpenLoadingF = (v) => {
    SetLoadingF(true);
    SetSelectedLoadingF(v);
  };
  const [openPoDetail, setOpenPoDetail] = useState(false);
  const [selectedpodetails, setSelectedPODetails] = useState(null);
  const handleOpenPoDetail = (v) => {

    setOpenPoDetail(true);
    setSelectedPODetails(v);
  };
  const handleClosePoDetail = () => setOpenPoDetail(false);
  const [value, setValue] = useState(0);

  const [requestCell, setRequestCell] = useState({
    EventId: 0,
    EventType: "RFQ",
    SortingColumn: "ApproverSeq",
    CustomerId: customerid
    //IsAscending:"True"
  });

  const [accessLevel, setAccessLevel] = useState([]);
  const [eventAppList, setEventAppList] = useState([]);
  const [approverInWorkflow, setApproverInWorkflow] = useState([]);
  const [stagearray, setStagearray] = useState([`Draft`]);
  const [currentStage, setCurrentStage] = useState(`Draft`);
  const [wfupdate, setwfUpdate] = useState([false]);


  useEffect(() => {
    if (rfqid) {
      setRequestCell((prevState) => ({
        ...prevState,
        EventId: rfqid,
      }));
    }
  }, [rfqid])
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {

    const params = new URLSearchParams(searchParams);
    const actionType = params.get("ActionType");
    const ActivityId = params.get("ActivityId");
    const StageValue = params.get("Stage");
    setActvityId(ActivityId ?? 0);
    setActionType(actionType);
    setStageValue(StageValue ?? '');
  }, [searchParams]);

  //useeffect
  useEffect(() => {
    if (version && vendorId) {
      getComparativedetailsVersionWise();
    }
  }, [version, vendorId]);
  useEffect(() => {
    if (rfqheader && rfqheader?.length > 0) {
      getEventStages();
    }
  }, [rfqheader])

  const handleEventAppList = useCallback((arr, updatedvalue) => {
    setEventAppList(updatedvalue?.approvers);
    setApproverInWorkflow(updatedvalue)
  }, []);

  const getComparativedetailsVersionWise = async () => {
    await pullRFQHeaderDetails();
    await RFQcomparativeReport();
  }

  const getEventStages = async () => {
    let VersionParam;
    if (version?.includes("x")) {
      VersionParam = version.split(".")[0];
    } else {
      VersionParam = version;
    }
    const urlparams = {
      EventType: "RFQ",
      CustomerId: customerid,
      EventId: rfqid,
      OrgId: rfqheader[0]?.purchOrgId,
      OrgGroupId: rfqheader[0]?.purchGrpId,
      Version: VersionParam
    }
    const queryParams = buildQueryParams(urlparams)
    const res = await apiClient.getres(`api/EventStage/EventStageFind?${queryParams}`, atoken);
    if (res?.data?.result?.length > 0) {

      const result = res?.data?.result?.filter((item) => item.stageSeq > 0)
      setStageList(result);

      const stagesarray = result?.map((item) => item.currentStage);

    }




  }
  const pullRFQHeaderDetails = async () => {
    let VersionParam;
    if (version?.includes("x")) {
      VersionParam = version.split(".")[0];
    }
    else {
      VersionParam = version

    }
    var data = {
      Id: rfqid,
      Version: parseInt(version),

    };
    if (version == 0) {
      delete data?.Version;
    }

    const queryParams = buildQueryParams(data);
    const res = await apiClient.getres(
      `/api/RFQManage/FindById?${queryParams}`,
      atoken
    );
    // console.log('request id pullRFQItemServiceFind', data);
    if (res) {
      const result = Array.isArray(res?.data?.result) ? res.data.result : [];
      const header = result?.[0];
      setRFQHeader(result);

      if (!header) {
        setrfqItemsList([]);
        setTotalItemSum(0);
        setRfqItemCommercialList([]);
        setRFQQuestionList([]);
        setrfqOthersCommercialList([]);
        return;
      }

      if (header?.versionhistory?.length !== versionhistory?.length) {
        setVersionhistory(header.versionhistory);
      }

      const rfqParameters = Array.isArray(header?.rfqParameters) ? header.rfqParameters : [];
      setrfqItemsList(rfqParameters);
      const itemsumarr = sumArray(rfqParameters.map(x => x.targetPrice * x.quantity));
      setTotalItemSum(itemsumarr);

      setRfqItemCommercialList(
        (Array.isArray(header?.rfqItemCommercial) ? header.rfqItemCommercial : []).filter((x) => x.level === "item")
      );
      setRFQQuestionList(Array.isArray(header?.rfqQuestionMaster) ? header.rfqQuestionMaster : []);

      setrfqOthersCommercialList(
        Array.isArray(header?.rfqPackageCommercial) ? header.rfqPackageCommercial : []
      );
    }
    if (res?.[0]?.userAccess?.length > 0) {
      const userAccess = res?.[0]?.userAccess.map(x => {
        return ({ ...x, claimValue: JSON.parse(x.claimValue) })
      })
      setAccessLevel(userAccess)
    }
    if (res[0]?.stage) {
      setCurrentStage(res[0]?.stage);
    }
  };


  const RFQcomparativeReport = async () => {
    let VersionParam;
    let finalversionparam = false;
    if (version?.includes("x")) {
      VersionParam = version.split(".")[0];
      finalversionparam = true

    }
    else {
      VersionParam = version


    }
    const reqdata = {
      rfqId: rfqid,
      Version: VersionParam,
      finalversion: finalversionparam,
      VendorId: vendorId
    };
    const queryParams = buildQueryParams(reqdata);
    const res = await apiClient.getres(
      `/api/RFQManage/RFQBenchmarking?${queryParams}`,
      atoken
    );
    if (res.status === 200) {

      let vendorItemAnalysisdata = res.data;

      setSupplierDetails(vendorItemAnalysisdata);
      //in order to segregate supplierquestionresponses
      if (vendorItemAnalysisdata && vendorItemAnalysisdata?.length > 0) {

        const vendorQuestionAns = vendorItemAnalysisdata?.map((v) => {

          let updatedvendorquestion;
          if (version != 0)
            updatedvendorquestion = JSON.parse(v?.vendorQuestionAns)?.filter(x => x.version == version)
          else {
            updatedvendorquestion = JSON.parse(v?.vendorQuestionAns)?.filter(x => x.version == currentVersion)
          }
          // Destructure only the fields you need
          return {
            ...v,
            vendorQuestionAns: updatedvendorquestion,  // Only include the fields you need
          };
        });
        setQuestionResponses(vendorQuestionAns);
      }




    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // const handleVersionClick = (v) => {
  //   setVersion(v);
  //   setAnchorEl(null);
  //   console.log(`Selected Version: ${v}`);
  // };
  const [currentVersion, setCurrentVersion] = useState(0);

  const [state, setState] = useState({
    openInvoiceApproved: false,
  });

  const toggleApprover = (anchor, open) => {
    setState({ ...state, [anchor]: open });
  };

  const [loading, setLoading] = useState(false);
  const [openQuotes, setOpenQuotes] = useState(null);

  useEffect(() => {
    if (rfqheader && rfqheader?.length > 0) {
      const currentrfqversion = rfqheader[0].rfqVersionHistory.find((x) => x.version == rfqheader[0].version);
      if (currentrfqversion) {
        const openQuotes = currentrfqversion.openQuotes;
        setOpenQuotes(openQuotes);
      }
      else {
        setOpenQuotes('Y');
      }
    }
  }, [rfqheader])

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--pe-border, #dfe3e8)',
          background: '#fff',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--pe-text, #1f2937)', letterSpacing: 0 }}>
            {supplierdetails?.[0]?.tradeName}
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <HistoryCell eventtype="RFQ" eventId={rfqid} permissionManager={permissionManager} />
            <IconButton className="sup-action-btn" size="small" onClick={onClose}>
              <HiOutlineX style={{ fontSize: 16 }} />
            </IconButton>
          </div>
        </div>

        {/* Modal Body */}
        <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left: Accordions */}
          <Box sx={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {/* Financial Comparative */}
            {isBoq == false &&
              <Accordion
                expanded={expanded === 'panel1'}
                onChange={handleAccordionChange('panel1')}
                elevation={0}
                sx={{ border: '1px solid var(--pe-border, #dfe3e8)', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 44, fontSize: 13, fontWeight: 600, color: 'var(--pe-text, #1f2937)', px: 2 }}>
                  Financial Details
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
                  <ItemDetails
                    rfqItemsList={rfqItemsList}
                    linewiseItemLowest={linewiseItemLowest}
                    vendorItemAnalysis={supplierdetails}
                    rfqheaderdetails={rfqheader}
                    openQuotes={openQuotes}
                    vendorId={vendorId}
                    permissionManager={permissionManager}
                  />
                </AccordionDetails>
              </Accordion>
            }
            {/* Commercial Comparative */}
            <Accordion
              expanded={expanded === 'panel2'}
              onChange={handleAccordionChange('panel2')}
              elevation={0}
              sx={{ border: '1px solid var(--pe-border, #dfe3e8)', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 44, fontSize: 13, fontWeight: 600, color: 'var(--pe-text, #1f2937)', px: 2 }}>
                Commercial Details
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
                <CommercialDetails
                  rfqItemsList={rfqItemsList}
                  vendorItemAnalysis={supplierdetails}
                  rfqPackageCommercial={rfqheader?.[0]?.rfqPackageCommercial?.filter(x => x.valuetype != "Percentage" && x.valuetype != "Currency")}
                  rfqheaderdetails={rfqheader}
                  openQuotes={openQuotes}
                  vendorId={vendorId}
                  permissionManager={permissionManager}
                />
              </AccordionDetails>
            </Accordion>
            {/* Technical Questions */}
            <Accordion
              expanded={expanded === 'panel3'}
              onChange={handleAccordionChange('panel3')}
              elevation={0}
              sx={{ border: '1px solid var(--pe-border, #dfe3e8)', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 44, fontSize: 13, fontWeight: 600, color: 'var(--pe-text, #1f2937)', px: 2 }}>
                Technical Questions
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
                <QuestionDetails
                  eventid={rfqid}
                  eventtype={'RFQ'}
                  librarytype={'QuestionLibrary'}
                  action={false}
                  Version={version}
                  vendorId={vendorId}
                  stagelist={stagelist}
                  questionresponses={QuestionResponses}
                  permissionManager={permissionManager}
                />
              </AccordionDetails>
            </Accordion>
            {/* Attachments */}
            <Accordion
              expanded={expanded === 'panel4'}
              onChange={handleAccordionChange('panel4')}
              elevation={0}
              sx={{ border: '1px solid var(--pe-border, #dfe3e8)', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 44, fontSize: 13, fontWeight: 600, color: 'var(--pe-text, #1f2937)', px: 2 }}>
                Attachments
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
                <SupplierAttachmentCell
                  eventid={rfqid}
                  eventtype="RFQ"
                  satoken={atoken}
                  vendorid={vendorId}
                  action={false}
                />
              </AccordionDetails>
            </Accordion>
            {/* Queries */}
            <Accordion
              expanded={expanded === 'panel5'}
              onChange={handleAccordionChange('panel5')}
              elevation={0}
              sx={{ border: '1px solid var(--pe-border, #dfe3e8)', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 44, fontSize: 13, fontWeight: 600, color: 'var(--pe-text, #1f2937)', px: 2 }}>
                Queries
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
                <QueryList
                  pageSlug={rfqid}
                  key={"QueryList"}
                  accessLevel={accessLevel}
                  fromEventPage={true}
                  EventId={rfqid}
                  EventType={"RFQ"}
                />
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Right: Approval panel */}
          <EventApprovalBoxRFQ
            requestCell={requestCell}
            handleEventAppList={handleEventAppList}
            wfupdate={wfupdate}
            action={stagearray.includes(currentStage)}
            stagelist={stagelist}
            accessLevel={accessLevel}
            Version={version}
            vendorId={vendorId}
            permissionManager={permissionManager}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default SupplierIndividualReport;
