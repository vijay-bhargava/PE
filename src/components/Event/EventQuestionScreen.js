import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import CommonBottomDrawer from "../CommonBottomDrawer";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { HiPlusSm, HiOutlineDotsHorizontal, HiOutlineX } from "react-icons/hi";
import {
  Autocomplete,
  Alert,
  Button,
  Divider,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
} from "@mui/material";
import { KeyboardArrowDownOutlined } from "@mui/icons-material";
import "react-quill/dist/quill.snow.css";
import "../../assets/css/manage-rfq-v2.css";
import Dropdown from "react-bootstrap/Dropdown";
import { useStateValue } from "../../store";
import { api, ApiClient } from "../../Apiclient";
import { buildQueryParams } from "../../utils/purchaseRequest";
import { toast } from "react-toastify";
import { RFQQuestionsModal, RFQQuestionsModalOBJ, RFQSupplierQuestionsModal, SQEQuestionsModal, SQEQuestionsModalOBJ } from "../../utils/modal";
import { findObjByValueFromArray, SQEAddModal, downloadExcelTemplate } from "../../utils/common";
import EventQuestionScreenList from "./EventQuestionScreenList";
import EventAddQuestionScreen from "./EventAddQuestionScreen";
import AddUpdateQuestion from "../../pages/Settings/QuestionMaster/AddUpdateQuestion";
import { CategoryFindAll } from "../../utils/questionlibrary";
import { FastApiClient } from "../../FastApiClient";
import { CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';
import { getEventApproversFind } from '../../utils/common/utility';
import { set } from "date-fns";
const EventQuestionScreen = forwardRef(({ props }, EventQuestionScreenRef) => {

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

  useEffect(() => {
    getLibraryList();
  }, []);

  useEffect(() => {
    //to set library and question once Librarylist is fetched
    if (props.eventid) getQuestionList();
  }, [Librarylist])

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
      const result = res?.data?.result?.filter(x => x.libraryType == props.librarytype);
      setLibrarylist(result);
    }
  };

  const getQuestionList = async () => {

    if (props.eventtype == "RFQ") {
      const params = {
        // CustomerId: customerid,
        RFQId: props.eventid,
        Version: isNaN(parseInt(props.Version)) ? undefined : parseInt(props.Version)
      };
      const queryParams = buildQueryParams(params);
      const res = await apiclient.getres(`/api/RFQQuestionLib/Find?${queryParams}`, atoken);
      if (res) {
        // API may return direct array or { result: [...] }
        const d = res?.data;
        const data = Array.isArray(d) ? d : (Array.isArray(d?.result) ? d.result : []);
        setQuestionList(data)
        const selectedLibrary = findObjByValueFromArray(Librarylist, data[0]?.libraryId, 'id');
        if (selectedLibrary) {
          setSelectedLibrary(selectedLibrary)
        }
      }
    }

    if (props.eventtype == "VQ") {
      // For VQ, use the correct API format: /api/SQE/{VendorId}/Find
      if (!props.vendorId) {
        setQuestionList([]);
        if (props.CallbackSelectedQuestionList) {
          props.CallbackSelectedQuestionList([]);
        }
        return;
      }

      const res = await apiclient.getres(`/api/SQE/${props.vendorId}/Find`, atoken);

      if (res && res.data?.length > 0) {

        // Find the specific VQ record that matches the eventid
        const vqRecord = res.data.find(vq => vq.id === parseInt(props.eventid));

        if (vqRecord && vqRecord.sqeHeaderDetails) {
          const sqeHeaderDetails = vqRecord.sqeHeaderDetails || [];

          // Filter out existing questions without libraryId to avoid duplicates
          const eventquestion = (questionlist ?? []).filter(x => !x.libraryId);

          // Set the questions list with the prefilled data
          const finalQuestions = sqeHeaderDetails.length > 0 ? sqeHeaderDetails : eventquestion;
          setQuestionList(finalQuestions);

          // Callback to parent with the questions
          if (props.CallbackSelectedQuestionList) {
            props.CallbackSelectedQuestionList(finalQuestions);
          }

          // Set the selected library if available
          if (sqeHeaderDetails.length > 0) {
            const firstQuestion = sqeHeaderDetails[0];
            const selectedLibrary = findObjByValueFromArray(Librarylist, firstQuestion?.libraryId, 'id');
            if (selectedLibrary) {
              setSelectedLibrary(selectedLibrary);
            }
          }
        } else {
          setQuestionList([]);
          if (props.CallbackSelectedQuestionList) {
            props.CallbackSelectedQuestionList([]);
          }
        }
      } else {
        setQuestionList([]);
        if (props.CallbackSelectedQuestionList) {
          props.CallbackSelectedQuestionList([]);
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
      EventType: props.eventtype,
      IsActive: true
    };
    const queryParams = buildQueryParams(params);
    const res = await apiclient.getres(`/api/QuestionsLib/Find?${queryParams}`, atoken);
    if (res) {
      const questionlibresult = Array.isArray(res?.data?.result) ? res.data.result : []; //pe.questionmaster table
      if (questionlibresult.length == 0) {
        toast.info(`No Questions Found. Please Select Another Library `, {
          toastid: "noquestionerror"
        })
        setSelectedLibrary(null)

        return false
      }
      let data = [];

      if (props.eventtype == "RFQ") {
        data = RFQQuestionsModal(questionlibresult, props.eventid)
      }
      else if (props.eventtype == "VQ") {
        data = SQEQuestionsModal(questionlibresult, props.eventid) //to map question master modal with SQ Modal.
      }

      const eventquestion = (questionlist ?? [])?.filter(x => !x.libraryId)
      setQuestionList([...eventquestion, ...data])

      if (props.eventtype == "VQ") {
        props.CallbackSelectedQuestionList([...eventquestion, ...data])
      }
    }
  }

  const [isQuestionListLoading, setIsQuestionListLoading] = useState(false);
  //in order to handle event from parent component
  useImperativeHandle(EventQuestionScreenRef, () => ({
    saveEventQuestion: async () => {
      if (isQuestionListLoading) {
        return;
      }
      setIsQuestionListLoading(true);
      if (props.eventtype == "RFQ") {
        questionlist?.forEach(x => {
          x.id = 0
          x.questionOption?.forEach(v => {
            v.id = 0
          })
          x.Version = props?.Version
        })
        const hasTechnicalApproval = props.stagelist.some(stage => stage.currentStage === "Technical Approval");

        const isTechApproverPresent = await getEventApproversFind(props.requestCell, atoken).then((res) => {
          return res?.some(item =>
            item.stage?.toLowerCase().includes("technical") ||
            item.wfStage?.toLowerCase().includes("technical")
          );
        });
        if ((hasTechnicalApproval && isTechApproverPresent)) {
          if (questionlist.length > 0) {
            const res = await apiclient.postres(`/api/RFQQuestionLib/${props.eventid}/Add`, questionlist, atoken);
            if (res) {
              toast.success("Questions Saved Successfully", {
                toastId: "QS"
              })
              return true
            }
            else {
              return false
            }
          }
          else {
            toast.error("Please select atleast one question", {
              toastId: "QS"
            })
            return false
          }
        }
        else {
          const res = await apiclient.postres(`/api/RFQQuestionLib/${props.eventid}/Add`, questionlist, atoken);
          if (res) {
            toast.success("Questions Saved Successfully", {
              toastId: "QS"
            })
            return true
          }
          // else {
          //   return false
          // }
        }
      }
      setIsQuestionListLoading(false);
    }
  }));

  const handleClickAnchor = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAnchor = () => {
    setAnchorEl(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleExcelUpload(file);
  };
  const handleExcelUpload = async (file) => {
    if (props?.eventtype == "RFQ") {

      const data = {
        templateId: 9,
        customerId: customerid,
        flagName: "RFQId",
        flagId: props?.eventid,
        file: file,
        createdById: userDetail?.id,
        createdByName: userDetail?.name
      }
      const host = window.location.host;      // buyer.pe.com
      const cleanHost = host.split(":")[0];   // remove port
      const tenant = cleanHost.split(".")[0];
      const response = await fastapiclient.postresmultipart(`bulk-qm/excel-upload`, data, tenant)

      if (response) {

        const errorDetails = response.data?.error_details;
        if (Array.isArray(errorDetails) && errorDetails.length > 0) {
          const allErrors = errorDetails
            ?.map(err => `Row ${err.row}, Field "${err.field}": ${err.error}`)
            .join("\n");
          toast.error(`Errors encountered:\n${allErrors}`, { autoClose: false });
        }
        else {
          toast.success("File uploaded successfully");
        }
        getQuestionList()
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

      }

    }

  }

  const handleDownloadExcelTemplate = async () => {
    if (props?.eventtype == "RFQ") {
      await downloadExcelTemplate({
        customerId: customerid,
        templateId: 9,
        fileName: `RFQ_template_${new Date().getTime()}.xlsx`,
        eventType: "RFQ"
      });
    }
  }

  const handleLibraryChange = (event, value) => {
    if (value && selectedLibrary) {
      // Store the new selection temporarily and open the confirm dialog
      setTempSelectedLibrary(value);
      setOpenComponents(prev => ({ ...prev, confirmDialog: true }));
    } else {
      setSelectedLibrary(value); // Directly update if no previous selection
      updateEventQuestionList(value?.id)
    }
  };

  const handleConfirmChange = () => {
    setSelectedLibrary(tempSelectedLibrary); // Update to the new selection   
    setOpenComponents(prev => ({ ...prev, confirmDialog: false })); // Close the dialog   
    updateEventQuestionList(tempSelectedLibrary?.id) // abheedev logic related to questions list  here
    setTempSelectedLibrary(null); // Clear the temporary selection
  };

  const handleCancelChange = (name) => {
    setTempSelectedLibrary(null); // Clear the temporary selection
    setOpenComponents(prev => ({ ...prev, [name]: false })); // Close the dialog
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

    if (props.eventtype == "VQ") {
      props.CallbackSelectedQuestionList((questionlist) => {
        // Filter out the question based on category, subcategory, and description
        return questionlist.filter((item) => {
          // We return only the items that do NOT match the specified category, subcategory, and description
          return !(
            item.questionCategory === category &&
            item.questionSubCategory === subcategory &&
            item.questionDescription.trim() === questionDescription.trim()
          );
        });
      })
    }

  };
  //drawerrelated

  const handleAddQuestion = (values) => {

    if (props?.eventtype == "RFQ") {
      const newQ = RFQQuestionsModalOBJ(values, props?.eventid);

      setQuestionList([...questionlist, newQ])
      return true;
    }

    if (props?.eventtype == "VQ") {

      const newQ = SQEQuestionsModalOBJ(values, props.eventid);

      setQuestionList([...questionlist, newQ])
      props.CallbackSelectedQuestionList([...questionlist, newQ])
      //#Anurag_Dev handle close the drawer after the question mapping
      setOpenComponents(prev => ({ ...prev, confirmDialog: false, addQuestionDrawer: false }));
      return true;
    }

  }

  return (

    <div className="p-3 pt-0 ps-0" style={{ overflow: "hidden" }}>
      <input className="d-none" id="itemuploadid" ref={fileInputRef} type="file" onChange={handleFileChange} />
      {props.action && <div className="rfq-question-toolbar">
        <div className="rfq-question-toolbar-left">
          <div className="rfq-question-library-field">
            <Autocomplete
              disablePortal
              fullWidth
              id="combo-box-demo"
              size="small"
              className="rfq-question-library-select"
              options={Librarylist ?? []}
              renderInput={(params) => (
                <TextField {...params} InputLabelProps={{ shrink: false }} label="" placeholder="Add from Question Library" />
              )}
              value={selectedLibrary}
              getOptionLabel={(option) => option.libraryEntity ?? ""}
              onChange={handleLibraryChange}
              disabled={!props.action}
            />
          </div>
        </div>
        <div className="rfq-question-toolbar-right">
          {props.action && (props.eventtype == "RFQ") && (
            <Dropdown align="end" className="d-inline-block">
              <Dropdown.Toggle as="div" id="gt" className="round-edit remove-tringle" role="button">
                <button type="button" className="pe-btn pe-btn--secondary">
                  <HiPlusSm /> <span>Bulk Questions</span>
                  <span className="rfq-question-action-chevron"><KeyboardArrowDownOutlined style={{ fontSize: 16 }} /></span>
                </button>
              </Dropdown.Toggle>
              <Dropdown.Menu className="ddl-menu">
                <MenuItem className="f14" onClick={() => document.getElementById("itemuploadid").click()}>Excel Upload</MenuItem>
                <Divider />
                <MenuItem className="f14" onClick={handleDownloadExcelTemplate}>Excel Template</MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          )}
          {props.action && (props.permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.CREATE) ?? false) && (
            <button type="button" className="pe-btn pe-btn--primary" onClick={() => setOpenComponents(prev => ({ ...prev, addQuestionDrawer: true }))}>
              <HiPlusSm /> Blank Question
            </button>
          )}
        </div>
      </div>}

      {/* Questions List */}

      <EventQuestionScreenList
        questions={questionlist}
        suppliercompanyName={props?.companyName ?? ""}
        eventtype={props?.eventtype}
        callbackDeleteQuesFromList={callbackDeleteQuesFromList}
        eventSealed={props?.eventSealed ?? "Y"}
        vendorId={props.vendorId}
        currentStage={props.currentStage}
        stagelist={props.stagelist}
        EventHeaderDetails={props.EventHeaderDetails}
        eventSubject={props.eventSubject}
        callbackEditQuesFromList={async (updatedvalue) => {

          if (props?.eventtype == "RFQ") {
            const data = RFQSupplierQuestionsModal(updatedvalue, props?.eventid)
            if (data) {
              const res = await apiclient.postres(
                `/api/RFQVendorQuestion/${props?.eventid}/Update`,
                data,
                atoken
              );
              if (res) {
                toast.success("Score Updated Successfully", {
                  toastId: "rvqsuc"
                });
                props.callback()
              }
            }
          }
          else if (props?.eventtype == "VQ") {



            if (updatedvalue) {
              const res = await apiclient.postres(
                `/api/SQE/UpdateSQEHeaderDetail`,
                updatedvalue,
                atoken
              );
              if (res) {
                toast.success("Score Updated Successfully", {
                  toastId: "rvqsuc"
                });
                props.callback()
              }

            }

          }
          else {

          }
        }
        }
        action={props.action}
        questionresponses={props.questionresponses ?? []}
        permissionManager={props.permissionManager}
      />

      {/* overlay component */}
      <Dialog
        open={openComponents.confirmDialog}
        onClose={() => handleCancelChange("confirmDialog")}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Library Change"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to change the library? Doing so will delete all the questions from given library .
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCancelChange("confirmDialog")} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmChange} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <CommonBottomDrawer
        open={openComponents.addQuestionDrawer}
        onClose={() => handleCancelChange("addQuestionDrawer")}
        title="Add Question"
        bodyStyle={{ overflowY: "auto" }}
        actions={<>
          <button type="button" className="pe-btn pe-btn--ghost" onClick={() => handleCancelChange("addQuestionDrawer")}>Cancel</button>
          <button type="reset" form="add-question-form" className="pe-btn pe-btn--secondary">Reset</button>
          <button type="submit" form="add-question-form" className="pe-btn pe-btn--primary">Add</button>
        </>}
      >
        <EventAddQuestionScreen
          questionlist={questionlist}
          eventid={props?.eventid}
          eventtype={props?.eventtype}
          callback={handleAddQuestion}
        />
      </CommonBottomDrawer>

    </div>
  );
});

export default EventQuestionScreen;
