import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Autocomplete,
	Button,
	Chip,
	Drawer,
	Grid,
	IconButton,
	InputAdornment,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { CategorySqeMasterModal, getPayloadWithStage, SQEAddModal } from "../utils/common";
import { useFormik } from "formik";
import { buildQueryParams } from "../utils/purchaseRequest";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiClient } from "../Apiclient";
import { useCookies } from "react-cookie";
import * as yup from "yup";
import { useStateValue } from "../store";
import TextFieldCell from "../pages/BaseCells/TextFieldCell";
import EventQuestionCell from "../pages/BaseCells/EventQuestionCell";
import { HiOutlineX } from "react-icons/hi";
import AddQuestionFormCell from "../pages/Configuration/RequestForQuotation/AddQuestionFormCell";
import { StageFindAll } from "../utils/stagemaster";
import EventQuestionScreen from "./Event/EventQuestionScreen";

const SQInvitationAll = ({sqinvitedSuppliers,toggleDrawer}) => {
    const [searchParams, setSearchParams] = useSearchParams();
	//#apiinterceptor to handle token expiry
	const [
		{
			atoken,
			rtoken,
			customerid,
			usertimezone,
			userdialingcode,
			roleClaims,
			userDetail,
			customersuffix
		},
		dispatch,
	] = useStateValue();
	const navigate = useNavigate();
	const apiclient = new ApiClient(customersuffix);
	const formikPrimaryContactRef = useRef();
	const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
	const location = useLocation();
	

	const { hash, pathname, search } = location;
    
    //vq started here
	const [currentVQStage, setCurrentVQStage] = useState(`Draft`);
	const [vqStagelist, setVQStageList] = useState(null);
	const [selectedVendors, setSelectedVendors] = useState([]); // State to store selected items
	const [dataSQE, setDataSQE] = useState([]); // State to store data
	const [expanded, setExpanded] = useState(false);
	const [subcategoryexpanded, setSubcategoryExpand] = useState(false);
    const [category_list, setCategoryList] = useState([]);
    const [CategoryModal, setCategoryModal] = useState(false);
    const handleOpenCateogyModal = () => {
		setCategoryModal(true);
	};
    //usestate for vq
    const [vqSubject, setvqSubject] = useState("");
    const [vqDescription, setvqDescription] = useState("");
    const [vqEndDate, setvqEndDate] = useState(null);
    const [sqe, setSqe] = useState("");
    const [sqeHeaderId, setSqeHeaderId] = useState("");
    const [isCustomPeriod, setIsCustomPeriod] = useState(false);
    const [selectedQuesionArray, setSelectedQuesionArray] = useState([]);
	const [allDataList, setAllDataList] = useState([]);
    const [isCallbackTriggered, setIsCallbackTriggered] = useState(false);
    const [state, setState] = useState({
		
		qusDrawer: false,
	});
  //useeffect

  useEffect(() => {
	
    PullLibraryAll();
    StageFindAll(
        {
            EventType: "VQ",
            CustomerId: customerid,
        },
        atoken
    ).then((res) => {
        setVQStageList(res);
    });

}, []);
    
    const saveUpdatedData = useCallback(async (dataSQE) => {
        try {
       
     const res = await apiclient.postres(`/api/SQE/Update`, dataSQE.sqeHeader[0], atoken);
     console.log('Updated data:', res);
   } catch (error) {
     console.error('Error updating data:', error);
     toast.error(`Error updating data: ${error.message}`);
   }
 }, [dataSQE, atoken]);
    	
    const handleQuestionUpdate = useCallback((sqeHeaderDetails) => {
		
        const updateddata =dataSQE
        if (updateddata.sqeHeader[0]) {
          updateddata.sqeHeader[0].sqeHeaderDetails = sqeHeaderDetails;
        }
        
        setDataSQE(updateddata);
        saveUpdatedData(updateddata);
         }, [dataSQE, saveUpdatedData]);

         const toggleDrawerCallback = useCallback((anchor, open) => {
            setState({ ...state, [anchor]: open });
        }, []);
       
	const callbackQuesAddCustom = useCallback(	
		(quesData,questionforedit) => {
			
			if(!questionforedit){
				setSelectedQuesionArray((prev) => [...prev, quesData]);
				setState({ ...state, qusDrawer: false });
			}
			else{
				
				const obj =selectedQuesionArray.map((x)=>{
					
					if(x.id==questionforedit.id){
						return quesData
					}
					else return x
				});
				
                setSelectedQuesionArray(obj)
                setState({ ...state, qusDrawer: false });
				//setQuestionForEdit(null)
			}
			
		},
		[selectedQuesionArray]
	);
    

    const VQInitialValues_tab3 = {
		vqSubject: '',
		vqDescription: '',
		vqEndDate: null,
	};
    const validationSchema_tab3 = yup.object({
		vqSubject: yup.string().required("please enter vq subject"),
		vqDescription: yup.string().required("Please enter vq description"),
		vqEndDate: yup.string().required("Please enter vq end date"),
	});

    const formik_SQE= useFormik({
		enableReinitialize: true,
		initialValues: VQInitialValues_tab3,
		validationSchema: validationSchema_tab3,
		onSubmit: (values) => {
			saveSQQuestionForSupplier(values)
		},
	});
    //LIBRARY LIST
	const [AllLibraryList, setLibraryList] = useState([]);
	const [chooseLibList, setChooseLibList] = useState(null);
	const PullLibraryAll = async () => {
		var data = {
			CustomerId: customerid,
			LibraryType: "QuestionLibrary",
			IsActive: true,
		};
		// LibraryFindAll(data, atoken).then((res) => {

		// 	setLibraryList(res);
		// });
		const queryParams = buildQueryParams(data);
		const res = await apiclient.getres(
			`/api/LibraryOrgEntity/Find?${queryParams}`,
			atoken
		);

		if (res) {
			console.log(res?.data?.result);
			setLibraryList(res?.data?.result);
		}
	};


    const handleDateChange = (newValue) => {
		const currentDate = new Date();
		// Set time to 00:00:00 for comparison
		currentDate.setHours(0, 0, 0, 0);
	
		if (newValue < currentDate) {
			toast.error(`The end date must be today or in the future.`);
			return; // Early return if the date is invalid
		}
	
		formik_SQE.setFieldValue("vqEndDate", newValue);
	};
    
  const handleFrequencyChange = (event) => {
    const value = event.target.value;
    formik_SQE.setFieldValue('frequency', value);
    setIsCustomPeriod(value === 0); // Show custom input when "Custom Period" is selected
  };

  const handleCustomFrequencyChange = (event) => {
    const customValue = event.target.value;
    formik_SQE.setFieldValue('frequency', customValue); // Save custom frequency in the same field
  };
  const filteredOptions = category_list.filter(option =>
  {

  }
    // selectedCategoryNames.includes(option.categoryName)
);
	
    const handleLibraryChange = (value) => {
		console.log("ChooseLibList", value);
		setChooseLibList(value);
		//setVQCategoryList([]);
	};
    const handleChangeItemCategory = (event, newValue) => {
		
		// Check if 'Add New' option is selected
		if (newValue.some((option) => option.id === "new")) {
			handleOpenCateogyModal(true); // Call function to open modal
		}
		formik_SQE.setFieldValue("sqeServiceCategory", newValue);
		//setCategory(newValue);
	};
    const saveSQQuestionForSupplier = async (values) => {
		
		var statusresponse = 0;
	         
			const sqeHeaderDetails = SQEAddModal(0, selectedQuesionArray);
			console.log("selectedQuesionArray", selectedQuesionArray);
			if (selectedQuesionArray.length > 0) {
				const data = {
					id: 0,
					vqSubject: values?.vqSubject,
					vqDescription: values?.vqDescription,
					vqEndDate: values?.vqEndDate,
					frequency: values?.frequency,
					customerId: customerid,
					
					sqeHeaderDetails: sqeHeaderDetails,
					//sqeServiceCategory: CategorySqeMasterModal(formik_SQE.values?.sqeServiceCategory?.filter(x=>x.createdById)),
					 sqeServiceCategory:[],
                    inviteVendors:sqinvitedSuppliers.map((x)=>{
                          return (
                            {
                              "vendorId": x.id
                            }
                          )
                    }
                        
                       )

				};
			

				let Data = getPayloadWithStage(
					"currentStage",
					currentVQStage,
					vqStagelist,
					data,
					"currentStage"
				);
				try {
					const res = await apiclient.postres(`/api/SQE/VendorInvite`, Data, atoken);
					statusresponse = res.status;
					

					if (res) {
						
						toast.success(`Supplier qualification has been successfully initiated.`)
                        toggleDrawer("opensqinvitation", false)()
					}
				} catch (error) {
					console.error("Error saving data:", error);
					toast.error(`Error saving data: ${error.message}`);
				}
			} else {
				toast.error(`Please select library to save the data.`);
			}
		
		
	};

 	
         const handleSelectedQArray = (value) => {
            setSelectedQuesionArray(value);
        };

 const handleSubmit=()=>{
	
     formik_SQE.submitForm()
	
 }   

 
const [libraryId,setLibraryId] =useState()
	
const updateEventLibraryId = (v) => {
  
  const {id} =v
  setLibraryId(id)
}

	//to set question for edit
    const [questionforedit,setQuestionForEdit]=useState(null);
	const handleSelectedEditQuestion=(question)=>{
		
		setQuestionForEdit(question)
		setState({...state,qusDrawer:true})
	}

  return(<>
   	<div className="container-fluid">
				<div className="row">
						<div className="col-12  col-md-12 col-lg-12 p-0">
						<div className="d-md-flex  justify-content-between align-items-center bg-white p-2 border-bottom">
								
                                <div className="f18 fw500" style={{color:"#1976ce"}}>SQ Invitation</div>
							
							 
									<div>
										<div className="action-wrap">
                                        <Button type="button" className="p-2 pt-1 pb-1 me-2" variant="contained" 
												onClick={handleSubmit}
                                                >
                                                            <span className="text-capitalize" >
                                                               Submit
                                                            </span>
                                                        </Button>

                                                        <IconButton
												onClick={toggleDrawer("opensqinvitation", false)}
												size="small"
												edge="start"
												sx={{ mr: 1 }}
											>
												<HiOutlineX className="f20 LinkBlue" />
											</IconButton>
										
										</div>
									</div>
								
								
							</div>
						</div>
					</div>
				</div>
   <Grid container className=" pb-3 mt-1" spacing={1}>
      {sqinvitedSuppliers && sqinvitedSuppliers.map((vendor) => (
        <Grid item key={vendor.id} >
          <Chip
            label={`${vendor.companyName} - ${vendor.vendorCode}`}
            variant="outlined"
            color="primary"
          />
        </Grid>
      ))}
    </Grid>
    <div className="d-flex flex-column vh-100">
<div className="mx-2">
<form onSubmit={formik_SQE.handleSubmit}>

<div className="row">



<div className="col-12 col-md-8 mb-4">
<TextFieldCell
id="vqSubject"
name="vqSubject"
label="Subject *"
placeholder=""
inputProps={{ maxLength: 100 }}
InputProps={{
readOnly: currentVQStage == "Under Approval" || currentVQStage == "Qualified",
title:(currentVQStage == "Under Approval" || currentVQStage == "Qualified") && "This field is not editable",
endAdornment: (
<InputAdornment position="end">
<Typography
variant="body2"
color="textSecondary"
>
{vqSubject?.length}/100
</Typography>
</InputAdornment>
),
}}
value={formik_SQE?.values?.vqSubject}
onChange={(e) => {
formik_SQE.setFieldValue("vqSubject", e.target.value);
}}
error={
formik_SQE?.touched?.vqSubject &&
Boolean(formik_SQE.errors?.vqSubject)
}
helperText={
formik_SQE.touched?.vqSubject &&
formik_SQE.errors?.vqSubject
}

/>
</div>
<div className="col-12 col-md-4 col-lg-4 mb-4">
<LocalizationProvider dateAdapter={AdapterDateFns}>
<MobileDateTimePicker
//disabled={!formik.values.sealedBid}
variant="outlined"
label="End Date *"
size="small"
name="vqEndDate"
id="vqEndDate"
value={formik_SQE?.values?.vqEndDate ?? null}
className="w-100 f14"
slotProps={{
textField: {
variant: "outlined",
size: "small",
InputLabelProps: { shrink: true },
error:
formik_SQE.touched.vqEndDate &&
Boolean(formik_SQE.errors.vqEndDate),
helperText:
formik_SQE.touched.vqEndDate &&
formik_SQE.errors.vqEndDate,
InputProps:{


title: "This field is not editable",
}

},
actionBar: {
actions: ["clear", "cancel", "accept"],
},
}}
// onChange={(newValue) => {
// 	formik_SQE.setFieldValue("vqEndDate", newValue);
// 	}}
onChange={handleDateChange}
disabled={currentVQStage == "Under Approval" || currentVQStage == "Qualified"}

/>
</LocalizationProvider>
</div>
</div>
<div className="row mb-4">


<div className="col-12 col-md-6 col-lg-6">
<TextField
id="frequency"
name="frequency"
select
className="w-100 f14"
size="small"
label="Frequency"
variant="outlined"
value={formik_SQE?.values?.frequency || ''}
onChange={handleFrequencyChange}
>
<MenuItem value={30}>Monthly</MenuItem>
<MenuItem value={90}>Quarterly</MenuItem>
<MenuItem value={120}>Half-yearly</MenuItem>
<MenuItem value={0}>Custom Period</MenuItem>
</TextField>
</div>

{isCustomPeriod && (
<div className="col-12 col-md-6 col-lg-6 ">
<TextField
id="customFrequency"
name="customFrequency"
type="number"
className="w-100 f14"
size="small"
label="Custom Frequency (days)"
variant="outlined"
value={formik_SQE?.values?.frequency || ''}
onChange={handleCustomFrequencyChange}
/>
</div>
)}							</div>
<div className="col-12  mb-3">
<TextFieldCell
id="vqDescription"
name="vqDescription"
label="Description *"
placeholder=""
inputProps={{ maxLength: 100 }}
InputProps={{
readOnly: currentVQStage == "Under Approval" || currentVQStage == "Qualified",
title: "This field is not editable",
endAdornment: formik_SQE?.values?.vqDescription && (
<InputAdornment position="end">
<Typography variant="body2" color="textSecondary">
{formik_SQE?.values?.vqDescription?.length}/1000
</Typography>
</InputAdornment>
),
classes: {
input: "p-4",
},
}}
value={formik_SQE?.values?.vqDescription}
onChange={(e) => {
formik_SQE.setFieldValue("vqDescription", e.target.value);
}}
error={
formik_SQE.touched.vqDescription &&
Boolean(formik_SQE.errors.vqDescription)
}
helperText={
formik_SQE.touched.vqDescription &&
formik_SQE.errors.vqDescription
}
readOnly={currentVQStage == "Under Approval" || currentVQStage == "Qualified"}
/>
</div>
{/* event question box */}
{currentVQStage == "Draft"  &&  <EventQuestionCell
eventtype= "VQ"
action={!isCallbackTriggered}
selectedQuesionArray={selectedQuesionArray}
handleSelectedQArray={handleSelectedQArray}
handleSelectedEditQuestion={handleSelectedEditQuestion}
questionLibraryDll={AllLibraryList}
toggleDrawer={toggleDrawerCallback}
selectedQuesDll={chooseLibList}
setSelectedQuesDll={handleLibraryChange}
updateEventLibraryId={updateEventLibraryId}
/>}





</form>

</div>
</div>


{/* for hhandling vq questions */}
<React.Fragment key="qusDrawertr">
				<Drawer anchor="right" open={state["qusDrawer"]}>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Add Question</div>
									<div>
										<IconButton
											onClick={()=>setState("qusDrawer", false)}
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
							<Box sx={{ flexGrow: 1, p: 2, mt: 2 }}>
								<AddQuestionFormCell
									idFromURL={sqe}
									callbackQuesAddCustom={callbackQuesAddCustom}
									libraryId={libraryId}
									questionforedit={questionforedit}
								/>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>

</>)
}

export default SQInvitationAll