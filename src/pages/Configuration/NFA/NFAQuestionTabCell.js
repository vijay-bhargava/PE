import React, { useState, useEffect, useImperativeHandle, useCallback, forwardRef } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { HiChevronDown } from "react-icons/hi";
import { ApiClient } from "../../../Apiclient";
import { useStateValue } from "../../../store";
import { toast } from "react-toastify";

const NFAQuestionTabCell = forwardRef(
  ({ questions, eventid, eventtype, version, addedQuestions,
    handleCancelChange, setLoading: setParentLoading }, ref) => {

    const [{ atoken, customersuffix }] = useStateValue();
    const apiclient = new ApiClient(customersuffix);
    const [collapsedLibs, setCollapsedLibs] = useState({});
    const [collapsedCats, setCollapsedCats] = useState({});
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setSelectedQuestions((addedQuestions || []).map(q => ({ ...q, id: q.questionId || q.id })));
    }, [addedQuestions]);

    const toggleLib = (libId) => setCollapsedLibs(prev => ({ ...prev, [libId]: !prev[libId] }));
    const toggleCat = (key) => setCollapsedCats(prev => ({ ...prev, [key]: !prev[key] }));

    const handleToggle = (q) => {
      const isSelected = selectedQuestions.some(sq => sq.id === q.id);
      setSelectedQuestions(prev => isSelected ? prev.filter(sq => sq.id !== q.id) : [...prev, q]);
    };

    const groupQuestions = (questionList) => {
      const categorized = {};
      const uncategorized = [];
      questionList.forEach((q) => {
        const category = q.questionCategory?.trim();
        const subcategory = q.questionSubCategory?.trim();
        if (!category) { uncategorized.push(q); return; }
        const sub = subcategory || "Others";
        if (!categorized[category]) categorized[category] = {};
        if (!categorized[category][sub]) categorized[category][sub] = [];
        categorized[category][sub].push(q);
      });
      const sortedCategorized = {};
      Object.keys(categorized).sort((a, b) => a.toLowerCase() === "others" ? 1 : b.toLowerCase() === "others" ? -1 : a.localeCompare(b))
        .forEach(cat => {
          sortedCategorized[cat] = {};
          Object.keys(categorized[cat]).sort((a, b) => a.toLowerCase() === "others" ? 1 : b.toLowerCase() === "others" ? -1 : a.localeCompare(b))
            .forEach(sub => { sortedCategorized[cat][sub] = categorized[cat][sub]; });
        });
      return { categorized: sortedCategorized, uncategorized };
    };

    const handleSubmit = useCallback(async () => {
      if (selectedQuestions.length === 0) {
        toast.error("Please select at least one question");
        return;
      }
      setLoading(true);
      if (setParentLoading) setParentLoading(true);
      const formatQuestion = (q) => ({
        id: 0,
        questionId: q.id || q.questionId || 0,
        questionDescription: q.questionDescription || "",
        attachement: q.attachement || false,
        attachedFileName: q.attachedFileName || "",
        optionType: q.optionType || false,
        weightage: q.weightage || 0,
        mandatory: q.mandatory || false,
        questionRequirement: q.questionRequirement || "",
        isActive: q.isActive ?? true,
        nfaId: eventid,
        libraryId: q.libraryId || 0,
        libraryEntity: q.libraryEntity || "",
        questionCategory: q.questionCategory || "",
        questionSubCategory: q.questionSubCategory || "",
        questionSubcategoryId: q.questionSubcategoryId || 0,
        questioncategoryId: q.questioncategoryId || 0,
        autoCalculated: q.autoCalculated ?? null,
        isMultiOption: q.isMultiOption || false,
        isMultipleChoice: q.isMultipleChoice || false,
        version: version || 1,
        answer: q.answer ?? null,
        ansAttachements: q.ansAttachements ?? null,
        questionOption: (q.questionOption || []).map(opt => ({ ...opt, id: 0 })),
      });
      try {
        const res = await apiclient.postres(`/api/NFAQuestionLib/${eventid}/Add`, selectedQuestions.map(formatQuestion), atoken);
        if (res) {
          toast.success("Questions Saved Successfully", { toastId: "QS" });
          handleCancelChange("libQuesDrawer");
        } else {
          toast.error("Failed to save questions");
        }
      } catch (error) {
        toast.error("An error occurred while saving questions");
      } finally {
        setLoading(false);
        if (setParentLoading) setParentLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedQuestions, eventid, version, atoken, handleCancelChange, setParentLoading]);

    useImperativeHandle(ref, () => ({ handleSubmit }), [handleSubmit]);

    const renderQuestion = (q, index, catKey) => (
      <div key={q.id} className="pe-question-card" style={{ marginBottom: 0 }}>
        <FormControlLabel
          style={{ alignItems: "flex-start", margin: 0, width: "100%" }}
          control={
            <Checkbox
              checked={selectedQuestions.some(sq => sq.id === q.id)}
              onChange={() => handleToggle(q)}
              size="small"
              style={{ paddingTop: 2 }}
            />
          }
          label={
            <div style={{ paddingTop: 2 }}>
              <div className="pe-question-title" style={{ marginBottom: 4 }}>
                <span className="pe-question-number">Q{index + 1}.</span>
                {q.questionDescription}
                {q.mandatory && <span className="pe-question-required"> (Required)</span>}
              </div>
              {q.questionRequirement && (
                <div className="pe-question-requirement">
                  <span className="pe-question-requirement-label">Requirement:</span>
                  {q.questionRequirement}
                </div>
              )}
              {q.questionOption?.length > 0 && (
                <div style={{ marginLeft: 8, marginTop: 4 }}>
                  {q.questionOption.map((opt, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#6b7280", lineHeight: "1.6" }}>
                      • {opt.questionOption}
                    </div>
                  ))}
                </div>
              )}
            </div>
          }
        />
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
          Questions for selection — {selectedQuestions.length} selected
        </div>

        {(questions || []).map((lib) => {
          const libKey = lib.id;
          const isLibCollapsed = !!collapsedLibs[libKey];
          const { categorized, uncategorized } = groupQuestions(lib.questions || []);

          return (
            <div key={libKey} className="pe-question-category">
              <div className="pe-question-category-header" onClick={() => toggleLib(libKey)}>
                <span className="pe-question-category-title">{lib.libraryEntity}</span>
                <button type="button" className="pe-icon-btn pe-icon-btn--expand">
                  <HiChevronDown style={{ transform: isLibCollapsed ? "rotate(-90deg)" : "none", transition: "transform 0.2s" }} />
                </button>
              </div>

              {!isLibCollapsed && (
                <div className="pe-question-category-body">
                  {/* Uncategorized → "Others" */}
                  {uncategorized.length > 0 && (() => {
                    const catKey = `${libKey}__others`;
                    const isCollapsed = !!collapsedCats[catKey];
                    return (
                      <div className="pe-question-category" style={{ marginBottom: 0 }}>
                        <div className="pe-question-category-header" style={{ background: "#f9fafb" }} onClick={() => toggleCat(catKey)}>
                          <span className="pe-question-category-title" style={{ fontWeight: 500 }}>Others ({uncategorized.length})</span>
                          <button type="button" className="pe-icon-btn pe-icon-btn--expand">
                            <HiChevronDown style={{ transform: isCollapsed ? "rotate(-90deg)" : "none", transition: "transform 0.2s" }} />
                          </button>
                        </div>
                        {!isCollapsed && (
                          <div className="pe-question-category-body">
                            {uncategorized.map((q, i) => renderQuestion(q, i, catKey))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Categorized */}
                  {Object.entries(categorized).map(([category, subcats]) => {
                    const catKey = `${libKey}__${category}`;
                    const isCatCollapsed = !!collapsedCats[catKey];
                    return (
                      <div key={catKey} className="pe-question-category" style={{ marginBottom: 0 }}>
                        <div className="pe-question-category-header" style={{ background: "#f9fafb" }} onClick={() => toggleCat(catKey)}>
                          <span className="pe-question-category-title" style={{ fontWeight: 500 }}>{category}</span>
                          <button type="button" className="pe-icon-btn pe-icon-btn--expand">
                            <HiChevronDown style={{ transform: isCatCollapsed ? "rotate(-90deg)" : "none", transition: "transform 0.2s" }} />
                          </button>
                        </div>
                        {!isCatCollapsed && (
                          <div className="pe-question-category-body">
                            {Object.entries(subcats).map(([subcat, qs]) => {
                              const subKey = `${catKey}__${subcat}`;
                              const isSubCollapsed = !!collapsedCats[subKey];
                              const showSubHeader = Object.keys(subcats).length > 1 || subcat !== "Others";
                              return showSubHeader ? (
                                <div key={subKey} className="pe-question-category" style={{ marginBottom: 0, marginLeft: 12 }}>
                                  <div className="pe-question-category-header" style={{ background: "#fff" }} onClick={() => toggleCat(subKey)}>
                                    <span className="pe-question-category-title" style={{ fontWeight: 400, fontSize: 13 }}>{subcat} ({qs.length})</span>
                                    <button type="button" className="pe-icon-btn pe-icon-btn--expand">
                                      <HiChevronDown style={{ transform: isSubCollapsed ? "rotate(-90deg)" : "none", transition: "transform 0.2s" }} />
                                    </button>
                                  </div>
                                  {!isSubCollapsed && (
                                    <div className="pe-question-category-body">
                                      {qs.map((q, i) => renderQuestion(q, i, subKey))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div key={subKey} className="pe-question-category-body">
                                  {qs.map((q, i) => renderQuestion(q, i, subKey))}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  });

export default NFAQuestionTabCell;
