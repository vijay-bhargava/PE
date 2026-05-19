import React, { useCallback, useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import { HiPlusSm, HiOutlineDotsHorizontal, HiX } from "react-icons/hi";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Divider,
  MenuItem,
  TextField,
} from "@mui/material";
import { Dropdown } from "react-bootstrap";
import "react-quill/dist/quill.snow.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import EventQuestionTable from "./EventQuestionTable";
import { mapQuestionsToSubcategories } from "../../utils/common";
import { useStateValue } from "../../store";
import { api, ApiClient } from "../../Apiclient";
import { getQuestionsLibFind } from "../../utils/common/utility";
import { buildQueryParams } from "../../utils/purchaseRequest";
import { toast } from "react-toastify";

function EventQuestionCell({
  eventtype,
  selectedQuesionArray,
  handleSelectedQArray,
  action,
  questionLibraryDll,
  toggleDrawer,
  selectedQuesDll,
  setSelectedQuesDll,
  updateEventLibraryId,
  handleSelectedEditQuestion,
  tableClass = "item-Table",
}) {
  const [QuestionCategoryList, setQuestionCategoryList] = useState([]);
  const [uncategorizedQuestions, setUncategorizedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [
    { atoken, rtoken, customerid, usertimezone,customersuffix, userdialingcode, roleClaims, userDetail },
    dispatch,
  ] = useStateValue();
  const [selectedQuestionDropdown, setSelectedQuestionDropdown] = useState();
  const [allDataList, setAllDataList] = useState([]);
  const [expandedAccordions, setExpandedAccordions] = useState([]); // Store expanded state of each category
  const [expandedUncategorized, setExpandedUncategorized] = useState(false); // State for uncategorized section
  const apiclient = new ApiClient(customersuffix);

  useEffect(() => {
    
    // Initialize all categories as expanded
    const allCategoryIds = QuestionCategoryList.map((category) => category.id);
    setExpandedAccordions(allCategoryIds); // Ensure all categories are expanded initially
  }, [QuestionCategoryList]);

  const handleAccordionChange = (category) => (event, isExpanded) => {
    setExpandedAccordions((prevExpanded) =>
      isExpanded
        ? [...prevExpanded, category] // Expand the category
        : prevExpanded.filter((item) => item !== category) // Collapse the category
    );
  };

  useEffect(() => {
    
    if (selectedQuesDll && selectedQuesionArray) {
      handleSaveQuestions(selectedQuesDll, selectedQuesionArray);
    }
  }, [selectedQuesDll, selectedQuesionArray]);

  const handleSaveQuestions = async (selectedQuesDll, selectedQuesionArray) => {
    
    console.log(`selectedQuesDll`, selectedQuesDll);
    console.log(`selectedQuesionArray`, selectedQuesionArray);
    var data = {
      CustomerId: customerid,
      LibraryId: selectedQuesDll?.id,
    };
    console.log('QCategory', data);
    setLoading(true);
    const queryParams = buildQueryParams(data);

    const res = await apiclient.getres(`/api/QCategory/Find?${queryParams}`, atoken);
    const categories = res?.data?.result;
    const questions = [...selectedQuesionArray];
    setAllDataList(questions);
    console.log("questionsquestionsquestions::", questions);
       
    const result = mapQuestionsToSubcategories(categories, questions);
    const updatedresult = result.filter(
      (x) => !(x.others.length === 0 && x.subCategory.length === 0)
    );

    if (res !== "" && res !== undefined) {
      setQuestionCategoryList(updatedresult);
    }

    const uncategorizedQuestions = questions.filter(
      (question) => !question.questionCategory
    );
    setUncategorizedQuestions(uncategorizedQuestions);
    setLoading(false);
  };

  const pullCategoryList = async (value) => {
    var data = {
      CustomerId: customerid,
      LibraryId: value?.id ? value?.id : value,
    };
    setLoading(true);
    const queryParams = Object.entries(data)
      .filter(([key, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    
    const res = await apiclient.getres(`/api/QCategory/Find?${queryParams}`, atoken);
    const res2 = await apiclient.getres(`/api/QuestionsLib/Find?${queryParams}`, atoken);
    const categories = res?.data?.result;
    const questions = res2?.data?.result;
    setAllDataList(questions);
    console.log("questionsquestionsquestions::", questions);
    const result = mapQuestionsToSubcategories(categories, questions);

    if (res !== "" && res !== undefined) {
      setQuestionCategoryList(result);
      handleSelectedQArray(questions);
    }

    const uncategorizedQuestions = questions.filter(
      (question) => !question.questionCategory
    );
    setUncategorizedQuestions(uncategorizedQuestions);
    setLoading(false);
  };

  const pullQuestionsLibFind = (selectedItem) => {
    console.log("selectedItems", selectedItem);
    var data = {
      CustomerId: customerid,
      LibraryId: selectedItem?.id,
    };
    console.log("request id getCommercialLibFind", data);
    getQuestionsLibFind(data, atoken).then((res) => {
      console.log("response getCommercialLibFind", res);
      if (res && res?.length > 0) {
        handleSelectedQArray(res);
      }
    });
  };

  const handleDeleteQuestion = useCallback(
    (questionId) => {
      console.log(questionId);
      const updatedQuestions = selectedQuesionArray.filter((question) => question.id !== questionId);
      handleSelectedQArray(updatedQuestions);
    },
    [selectedQuesionArray]
  );

  const handleEditQuestion = useCallback(
    (questionrow) => {
      const updatedQuestions = selectedQuesionArray.filter((question) => question.id === questionrow.id);
      handleSelectedEditQuestion(updatedQuestions[0]);
    },
    [selectedQuesionArray]
  );

  const handleDeleteQuestionCategory = (questioncategory) => {
    
    if (questioncategory) {
      const updatedQuestions = selectedQuesionArray.filter(
        (question) => question.questionCategory !== questioncategory
      );
      handleSelectedQArray(updatedQuestions);
      toast.success(`${questioncategory} Category deleted Successfully.`, {
        toastId: "questioncategoryerror",
      });
    }
  };

  const handleDeleteQuestionSubCategory = (questionsubcategory) => {
    if (questionsubcategory) {
      const updatedQuestions = selectedQuesionArray.filter(
        (question) => question.questionSubCategory !== questionsubcategory
      );
      handleSelectedQArray(updatedQuestions);
      toast.success(`${questionsubcategory} Subcategory deleted Successfully.`, {
        toastId: "questionsubcategorysuccess",
      });
    }
  };

  return (
    <>
      <div className="p-3 pt-0 ps-0 ">
        {action && (
          <div className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <div className="row mt-2">
                <div className="col-12 col-md-8 col-lg-8 pe-0">
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    size="small"
                    options={questionLibraryDll ?? []}
                    className="w-100"
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        label="Select Library"
                      />
                    )}
                    value={selectedQuesDll}
                    getOptionLabel={(option) => option.libraryEntity ?? ""}
                    onChange={(event, value) => {
                      if (value) {
                        setSelectedQuesDll(value);
                        pullCategoryList(value, selectedQuesionArray);
                        updateEventLibraryId(value);
                      } else {
                        setSelectedQuesDll(null);
                        setQuestionCategoryList([]);
                        handleSelectedQArray([]);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="text-end">
              <Button
                variant="text"
                size="small"
                startIcon={<HiPlusSm />}
                className="text-capitalize font-normal me-3"
                onClick={() => handleSelectedEditQuestion(null)}
                disabled={!selectedQuesDll}
              >
                Add More
              </Button>

             {eventtype!= 'VQ' && <Dropdown align="end" className="d-inline-block">
                <Dropdown.Toggle
                  id="dropdown-custom-components"
                  variant="link"
                  className="bg-white px-2 py-1 border-0"
                  role="button"
                >
                  <IconButton size="medium" className="shadow-sm ">
                    <HiOutlineDotsHorizontal className="f17" />
                  </IconButton>
                </Dropdown.Toggle>
                <Dropdown.Menu className="ddl-menu">
                  <MenuItem className="f14">Excel Upload</MenuItem>
                  <Divider />
                  <MenuItem className="f14">Excel Template</MenuItem>
                </Dropdown.Menu>
              </Dropdown>}
            </div>
          </div>
        )}
        <div className={tableClass}>
          <div>
            <div className="col-lg-12 col-md-10 pt-2">
              {QuestionCategoryList.length > 0 &&
                QuestionCategoryList.map((category) => {
                  
                  return (
                    <Accordion
                      key={category.id}
                      expanded={expandedAccordions.includes(category.id)} // Open all by default
                      onChange={handleAccordionChange(category.id)}
                      className="shadow-none"
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon style={{ color: "#218cde" }} />}
                        aria-controls={`panel-${category.id}-content`}
                        id={`panel-${category.id}-header`}
                        className="mb-0 mt-1"
                        classes={{
                          content: "MuiAccordionSummary-content custom-accordion-summary-content d-flex justify-content-between align-items-center",
                        }}
                      >
                        <h3 className="f15 fw600" style={{ color: "#218cde" }}>
                          {category.questioncategory}
                        </h3>
                        <div>
                          {action && (
                            <IconButton
                              size="small"
                              className="bg-white ms-2"
                              color="error"
                              onClick={() => handleDeleteQuestionCategory(category.questioncategory)}
                            >
                              <HiX className="f17" />
                            </IconButton>
                          )}
                        </div>
                      </AccordionSummary>
                      <AccordionDetails>
                        {category.others.length > 0 && (
                          <EventQuestionTable
                            action={action}
                            questions={category?.others}
                            callbackDeleteQuesFromList={handleDeleteQuestion}
                            callbackEditQuesFromList={handleEditQuestion}
                          />
                        )}
                        {category.subCategory.length > 0 &&
                          category.subCategory.filter((x) => x.questions.length !== 0).map((subcategory) => (
                            <Accordion
                              key={subcategory.id}
                              expanded={expandedAccordions.includes(subcategory.id)}
                              onChange={handleAccordionChange(subcategory.id)}
                              className="shadow-none"
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon style={{ color: "#218cde" }} />}
                                aria-controls={`panel-${subcategory.id}-content`}
                                id={`panel-${subcategory.id}-header`}
                                className="mb-0 mt-1"
                                style={{ minHeight: "35px", paddingLeft: "0", paddingRight: "0" }}
                                classes={{
                                  content: "MuiAccordionSummary-content custom-accordion-summary-content d-flex justify-content-between align-items-center",
                                }}
                              >
                                <h4 className="f12 fw600" style={{ color: "#218cde" }}>
                                  {subcategory.questionsubcategory}
                                </h4>
                                {action && (
                                  <IconButton
                                    size="small"
                                    className="bg-white ms-2"
                                    color="error"
                                    onClick={() => handleDeleteQuestionSubCategory(subcategory.questionsubcategory)}
                                  >
                                    <HiX className="f17" />
                                  </IconButton>
                                )}
                              </AccordionSummary>
                              <AccordionDetails style={{ paddingLeft: "0", paddingRight: "0" }}>
                                <EventQuestionTable
                                  action={action}
                                  questions={subcategory?.questions}
                                  callbackDeleteQuesFromList={handleDeleteQuestion}
                                  callbackEditQuesFromList={handleEditQuestion}
                                />
                              </AccordionDetails>
                            </Accordion>
                          ))}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}

              {uncategorizedQuestions.length > 0 && (
                <Accordion
                  expanded={expandedUncategorized} // Use expandedUncategorized for "Others"
                  onChange={() => {
                    setExpandedUncategorized(!expandedUncategorized);
                  }}
                  className="shadow-none"
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon style={{ color: "#218cde" }} />}
                    aria-controls="panel-uncategorized-content"
                    id="panel-uncategorized-header"
                    className="mb-0 mt-1"
                    style={{ minHeight: "35px" }}
                    classes={{
                      content: "MuiAccordionSummary-content custom-accordion-summary-content",
                    }}
                  >
                    <h3 className="f15 fw600" style={{ color: "#218cde" }}>
                      Others
                    </h3>
                  </AccordionSummary>
                  <AccordionDetails>
                    <EventQuestionTable
                      action={action}
                      questions={uncategorizedQuestions}
                      callbackDeleteQuesFromList={handleDeleteQuestion}
                      callbackEditQuesFromList={handleEditQuestion}
                    />
                  </AccordionDetails>
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventQuestionCell;
