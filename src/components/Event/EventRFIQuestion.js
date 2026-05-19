import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { HiPlusSm, HiOutlineDotsHorizontal, HiOutlineX } from "react-icons/hi";
import {
  Autocomplete,
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
  Drawer,
} from "@mui/material";
import "react-quill/dist/quill.snow.css";
import { useStateValue } from "../../store";
import { api, ApiClient } from "../../Apiclient";
import { buildQueryParams } from "../../utils/purchaseRequest";
import { toast } from "react-toastify";
import { RFQQuestionsModal, RFQQuestionsModalOBJ, RFQSupplierQuestionsModal, SQEQuestionsModal } from "../../utils/modal";
import { findObjByValueFromArray, SQEAddModal } from "../../utils/common";
import EventQuestionScreenList from "./EventQuestionScreenList";
import EventAddQuestionScreen from "./EventAddQuestionScreen";
import AddUpdateQuestion from "../../pages/Settings/QuestionMaster/AddUpdateQuestion";
import { CategoryFindAll } from "../../utils/questionlibrary";
import EventRFIQuestionList from "./EventRFIQuestionList";

const EventRFIQuestion = forwardRef(({ props }, EventQuestionScreenRef) => {
  
  const [{ atoken, rtoken, customerid,customersuffix, usertimezone, userdialingcode, roleClaims, userDetail }, dispatch] = useStateValue();
  const apiclient = new ApiClient(customersuffix);
  const [Librarylist, setLibrarylist] = useState(null);
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [questionlist,setQuestionList]= useState(null);
  const [openComponents, setOpenComponents] = useState({
    confirmDialog: false,
    addQuestionDrawer:false
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempSelectedLibrary, setTempSelectedLibrary] = useState(null); // Temporary state for new selection

  useEffect(() => {
    getLibraryList();
   
  }, []);

  useEffect(()=>{
    //to set library and question once Librarylist is fetched
    if(props.eventid && Librarylist && Librarylist?.length>0) getQuestionList();
  },[Librarylist])

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
      const result = res?.data?.result?.filter(x=>x.libraryType==props.librarytype);
      setLibrarylist(result);
    }
  };

  const getQuestionList=async ()=>{
    
    if(props.eventtype=="RFI"){
      const params = {
       // CustomerId: customerid,
        RFQId: props.eventid
      };
      const queryParams = buildQueryParams(params); 
      const res = await apiclient.getres(`/api/RFQQuestionLib/Find?${queryParams}`, atoken);
      if(res){       
        const data= res?.data?.result;      
        

        const eventquestion= (questionlist??[])?.filter(x=>!x.libraryId) 
        setQuestionList([...eventquestion ,...data])
        const selectedLibrary=findObjByValueFromArray(Librarylist,data[0]?.libraryId,'id');
        if(selectedLibrary){
          
          setSelectedLibrary(selectedLibrary)
        }
        
      }

    }
     

    if(props.eventtype=="VQ"){
      
      const params = {
        Id: props.eventid
      };
      const queryParams = buildQueryParams(params); 
      const res = await apiclient.getres(`/api/SQE/Find?${queryParams}`, atoken);
      if(res){  
             
        const data= res?.data?.result[0]?.sqeHeaderDetails; 
        const eventquestion= (questionlist??[])?.filter(x=>!x.libraryId) 
        const selectedLibrary=findObjByValueFromArray(Librarylist,data[0]?.libraryId,'id');
        setQuestionList([...eventquestion ,...data])
        if(props.eventtype=="VQ"){
          props.CallbackSelectedQuestionList([...eventquestion ,...data])
        }        
        if(selectedLibrary){          
          setSelectedLibrary(selectedLibrary)
        }
        
      }

    }

    
    
  }

  const updateEventQuestionList=async (id)=>{
    
    //get Questions from Question Master
    if(!id){
        return;
    }
    const params = {
        CustomerId: customerid,
        LibraryId:id,
        EventType: props.eventtype,
        IsActive: true
      };
    const queryParams = buildQueryParams(params);
    const res= await apiclient.getres(`/api/QuestionsLib/Find?${queryParams}`, atoken);
    if(res){
      
        const questionlibresult=res?.data?.result; //pe.questionmaster table
        if(questionlibresult==0){
            toast.info(`No Questions Found. Please Select Another Library `,{
                toastid:"noquestionerror"
            })
            setSelectedLibrary(null)

            return false
        }
        let data=[];
        
        if(props.eventtype=="RFI"){
          
          data = RFQQuestionsModal(questionlibresult,props.eventid)
        }
        else if(props.eventtype=="VQ"){
          data = SQEQuestionsModal(questionlibresult,props.eventid) //to map question master modal with SQ Modal.
        }
         
        const eventquestion= (questionlist??[])?.filter(x=>!x.libraryId) 
        setQuestionList([...eventquestion ,...data])

        if(props.eventtype=="VQ"){
          props.CallbackSelectedQuestionList([...eventquestion ,...data])
        }
        

    }
    

  }

  //in order to handle event from parent component
  useImperativeHandle(EventQuestionScreenRef, () => ({
          saveEventQuestion: async () => {
            if( props.eventtype=="RFI"){  
                            
              questionlist?.forEach(x=>{
                x.id=0
                x.questionOption?.forEach(v=>{
                  v.id=0
                })
                x.Version=props?.Version
              })    
              const res =await apiclient.postres(`/api/RFQQuestionLib/${props.eventid}/Add`,questionlist,atoken);
              if(res){   
               
                toast.success("Questions Saved Successfully",{
                  toastId:"QS"
                })             
                return true
              }
              else{
                return false
              }
           }
          }
      }));

  const handleClickAnchor = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAnchor = () => {
    setAnchorEl(null);
  };

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
    if( props.eventtype=="VQ"){   
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

  const handleAddQuestion=(values)=>{
    if(props?.eventtype=="RFI"){
      
       const newQ= RFQQuestionsModalOBJ(values,props?.eventid);
       setQuestionList([...questionlist,newQ])
       return true;
    }

  }
  
  
  
  
  return (
    <div className="p-3 pt-0 ps-0">
      <div className="d-flex justify-content-between align-items-center">
        <div className="flex-grow-1">
          <div className="row mt-2">
            <div className="col-12 col-md-8 col-lg-8 pe-0">
           { props.action && <Autocomplete
                disablePortal
                id="combo-box-demo"
                size="small"
                options={Librarylist ?? []}
                className="w-100"
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    label="Add Questions From Library"
                  />
                )}
                value={selectedLibrary}
                getOptionLabel={(option) => option.libraryEntity ?? ""}
                onChange={handleLibraryChange}
                //disabled={!props.action}
              />}
            </div>
          </div>
        </div>

        <div className="text-end">
         {props.action && <Button
            variant="text"
            size="small"
            startIcon={<HiPlusSm />}
            className="text-capitalize font-normal me-3"
            onClick={()=> setOpenComponents(prev => ({ ...prev, addQuestionDrawer: true }))}
          >
            Add More
          </Button>}

          {props.action && <div className="d-inline-block">
            <IconButton
              aria-label="more"
              id="dropdown-custom-components"
              aria-controls="long-menu"
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
              onClick={handleClickAnchor}
              size="medium"
              className="shadow-sm"
            >
              <MoreVertIcon className="f17" />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleCloseAnchor}
              className="ddl-menu"
            >
              <MenuItem className="f14" onClick={handleCloseAnchor}>
                Excel Upload
              </MenuItem>
              <Divider />
              <MenuItem className="f14" onClick={handleCloseAnchor}>
                Excel Template
              </MenuItem>
            </Menu>
          </div>}
        </div>
      </div>
      
      {/* Questions List */}
      <div className="mt-2 item-Table">  
      <EventRFIQuestionList
       questions={questionlist}
       callbackDeleteQuesFromList={callbackDeleteQuesFromList}
       callbackEditQuesFromList={async (updatedvalue)=>{
        
        if(props?.eventtype=="RFI"){
          const data =RFQSupplierQuestionsModal(updatedvalue,props?.eventid)
          if(data){
            const res =await apiclient.postres(
              `/api/RFQVendorQuestion/${props?.eventid}/Update`,
              data,
              atoken
            );
            if (res) {
                toast.success("Score Updated Successfully",{
                  toastId:"rvqsuc"
                });
                props.callback()
            }
          }
        }
        
       }}
       action ={props.action}
       questionresponses={props.questionresponses ?? []}
       />
      </div>
    {/* overlay component */}
      <Dialog
        open={openComponents.confirmDialog}
        onClose={()=>handleCancelChange("confirmDialog")}
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
          <Button onClick={()=>handleCancelChange("confirmDialog")} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmChange} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      {/*add question component*/}
      <React.Fragment key="top">
        <Drawer
          anchor="right"
          open={openComponents.addQuestionDrawer}
          onClose={()=>handleCancelChange("addQuestionDrawer")}
        >
          <Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
            <div className="flex flex-col">
              <Box className="bgheaderCards">
                <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                  <div className="ms-3 text-white">Add Question</div>
                  <div>
                 <IconButton
                      onClick={()=>handleCancelChange("addQuestionDrawer")}
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
                      <EventAddQuestionScreen 
                      questionlist={questionlist}
                      eventid={props?.eventid}
                      eventtype={props?.eventtype}
                      callback={handleAddQuestion}
                      />
              </Box>
            </div>
          </Box>
        </Drawer>
        
      </React.Fragment>

    </div>
  );
});

export default EventRFIQuestion;