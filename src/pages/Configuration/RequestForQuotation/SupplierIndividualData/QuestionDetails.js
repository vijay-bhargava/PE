import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Accordion, AccordionDetails, InputAdornment, AccordionSummary, Alert, Button, IconButton, Typography, Card, Divider, Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, FormGroup, FormControlLabel, Menu, MenuItem, Button as MuiButton, Tooltip, TextField, Stack } from "@mui/material";
import "react-quill/dist/quill.snow.css";
import { ExpandMore, Launch } from '@mui/icons-material';
import { HiDownload, HiX, HiOutlineX, HiDotsVertical } from "react-icons/hi";
import { useStateValue } from "../../../../store";
import { api, ApiClient } from "../../../../Apiclient";
import { buildQueryParams } from "../../../../utils/purchaseRequest";
import { toast } from "react-toastify";
import { RFQQuestionsModal, RFQQuestionsModalOBJ, RFQSupplierQuestionsModal, SQEQuestionsModal, SQEQuestionsModalOBJ } from "../../../../utils/modal";
import { findObjByValueFromArray, SQEAddModal ,downloadFilesOnAzure, getFileName, PercentageRegex, menuactionlist, getStageInfo, getPayloadWithStage} from "../../../../utils/common";
import EventQuestionScreenList from "../../../../components/Event/EventQuestionScreenList";
import EventAddQuestionScreen from "../../../../components/Event/EventAddQuestionScreen";
import { FastApiClient } from "../../../../FastApiClient";
import { CLAIM_TYPES, ACTIONS } from '../../../../utils/permissionManager';

const QuestionDetails = ({eventid,eventtype,librarytype,action,Version,vendorId,stagelist,questionresponses,permissionManager}) => {
  const [{ atoken, rtoken, customerid, customersuffix, usertimezone, userdialingcode, roleClaims, userDetail }, dispatch] = useStateValue();
  const apiclient = new ApiClient(customersuffix);
  const fastapiclient = new FastApiClient();
  const fileInputRef = useRef(null);
  const [Librarylist, setLibrarylist] = useState(null);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [questionlist, setQuestionList] = useState([]);
  const [openComponents, setOpenComponents] = useState({
    confirmDialog: false,
    addQuestionDrawer: false
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempSelectedLibrary, setTempSelectedLibrary] = useState(null); // Temporary state for new selection

  const [supplierlist, setSupplierList] = useState([]);
  const [SupplierQuestionResponses, setSupplierQuestionResponses] = useState([])
  useEffect(() => {
    getLibraryList();
  }, []);

  useEffect(() => {
    //to set library and question once Librarylist is fetched
    if (eventid) getQuestionList();
  }, [Librarylist])

  const getLibraryList = async () => {
    const params = {
      CustomerId: customerid,
      LibraryType: librarytype,
      EventType: eventtype,
      IsActive: true
    };
    const queryParams = buildQueryParams(params);
    const res = await apiclient.getres(`/api/LibraryOrgEntity/Find?${queryParams}`, atoken);
    if (res) {
      const result = res?.data?.result?.filter(x => x.libraryType == librarytype);
      setLibrarylist(result);
    }
  };

  const getQuestionList = async () => {
    
    if (eventtype == "RFQ") {
      const params = {
        // CustomerId: customerid,
        RFQId: eventid,
        Version: parseInt(Version)
      };
      const queryParams = buildQueryParams(params);
      const res = await apiclient.getres(`/api/RFQQuestionLib/Find?${queryParams}`, atoken);
      if (res) {
        const data = res?.data?.result;
        setQuestionList([...data])
        const selectedLibrary = findObjByValueFromArray(Librarylist, data[0]?.libraryId, 'id');
        if (selectedLibrary) {
          setSelectedLibrary(selectedLibrary)
        }
      }
    }

  }

  const updateEventQuestionList = async (id) => {

    //get Questions from Question Master
    if (!id) {
      return;
    }
    const params = {
      CustomerId: customerid,
      LibraryId: id,
      EventType: eventtype,
      IsActive: true
    };
    const queryParams = buildQueryParams(params);
    const res = await apiclient.getres(`/api/QuestionsLib/Find?${queryParams}`, atoken);
    if (res) {
      const questionlibresult = res?.data?.result; //pe.questionmaster table
      if (questionlibresult == 0) {
        toast.info(`No Questions Found. Please Select Another Library `, {
          toastid: "noquestionerror"
        })
        setSelectedLibrary(null)

        return false
      }
      let data = [];

      if (eventtype == "RFQ") {
        data = RFQQuestionsModal(questionlibresult, eventid)
      }

      const eventquestion = (questionlist ?? [])?.filter(x => !x.libraryId)
      setQuestionList([...eventquestion, ...data])


    }


  }

    useEffect(() => {
        if (questionresponses) {
            
            const updatevalue = questionresponses.map(x => x.id)
            setSupplierList(updatevalue)
            setSupplierQuestionResponses(questionresponses)
        }
    }, [questionresponses])

    const groupedQuestions = questionlist?.reduce((acc, question) => {
        const { questionCategory, questionSubCategory } = question;

        if (!acc[questionCategory]) {
            acc[questionCategory] = {};
        }

        if (!acc[questionCategory][questionSubCategory]) {
            acc[questionCategory][questionSubCategory] = [];
        }

        acc[questionCategory][questionSubCategory].push(question);

        return acc;
    }, {});

    const onClickDownload = (question) => {
        if (question.attachedFileName) {
            const fileName = question.attachedFileName;
            downloadFilesOnAzure(fileName, fileName);
        } else {
            console.error("No attached file name found!");
        }
    };
  



  return (
    <div className="p-3 pt-0 ps-0" style={{ overflow: 'hidden' }}>
      <div className="mt-0 item-Table">
        <Box sx={{ 
            width: "100%",
            maxWidth: "100%",
            minHeight: "300px",
            borderRadius: 1,
            maxHeight: "calc(100vh - 120px)",
      
        }}>
            {questionlist && Object.keys(groupedQuestions)?.length > 0 ? (
                Object.keys(groupedQuestions).map((category, categoryIndex) => (
                    <Accordion key={categoryIndex} defaultExpanded sx={{ mb: 2, border: '1px solid #dee2e6' }}>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #ffffff' }}
                        >
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 400 }}>
                                {category || "Others"}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            {Object.keys(groupedQuestions[category]).map((subcategory, subIndex) => (
                                <Accordion key={subIndex} defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMore />}
                                        sx={{ backgroundColor: '#ffffff', minHeight: '48px' }}
                                    >
                                        <Typography variant="subtitle1" color="textSecondary" sx={{ fontWeight: 500 }}>
                                            {subcategory || "Others"}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0 }}>
                                        <TableContainer>
                                            <Table sx={{ tableLayout: 'auto' }}>
                                                <TableHead>
                                                    <TableRow sx={{ backgroundColor: '#e9ecef' }}>
                                                        <TableCell sx={{ fontWeight: 600, width: '5%', py: 1 }}></TableCell>
                                                        <TableCell sx={{ fontWeight: 600, width: '30%', py: 1 }}>Question</TableCell>
                                                        {SupplierQuestionResponses?.length > 0 && (
                                                            <>
                                                                <TableCell sx={{ fontWeight: 600, width: '20%', py: 1 }}>Answer</TableCell>
                                                                <TableCell sx={{ fontWeight: 600, width: '15%', py: 1 }}>Selected Option</TableCell>
                                                            </>
                                                        )}
                                                        <TableCell sx={{ fontWeight: 600, width: '10%', py: 1, textAlign: 'center' }}>Attachment</TableCell>
                                                        <TableCell sx={{ fontWeight: 600, width: '10%', py: 1, textAlign: 'center' }}>Weightage</TableCell>
                                                        <TableCell sx={{ fontWeight: 600, width: '10%', py: 1, textAlign: 'center' }}>Mandatory</TableCell>
                                                        {SupplierQuestionResponses?.length > 0 && (
                                                            <TableCell sx={{ fontWeight: 600, width: '10%', py: 1, textAlign: 'center' }}>Score</TableCell>
                                                        )}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {groupedQuestions[category][subcategory].map((item, i) => {
                                                        // Get supplier response for this question
                                                        const supplierResponse = SupplierQuestionResponses?.length > 0 ? SupplierQuestionResponses[0] : null;
                                                        let answer = null;
                                                        let questionOption = [];
                                                        let ansAttachements = null;
                                                        let score = 0;

                                                        if (supplierResponse) {
                                                            if (eventtype === "VQ") {
                                                                answer = supplierResponse.sqeHeaderDetails?.find(ans => ans.id === item.id);
                                                                questionOption = answer?.questionOption?.filter(x => x.selectYN === "Y") || [];
                                                            } else {
                                                                answer = supplierResponse.vendorQuestionAns?.find(ans => ans.questionId == item.id);
                                                                questionOption = answer?.vendorQuestOptions?.filter(x => x.SelectYN === "Y") || [];
                                                            }
                                                            ansAttachements = answer?.ansAttachements;
                                                            score = answer?.score || 0;
                                                        }

                                                        return (
                                                            <TableRow key={i} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                                                                <TableCell sx={{ py: 2, verticalAlign: 'top' }}>
                                                                    <ExpandMore sx={{ cursor: 'pointer', color: '#6c757d' }} />
                                                                </TableCell>
                                                                <TableCell sx={{ py: 2, verticalAlign: 'top' }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                                        Q{i + 1}: {item.questionDescription}
                                                                    </Typography>
                                                                    {item.attachedFileName && (
                                                                        <Tooltip title={getFileName(item.attachedFileName)} arrow>
                                                                            <IconButton
                                                                                size="small"
                                                                                color="primary"
                                                                                onClick={() => onClickDownload(item)}
                                                                            >
                                                                                <HiDownload />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    {item?.questionOption && item?.questionOption?.length > 0 && (
                                                                        <Box sx={{ mt: 1, pl: 2 }}>
                                                                            {item.questionOption.map((option, optIdx) => (
                                                                                <Typography key={optIdx} variant="caption" display="block" color="textSecondary">
                                                                                    {optIdx + 1}. {option?.questionOption} {option?.weightage !== 0 && `(Score: ${option?.weightage})`}
                                                                                </Typography>
                                                                            ))}
                                                                        </Box>
                                                                    )}
                                                                </TableCell>
                                                                {SupplierQuestionResponses?.length > 0 && (
                                                                    <>
                                                                        <TableCell sx={{ py: 2, verticalAlign: 'top' }}>
                                                                            <Typography variant="body2">
                                                                                {answer ? answer.answer || '-' : '-'}
                                                                            </Typography>
                                                                            {ansAttachements && (
                                                                                <Tooltip title={getFileName(ansAttachements)} arrow>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        color="primary"
                                                                                        onClick={() => downloadFilesOnAzure(ansAttachements, getFileName(ansAttachements), atoken)}
                                                                                    >
                                                                                        <HiDownload />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell sx={{ py: 2, verticalAlign: 'top' }}>
                                                                            {questionOption.length > 0 ? (
                                                                                questionOption.map((opt, optIdx) => (
                                                                                    <Typography key={optIdx} variant="body2" display="block">
                                                                                        {opt?.questionoption || opt?.questionOption}
                                                                                    </Typography>
                                                                                ))
                                                                            ) : (
                                                                                <Typography variant="body2">-</Typography>
                                                                            )}
                                                                        </TableCell>
                                                                    </>
                                                                )}
                                                                <TableCell sx={{ py: 2, textAlign: 'center', verticalAlign: 'top' }}>
                                                                    <Typography variant="body2">{item.attachement ? 'Yes' : 'No'}</Typography>
                                                                </TableCell>
                                                                <TableCell sx={{ py: 2, textAlign: 'center', verticalAlign: 'top' }}>
                                                                    <Typography variant="body2">{item.weightage != "0" ? item.weightage : '-'}</Typography>
                                                                </TableCell>
                                                                <TableCell sx={{ py: 2, textAlign: 'center', verticalAlign: 'top' }}>
                                                                    <Typography variant="body2">{item.mandatory ? 'Yes' : 'No'}</Typography>
                                                                </TableCell>
                                                                {SupplierQuestionResponses?.length > 0 && (
                                                                    <TableCell sx={{ py: 2, textAlign: 'center', verticalAlign: 'top' }}>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{score}</Typography>
                                                                    </TableCell>
                                                                )}
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Typography variant="h6" color="textSecondary" align="center" sx={{ mt: 4 }}>
                    No questions selected
                </Typography>
            )}
        </Box>
      </div>
    </div>
  );
};

export default QuestionDetails;