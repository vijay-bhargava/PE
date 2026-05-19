import { Accordion, AccordionDetails,Checkbox,Radio,InputAdornment,CircularProgress, AccordionSummary, Button, IconButton, Typography, Card, Divider, Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, FormGroup, FormControlLabel, Menu, MenuItem, Button as MuiButton, Tooltip, TextField, Stack, Alert } from '@mui/material'
import { HiDownload, HiX, HiOutlineInformationCircle } from "react-icons/hi";
import { ExpandMore } from '@mui/icons-material';
import React, { useCallback, useEffect, useState,useRef } from 'react';
import { downloadFilesOnAzure, getFileName, PercentageRegex,uploadFilesOnAzure ,uploadFilesOnAzure2} from '../../../utils/common';
  import { HiChevronDown, HiOutlineX } from "react-icons/hi";
import { DataGrid } from '@mui/x-data-grid';
import { MaterialReactTable, MRT_ToggleDensePaddingButton, MRT_ToggleFullScreenButton, useMaterialReactTable } from 'material-react-table';
import { useStateValue } from '../../../store';
import { MdCloseFullscreen, MdFullscreen } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { EventQuestionVQModal, formatDateViaLocale } from '../../../utils/common/utility';
import styled from "styled-components";
import { Form } from "react-bootstrap";
// Permission Management Imports
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';

  const MainContent = styled.div`
    display: flex;
    flex-direction: row;
    height: 100vh;
  `;
  
  const Sidebar = styled.div`
    width: 30%;
    background-color: #f5f5f5;
    padding: 1rem;
    overflow-y: auto;
    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;
    scrollbar-width: none;
  `;
  
  const QuestionList = styled.ul`
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  `;
  
  const QuestionItem = styled.li`
    padding: 0.5rem;
    cursor: pointer;
    background-color: ${props => props.status === 'green' ? '#d4edda' : props.status === 'red' ? '#f8d7da' : '#d3d3d3'};
    color: ${props => props.status === 'green' ? '#155724' : props.status === 'red' ? '#721c24' : '#000'};
    border-radius: 4px;
    &:hover {
      background-color: ${props => 
        props.status === 'green' ? '#a3e0a3' :   // Darker green
        props.status === 'red' ? '#f5a0a0' :     // Darker red
        '#a3a3a3'};                              // Darker grey
    }
  `;
  
  const MainArea = styled.div`
    width: 70%;
    padding: 1rem;
    overflow-y: auto;
    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;
    scrollbar-width: none;
  `;


const NFAQuestionScreenList = ({ questions, callbackDeleteQuesFromList, action, eventtype,eventId ,isSaveButtonDisabled,handleQuestionUpdate, permissionManager, canRead, canEdit, canCreate, canRemove,currentStage, isDraftStage}) => {
    
    const [{ atoken, rtoken, customerid, usertimezone, customersuffix, userdialingcode, roleClaims, userDetail }, dispatch] = useStateValue();
    const navigate = useNavigate();
    
    // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
    const [viewMode, setViewMode] = useState(null); // 'cross-supplier-benchmarking', 'category-wise', 'question-wise'
    const [anchorEl, setAnchorEl] = useState(null);
    const [questionArray,setQuestionArray]=useState()
    const [loading, setLoading] = useState(false); // Loading state for file operations
    const [mergedData, setMergedData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [checkboxState, setCheckboxState] = useState({});
    const mainAreaRef = useRef(null);
    const [radioState, setRadioState] = useState({});
    const [expandedAccordion, setExpandedAccordion] = useState(null);
    const [textFieldState, setTextFieldState] = useState({});
    const fileInputRef = useRef(null);
    
    useEffect(()=>{
        if(questions){
            setQuestionArray(questions)
        }
    },[questions])

    useEffect(() => {
        if (!Array.isArray(questionArray)) return;
        const initialRadioState = {};
        const initialCheckboxState = {};
      
        questionArray.forEach((q) => {
          const selectedOptions = q.questionOption?.filter(opt => opt.selectYN === "Y").map(opt => opt.id);
      
          if (q.isMultipleChoice) {
            if (selectedOptions?.length) initialCheckboxState[q.id] = selectedOptions;
          } else {
            if (selectedOptions?.length) initialRadioState[q.id] = selectedOptions[0];
          }
        });
      
        setRadioState(initialRadioState);
        setCheckboxState(initialCheckboxState);
      }, [questionArray]);
    
    // useCallback hook
    const getMCQStatus = useCallback((question) => {
        if (question.questionOption.length > 0 && question.isMultipleChoice) {
        const answered = question.questionOption.some(opt => opt.selectYN === 'Y');
        return answered ? 'green' : question.mandatory ? 'red' : 'grey';
        } else if (question.questionOption.length > 0 && !question.isMultipleChoice) {
        const answered = question.questionOption.some(opt => opt.selectYN === 'Y');
        return answered ? 'green' : question.mandatory ? 'red' : 'grey';
        } else {
        return getQuestionStatus(question);
        }
    },[questions]); // Changed dependency from groupedQuestions to questions
    
    // Helper function for getQuestionStatus
    const getQuestionStatus = (question) => {
        if (question.mandatory && (!question.answer || question.answer.trim() === '')) {
        return 'red'; // Required but not answered
        } else if (!question.mandatory && (!question.answer || question.answer.trim() === '')) {
        return 'grey'; // Not required and not answered
        } else {
        return 'green'; // Answered
        }
    };
    
    // useMaterialReactTable hook
    const table = useMaterialReactTable({
        columns,
        data: mergedData,
        enableColumnOrdering: true,
        enableColumnPinning: true,
        enablePagination: true,
        enableSorting: true,
        enableColumnResizing: true,
        enableStickyHeader: true,
        icons: {
            //change sort icon, connect internal props so that it gets styled correctly
            FullscreenExitIcon: () => <MdCloseFullscreen color='primary' />,
            FullscreenIcon: () => <MdFullscreen color='primary' />
        },

        enableTopToolbar: true,
        initialState: {
            pagination: { pageSize: 50 },
            columnPinning: { left: ['id', 'questionDescription'] },
        },
        layoutMode: "grid",
        renderToolbarInternalActions: ({ table }) => (
            <Box>
                {/* along-side built-in buttons in whatever order you want them */}
                <MRT_ToggleDensePaddingButton table={table} color='primary' />
                <MRT_ToggleFullScreenButton table={table} color='primary' />
            </Box>
        ),
    });
    
    // Extract permission properties
    const questionsCanRead = canRead ?? true;
    const questionsCanEdit = canEdit ?? true;
    const questionsCanCreate = canCreate ?? true;
    const questionsCanRemove = canRemove ?? true;
    
    // If no read permission, deny access completely (AFTER all hooks)
    if (!questionsCanRead) {
      return (
        <div className="p-4">
          <Alert severity="error">
            <div className="d-flex align-items-center">
              <HiOutlineX className="me-2 f18" />
              Access Denied: You don't have permission to view Questions.
            </div>
          </Alert>
        </div>
      );
    }
    // const groupedQuestions = questionArray?.reduce((acc, question) => {
    //     const category = question.questionCategory?.trim() || "Others";
    //     if (!acc[category]) {
    //         acc[category] = [];
    //     }
    //     acc[category].push(question);
    //     return acc;
    // }, {});
    
    const groupedQuestions = questions?.reduce((acc, question) => {
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

    const sortedCategories = Object.keys(groupedQuestions || {}).sort((a, b) => {
        if (a === "Others") return 1;
        if (b === "Others") return -1;
        return a.localeCompare(b);
    });

    const handleChangeAccordion = (panel) => (event, isExpanded) => {
        setExpandedAccordion(isExpanded ? panel : null);
    };

    const scrollToQuestion = (questionId) => {
        const questionElement = document.getElementById(`question-${questionId}`);
        if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth' });
        }
    };
    const truncateFileName = (filename, wordLimit) => {
        const words = filename.split(" ");
        if (words.length <= wordLimit) return filename;
        return words.slice(0, wordLimit).join(" ") + "…";
    };
    const onClickDownload = (question) => {
        if (question.attachedFileName) {
        const fileName = question.attachedFileName;
        downloadFilesOnAzure(fileName, fileName);
        } else {
        console.error("No attached file name found!");
        }
    };
    
    const onClickDownloadAnsAttach = (question) => {
        if (question.ansAttachements) {
        const fileName = question.ansAttachements;
        downloadFilesOnAzure(fileName, fileName);
        } else if (question.attachements) {
        const fileName = question.attachements;
        downloadFilesOnAzure(fileName, fileName);
        } else {
        console.error("No attached file name found!");
        }
    };
    

    const handleCheckboxChange = (questionId, optionId, checked) => {
        
        setCheckboxState((prevState) => {
            const current = prevState[questionId] || [];
        
            return {
              ...prevState,
              [questionId]: checked
                ? [...current, optionId]
                : current.filter((id) => id !== optionId),
            };
          });

        const updatedQuestions = questionArray?.map((q) => {
            if (q.id === questionId) {
            const updatedOptions = q.questionOption.map((opt) => {
                if (opt.id === optionId) {
                return { ...opt, selectYN: checked ? "Y" : "N" };
                }
                return opt;
            });
            return { ...q, questionOption: updatedOptions };
            }
            return q;
        });
        
        handleQuestionUpdate(updatedQuestions);
        setQuestionArray(updatedQuestions);
    };

    const handleRadioChange = (questionId, optionId) => {
        // 

        // 1. Update radioState (optional UI state tracking)
        setRadioState((prevState) => ({
            ...prevState,
            [questionId]: optionId,
        }));

        // 2. Update questionArray with selectYN logic
        const updatedQuestions = questionArray?.map((q) => {
          if (q.id === questionId) {
            const updatedOptions = q.questionOption.map((opt) => ({
              ...opt,
              selectYN: opt.id === optionId ? "Y" : "N",
            }));
            return { ...q, questionOption: updatedOptions };
          }
          return q;
        });
        handleQuestionUpdate(updatedQuestions);
        setQuestionArray(updatedQuestions);
    };

    const handleTextFieldChange=(questionId, value)=>{
        const updatedQuestions = questionArray?.map((q) => {
        if (q.id === questionId) {
            return { ...q, answer: value };
        }
        return q;
        });
        setQuestionArray(updatedQuestions)
        handleQuestionUpdate(updatedQuestions);
    }
    const handleTextFieldBlur = (questionId, value) => {
        const updatedQuestions = questionArray?.map((q) => {
        if (q.id === questionId) {
            return { ...q, answer: value };
        }
        return q;
        });
        setQuestionArray(updatedQuestions)
        handleQuestionUpdate(updatedQuestions);
    };
    
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleRemoveFile = (questionId) => {
        const updatedQuestions = questionArray?.map((q) => {
            if (q.id === questionId) {
            return { ...q, ansAttachements: null, attachements: null };
            }
            return q;
        });
        handleQuestionUpdate(updatedQuestions);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        handleClose();
    };

  
    

    return (
            <MainContent>
                <MainArea ref={mainAreaRef}>
                {/* Permission Status Alert */}
                {/* <Alert severity="info" className="mb-3">
                  <div className="d-flex align-items-center">
                    <HiOutlineInformationCircle className="me-2 f18" />
                    Questions Permissions - Read: {questionsCanRead ? '✓' : '✗'}, Edit: {questionsCanEdit ? '✓' : '✗'}, Create: {questionsCanCreate ? '✓' : '✗'}, Remove: {questionsCanRemove ? '✓' : '✗'}
                  </div>
                </Alert> */}
                
                {questions && Object.keys(groupedQuestions).length > 0 ? (
                    Object.keys(groupedQuestions).map((category,catIndex) => (
                        <Accordion
                            key={catIndex}
                            onChange={handleChangeAccordion(category)}
                            defaultExpanded
                            sx={{ border: 'none', boxShadow: 'none', '&:before': { display: 'none' } }}
                        >
                            <AccordionSummary
                            expandIcon={<HiChevronDown style={{ color: "#218cde" }} />}
                            >
                            <Typography className="text-medium dark-blue ">
                                {category || "Others"}
                            </Typography>
                            

                            </AccordionSummary>
                            <AccordionDetails className="mb-5">
                            <Box> 
                                {Object.keys(groupedQuestions[category]).map((subcategory, subIndex) => (
                                    <Accordion 
                                        key={subIndex} 
                                        sx={{ 
                                            marginBottom: 1, 
                                            border: 'none', 
                                            boxShadow: 'none',
                                            '&:before': { display: 'none' }
                                        }} 
                                        defaultExpanded
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMore />}
                                            aria-controls={`panel-${subcategory}-content`}
                                            id={`panel-${subcategory}-header`}
                                            sx={{ backgroundColor: '#fff'}}
                                        >
                                            <Typography className='text-medium dark-blue '>{subcategory || "Others"}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {groupedQuestions[category][subcategory].map((question, index) => {
                                                console.log('questions ids',groupedQuestions[category][subcategory].map(q => q.questionId))
                                                return(
                                                <div key={index} style={{ marginBottom: "1.5em", padding: "1rem 0" }}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography className="text-default">
                                                            <div className="d-flex justify-content-between">
                                                                <div>
                                                                    <span><b>Q{index + 1}. {question.questionDescription}{" "}</b></span>
                                                                    {question.mandatory ? <span style={{ color: "#df2c14" }}>(Required)</span> : ""}
                                                                </div>
                                                                {question?.attachedFileName && (
                                                                <div className="d-flex justify-content-end">
                                                                    <div className="custom-chip" title={getFileName(question.attachedFileName)}>
                                                                        <span className="custom-chip-text">
                                                                        {truncateFileName(getFileName(question.attachedFileName), 10)}
                                                                        </span>
                                                                        <span className="custom-chip-icon" onClick={() => onClickDownload(question)}>
                                                                        <HiDownload />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                )}
                                                            </div>
                                                        </Typography>
                                                        {action && isDraftStage && !question.mandatory && questionsCanRemove && <IconButton onClick={() => callbackDeleteQuesFromList(question?.questionCategory, question?.questionSubCategory, question.questionDescription)} color="error">
                                                            <HiX />
                                                        </IconButton>}
                                                    </Box>
                                                    {question.questionRequirement && (
                                                        <div className="f10">
                                                        <strong>Requirement</strong>: {question.questionRequirement}
                                                        </div>
                                                    )}
                                                    {question.isMultipleChoice && question.questionOption.length > 0 ? (
                                                        question.questionOption.map((option, optindex) => (
                                                        <FormControlLabel
                                                            key={`${question.id}-${option.id}`}
                                                            id={option.questionOption}
                                                            name={`questionOption${optindex}`}
                                                            className="mt-2"
                                                            control={
                                                            <Checkbox
                                                                checked={checkboxState[question.id]?.includes(option.id) || option.selectYN === "Y"}
                                                                onChange={(e) => !isSaveButtonDisabled && isDraftStage && questionsCanEdit && handleCheckboxChange(question.id, option.id, e.target.checked)}
                                                                disabled={!isDraftStage || !questionsCanEdit}
                                                            />
                                                            }
                                                            label={option.questionOption}
                                                        />
                                                        ))
                                                    ) : (
                                                        question.questionOption.length > 0 && !question.isMultipleChoice ? (
                                                        question.questionOption.map((option, optindex) => (
                                                            <FormControlLabel
                                                            key={`${question.id}-${option.id}`}
                                                            id={option.questionOption}
                                                            name={`question-${question.id}-option-${option.id}`}
                                                            className="mt-2"
                                                            control={
                                                                <Radio
                                                                checked={radioState[question.id] === option.id || option.selectYN === "Y"}
                                                                onChange={() => !isSaveButtonDisabled && isDraftStage && questionsCanEdit && handleRadioChange(question.id, option.id)}
                                                                disabled={!isDraftStage || !questionsCanEdit}
                                                                />
                                                            }
                                                            label={option.questionOption}
                                                            />
                                                        ))
                                                        ) : (
                                                        <>
                                                            <TextField
                                                            fullWidth
                                                            label="Answer"
                                                            className="mt-2"
                                                            variant="outlined"
                                                            id={question.answer}
                                                            name="answer"
                                                            rows={3}
                                                            color={"primary"}
                                                            multiline
                                                            value={question.answer}
                                                            onBlur={(e) =>!isSaveButtonDisabled && isDraftStage && questionsCanEdit && handleTextFieldBlur(question.id, e.target.value)}
                                                            onChange={(e) =>
                                                            {
                                                                
                                                                console.log(textFieldState)
                                                                if(!isSaveButtonDisabled && isDraftStage && questionsCanEdit){
                                                                    handleTextFieldChange(question.id, e.target.value)
                                                                }
                                                            // !isSaveButtonDisabled && setTextFieldState({ ...textFieldState, [question.id]: e.target.value })
                                                            }
                                                            
                                                            
                                                            }
                                                            disabled={!isDraftStage || !questionsCanEdit}
                                                            InputProps={{
                                                                endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <Typography variant="body2" color="textSecondary">
                                                                    { question.answer?.length}/1000
                                                                    </Typography>
                                                                </InputAdornment>
                                                                ),
                                                            }}
                                                            inputProps={{
                                                                maxLength: 1000,
                                                            }}
                                                            />
                                                        </>
                                                        )
                                                    )}
                                    
                                                    {/* <div className="col-md-12 mt-2 d-flex align-items-baseline"> */}
                                                    <div className="col-md-12 mt-2 d-flex flex-column align-items-baseline">
                                                        {!isSaveButtonDisabled && isDraftStage && question.attachement && (
                                                            <Form.Group controlId={`formFile_${question.id}`}>
                                                            <Form.Control
                                                                type="file"
                                                                id={question.ansAttachements}
                                                                name="ansAttachements"
                                                                size="md"
                                                                accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                                                onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                // const Data = {
                                                                //     RequestedBy: "vendor",
                                                                //     EventType: 'VQ',
                                                                //     CustomerId: 0,
                                                                //     Description: `vqquestionfile${question.id}`,
                                                                // };
                                                                const Data = {
                                                                    RequestedBy: "customer",
                                                                    EventType: "NFA",
                                                                    EventId: eventId,
                                                                    CustomerId: customerid,
                                                                    Description: "QuestionAnswer",
                                                                };
                                                                uploadFilesOnAzure2(Data, file, atoken).then((res) => {
                                                                    if (res) {
                                                                        const ansAttachementspath = res?.blobName;
                                                                        const updatedQuestions = questionArray.map(q => {
                                                                            if (q.id === question.id) {
                                                                            return { ...q, ansAttachements: ansAttachementspath };
                                                                            }
                                                                            return q;
                                                                        });
                                                                        handleQuestionUpdate(updatedQuestions);
                                                                    }
                                                                });
                                                                }}
                                                                ref={fileInputRef}
                                                            />
                                                            {!question.ansAttachements && (question.attachement && question.answer && (
                                                                <div className="f10 me-2 text-danger">
                                                                {"Attachment is required"}
                                                                </div>
                                                            ))}
                                                            <Form.Text id="filiploadtext" muted className="f10">
                                                                (\.docx|\.doc|\.jpg|\.jpeg|\.png|\.pdf|\.xlsx), Max Size: 10 mb
                                                            </Form.Text>
                                                            </Form.Group>
                                                        )}
                                                        {question.ansAttachements && (
                                                            <div className="mt-2 d-flex justify-content-end"> {/* Added spacing */}
                                                                <div
                                                                    className="anscustom-chip-rectangle-small shadow-sm"
                                                                    title={getFileName(question.ansAttachements)}
                                                                >
                                                                    <span className="anscustom-chip-text">
                                                                    {truncateFileName(getFileName(question.ansAttachements), 10)}
                                                                    </span>
                                                                    <span
                                                                    className="anscustom-chip-icon"
                                                                    onClick={() => onClickDownloadAnsAttach(question)}
                                                                    style={{ cursor: 'pointer' }}
                                                                    >
                                                                    <HiDownload size={14} />
                                                                    </span>
                                                                    { !isSaveButtonDisabled && isDraftStage && (
                                                                    <span
                                                                        className="anscustom-chip-icon"
                                                                        onClick={() => handleRemoveFile(question.id)}
                                                                        style={{ cursor: 'pointer', color: 'white' }}
                                                                    >
                                                                        <HiOutlineX size={14} />
                                                                    </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-12 mt-2 d-flex align-items-baseline">
                                                        {loading ? (
                                                        <CircularProgress size={24} />
                                                        ) : (
                                                        <></>
                                                        )}
                                                    </div>
                                                </div>)
})}
                                        </AccordionDetails>
                                    </Accordion> 
                                ))}   
                            </Box>
                            
                            </AccordionDetails>
                        </Accordion>
                    ))
                ):(
                        <Typography variant="h6" color="textSecondary" align="center">No questions selected</Typography>
                        )}
                </MainArea>
                {/* <Sidebar>
                    {sortedCategories.map((category) => (
                    <Accordion
                        key={category}
                        onChange={handleChangeAccordion(category)}
                        defaultExpanded
                    >
                        <AccordionSummary
                        expandIcon={<HiChevronDown style={{ color: "#218cde" }} />}
                        >
                        <Typography className="f15 fw600" style={{ color: "#218cde" }}>
                            {category}
                        </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                        <QuestionList>
                            {groupedQuestions[category].map((question, index) => (
                            <QuestionItem
                                key={question.id}
                                status={getMCQStatus(question)}
                                onClick={() => scrollToQuestion(question.id)}
                            >
                                Q{index + 1}
                            </QuestionItem>
                            ))}
                        </QuestionList>
                        </AccordionDetails>
                    </Accordion>
                    ))}
                </Sidebar> */}
                <Sidebar>
                    {Object.keys(groupedQuestions).map((category) => (
                        <Accordion
                        key={category}
                        onChange={handleChangeAccordion(category)}
                        defaultExpanded
                        sx={{ border: 'none', boxShadow: 'none', '&:before': { display: 'none' } }}
                        >
                        <AccordionSummary expandIcon={<HiChevronDown style={{ color: "#218cde" }} />}>
                            <Typography className="text-medium dark-blue">
                            {category || "Others"}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {Object.keys(groupedQuestions[category]).map((subcategory) => (
                            <div key={subcategory} style={{ marginBottom: "1rem" }}>
                                <Typography className="text-medium dark-blue">
                                {subcategory || "Others"}
                                </Typography>
                                <QuestionList>
                                {groupedQuestions[category][subcategory].map((question, index) => (
                                    <QuestionItem
                                    key={question.id}
                                    status={getMCQStatus(question)}
                                    onClick={() => scrollToQuestion(question.id)}
                                    >
                                    Q{index + 1}
                                    </QuestionItem>
                                ))}
                                </QuestionList>
                            </div>
                            ))}
                        </AccordionDetails>
                        </Accordion>
                    ))}
                </Sidebar>

            </MainContent>
    );
};

export default NFAQuestionScreenList;