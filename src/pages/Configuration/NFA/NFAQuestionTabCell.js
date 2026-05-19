import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    FormControlLabel,
    Checkbox,
  } from "@mui/material";
  import React, { useState, useRef, useEffect, useCallback } from "react";
//   import { downloadFilesOnAzure, uploadFilesOnAzure, validateFileSize } from "../../utils/common";
import { useStateValue } from "../../../store"
import { LoadingButton } from "@mui/lab";
import {  Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api, ApiClient } from "../../../Apiclient";
import { toast } from "react-toastify";
  
  
  const NFAQuestionTabCell = (({ questions, eventid,eventtype,version,addedQuestions,handleCancelChange }) => {
    
    const [{ atoken, rtoken, customerid,customersuffix, usertimezone, userdialingcode, roleClaims, userDetail }, dispatch] = useStateValue();
    const fileInputRef = useRef(null);
    const apiclient = new ApiClient(customersuffix);
    const [expandedAccordion, setExpandedAccordion] = useState(null);
    const [checkboxState, setCheckboxState] = useState({});
    const [radioState, setRadioState] = useState({});
    const [textFieldState, setTextFieldState] = useState({});
    const [loading, setLoading] = useState(false); // Loading state for file operations
    const mainAreaRef = useRef(null);
    const [questionArray,setQuestionArray]=useState()
    const [selectedQuestions, setSelectedQuestions] = useState([]);


    useEffect(()=>{
      setQuestionArray(questions)
    },[questions])

    // const handleToggle = (questionId) => {
    //     setSelectedQuestions((prev) =>
    //       prev.includes(questionId)
    //         ? prev.filter((id) => id !== questionId)
    //         : [...prev, questionId]
    //     );
    // };
      
    // const handleToggle = (question) => {
    //     setSelectedQuestions((prev) => {
    //         const exists = prev.some((q) => q.id === question.id);
    //         if (exists) {
    //         return prev.filter((q) => q.id !== question.id);
    //         } else {
    //         return [...prev, question];
    //         }
    //     });
    // };
    const handleToggle = (question) => {
        const isSelected = selectedQuestions.some((q) => q.id === question.id);
        if (isSelected) {
          setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
        } else {
          setSelectedQuestions(prev => [...prev, question]);
        }
      };
      
    // const handleSubmit = async () => {
    //     try {
    //         const payload = selectedQuestions; // Adjust format if needed by your API
    //         const res = await apiclient.post('/api/QuestionsLib/SubmitSelected', payload, atoken);
    //         toast.success("Questions submitted successfully!");
    //     } catch (error) {
    //         console.error("Error submitting questions:", error);
    //         toast.error("Failed to submit questions.");
    //     }
    // };

    // const groupQuestions = (questionList) => {
    //     const categorized = {}; // category > subcategory > questions[]
    //     const uncategorized = []; // questions with no category
    
    //     questionList.forEach((q) => {
    //       const category = q.questionCategory?.trim();
    //       const subcategory = q.questionSubCategory?.trim();
    
    //       if (!category) {
    //         // No category → go directly to "Others"
    //         uncategorized.push(q);
    //       } else {
    //         // Has category → may or may not have subcategory
    //         const cat = category;
    //         const sub = subcategory || "Others";
    
    //         if (!categorized[cat]) {
    //           categorized[cat] = {};
    //         }
    //         if (!categorized[cat][sub]) {
    //           categorized[cat][sub] = [];
    //         }
    //         categorized[cat][sub].push(q);
    //       }
    //     });
    
    //     return { categorized, uncategorized };
    // };
    
    // const handleSubmit = async () => {
    //     
    //     // const formatted = selectedQuestions.map(q => NFAQuestionsModalOBJ(q, eventid));
    //     const questionlist = selectedQuestions.map((q) => {
    //       return {
    //         ...q,
    //         id: 0,
    //         questionOption: (q.questionOption || []).map((opt) => ({
    //           ...opt,
    //           id: 0,
    //         })),
    //         Version: version,
    //       };
    //     });
      
    //     try {
    //       const res = await apiclient.postres(
    //         `/api/NFAQuestionLib/${eventid}/Add`,
    //         questionlist,
    //         atoken
    //       );
      
    //       if (res) {
    //         toast.success("Questions Saved Successfully", {
    //           toastId: "QS",
    //         });

    //       } else {
    //         toast.error("Failed to save questions.");
    //       }
    //     } catch (error) {
    //       console.error("Submit error:", error);
    //       toast.error("An error occurred while saving questions.");
    //     }
    // };
      
    // const handleSubmit = async () => {
    //     const payload = selectedQuestions.map((q) => ({
    //       id: 0,
    //       questionId: q.id || 0,
    //       questionDescription: q.questionDescription || "",
    //       attachement: q.attachement || false,
    //       attachedFileName: q.attachedFileName || "",
    //       optionType: q.optionType || false,
    //       weightage: q.weightage || 0,
    //       mandatory: q.mandatory || false,
    //       questionRequirement: q.questionRequirement || "",
    //       isActive: q.isActive ?? true,
    //       nfaId: eventid,
    //       libraryId: q.libraryId || 0,
    //       libraryEntity: q.libraryEntity || "",
    //       questionCategory: q.questionCategory || "",
    //       questionSubCategory: q.questionSubCategory || "",
    //       questionSubcategoryId: q.questionSubcategoryId || 0,
    //       questioncategoryId: q.questioncategoryId || 0,
    //       autoCalculated: q.autoCalculated ?? null,
    //       isMultiOption: q.isMultiOption || false,
    //       isMultipleChoice: q.isMultipleChoice || false,
    //       version: version || 1,
    //       answer: q.answer ?? null,
    //       ansAttachements: q.ansAttachements ?? null,
    //       questionOption: q.questionOption?.map(opt => ({
    //         ...opt,
    //         id: 0
    //       })) || []
    //     }));
      
    //     try {
    //       const res = await apiclient.postres(
    //         `/api/NFAQuestionLib/${eventid}/Add`,
    //         payload,
    //         atoken
    //       );
      
    //       if (res) {
    //         toast.success("Questions Saved Successfully", { toastId: "QS" });
    //         return true;
    //       } else {
    //         toast.error("Failed to save questions");
    //         return false;
    //       }
    //     } catch (error) {
    //       console.error("Submission error:", error);
    //       toast.error("An error occurred during submission");
    //       return false;
    //     }
    //   };
      
    // const handleSubmit = async () => {
    //     // Format both selected and added questions to the same structure
    //     const formatQuestion = (q) => ({
    //       id: 0,
    //       questionId: q.id || q.questionId || 0,
    //       questionDescription: q.questionDescription || "",
    //       attachement: q.attachement || false,
    //       attachedFileName: q.attachedFileName || "",
    //       optionType: q.optionType || false,
    //       weightage: q.weightage || 0,
    //       mandatory: q.mandatory || false,
    //       questionRequirement: q.questionRequirement || "",
    //       isActive: q.isActive ?? true,
    //       nfaId: eventid,
    //       libraryId: q.libraryId || 0,
    //       libraryEntity: q.libraryEntity || "",
    //       questionCategory: q.questionCategory || "",
    //       questionSubCategory: q.questionSubCategory || "",
    //       questionSubcategoryId: q.questionSubcategoryId || 0,
    //       questioncategoryId: q.questioncategoryId || 0,
    //       autoCalculated: q.autoCalculated ?? null,
    //       isMultiOption: q.isMultiOption || false,
    //       isMultipleChoice: q.isMultipleChoice || false,
    //       version: version || 1,
    //       answer: q.answer ?? null,
    //       ansAttachements: q.ansAttachements ?? null,
    //       questionOption: q.questionOption?.map(opt => ({
    //         ...opt,
    //         id: 0
    //       })) || []
    //     });
      
    //     // Merge and format both lists
    //     const allFormattedQuestions = [
    //       ...addedQuestions.map(formatQuestion),
    //       ...selectedQuestions.map(formatQuestion)
    //     ];
      
    //     // Optional deduplication by questionId if you want to filter before sending
    //     // const uniquePayload = Array.from(new Map(allFormattedQuestions.map(q => [q.questionId, q])).values());
      
    //     try {
    //       const res = await apiclient.postres(
    //         `/api/NFAQuestionLib/${eventid}/Add`,
    //         allFormattedQuestions, // or use `uniquePayload` if you uncomment deduplication
    //         atoken
    //       );
      
    //       if (res) {
    //         toast.success("Questions Saved Successfully", { toastId: "QS" });
    //         return true;
    //       } else {
    //         toast.error("Failed to save questions");
    //         return false;
    //       }
    //     } catch (error) {
    //       console.error("Submission error:", error);
    //       toast.error("An error occurred during submission");
    //       return false;
    //     }
    //   };
      
    const handleSubmit = async () => {
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
          questionOption: q.questionOption?.map(opt => ({
            ...opt,
            id: 0
          })) || []
        });
      
        const payload = selectedQuestions.map(formatQuestion);
      
        try {
          const res = await apiclient.postres(
            `/api/NFAQuestionLib/${eventid}/Add`,
            payload,
            atoken
          );
      
          if (res) {
            toast.success("Questions Saved Successfully", { toastId: "QS" });
            handleCancelChange("libQuesDrawer");
            return true;
          } else {
            toast.error("Failed to save questions");
            return false;
          }
        } catch (error) {
          console.error("Submission error:", error);
          toast.error("An error occurred during submission");
          return false;
        }
    };
      
    const groupQuestions = (questionList) => {
        const categorized = {}; // category > subcategory > questions[]
        const uncategorized = []; // questions with no category
      
        questionList.forEach((q) => {
          const category = q.questionCategory?.trim();
          const subcategory = q.questionSubCategory?.trim();
      
          if (!category) {
            // No category → go directly to "Others"
            uncategorized.push(q);
          } else {
            // Has category → may or may not have subcategory
            const cat = category;
            const sub = subcategory || "Others";
      
            if (!categorized[cat]) {
              categorized[cat] = {};
            }
            if (!categorized[cat][sub]) {
              categorized[cat][sub] = [];
            }
            categorized[cat][sub].push(q);
          }
        });
      
        // Sort categories: alphabetical with "Others" last
        const sortedCategories = Object.keys(categorized)
          .sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            if (aLower === "others") return 1;
            if (bLower === "others") return -1;
            return aLower.localeCompare(bLower);
          });
      
        // Build new sorted object for categories and subcategories
        const sortedCategorized = {};
        sortedCategories.forEach((cat) => {
          // Sort subcategories similarly for each category
          const subcats = categorized[cat];
          const sortedSubcats = Object.keys(subcats)
            .sort((a, b) => {
              const aLower = a.toLowerCase();
              const bLower = b.toLowerCase();
              if (aLower === "others") return 1;
              if (bLower === "others") return -1;
              return aLower.localeCompare(bLower);
            });
      
          sortedCategorized[cat] = {};
          sortedSubcats.forEach((sub) => {
            sortedCategorized[cat][sub] = subcats[sub];
          });
        });
      
        return { categorized: sortedCategorized, uncategorized };
    };

    useEffect(() => {
        setSelectedQuestions(addedQuestions.map(q => ({
          ...q,
          id: q.questionId || q.id // normalize
        })));
      }, [addedQuestions]);      
    return (
  
        <div className="question-container" style={{ 
          height: '100%', 
          overflowY: 'auto'
        }}>
          <style>
            {`
              .question-container::-webkit-scrollbar {
                display: none;
              }
              .question-container {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
            `}
          </style>
          <Typography gutterBottom>
            Questions for selection:
          </Typography>
    
          {questions.map((lib) => {
            const { categorized, uncategorized } = groupQuestions(lib.questions || []);
    
            return (
              <Accordion key={lib.id} sx={{ border: 'none', boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography className="text-medium dark-blue">{lib.libraryEntity}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Uncategorized questions go directly here under "Others" */}
                  {uncategorized.length > 0 && (
                    <Accordion sx={{ ml: 2, border: 'none', boxShadow: 'none' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className="text-medium dark-blue">Others</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {uncategorized.map((q, index) => (
                          <div
                            key={q.id}
                            style={{
                              marginBottom: "1rem",
                              paddingBottom: "0.5rem",
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                    checked={selectedQuestions.some((sq) => sq.id === q.id)}
                                    onChange={() => handleToggle(q)}
                                />
                              }
                              label={
                                <div>
                                  <Typography variant="subtitle1">
                                    {index + 1}. {q.questionDescription}
                                  </Typography>
                                  {q.questionRequirement && (
                                    <Typography
                                      variant="body2"
                                      sx={{ ml: 2, color: "gray" }}
                                    >
                                      Requirement: {q.questionRequirement}
                                    </Typography>
                                  )}
                                  {q.questionOption?.length > 0 && (
                                    <div
                                      style={{
                                        marginLeft: "1.5rem",
                                        marginTop: "0.5rem",
                                      }}
                                    >
                                      {q.questionOption.map((opt, optIndex) => (
                                        <Typography
                                          key={optIndex}
                                          variant="body2"
                                          sx={{ display: "block" }}
                                        >
                                          • {opt.questionOption}
                                        </Typography>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              }
                            />
                          </div>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  )}
    
                  {/* Render categorized questions */}
                  {Object.entries(categorized)
                  .map(([category, subcats]) => (
                    <Accordion key={category} sx={{ ml: 2, border: 'none', boxShadow: 'none' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className="text-medium dark-blue">{category}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {Object.entries(subcats).map(([subcat, qs]) => (
                          <Accordion key={subcat} sx={{ ml: 2, border: 'none', boxShadow: 'none' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography className="text-medium dark-blue">{subcat}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              {qs.map((q, index) => (
                                <div
                                  key={q.id}
                                  style={{
                                    marginBottom: "1rem",
                                    paddingBottom: "0.5rem",
                                  }}
                                >
                                  <FormControlLabel
                                    control={
                                    <Checkbox
                                        checked={selectedQuestions.some((sq) => sq.id === q.id)}
                                        onChange={() => handleToggle(q)}
                                    />
                                    }
                                    label={
                                      <div>
                                        <Typography variant="subtitle1">
                                          {index + 1}. {q.questionDescription}
                                        </Typography>
                                        {q.questionRequirement && (
                                          <Typography
                                            variant="body2"
                                            sx={{ ml: 2, color: "gray" }}
                                          >
                                            Requirement: {q.questionRequirement}
                                          </Typography>
                                        )}
                                        {q.questionOption?.length > 0 && (
                                          <div
                                            style={{
                                              marginLeft: "1.5rem",
                                              marginTop: "0.5rem",
                                            }}
                                          >
                                            {q.questionOption.map(
                                              (opt, optIndex) => (
                                                <Typography
                                                  key={optIndex}
                                                  variant="body2"
                                                  sx={{ display: "block" }}
                                                >
                                                  • {opt.questionOption}
                                                </Typography>
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    }
                                  />
                                </div>
                              ))}
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            );
          })}
    
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
            disabled={selectedQuestions.length === 0}
          >
            Submit Selected Questions
          </Button>
        </div>
      );
      
  });
  
  export default NFAQuestionTabCell;