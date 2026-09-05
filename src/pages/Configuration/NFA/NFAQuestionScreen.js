import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback, useMemo } from "react";
import {HiPlusSm, HiOutlineX } from "react-icons/hi";
import { Box, Drawer, Alert } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CommonBottomDrawer from "../../../components/CommonBottomDrawer";
import { useParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import { useStateValue } from "../../../store";
import { ApiClient } from "../../../Apiclient";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import { toast } from "react-toastify";
import { NFAQuestionsModalOBJ } from "../../../utils/modal";
import { findObjByValueFromArray, downloadExcelTemplate, getApiErrorMessage } from "../../../utils/common";
import PEModal from "../../../components/PEModal";
// Permission Management Imports
import { CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
// import EventQuestionScreenList from "../../../components/Event/EventQuestionScreenList";
import NFAQuestionScreenList from './NFAQuestionScreenList'
import NFAQuestionTabCell from './NFAQuestionTabCell'
import EventAddQuestionScreen from "../../../components/Event/EventAddQuestionScreen";
import { FastApiClient } from "../../../FastApiClient";

const NFAQuestionScreen = forwardRef(({ props }, NFAQuestionScreenRef) => {

  const [{ atoken, rtoken, customerid, customersuffix, usertimezone, userdialingcode, roleClaims, userDetail }, dispatch] = useStateValue();
  const apiclient = new ApiClient(customersuffix);
  const fastapiclient = new FastApiClient();
  const { pageSlug } = useParams();

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const [idFromURL, setIdFromURL] = useState(pageSlug);
  const fileInputRef = useRef(null);
  const [librarylist, setLibrarylist] = useState(null);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [questionlist, setQuestionList] = useState([]);
  const [openComponents, setOpenComponents] = useState({
    confirmDialog: false,
    addQuestionDrawer: false,
    libQuesDrawer: false
  });
  const [libraryWithQuestions, setLibraryWithQuestions] = useState([]);
  const [tempSelectedLibrary, setTempSelectedLibrary] = useState(null);
  const [libQuesLoading, setLibQuesLoading] = useState(false);
  const libQuesTabRef = useRef(null);

  // Extract permission properties from props
  const { permissionManager, canRead, canEdit, canCreate, canRemove } = props;

  // Questions permission checks
  const questionsCanRead = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ) ?? true;
  const questionsCanEdit = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.EDIT) ?? true;
  const questionsCanCreate = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.CREATE) ?? true;
  const questionsCanRemove = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.REMOVE) ?? true;

  // Check if current stage is Draft - only allow edits in Draft stage
  const isDraftStage = props.currentStage?.trim() === "Draft";

  // All useEffect hooks
  useEffect(() => {
    getLibraryList();
    // setHasSubmittedMandatory(false);
  }, []);

  useEffect(() => {
    //to set library and question once Librarylist is fetched
    if (props.eventid) getQuestionList();
    //  updateEventQuestionList(librarylist);
  }, [props.eventid])

  // useMemo hook
  const nonMandatoryLibraryQuestions = useMemo(() => {
    return libraryWithQuestions.map(library => ({
      ...library,
      questions: library.questions.filter(q => !q.mandatory),
    }));
  }, [libraryWithQuestions]);

  // useImperativeHandle hook
  useImperativeHandle(NFAQuestionScreenRef, () => ({
    saveEventQuestion: async () => {
      if (props.eventtype === "NFA") {
        // Validation for mandatory questions
        const invalidMandatoryQuestions = questionlist.filter(q => {
          if (!q.mandatory) return false;

          const isTextEmpty = !q.answer || q.answer.trim() === "";
          const isAllOptionsUnselected = !q.questionOption?.some(opt => opt.selectYN === "Y");

          // Check if it's a text question or option-based
          const isOptionQuestion = q.questionOption?.length > 0;

          return isOptionQuestion ? isAllOptionsUnselected : isTextEmpty;
        });

        if (invalidMandatoryQuestions.length > 0) {
          toast.error("Please answer all required questions before submitting.", { toastId: "mandatoryError" });
          return false;
        }
        questionlist?.forEach(x => {
          x.id = 0
          x.questionOption?.forEach(v => {
            v.id = 0
          })
          x.Version = props?.Version
        })
        try {
          const res = await apiclient.postres(`/api/NFAQuestionLib/${props.eventid}/Add`, questionlist, atoken);
          if (res) {
            toast.success("Questions Saved Successfully", { toastId: "QS" });
            return true;
          }
          return false;
        } catch (error) {
          toast.error(getApiErrorMessage(error), { toastId: "q_save_error" });
          return false;
        }
      }
    }
  }));

  // useCallback hook
  const handleQuestionUpdate = useCallback(
    (questionlist) => {
      const updateddata = [...questionlist];

      setQuestionList(updateddata);
      //   saveQuestions(updateddata);
    },
    [questionlist]
  );

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

  const getLibraryList = async () => {
    const params = {
      CustomerId: customerid,
      LibraryType: props.librarytype,
      EventType: props.eventtype,
      IsActive: true
    };
    const queryParams = buildQueryParams(params);
    const res = await apiclient.getres(`/api/LibraryOrgEntity/Find?${queryParams}`, atoken);
    if (res) {
      const result = res?.data?.result?.filter(x => x.libraryType === props.librarytype);
      setLibrarylist(result);
      updateEventQuestionList(result);
    }
  };

  const updateEventQuestionList = async (librarylist) => {

    if (!Array.isArray(librarylist) || librarylist.length === 0) {
      return;
    }

    const formattedData = [];

    for (const lib of librarylist) {
      const params = {
        CustomerId: lib.customerId,
        LibraryId: lib.id,
        EventType: "NFA",
        IsActive: true,
      };

      const queryParams = buildQueryParams(params);

      try {
        const res = await apiclient.getres(`/api/QuestionsLib/Find?${queryParams}`, atoken);

        let questions = [];

        if (Array.isArray(res?.data?.result) && res.data.result.length > 0) {
          questions = res.data.result;
        }
        // else {
        //   toast.info(`No Questions Found in "${lib.libraryEntity}".`, {
        //       toastId: `noquestion-${lib.id}`,
        //   });
        // }

        formattedData.push({
          ...lib,
          eventType: "NFA",
          isActive: true,
          organisationId: 0,
          organisationName: "",
          orgGroups: [],
          grandTotalTermName: "",
          questions: questions,
        });

      } catch (error) {
        console.error(`Error fetching questions for Library ID ${lib.id}:`, error);
        toast.error(`Error loading questions from "${lib.libraryEntity}".`, {
          toastId: `errorquestion-${lib.id}`,
        });
      }
    }
    // ✅ Set final result in state
    setLibraryWithQuestions(formattedData);
    return formattedData;
  };

  const getQuestionList = async () => {
    if (props.eventtype === "NFA") {
      try {
        const params = {
          NFAId: props.eventid,
          Version: parseInt(props.Version)
        };
        const queryParams = buildQueryParams(params);
        const res = await apiclient.getres(`/api/NFAQuestionLib/Find?${queryParams}`, atoken);
        if (res) {
          const data = res?.data || [];
          setQuestionList([...data]);
          const selectedLibrary = findObjByValueFromArray(librarylist, data[0]?.libraryId, 'id');
          if (selectedLibrary) {
            setSelectedLibrary(selectedLibrary);
          }
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error), { toastId: "q_fetch_error" });
      }
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleExcelUpload(file);
  };
  const handleExcelUpload = async (file) => {
    if (props?.eventtype === "NFA") {

      const data = {
        templateId: 2,
        customerId: 1,
        flagName: props?.eventtype,
        flagId: props?.eventid,
        file: file
      }
      const host = window.location.host;      // buyer.pe.com
      const cleanHost = host.split(":")[0];   // remove port
      const tenant = cleanHost.split(".")[0];
      const response = await fastapiclient.postresmultipart(`bulk-upload/excel-upload`, data, tenant)
      if (response) {

        const errorDetails = response.data?.error_details;
        if (Array.isArray(errorDetails) && errorDetails.length > 0) {
          const allErrors = errorDetails.join("\n");
          toast.error(`Errors encountered:\n${allErrors}`, { autoClose: false });
        }
        else {
          getQuestionList()
          toast.success("File uploaded successfully");
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  }

  const handleDownloadExcelTemplate = async () => {
    if (props?.eventtype === "NFA") {
      await downloadExcelTemplate({
        customerId: customerid,
        templateId: 2,
        fileName: `NFA_template_${new Date().getTime()}.xlsx`,
        eventType: "NFA"
      });
    }
  }

  const handleCancelChange = (name) => {
    setTempSelectedLibrary(null); // Clear the temporary selection
    setOpenComponents(prev => ({ ...prev, [name]: false })); // Close the dialog
    if (props.eventid) getQuestionList();
  };

  const callbackDeleteQuesFromList = (category, subcategory, questionDescription) => {

    setQuestionList((prevQuestions) => {
      // Filter out the question based on category, subcategory, and description
      return prevQuestions.filter((item) => {
        // We return only the items that do NOT match the specified category, subcategory, and description
        return !(
          item.questionCategory === category &&
          item.questionSubCategory === subcategory &&
          item.questionDescription.trim() === questionDescription.trim()
        );
      });
    });
  };

  const handleAddQuestion = (values) => {
    if (props?.eventtype === "NFA") {
      const newQ = NFAQuestionsModalOBJ(values, props?.eventid);

      // Add to question list
      // setQuestionList(prev => [...prev, newQ]);
      setQuestionList(prev => {
        const updatedList = [...prev, newQ];

        handleNewQuestionAdd(updatedList); // ✅ pass updated list
        return updatedList;
      });
    }
  };

  const handleNewQuestionAdd = async (updatedList) => {
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
      nfaId: props?.eventid,
      libraryId: q.libraryId || 0,
      libraryEntity: q.libraryEntity || "",
      questionCategory: q.questionCategory || "",
      questionSubCategory: q.questionSubCategory || "",
      questionSubcategoryId: q.questionSubcategoryId || 0,
      questioncategoryId: q.questioncategoryId || 0,
      autoCalculated: q.autoCalculated ?? null,
      isMultiOption: q.isMultiOption || false,
      isMultipleChoice: q.isMultipleChoice || false,
      version: props?.version || 1,
      answer: q.answer ?? null,
      ansAttachements: q.ansAttachements ?? null,
      questionOption: q.questionOption?.map(opt => ({
        ...opt,
        id: 0
      })) || []
    });

    const payload = updatedList?.map(formatQuestion);

    try {
      const res = await apiclient.postres(
        `/api/NFAQuestionLib/${props?.eventid}/Add`,
        payload,
        atoken
      );

      if (res) {
        toast.success("Questions Saved Successfully", { toastId: "QS" });
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
  }

  return (
    <div style={{ padding: '16px' }}>
      <div className="d-flex justify-content-between align-items-center pb-3 border-bottom">
        <div className="flex-grow-1">
          <div className="row mt-2">
            <input className="d-none" id="itemuploadid" ref={fileInputRef} type="file" onChange={handleFileChange} />
          </div>
        </div>

        {props.action && isDraftStage && questionsCanCreate && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="pe-btn pe-btn--secondary"
              onClick={() => document.getElementById('itemuploadid').click()}
            >
              Excel Upload
            </button>
            <button
              type="button"
              className="pe-btn pe-btn--secondary"
              onClick={handleDownloadExcelTemplate}
            >
              Excel Template
            </button>
            <button
              type="button"
              className="pe-btn pe-btn--primary"
              onClick={() => setOpenComponents(prev => ({ ...prev, addQuestionDrawer: true }))}
            >
              <HiPlusSm /> Add Questions
            </button>
            <button
              type="button"
              className="pe-btn pe-btn--primary"
              onClick={() => setOpenComponents(prev => ({ ...prev, libQuesDrawer: true }))}
            >
             <HiPlusSm /> Add from Library
            </button>
          </div>
        )}
      </div>
      {/* Questions List */}
      <NFAQuestionScreenList
        questions={questionlist}
        eventtype={props?.eventtype}
        eventId={props?.eventid}
        callbackDeleteQuesFromList={callbackDeleteQuesFromList}
        action={props.action}
        currentStage={props.currentStage}
        isDraftStage={isDraftStage}
        isSaveButtonDisabled={!(props.currentStage === "Draft")}
        handleQuestionUpdate={handleQuestionUpdate}
        permissionManager={permissionManager}
        canRead={questionsCanRead}
        canEdit={questionsCanEdit}
        canCreate={questionsCanCreate}
        canRemove={questionsCanRemove}
      />

      {/* overlay component */}
      <PEModal
        open={openComponents.confirmDialog}
        onClose={() => handleCancelChange("confirmDialog")}
        size="sm"
        title="Confirm Library Change"
      >
        <p>Are you sure you want to change the library? Doing so will delete all the questions from given library .</p>
      </PEModal>
      {/*add question component*/}
      <React.Fragment key="top">
        {/* Add Question Drawer */}
        <CommonBottomDrawer
          open={openComponents.addQuestionDrawer}
          onClose={() => handleCancelChange("addQuestionDrawer")}
          title="Add Question"
          actions={
            <>
              <button
                type="button"
                className="rfq-v2-event-btn rfq-v2-event-btn-ghost"
                onClick={() => handleCancelChange("addQuestionDrawer")}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-question-form"
                className="rfq-v2-event-btn rfq-v2-event-btn-primary"
              >
                Add Question
              </button>
            </>
          }
          sectionStyle={{ display: "flex", flexDirection: "column" }}
          bodyStyle={{ padding: "16px", overflowY: "auto", flex: 1 }}
        >
          <EventAddQuestionScreen
            questionlist={questionlist}
            eventid={props?.eventid}
            eventtype={props?.eventtype}
            callback={handleAddQuestion}
          />
        </CommonBottomDrawer>
        {/* Library Questions Drawer */}
        <CommonBottomDrawer
          open={openComponents.libQuesDrawer}
          onClose={() => handleCancelChange("libQuesDrawer")}
          title="Library Questions"
          actions={
            <>
              <button
                type="button"
                className="rfq-v2-event-btn rfq-v2-event-btn-ghost"
                onClick={() => handleCancelChange("libQuesDrawer")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rfq-v2-event-btn rfq-v2-event-btn-primary"
                disabled={libQuesLoading}
                onClick={() => libQuesTabRef.current?.handleSubmit()}
              >
                {libQuesLoading ? "Saving…" : "Submit Selected Questions"}
              </button>
            </>
          }
          sectionStyle={{ display: "flex", flexDirection: "column" }}
          bodyStyle={{ padding: "16px", overflowY: "auto", flex: 1 }}
        >
          <NFAQuestionTabCell
            ref={libQuesTabRef}
            questions={nonMandatoryLibraryQuestions}
            addedQuestions={questionlist}
            eventid={props?.eventid}
            eventtype={props?.eventtype}
            version={props?.Version}
            handleCancelChange={handleCancelChange}
            setLoading={setLibQuesLoading}
          />
        </CommonBottomDrawer>
      </React.Fragment>
    </div>
  );
});

export default NFAQuestionScreen;