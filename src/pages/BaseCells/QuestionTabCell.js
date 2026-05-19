import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  Radio,
} from "@mui/material";
import React, { useState, useRef } from "react";
import { HiChevronDown, HiDownload, HiOutlineX } from "react-icons/hi";
import { Form } from "react-bootstrap";
import { downloadFilesOnAzure, uploadFilesOnAzure } from "../../utils/common";
import { useStateValue } from "../../store/StateProvider";

const QuestionTabCell = ({ handleChange, questionArray, handleQuestionUpdate,action,comparitive}) => {
  
  const [{ atoken }] = useStateValue();
  const fileInputRef = useRef(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [checkboxState, setCheckboxState] = useState({});
  const [textFieldState, setTextFieldState] = useState({});
  const [textField2State, setTextFieldState2] = useState({});
  const [expandedAccordions, setExpandedAccordions] = useState([]);

  const handleAccordionChange = (category) => (event, isExpanded) => {
    setExpandedAccordions((prevExpanded) =>
      isExpanded
        ? [...prevExpanded, category]
        : prevExpanded.filter((item) => item !== category)
    );
  };

  const handleChangeAccordion = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
  };

  function getFileName(path) {
    return path.split('/').pop();
  }
  //for handling vq remove file
  const handleRemoveFile = (questionId) => {
    const updatedQuestions = questionArray?.map(q => {
      if (q.id === questionId) {
        return { ...q, ansAttachements: null };
      }
      return q;
    });
    handleQuestionUpdate(updatedQuestions);
  };
  //for handling event remove file
  const handleRemoveFileEvent = (questionId) => {
    const updatedQuestions = questionArray?.map(q => {
      if (q.id === questionId) {
        return { ...q, attachedFileName: null };
      }
      return q;
    });
    handleQuestionUpdate(updatedQuestions);
  };

  if (!questionArray) {
    return null;
  }

  const groupedQuestions = questionArray?.reduce((acc, question) => {
    
    const category = question?.questionCategory?.trim() || "Others";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(question);
    return acc;
  }, {});
  
  const sortedCategories = Object.keys(groupedQuestions).sort((a, b) => {
    if (a === "Others") return 1;
    if (b === "Others") return -1;
    return a.localeCompare(b);
  });
  console.log("sortedCategoriessortedCategories", sortedCategories)
  const onClickDownload = (question) => {
    if (question?.attachedFileName) {
      const fileName = question?.attachedFileName;
      downloadFilesOnAzure(fileName, fileName);
    } else {
      console.error("No attached file name found!");
    }
  };

  const onClickDownloadAnsAttach = (question) => {
    if (question?.ansAttachements) {
      const fileName = question?.ansAttachements;
      downloadFilesOnAzure(fileName, fileName);
    } else {
      console.error("No attached file name found!");
    }
  };

  const handleCheckboxBlur = (questionId, optionId) => {
    const updatedQuestions = questionArray?.map(q => {
      if (q.id === questionId) {
        const updatedOptions = q.questionOption.map(opt => {
          if (opt.id === optionId) {
            return { ...opt, selectYN: checkboxState[optionId] ? 'Y' : 'N' };
          }
          return opt;
        });
        return { ...q, questionOption: updatedOptions };
      }
      return q;
    });
    handleQuestionUpdate(updatedQuestions);
  };

  const handleCheckboxChange = (optionId, checked) => {
    setCheckboxState(prevState => ({
      ...prevState,
      [optionId]: checked
    }));
  };

  const handleTextFieldBlur = (questionId, value) => {
    
    const updatedQuestions = questionArray?.map(q => {
      if (q.id === questionId) {
        return { ...q, score: value };
      }
      return q;
    });
    handleQuestionUpdate(updatedQuestions);
  };

  return (
    <div className="col-lg-12 col-md-10 pt-2 min-vh-100">
  {sortedCategories.map((category) => (
    <Accordion
      key={category}
      expanded={expandedAccordions.includes(category)}
      onChange={handleAccordionChange(category)}
      className="shadow-none"
    >
      <AccordionSummary
        className="mb-0 mt-1"
        expandIcon={<HiChevronDown style={{ color: '#218cde' }} />}
      >
        <Typography className="f15 fw600" style={{ color: '#218cde' }}>
          {category}
        </Typography>
      </AccordionSummary>
      <AccordionDetails className="mb-5">
        {groupedQuestions[category].map((question, index) => 
           {
            
                   return(<div key={question?.id} style={{ marginBottom: '1em' }}>
                    <Typography variant="body1">
                      <div>
                     
                        Q{index + 1}. {question?.questionDescription} {question?.mandatory ?<span style={{ color: '#df2c14' }}>*</span>:""}
                        <div className="row mt-2">
                          {question?.rfqQuestionRequirement && (
                            <div className="col-12 col-md-8 text-truncate">
                              <div className="f9pt text-muted text-truncate">
                                Requirement: {question?.rfqQuestionRequirement || ''}
                              </div>
                            </div>
                          )}
                          <div className="col-12 col-md-3">
                            <div className="f9pt text-muted">
                              {/* Weightage: {question?.weightage} */}
                              {question?.weightage !== 0 && (
    <div className="f9pt text-muted">
      Weightage: {question?.weightage}
    </div>
  )}
                            </div>
                          </div>
                          <div className="col-12 col-md-3">
                            <div className="f9pt text-muted">
                              Attachment: {question?.attachement ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div className="col-12 col-md-3">
                            <div className="f9pt text-muted">
                              Sub-Category: {question?.questionSubCategory || "N/A"}
                            </div>
                          </div>
                          <div className="col-12 col-md-3">
                            <div className="f9pt text-muted">
                              Mandatory: {question?.mandatory ? 'Yes' : 'No'}
                            </div>
                          </div>
                          {!action  && (
                            <div className="col-12 col-md-4 mt-2 mb-2">
                              <div className="f9pt text-muted">
                                <TextField
                                  fullWidth
                                  label="Score"
                                  size="small"
                                  variant="outlined"
                                  id={question?.score}
                                  name="Score"
                                  rows={1}
                                  value={textField2State[question?.id] !== undefined ? textField2State[question?.id] : question?.score }
                                  onChange={(e) => {
                                    const regex = /^[0-9]*\.?[0-9]{0,4}$/;
                                    if (regex.test(e.target.value)) {
                                      if (e.target.value <= 100) {
                                        setTextFieldState2({ ...textField2State, [question?.id]: e.target.value });
                                      }
                                    }
                                  }}
                                  onBlur={(e) => handleTextFieldBlur(question?.id, e.target.value)}
                                  disabled={comparitive}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        {question?.attachedFileName  && (
                          <div className="selected-file text-end pe-0 pointer-cursor mt-2">
                            <span
                              className="pointer-cursor"
                              onClick={() => onClickDownload(question)}
                              style={{ color: 'blue' }}
                            >
                              {getFileName(question?.attachedFileName)}
                            </span>
                            <span
                              className="ms-2 pointer-cursor"
                              onClick={() => onClickDownload(question)}
                            >
                              <HiDownload />
                            </span>
                          </div>
                        )}
                      </div>
                    </Typography>
                    {question?.questionOption?.length > 0 ? (
                      question?.questionOption?.map((option) => (
                        <FormControlLabel
                          key={option.id}
                          id={option.questionOption}
                          name="ansAttachements"
                          className="mt-2"
                          control={
                            question.isMultipleChoice ?
                            <Checkbox
                              checked={checkboxState[option.id] !== undefined ? checkboxState[option.id] : option.selectYN === 'Y'}
                              onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                              onBlur={() => handleCheckboxBlur(question?.id, option.id)}
                            />:<Radio
                            checked={checkboxState[option.id] !== undefined ? checkboxState[option.id] : option.selectYN === 'Y'}
                            onChange={(e) => handleCheckboxChange(option.id, e.target.checked)}
                            onBlur={() => handleCheckboxBlur(question?.id, option.id)}
                          />
                          }
                          label={option.questionOption}
                          disabled
                        />
                      ))
                    ) : (
                      !action && (
                        <TextField
                          fullWidth
                          label="Answer"
                          className="mt-2"
                          variant="outlined"
                          id={question?.answer}
                          name="answer"
                          rows={5}
                          value={textFieldState[question?.id] !== undefined ? textFieldState[question?.id] : question?.answer}
                          disabled
                        />
                      )
                    )}
                    {question?.attachement && (
                      <div className="col-md-12 mt-2 d-flex align-items-baseline">
                        {question?.ansAttachements && (
                          <div className="selected-file col-md-8" style={{ cursor: "pointer" }}>
                            <span
                              className="ms-2 pointer-cursor"
                              style={{ color: 'blue' }}
                              onClick={() => onClickDownloadAnsAttach(question)}
                            >
                              {getFileName(question?.ansAttachements)}
                            </span>
                            <span
                              className="ms-2 pointer-cursor"
                              onClick={() => onClickDownloadAnsAttach(question)}
                            >
                              <HiDownload />
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>)
          }
          
        )}
      </AccordionDetails>
    </Accordion>
  ))}
</div>
  );
};

export default QuestionTabCell;