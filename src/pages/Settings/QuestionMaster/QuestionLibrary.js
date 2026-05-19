import {
  Box, Button, Checkbox, Drawer, FormControl, Autocomplete, FormControlLabel, FormGroup, IconButton,
  TextField, Chip, Avatar, Switch,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineLink, HiOutlineTrash, HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { useFormik } from "formik";
import { useRef } from "react";
import { actionTypes, useStateValue } from "../../../store";
import { QuestionFindAll, CategoryFindAll, AddQuestionOption, UpdateQuestion, LibraryFindAll } from "../../../utils/questionlibrary";
import AddUpdateQuestion from "./AddUpdateQuestion";
import { getPurchaseOrg } from "../../../utils/workflow";
import { formatDate, getMenuMaster } from "../../../utils/common/utility";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { format } from "date-fns";
import { downloadFilesOnAzure } from "../../../utils/common";
import { Close } from "@mui/icons-material";
import { BackButton } from "../../../utils/common/component";
import { toast } from "react-toastify";
import useResponsiveColumns from "../../../components/useResponsiveColumns";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";

const QuestionLibarary = () => {
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [questionid, setquestionid] = useState(1);
  const handleChange = (event, value) => {
    setPage(value);
  };

  const [state, setState] = useState({
    right: false,
    viewTicketSidebar: false,
    rightLog: false,
  });
 const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
  const [editRecordData, seteditRecordData] = useState(null);
  const [totalRecords, setTotalRecords] = useState("");
  const [questionunsavedChanges, setquestionunsavedChanges] = useState(false); 
  const [questionModalOpen, setquestionModalOpen] = useState(false); 
  const handlequestionModal = (confirm) => {
    const anchor = 'left';
    if (confirm) {
        setState({ ...state, opensidebar: false }); // Close the sidebar
        setquestionunsavedChanges(false); // Reset unsaved changes flag
        toggleDrawer(anchor, false)(null); 
    }
    setquestionModalOpen(false); // Close the modal
};
  const [pageCount, setPageCount] = useState(1);
  const toggleDrawer = (anchor, open) => (event) => {
    
    // Check for unsaved question changes
    if (questionunsavedChanges) {
        setquestionModalOpen(true);
        return;
    }
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
        return;
    }
    if (open === false) {
        seteditRecordData(null);
    }

    setState({ ...state, [anchor]: open });
};

  const callback = useCallback((pass) => {
  }, []);

  useEffect(() => {
      PullLibraryList();
    pullQuestionList();
    pullMenuMaster();
  }, [page]);


  const handleReflectedData = () => {
    PullLibraryList();
    pullQuestionList();
    pullMenuMaster();
  };
  
  useEffect(() => {
    PullCategoryFindAll();
    Purchaseorg();
  }, []);

  // To Purchase org list
  const [purchaseOrgList, setpurchaseOrgList] = useState([]);
  const Purchaseorg = () => {
    var data = {
      customerId: customerid,
      token: atoken,
      isActive: true,
    };
    getPurchaseOrg(data,atoken).then((res) => {
      if (res && Array.isArray(res)) {
        setpurchaseOrgList(res);
      } else {
        return;
      }
    });
  };

  const [dataticketCreate, setdataticketCreate] = useState([]);
  useEffect(() => {
    if (location?.state?.data?.custdata?.userId > 0) {
      setdataticketCreate(location?.state?.data);
      setState({ ...state, right: true });
    }
  }, [location?.state?.data]);
  const [expandedLibraryId, setExpandedLibraryId] = useState(null); 
      const handleAccordionChange = (libraryId) => {
          setExpandedLibraryId((prev) => (prev === libraryId ? null : libraryId)); // Toggle accordion open/close
        }
    const [libraryList, setlibraryList] = useState([]);

  const PullLibraryList = () => {
      var data = {
          CustomerId: customerid,
          LibraryType:'QuestionLibrary',
          // IsActive:true
      };
      LibraryFindAll(data,atoken).then((res) => {
          
          
          setlibraryList(res);
      });
  };

  const [questionList, setQuestionList] = useState([]);
  const pullQuestionList = (libraryId) => {
    var data = {
      CustomerId: customerid,
      SortingColumn: "Id",
      LibraryId:libraryId
};
    setLoading(true);
    QuestionFindAll(data, atoken).then((res) => {
      setRowLoading((prev) => ({ ...prev, [libraryId]: false }));

      console.log(res);
    // setGridloading(true);
      if (res != "" && res != undefined) {
        setQuestionList(res);
       // setGridloading(false);
        setTotalRecords(res[0]?.totalrecords);
        setPageCount(Math.ceil(res[0]?.totalrecords / 15));
      }
      setLoading(false);
      setGridloading(false);
    });
  };
 const [rowLoading, setRowLoading] = useState({});

  const handleRowToggle = (libraryId) => {
    if (expandedLibraryId === libraryId) {
      setExpandedLibraryId(null);
      setRowLoading((prev) => ({ ...prev, [libraryId]: false }));
    } else {
      setExpandedLibraryId(libraryId);
      setRowLoading((prev) => ({ ...prev, [libraryId]: true }));
      pullQuestionList(libraryId);
    }
  };
  const [eventType, setEventType] = useState("");
  const eventTypeChange = (e, value) => {
    setEventType(value?.id);
  };

  const [catAllList, setCatAllList] = useState([]);
  const PullCategoryFindAll = () => {
    var data = {
     CustomerId: customerid,
      IsActive: "true"
    };
    CategoryFindAll(data, atoken).then((res) => {

      setCatAllList(res);
    });
  };

  const [catId, setCatId] = useState(
    editRecordData?.catId ? `${editRecordData?.catId}` : ""
  );
  const onChangecategory = (e, value) => {
    setCatId(value?.id);
  };

  const callbackstep = useCallback(
    (data) => {
      setState({ ...state, right: false });
      seteditRecordData(null);
      pullQuestionList();
    },
    [page]
  );

 const callbackedit = useCallback((data) => {
console.log('data to edit', data)
seteditRecordData(data);
setState({ ...state, addnewfield: true });
  }, []);
  const handleStatus = (rowValue) => {
    // Check if isActive exists, if not default to false
    let isactive = rowValue?.isActive;  // Safely access isActive
  
    // If isactive is undefined, set to false by default
    if (isactive === undefined) {
      isactive = false;
    }
  
    // Toggle the value of isactive
    isactive = !isactive;
  
    // Update the isActive status on rowValue
    rowValue.isActive = isactive;
  
    // Log the updated row to check if isActive has toggled correctly
    console.log("Updated Row with Toggled isActive:", rowValue);
  
    // Call the Update function to send updated data to backend
    UpdateStageStatus(rowValue, rowValue.id, atoken);
  };
  
  
  
  // UpdateStageStatus function (no changes needed if it's working fine)
  const UpdateStageStatus = (data, id, atoken) => {
    if (id > 0) {
      UpdateQuestion(data, id, atoken).then((res) => {
        pullQuestionList(); // Refresh the question list
      });
    }
  };

const formik = useFormik({
    initialValues: {
      customerid: customerid,
      questioncategoryid: 0,
      questionsubcategoryid: 0,
      applyeventtype: "",
      questiondescription: "",
      isactive: true,
      createdon: "2023-09-25T11:17:41.356Z",
    },
    onSubmit: (values) => {
    QuestionFindAll(values).then((res) => {
          if (res != "") {
          setQuestionList(res);
          setTotalRecords(res[0]?.totalrecords);
          setPageCount(Math.ceil(res[0]?.totalrecords / 15));
        }

        setLoading(false);


      });
    },
  });

  const getMenuItemName = (MenuItemCode) => {
    ;
    const MenuItem = MenuMasterList.find((data) => data?.menuIdentity === MenuItemCode);
    return MenuItem ? MenuItem.menuName : '';
  };

  const [MenuMasterList, setMenuMasterList] = useState([]);
  const pullMenuMaster = () => {
    var data = {
      MenuType: 'Event',
    };

    getMenuMaster(data, atoken).then((res) => {
      // console.log(res);
      setMenuMasterList(res);
    });
  };
const handleResetClick = () => {
    // 
    const inputDate = new Date(); // Replace with your date input
    let formattedDate = formatDate(inputDate);
    formik.resetForm();
    formRef.current.reset();
    pullQuestionList({
      customerid: customerid,

      questioncategoryid: 0,
      questionsubcategoryid: 0,
      applyeventtype: "",
      questiondescription: "",
      isactive: true,
      // token: atoken,
      createdon: "2023-09-25T11:17:41.356Z",
    });
  };

  const [gridloading, setGridloading] = useState(true);
  const [modal1, setModal1] = useState(false);
  const handleCloseModal1 = () => setModal1(false);
  const [inputList, setInputList] = useState([]);
  const openOptionPopup = (itemvalue, open) => {
    
    if (open == false) {
      setInputList([ 
        {
          id: 0,
          customerId: customerid,
          questionId: 0,
          questionOption: "",
          weightage: 0,
        },
      ]);
    }
    
    if (itemvalue?.questionOption != null && itemvalue?.questionOption != "") {
      var arraydata = itemvalue?.questionOption;
      
      setInputList(arraydata);
    }
    else {
      setInputList([{ id: 0, customerId: customerid, questionId: itemvalue?.id, questionOption: "", weightage: 0 },])
    }
    setModal1(true);
    formikcat.setValues({
      questionid: itemvalue?.id,  // Set the questionid
      options: itemvalue?.questionOption || [],  // Set options if available, else an empty array
    });
  };
  const columnWidths = useResponsiveColumns();
const [rowCell, setRowCell] = useState(null);
  const getRowId = (row) => {
    return row.id;
  }
  const onClickDownload = (rows) => {

    if (rows.field === 'attachedFileName') {
      downloadFilesOnAzure(rows.row.attachedFileName, rows.row.attachedFileName)
    }
  }
  const handleRowClick = (params) => {
    console.log("param" + params);
    setRowCell(params.row);
  };

  const handleCellClick = (row) => {
    if (row && row.optionType !== null) { // Ensuring row and optionType exist
      // Call the function to open the popup/modal
      openOptionPopup(row, true);
      setRowCell(row);
    }
  }
 
  //formik for handling option modal of data grid
  const formikcat = useFormik({
    enableReinitialize: true,
    initialValues: { 
      questionid: rowCell?.id,
      options: []

    },
    onSubmit: (values) => {

      console.log("dataques", values);
      AddQuestionOption(values, atoken).then((res) => {
        setLoading(false);
        dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
        dispatch({
          type: actionTypes.SET_MSGALERTDATA,
          value: res?.data?.message,
        });
        dispatch({ type: actionTypes.SET_MSGALERT, value: true });
        setModal1(false);
        pullQuestionList();
        return true;
      });
    },
  });
  const handleInputChange = (e, index) => {
    console.log("page", e);
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);
  };

  const handleAddClick = (value) => {
    console.log("abcccc", inputList);
    setInputList([
      ...inputList,
      { id: 0, questionId: value.id, questionOption: "", deleteFlag: false },
    ]);
    setRowCell(value);
    console.log("yyyyyy", inputList);
  };
const [totalWeightage, settotalWeightage] = useState(0);
  const handleInputWeightageChange = (e, index) => {
    console.log("page", e);

    let totWeightage = totalWeightage;
    const { name, value } = e.target;
    if (value > 0) {
      totWeightage = totWeightage + value;
      console.log("totWeightage", totWeightage);
      if (totWeightage > 100) {

      } else {
        settotalWeightage(value);
      }
    }

    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);
  };
  const onlyNumbers = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  const handleRemoveClick = (index) => {
    const list = [...inputList];
    list.splice(index, 1); // Remove item at the index
    setInputList(list);
    
    // Update rowCell if necessary
    if (list.length > 0) {
      setRowCell((prev) => ({ ...prev, id: list[0]?.questionId })); // Or any other logic to update rowCell
    } else {
      setRowCell({}); // Reset rowCell if no items remain
    }
  };
  const updateOptions = useCallback(() => {
    ;
    formikcat.setFieldValue("customerid", rowCell?.customerid);
    formikcat.setFieldValue("questionid", rowCell?.id);
    formikcat.setFieldValue("options", inputList);
    formikcat.handleSubmit();
  },[rowCell, inputList]);

const getCellClassName = (params) => {
  return params.field === 'optionType' || params.field === 'attachedFileName' ? 'pointer-cursor' : '';
  };
 return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-column min-vh-100">
             
              <div className="flex-grow-1">
                <div className="row m-2">
                  <div className="col-12">
                    <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
                      {/* Header with BackButton, title and Add New button */}
                      <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
                        <div className="d-flex align-items-center">
                          <BackButton title={<span className="page-heading">Question Library</span>} />
                        </div>
                        <Button
                          variant="text"
                          size="large"
                          startIcon={<HiPlusSm />}
                          className="text-capitalize blue-text font-normal"
                          onClick={toggleDrawer("addnewfield", true)}
                        >
                          Add New
                        </Button>
                      </div>
                      
                      
      
      {gridloading ? (
        <GridSkeleton />
      ) : (
        <>
          <div className="table-responsive item-Table" style={{ height: '400px', overflowY: 'auto' }}>
            {libraryList.length === 0 ? (
              <div className="no-terms-message">
                <p>There are no libraries associated with this customer.</p>
              </div>
            ) : (
              
                  <table className="roles-table stripped">
                    
                <thead>
                  <tr>
                  <th className="text-white">Event</th>
                    <th className="text-white">Library</th>
                   
                    <th className="text-white"></th>
                  </tr>
                </thead>
                <tbody>
                  {libraryList?.map((item, index) => {
                    const hasTermsForLibrary = questionList?.some((term) => term.libraryId === item.id);

                    return (
                      <React.Fragment key={index}>
                        <tr className={index % 2 === 0 ? 'even' : 'odd'}>
                           <td className=" productTd" style={{ cursor: "pointer" }}>{item?.eventType}</td>
                          <td className=" productTd" style={{ cursor: "pointer" }}>{item?.libraryEntity}</td>
                         
                          <td className=" productTd" style={{ cursor: "pointer" }}>
                            <IconButton size="small" onClick={() => handleRowToggle(item.id)}>
                              {expandedLibraryId === item.id ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                            </IconButton>
                          </td>
                        </tr>
                        {expandedLibraryId === item?.id && hasTermsForLibrary ? (
                          <tr>
                            <td colSpan={3}>
                              <div style={{ height: '300px', width: '100%' }}>
                                <DataGrid 
                                columnHeaderHeight={35}
                                disableDensitySelector

                                  rows={questionList?.filter((term) => term.libraryId === item.id)}  // Filter records by current libraryId
                                  columns={[
                                    { field: "questionCategory", headerName: "Category", width: 150},
                                    { field: "questionDescription", headerName: "Question", width: 120 },
                                    {
                                      field: "optionType",
                                      headerName: "Option",
                                      width: columnWidths.questionStatus,
                                      renderCell: (params) => {
                                        return params?.formattedValue ? (
                                          <>
                                            <Chip
                                              avatar={<Avatar>{params?.formattedValue}</Avatar>}
                                              size="small"
                                              label="Options"
                                              color="success"
                                              variant="outlined"
                                              onClick={() => handleCellClick(params?.row)}
                                            />
                                          </>
                                        ) : (
                                          <></>
                                        );
                                      }
                                    },
                                    
  {
    field: "attachedFileName",
    headerName: "Attachment",
    width: columnWidths.questionStatus,
    renderCell: (params) => {
      const fileName = params.formattedValue;
      console.log("Formatted Value:", fileName);
  
      return fileName && fileName !== 'undefined' ? (
        <Chip
          icon={<HiOutlineLink />}
          size='small'
          color="primary"
          className='ps-1'
          variant="outlined"
          label="Download"
          onClick={() => onClickDownload(params)} // Trigger download function when clicked
        />
      ) : null;
    }
  },
  

      {
        field: "mandatory",
        headerName: "Mandatory",
        width: columnWidths.questionStatus,
        renderCell: (params) => (
          params.formattedValue ? "Yes" : "No"
        )
      },
             
                         
                                    {
                                      field: "isActive",
                                      headerName: "Status",
                                      width: 150,
                
                                      renderCell: (params) => (
                                        <Switch
                                          checked={params.value}
                                          onChange={() => handleStatus(params.row)}
                                          inputProps={{ 'aria-label': 'controlled' }}
                                        />
                                      ),
                                    },

                                    
                                    {
                                      field: "actions",
                                      headerName: "",
                                      width: 150,
                
                                      renderCell: (params) => (
                                        <IconButton size="small" onClick={() => callbackedit(params.row)}>
                                          <HiPencilAlt className="f17 text-primary" />
                                        </IconButton>
                                      ),
                                    },
                                  ]}
                                  pageSize={5}
                                  rowsPerPageOptions={[5]}
                                  loading={rowLoading[item.id]}
                                  sx={{
                                    '& .MuiDataGrid-columnHeaders': {
                                      backgroundColor: '#E9EAEC !important', // Column header background color
                                      color: '#0c0a0af2', // Text color for headers
                                    },
                                    // '& .MuiDataGrid-columnHeaderTitle': {
                                    //   fontWeight: 'bold', // Optional: Make header titles bold
                                    // },
                                  }}

                                />
                              </div>
                            </td>
                          </tr>
                        ) : (
                          // Show message when expanded but no terms for this library
                          expandedLibraryId === item?.id && !hasTermsForLibrary && (
                            <tr>
                              <td colSpan={3} className="no-terms-message">
                                <p>No terms associated with this library: {item?.libraryEntity}</p>
                              </td>
                            </tr>
                          )
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <React.Fragment key="top">
        <Drawer
          anchor="right"
          open={state["addnewfield"]}
          onClose={toggleDrawer("addnewfield", false)}
        >
          <Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
            <div className="flex flex-col">
              <Box className="bgheaderCards">
                <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                  <div className="ms-3 text-white">Question Master</div>
                  <div>
                    <IconButton
                      onClick={toggleDrawer("addnewfield", false)}
                      size="small"
                      edge="start"
                      sx={{ mr: 1 }}
                    >
                      <HiOutlineX className="f20 text-white" />
                    </IconButton>
                  </div>
                </div>
              </Box>
              <div className="h50px"></div>
              <Box sx={{ flexGrow: 1, p: 2 }}>
                <AddUpdateQuestion
                  callbackstep={callbackstep}
                  PullCategoryFindAll={PullCategoryFindAll}
                  purchaseOrgList={purchaseOrgList}
                  catList={catAllList}
                  editRecordData={editRecordData}
                  pullQuestionList={pullQuestionList}
                  setquestionunsavedChanges={setquestionunsavedChanges}
                  handleReflectedData={handleReflectedData}
                />
              </Box>
            </div>
          </Box>
        </Drawer>
        <Dialog open={questionModalOpen} onClose={() => handlequestionModal(false)}>
                <DialogTitle>{"Are you sure?"}</DialogTitle>
                <DialogContent style={{ minWidth: "300px" }}>
                    <DialogContentText>
                        Do you want to close? Unsaved changes will be lost.
                    </DialogContentText>
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handlequestionModal(false)}>No</Button>
                    <Button onClick={() => handlequestionModal(true)} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
      </React.Fragment>
      <Modal
        size="md"
        show={modal1}
        backdrop="static"
        keyboard={false}
        centered
            style={{borderRadius:"5px"}}
        contentClassName="border-0 "
        onHide={() => handleCloseModal1()}
      >
        <Modal.Header className="bgheaderCards p-2">
          <Modal.Title id="modal-heading">
                        <div className="d-flex align-items-center text-white">ADD OPTIONS</div>
          </Modal.Title>
          <IconButton

            onClick={() => handleCloseModal1()}
            size="small"
            edge="start"
            color="white"
          >
            <Close className='text-white' />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-2">
            <div className="row">
              <div className="col-12 col-lg-12 mt-2 ">
                <form onSubmit={formikcat.handleSubmit} autoComplete="off">
                  {inputList?.map((x, i) => {
                    return (
                      <div
                        className="option"
                        key={i}
                      >
                        <div className="row justify-content-between align-items-center w-100 mb-2 ms-0 p-2">
                          <div className="col-md-1">
                            {i + 1}
                          </div>
                          <div className="col-md-5 ">
                            <TextField
                              variant="outlined"
                              className="w-100"
                              required
                              id={x.questionOption}
                              label="Option Value"
                              value={x.questionOption}
                              size="small"
                              name="questionOption"
                              placeholder="Option Value"
                              onChange={(e) => handleInputChange(e, i)}
                              inputProps={{
                                style:{padding:"4.5px 14px"}
                              }}
                            />
                          </div>
                          <div className="col-md-5">
                            <TextField
                              variant="outlined"
                              className="w-50"
                              required
                              id={x.weightage}
                              name="weightage"
                              label="Score"
                              value={x.weightage}
                              maxLength={3}
                              size="small"
                              placeholder="Option Weightage"
                              onChange={(e) => handleInputWeightageChange(e, i)}
                              onInput={(e) => onlyNumbers(e)}
                              inputProps={{
                                style:{padding:"4.5px 14px"}
                              }}
                            />
                          </div>
                   <div className="col-md-1">
                            <div className="d-flex justify-content-end align-items-end">
                              <Button
                                color="error"
                                size="small"
                                className="ms-2"
                                onClick={() => handleRemoveClick(i)}
                              >
                                <HiOutlineX className="f16 text-danger" />
                              </Button>
                            </div>
                          </div>
                        </div>
 <div className="row justify-content-end">
                          {inputList?.length ? (
                            <>
                              {inputList.length - 1 === i && (
                                <div className="col-lg-4 mt-3 text-end">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    style={{ fontSize: '0.75rem' }} 
                                    className=""
                                    onClick={() => handleAddClick(rowCell)}
                                  >
                                    + Add More
                                  </Button>
                                </div>
                              )}
                            </>
                          ) : null}
                        </div>
 </div>
                    );
                  })}
                </form>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="error"
            variant="text"
            onClick={() => handleCloseModal1()}
            className="me-3"
            size="small"
            style={{ fontSize: '0.75rem' }}
          >
            Cancel
          </Button>
          {!loading ? (
            <Button
              color="success"
              variant="outlined"
              className=""
              size="small"
              style={{ fontSize: '0.75rem' }}
              onClick={() => updateOptions(rowCell)}
            >
              Save
            </Button>
          ) : (
            <LoadingButton className="" loading variant="outlined">
              save
            </LoadingButton>
          )}
        </Modal.Footer>
      </Modal>

    </>
  );
};

 export default QuestionLibarary;
