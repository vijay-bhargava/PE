import React, { useEffect, useRef, useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import TextFieldCell from '../../BaseCells/TextFieldCell'
import { LoadingButton } from '@mui/lab'
import { useStateValue } from '../../../store';
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, InputAdornment, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { Form } from 'react-bootstrap';
import { HiOutlineX } from 'react-icons/hi';
import { Modal } from "react-bootstrap";
import { CategoryFindAll, SubCategoryFindAll } from '../../../utils/questionlibrary';
import AddQuestionCategory from '../../Settings/QuestionMaster/AddQuestionCategory';
import AddQuestionSubCategory from '../../Settings/QuestionMaster/AddQuestionSubCategory';
import { toast } from 'react-toastify';
import { downloadFilesOnAzure, getExtension, getFileName, uploadFilesOnAzure, validateFileSize } from '../../../utils/common';

const AddNFAQuestionFormCell = ({ idFromURL,callbackQuesAddCustom,libraryId,questionforedit}) => {
    const [{ atoken, rtoken, customerid, userDetail }, dispatch] = useStateValue();
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [modal, setModal] = useState(false);
    const [catAllList, setCatAllList] = useState([]);
    const [subCatList, setSubCatlist] = useState([]);
    const [weightage, setweightage] = useState(0);


    useEffect(()=>{
        
        if(questionforedit){
            
             formik.setFieldValue("nfaQestion",questionforedit?.questionDescription)
             formik.setFieldValue("nfaQuestionRequirement",questionforedit?.nfaQuestionRequirement)
             formik.setFieldValue("mandatory",questionforedit?.mandatory)
             formik.setFieldValue("attachement",questionforedit?.attachement)
             setweightage(questionforedit?.weightage)
             setCatId(questionforedit?.questioncategoryId)
             SetquestionCategory(questionforedit?.questionCategory)
             
           if(questionforedit?.questioncategoryId){
             PullSubCategoryFindAll(questionforedit?.questioncategoryId,true)
           } 
             
        }
    },[]) 
    useEffect(() => {
        PullCategoryFindAll();
      }, [libraryId]);
    const PullCategoryFindAll = () => {
        
      var data = {
       CustomerId: customerid,
        IsActive: "true",
        LibraryId:libraryId
      };
      CategoryFindAll(data, atoken).then((res) => {
        setCatAllList(res);
      });
    };
    const openAddCategoryModal = () => {
        setModal(true);
    };

    const closeModal = () => {
        setModal(false);
    };
    const [subCatId, setSubCatId] = useState(0);
    const [catId, setCatId] = useState(0);
    const CloseModal = () => setModal(false);
    const CloseSubModal = () => setSubModal(false);
    const [displayAttachedName, setdisplayAttachedName] = useState("");
    const [attachedFileName, setattachedFileName] = useState("");
    const fileInputRef = useRef(null);
    const [fileList, setFileList] = React.useState([]);
    
    const [attachement, setattachement] = useState(false);
    const PullSubCategoryFindAll = (valueId,edit) => {
        var data = {
            CustomerId: customerid,
            questioncategoryid: valueId,
            IsActive: "true",
            
        };
        console.log("sub post", data);
        SubCategoryFindAll(data, atoken).then((res) => {
            console.log("subcat", res);
            setSubCatlist(res);
            if(edit){
                setSubCatId(questionforedit?.questionSubcategoryId)
                SetquestionSubCategory(questionforedit?.questionSubCategory)
            }
        });
    };
    const [postFileName, setPostFileName] = React.useState("");
    const [filepath, setfilepath] = useState("");
    const [questionCategory, SetquestionCategory] = useState("");
    const [questionSubCategory, SetquestionSubCategory] = useState("");
    const validationSchema = yup.object().shape({
        nfaQestion: yup
            .string('Enter Question')
            .required('Question Title is required'),
            weightage: yup
            .number()
        .nullable() // Allow weightage to be null (optional)
        .min(0, 'Weightage must be at least 1')
        .max(100, 'Weightage must be at most 100')
        .notRequired(),
    });
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            nfaQestion: '',
            nfaQuestionRequirement: '',
            mandatory: false,
            attachement:false,
            weightage: weightage || null,
        },
        validationSchema: validationSchema,
        onSubmit:async (values, { resetForm }) => {
            
            let filepath;
            if(attachedFileName){
                let Data = {
                    EventType: `RFQQuestion`,
                    EventId: idFromURL,
                    CustomerId: customerid
                };
    
                const res = await uploadFilesOnAzure(Data,attachedFileName,atoken)
                 filepath =res?.data?.result?.blobName

            }
            
            let data ;
            if(questionforedit){
                 data = {
                    id:questionforedit.id,
                    nfaId:idFromURL,
                    questionId: questionforedit?.questionId ?? 0,
                    questionDescription:values?.nfaQestion,
                    attachement:values?.attachement,
                    attachedFileName:filepath ?? (questionforedit ? questionforedit?.attachedFileName: ''),
                    optionType:false,
                    mandatory: values?.mandatory,
                    weightage:weightage,
                    questionOption:values?.questionOption ??"",
                    questionRequirement: values?.nfaQuestionRequirement,
                    libraryId:questionforedit? questionforedit.libraryId: 0,
                    questioncategoryId:catId??0,
                    questionCategory:questionCategory??"",
                    questionSubCategory:questionSubCategory??"",
                    questionSubcategoryId:subCatId ?? 0		
                };

            }
            else{
                data = {
                    id: 0,
                    nfaId:idFromURL,
                    questionId:0,
                    questionDescription:values?.nfaQestion,
                    attachement:values?.attachement,
                    attachedFileName:filepath,
                    optionType:false,
                    mandatory: values?.mandatory,
                    weightage:weightage,
                    questionOption:values?.questionOption ??"",
                    questionRequirement: values?.nfaQuestionRequirement,
                    nfaQuestionRequirement: values?.nfaQuestionRequirement,
                    libraryId:libraryId ?? 0,
                    questioncategoryId:catId??0,
                    questionCategory:questionCategory??"",
                    questionSubCategory:questionSubCategory??"",
                    questionSubcategoryId:subCatId ?? 0		
                };
            }
            
          
            
            callbackQuesAddCustom(data,questionforedit)
        }
    });
    const [subModal, setSubModal] = useState(false);
    const openAddSubCategoryModal = () => {
        setSubModal(true);
    };
    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
      
        
        if (selectedValue === "new") {  
          openAddCategoryModal();  
        } else {
         
          setCatId(selectedValue);  
      
       
          const selectedCategory = catAllList.find((cat) => cat.id === selectedValue);
          
          SetquestionCategory(selectedCategory?.questioncategory);
      

          PullSubCategoryFindAll(selectedValue);
      
          
        }
      };
      
    const handleSubCatChange = (e) => {
        const selectedValue = e?.target?.value;
      
        if (selectedValue === "new") {
          openAddSubCategoryModal();
        } else {
          const selectedSubCategory = subCatList.find(option => option.id === selectedValue)?.questionsubcategory;
      
          setSubCatId(selectedValue);
          SetquestionSubCategory(selectedSubCategory); 
         
        }
      };
      const onlyNumberwithdecimal = (e) => {
        let inputvalue = e.target.value;
        inputvalue = inputvalue.replace(/[^\d.]/g, ""); // Allow only numbers and one decimal point
        const decimalCount = (inputvalue.match(/\./g) || []).length;
        if (decimalCount > 1) {
            inputvalue = inputvalue.slice(0, inputvalue.lastIndexOf(".")); // Remove extra decimal points
        }
        if (isNaN(inputvalue)) {
            toast("Quantity can be numeric only", {
                hideProgressBar: true,
                autoClose: 500,
                type: "error",
            });
            return;
        }
        return inputvalue;
    };
  
    function handleFileChange(event) {
        
        if (event) {
            if (validateFileSize(event)) {
                //const chosenFiles = Array.prototype.slice.call(event.target.files)
                //handleUploadFiles(event.target.files);
                //;
                const fileName = event.target.files[0].name;
                if (fileName.length > 50) {
                    toast.error("Attachment name must be 50 characters or fewer.", {
                        position: toast.POSITION.TOP_CENTER,
                    });
                    event.target.value = null; // Clear the file input field
                    return; // Stop further processing
                }
                setattachedFileName(event.target.files[0]);
                //setdisplayAttachedName(event.target.files[0].name);
                //var foldername = "Questions/" + "rfq" +"questiondescription"; // Example folder name
                //setfilepath(foldername);
                //setFileList(event.target.files[0]);
            
            }
            else{
                setPostFileName("");
    
                
    
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                    return;
            }
        }
    }
    const handleRemoveattachmentClick = () => {
        console.log("Remove button clicked");
        setFileList([]);

        setattachedFileName("");
        setdisplayAttachedName("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    // const handleDownload = () => {
    // 	if (editRecordData?.attachedFileName) {
    // 		downloadFilesOnAzure(
    // 			editRecordData.attachedFileName,
    // 			displayAttachedName,
    // 			atoken
    // 		);
    // 	} else {
    // 		toast("File name is not available", {
    // 			hideProgressBar: true,
    // 			autoClose: 1000,
    // 			type: "error",
    // 		});
    // 	}
    // };
    const handleWeightageChange = (e) => {
        // Get the raw value from the event
        const newValue = onlyNumberwithdecimal(e);
      
        // Allow empty input
        if (newValue === '') {
          setweightage('');
          return;
        }
      
        const numericValue = parseFloat(newValue);
        
        if (isNaN(numericValue) || numericValue < 1 || numericValue > 100) {
          setweightage(newValue); // Allow the invalid value to stay in the input
        } else {
          setweightage(numericValue); // If valid, update the state
        }
      };
      
      
      
    return (
        <div>
            <form onSubmit={formik.handleSubmit} autoComplete="off">
                <div className='row'>
                <div className="col-12 col-md-4   ">
                    <FormControl fullWidth>
                        <InputLabel id="category">Category</InputLabel>
                        <Select
                            labelId="questioncategoryid"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            label="Category "
                            id="questioncategoryid"
                            name="questioncategoryid"
                            variant="outlined"
                            value={catId} 
                            size="small"
                            onChange={handleCategoryChange}
                            
                        >
                                {catAllList?.map((option, i) => (
                                <MenuItem key={i} value={option?.id}>
                                    {option?.questioncategory}
                                </MenuItem>
                            ))}
                            
                            
                        </Select>
                    </FormControl>
                </div>
                <div className="col-12 col-md-4  ">
                <FormControl fullWidth>
                        <InputLabel id="subcategory" >Sub Category</InputLabel>
                        <Select
                            labelId="questionsubcategoryid"
                        
                            InputLabelProps={{
                                shrink: true,
                                
                            }}
                            label="Category "
                            id="questionsubcategoryid"
                            name="questionsubcategoryid"
                            variant="outlined"
                            value={subCatId} //{formik.values.questionsubcategoryid}
                            size="small"
                            className='customCategory'
                            onChange={handleSubCatChange}
                            
                            error={
                                formik.touched.questionsubcategoryid &&
                                Boolean(formik.errors.questionsubcategoryid)
                            }
                            helperText={
                                formik.touched.questionsubcategoryid &&
                                formik.errors.questionsubcategoryid
                            }
                        >
                            {subCatList?.map((option, i) => (
                                <MenuItem key={i} value={option?.id}>
                                    {option?.questionsubcategory}
                                </MenuItem>
                            ))}
                        
                        </Select>
                    </FormControl>
                </div>
                
                <div className="col-4  focus">
                    <FormControl fullWidth className="form-control">
                        <TextFieldCell
                            id="weightage"
                            name="weightage"
                            label="Question Weightage(In Percentage)"
                            maxLength={3}
                            inputProps={{ maxLength: 5 }}
                            onInput={(e) => onlyNumberwithdecimal(e)}
                            value={weightage}
                            //onChange={formik.handleChange}
                            // onChange={(e) => {
                            // 	const newValue = onlyNumberwithdecimal(e); // Apply your function here
                            // 	if (newValue !== undefined) {
                            // 		setweightage(newValue);
                            // 	}
                            // }}
                            onChange={handleWeightageChange} 
                            error={formik.touched.weightage && Boolean(formik.errors.weightage)} // Show error state if touched and error exists
                            helperText={formik.touched.weightage && formik.errors.weightage ? "Value must be between 1 and 100" : ""}
                        />
                    </FormControl>
                </div>
                </div>

                    <div className='col-12 col-md-12 mb-4 mt-2'>    
                    <div className='col-12 col-md-12 mt-4 mb-4'>
                        <TextFieldCell
                            id="nfaQestion"
                            name="nfaQestion"
                            label="Enter Question *"
                            placeholder=''
                            value={formik.values.nfaQestion}
                            onChange={formik.handleChange}
                            maxLength={200}
                            InputProps={{
                                endAdornment: formik.values.nfaQestion && (
                                  <InputAdornment position="end">
                                    <Typography variant="body2" color="textSecondary">
                                      {formik.values.nfaQestion.length}/200
                                    </Typography>
                                  </InputAdornment>
                                ),
                              }}
                            error={formik.touched.nfaQestion && Boolean(formik.errors.nfaQestion)}
                            helperText={formik.touched.nfaQestion && formik.errors.nfaQestion}
                        />
                    </div>
                    
                    <div className='col-12 col-md-12 mb-2'>
                        <TextFieldCell
                            id="nfaQuestionRequirement"
                            name="nfaQuestionRequirement"
                            label="Your Requirement"
                            multiline
                            rows={2}
                            placeholder=''
                            value={formik.values.nfaQuestionRequirement}
                            onChange={formik.handleChange}
                            maxLength={200}
                            InputProps={{
                                endAdornment: formik.values.nfaQuestionRequirement && (
                                  <InputAdornment position="end">
                                    <Typography variant="body2" color="textSecondary">
                                      {formik.values.nfaQuestionRequirement.length}/200
                                    </Typography>
                                  </InputAdornment>
                                ),
                              }}
                            error={formik.touched.nfaQuestionRequirement && Boolean(formik.errors.nfaQuestionRequirement)}
                            helperText={formik.touched.nfaQuestionRequirement && formik.errors.nfaQuestionRequirement}
                        />
                    </div>
                    <div className="col-12 col-md-12 mt-3">
                                <Form.Group controlId="formFile" className="">
                        <Form.Control
                            type="file"
                            size="sm"
                            accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </Form.Group>
                    <div
                        className="col-12 col-md-12 mb-2 "
                        style={{ color: "blue", fontStyle: "italic" }}
                    >
                        <div id="attachedFileName">
                        
                        {questionforedit?.attachedFileName && (
                       <div className="d-flex align-items-center justify-content-between mt-2">
                           <Button
                               variant="text"
                               size="small"
                               className="attached-file-name"
                               onClick={()=>downloadFilesOnAzure(questionforedit?.attachedFileName,getFileName(questionforedit?.attachedFileName),atoken)}
                           >
                               {getFileName(questionforedit?.attachedFileName)}
                           </Button>
                           {/* {attachedFileName && <div>{attachedFileName}</div>} */}
                           {/* <div className="attached-file-name">{attachedFileName}</div> */}
                           <div>
                               <IconButton
                                   size="medium"
                                   className="bg-white ml-2"
                                   onClick={handleRemoveattachmentClick}
                               >
                                   <HiOutlineX className="f16 text-danger" />
                               </IconButton>
                           </div>
                       </div>
                   )}
               </div>
                    </div>
                </div>
                <div className='row'>

                    <div className='col-12 col-md-3 me-0 pe-0'>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={formik.values.mandatory} />}
                                id="mandatory"
                                label={<span className='f14 muted'>Mandatory</span>}
                                labelPlacement="Sealed Bid"
                                name="mandatory"
                                value={formik.values.mandatory}
                                onChange={formik.handleChange}
                            />
                        </FormGroup>
                    </div>
                    <div className='col-12 col-md-3 me-0 pe-0 ps-0'>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={formik.values.attachement} />}
                                id="attachement"
                                label={<span className='f14 muted'>Attachement</span>}
                                labelPlacement="attachement"
                                name="attachement"
                                value={formik.values.attachement}
                                onChange={formik.handleChange}
                            />
                        </FormGroup>
                    </div>

                </div>
                </div>
                <div className='text-end'>
                    <LoadingButton
                        variant='outlined'
                        onClick={() => formik.resetForm()}
                        color='primary'
                        className='me-3 text-capitalize'
                        size='small'
                    >
                        Reset
                    </LoadingButton>
                    <LoadingButton
                        loading={loadingSubmit}
                        variant='contained'
                        type="submit"
                        color='primary'
                        className='text-capitalize'
                        size='small'
                    >
                        Add
                    </LoadingButton>
                </div>
              
            </form>

        </div>
    )
}

export default AddNFAQuestionFormCell