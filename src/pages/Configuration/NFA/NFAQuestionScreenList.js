import {
  FormControlLabel, Checkbox, Radio, CircularProgress, Alert,
} from "@mui/material";
import { HiDownload, HiX, HiChevronDown, HiOutlineX, HiOutlinePaperClip } from "react-icons/hi";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { downloadFilesOnAzure, getFileName, uploadFilesOnAzure2 } from "../../../utils/common";
import { useStateValue } from "../../../store";
import { Form } from "react-bootstrap";

const NFAQuestionScreenList = ({
  questions, callbackDeleteQuesFromList, action, eventtype, eventId,
  isSaveButtonDisabled, handleQuestionUpdate, permissionManager,
  canRead, canEdit, canCreate, canRemove, currentStage, isDraftStage
}) => {
  const [{ atoken, customerid }] = useStateValue();
  const [questionArray, setQuestionArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkboxState, setCheckboxState] = useState({});
  const [radioState, setRadioState] = useState({});
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const fileInputRef = useRef(null);

  const questionsCanRead = canRead ?? true;
  const questionsCanEdit = canEdit ?? true;
  const questionsCanRemove = canRemove ?? true;

  useEffect(() => {
    if (questions) setQuestionArray(questions);
  }, [questions]);

  useEffect(() => {
    if (!Array.isArray(questionArray)) return;
    const initialRadioState = {};
    const initialCheckboxState = {};
    questionArray.forEach((q) => {
      const selected = q.questionOption?.filter(o => o.selectYN === "Y").map(o => o.id);
      if (q.isMultipleChoice) { if (selected?.length) initialCheckboxState[q.id] = selected; }
      else { if (selected?.length) initialRadioState[q.id] = selected[0]; }
    });
    setRadioState(initialRadioState);
    setCheckboxState(initialCheckboxState);
  }, [questionArray]);

  const groupedQuestions = questions?.reduce((acc, q) => {
    const cat = q.questionCategory?.trim() || "Others";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {}) || {};

  const sortedCategories = Object.keys(groupedQuestions).sort((a, b) => {
    if (a === "Others") return 1;
    if (b === "Others") return -1;
    return a.localeCompare(b);
  });

  const toggleCategory = (cat) =>
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

  const scrollToQuestion = (questionId) => {
    const el = document.getElementById(`question-${questionId}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const truncateFileName = (filename, limit) => {
    const words = filename.split(" ");
    return words.length <= limit ? filename : words.slice(0, limit).join(" ") + "…";
  };

  const onClickDownload = (question) => {
    if (question.attachedFileName) downloadFilesOnAzure(question.attachedFileName, question.attachedFileName);
  };

  const onClickDownloadAnsAttach = (question) => {
    const f = question.ansAttachements || question.attachements;
    if (f) downloadFilesOnAzure(f, f);
  };

  const getQuestionStatus = (q) => {
    if (q.mandatory && (!q.answer || q.answer.trim() === "")) return "red";
    if (!q.mandatory && (!q.answer || q.answer.trim() === "")) return "grey";
    return "green";
  };

  const getMCQStatus = useCallback((q) => {
    if (q.questionOption?.length > 0) {
      const answered = q.questionOption.some(o => o.selectYN === "Y");
      return answered ? "green" : q.mandatory ? "red" : "grey";
    }
    return getQuestionStatus(q);
  }, [questions]);

  const handleCheckboxChange = (questionId, optionId, checked) => {
    setCheckboxState(prev => {
      const cur = prev[questionId] || [];
      return { ...prev, [questionId]: checked ? [...cur, optionId] : cur.filter(id => id !== optionId) };
    });
    const updated = questionArray.map(q => {
      if (q.id !== questionId) return q;
      return { ...q, questionOption: q.questionOption.map(o => o.id === optionId ? { ...o, selectYN: checked ? "Y" : "N" } : o) };
    });
    handleQuestionUpdate(updated);
    setQuestionArray(updated);
  };

  const handleRadioChange = (questionId, optionId) => {
    setRadioState(prev => ({ ...prev, [questionId]: optionId }));
    const updated = questionArray.map(q => {
      if (q.id !== questionId) return q;
      return { ...q, questionOption: q.questionOption.map(o => ({ ...o, selectYN: o.id === optionId ? "Y" : "N" })) };
    });
    handleQuestionUpdate(updated);
    setQuestionArray(updated);
  };

  const handleTextFieldChange = (questionId, value) => {
    const updated = questionArray.map(q => q.id === questionId ? { ...q, answer: value } : q);
    setQuestionArray(updated);
    handleQuestionUpdate(updated);
  };

  const handleRemoveFile = (questionId) => {
    const updated = questionArray.map(q => q.id === questionId ? { ...q, ansAttachements: null, attachements: null } : q);
    handleQuestionUpdate(updated);
  };

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

  return (
    <div style={{ display: "flex", flexDirection: "row", backgroundColor: "#fff" }}>

      {/* Main questions area */}
      <div style={{ flex: 1, minWidth: 0, padding: "1rem", overflowY: "auto", scrollbarWidth: "thin" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#101828", marginBottom: "1rem", paddingBottom: "0.5rem" }}>
          Questions
        </div>

        {sortedCategories.length === 0 && (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: "2rem 0" }}>No questions selected</div>
        )}

        {sortedCategories.map((category) => {
          const isCollapsed = !!collapsedCategories[category];
          return (
            <div key={category} className="pe-question-category">
              <div className="pe-question-category-header" onClick={() => toggleCategory(category)}>
                <span className="pe-question-category-title">
                  {category} ({groupedQuestions[category].length})
                </span>
                <button
                  type="button"
                  className="pe-icon-btn pe-icon-btn--expand"
                  onClick={(e) => { e.stopPropagation(); toggleCategory(category); }}
                >
                  <HiChevronDown style={{ transform: isCollapsed ? "rotate(-90deg)" : "none", transition: "transform 0.2s" }} />
                </button>
              </div>

              {!isCollapsed && (
                <div className="pe-question-category-body">
                  {groupedQuestions[category].map((question, index) => (
                    <div key={question.id} id={`question-${question.id}`} className="pe-question-card">

                      {/* Question title row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div className="pe-question-title">
                          <span className="pe-question-number">Q{index + 1}.</span>
                          {" "}{question.questionDescription}
                          {question.mandatory && <span className="pe-question-required"> (Required)</span>}
                        </div>
                        {action && isDraftStage && !question.mandatory && questionsCanRemove && (
                          <button
                            type="button"
                            className="pe-icon-btn pe-icon-btn--delete"
                            onClick={() => callbackDeleteQuesFromList(question.questionCategory, question.questionSubCategory, question.questionDescription)}
                            style={{ marginLeft: "8px", flexShrink: 0 }}
                          >
                            <HiX />
                          </button>
                        )}
                      </div>

                      {/* Reference doc */}
                      {question?.attachedFileName && (
                        <div className="pe-question-refdoc">
                          <HiOutlinePaperClip size={13} />
                          <span>Reference:</span>
                          <button type="button" className="pe-question-refdoc-link" onClick={() => onClickDownload(question)}>
                            {truncateFileName(getFileName(question.attachedFileName), 20)}
                            <HiDownload size={13} />
                          </button>
                        </div>
                      )}

                      {question.questionRequirement && (
                        <div className="pe-question-requirement">
                          <span className="pe-question-requirement-label">Requirement:</span>
                          {" "}{question.questionRequirement}
                        </div>
                      )}

                      {/* Answer input */}
                      {question.isMultipleChoice && question.questionOption?.length > 0 ? (
                        question.questionOption.map((option, optindex) => (
                          <FormControlLabel
                            key={option.id}
                            name={`questionOption${optindex}`}
                            className="mt-2"
                            control={
                              <Checkbox
                                checked={checkboxState[question.id]?.includes(option.id) || option.selectYN === "Y"}
                                onChange={(e) => !isSaveButtonDisabled && isDraftStage && questionsCanEdit && handleCheckboxChange(question.id, option.id, e.target.checked)}
                                disabled={!isDraftStage || !questionsCanEdit}
                              />
                            }
                            label={<span className="textDefault">{option.questionOption}</span>}
                          />
                        ))
                      ) : question.questionOption?.length > 0 && !question.isMultipleChoice ? (
                        question.questionOption.map((option, optindex) => (
                          <FormControlLabel
                            key={option.id}
                            name={`question-${question.id}-option-${option.id}`}
                            className="mt-2"
                            control={
                              <Radio
                                checked={radioState[question.id] === option.id || option.selectYN === "Y"}
                                onChange={() => !isSaveButtonDisabled && isDraftStage && questionsCanEdit && handleRadioChange(question.id, option.id)}
                                disabled={!isDraftStage || !questionsCanEdit}
                              />
                            }
                            label={<span className="textDefault">{option.questionOption}</span>}
                          />
                        ))
                      ) : (
                        <div style={{ marginTop: "8px" }}>
                          <label className="pe-field-label">Answer</label>
                          <textarea
                            className="pe-detail-form-input"
                            rows={3}
                            name="answer"
                            disabled={!isDraftStage || !questionsCanEdit}
                            value={question.answer || ""}
                            maxLength={1000}
                            style={{ whiteSpace: "pre-wrap", resize: "vertical", width: "100%" }}
                            onChange={(e) => !isSaveButtonDisabled && isDraftStage && questionsCanEdit && handleTextFieldChange(question.id, e.target.value)}
                          />
                          <div style={{ textAlign: "right", fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
                            {question.answer?.length || 0}/1000
                          </div>
                        </div>
                      )}

                      {/* File upload */}
                      <div style={{ marginTop: "8px" }}>
                        {!isSaveButtonDisabled && isDraftStage && question.attachement && (
                          <Form.Group controlId={`formFile_${question.id}`}>
                            <Form.Control
                              type="file"
                              name="ansAttachements"
                              size="md"
                              accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                const Data = { RequestedBy: "customer", EventType: "NFA", EventId: eventId, CustomerId: customerid, Description: "QuestionAnswer" };
                                uploadFilesOnAzure2(Data, file, atoken).then((res) => {
                                  if (res) {
                                    const path = res?.blobName;
                                    const updated = questionArray.map(q => q.id === question.id ? { ...q, ansAttachements: path } : q);
                                    handleQuestionUpdate(updated);
                                  }
                                });
                              }}
                              ref={fileInputRef}
                            />
                            <Form.Text muted className="f10">
                              Supported formats: .docx, .doc, .jpg, .jpeg, .png, .pdf, .xlsx (Max: 10 MB)
                            </Form.Text>
                          </Form.Group>
                        )}
                        {question.ansAttachements && (
                          <div className="mt-2 d-flex align-items-center gap-2">
                            <button type="button" className="pe-question-refdoc-link" onClick={() => onClickDownloadAnsAttach(question)}>
                              <HiDownload size={13} /> {getFileName(question.ansAttachements)}
                            </button>
                            {!isSaveButtonDisabled && isDraftStage && (
                              <button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => handleRemoveFile(question.id)}>
                                <HiOutlineX size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {loading && <CircularProgress size={20} style={{ marginTop: "8px" }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Question Navigator sidebar */}
      {sortedCategories.length > 0 && (
        <div style={{
          width: "280px", flexShrink: 0, borderLeft: "1px solid #e5e7eb",
          padding: "1rem", overflowY: "auto", backgroundColor: "#fff",
          scrollbarWidth: "none", msOverflowStyle: "none",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#101828", marginBottom: "1rem", paddingBottom: "0.5rem" }}>
            Question Navigator
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 60px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: "12px", fontWeight: 600, color: "#374151" }}>
              <div style={{ padding: "10px 14px", borderRight: "1px solid #e5e7eb" }}>Category &amp; Question</div>
              <div style={{ padding: "10px 8px", textAlign: "center" }}>Status</div>
            </div>

            {/* Rows */}
            {sortedCategories.map((category) => (
              <div key={category}>
                {/* Category row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 60px", borderBottom: "1px solid #e5e7eb", fontSize: "11px", fontWeight: 700, color: "#374151" }}>
                  <div style={{ padding: "8px 14px", borderRight: "1px solid #e5e7eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {category}
                  </div>
                  <div style={{ padding: "8px 8px", textAlign: "center", fontSize: "10px", color: "#9ca3af" }}>
                    {groupedQuestions[category].length} Q's
                  </div>
                </div>

                {/* Question rows */}
                {groupedQuestions[category].map((question, index) => {
                  const status = getMCQStatus(question);
                  const statusStyle = { green: { bg: "#dcfce7", color: "#166534", icon: "✓" }, red: { bg: "#fee2e2", color: "#991b1b", icon: "!" }, grey: { bg: "#f3f4f6", color: "#9ca3af", icon: "○" } }[status];
                  return (
                    <div
                      key={question.id}
                      onClick={() => scrollToQuestion(question.id)}
                      style={{ display: "grid", gridTemplateColumns: "1fr 60px", borderBottom: "1px solid #e5e7eb", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f9fafb"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <div style={{ padding: "8px 14px", borderRight: "1px solid #e5e7eb", fontSize: "12px", color: "#374151" }}>
                        <div style={{ fontWeight: 600, marginBottom: "2px" }}>Q{index + 1}</div>
                        <div style={{ fontSize: "10px", color: "#9ca3af", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {question.questionDescription}
                        </div>
                      </div>
                      <div style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: "11px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          {statusStyle.icon}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFAQuestionScreenList;
