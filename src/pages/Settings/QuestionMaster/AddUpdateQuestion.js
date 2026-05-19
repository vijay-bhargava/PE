import React, { useState, useEffect, useRef } from "react";
import {
	Box,
	Button,
	Checkbox,
	Drawer,
	FormControl,
	FormControlLabel,
	FormGroup,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Autocomplete,
	Typography,
	InputAdornment,
} from "@mui/material";
import { Modal } from "react-bootstrap";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import AddQuestionCategory from "./AddQuestionCategory";
import { Form } from "react-bootstrap";
import AddQuestionSubCategory from "./AddQuestionSubCategory";
import { LoadingButton } from "@mui/lab";
import "../../../assets/css/base.css";
//import EditIcon from '@mui/icons-material/Edit';
//import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import {
	HiOutlinePencilAlt,
	HiOutlineTrash,
	HiOutlineX,
	HiPencilAlt,
} from "react-icons/hi";
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../../store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
	AddQuestion,
	UpdateQuestion,
	QuestionFindAll,
	QuestionFindById,
	CategoryFindById,
	CategoryFindAll,
	SubCategoryFindById,
	SubCategoryFindAll,
	AddQuestionOption,
	GetQuestionOptions,
	getMenuMaster,
	LibraryFindAll,
} from "../../../utils/questionlibrary";
import { formatDate } from "../../../utils/common/utility";

import { getPurchaseGrp } from "../../../utils/workflow";
import { lib } from "crypto-js";
import AddComLibrary from "../CommercialTerms/AddComLibrary";
import { uploadFilesOnAzure } from "../../../utils/documentlibrary";
import { downloadFilesOnAzure, getExtension, validateFileSize } from "../../../utils/common";
import { id } from "date-fns/locale";

const AddUpdateQuestion = ({
	callbackstep,
	PullCategoryFindAll,
	purchaseOrgList,
	catList,
	editRecordData,
	pullQuestionList,setquestionunsavedChanges,handleReflectedData
}) => {
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
	const [subCatList, setSubCatlist] = useState([]);
	const [questionCategory, SetquestionCategory] = useState("");
	const [questionSubCategory, SetquestionSubCategory] = useState("");
	const [inputOrgGrpList, setinputOrgGrpList] = useState([]);
	const [displayAttachedName, setdisplayAttachedName] = useState("");
	const [attachedFileName, setattachedFileName] = useState("");
	const [libraryEntity, setlibraryEntity] = useState("");
	const [applyeventtype, setapplyeventtype] = useState("");
	const [libraryid, setlibraryid] = useState(0);
	const [questiondescription, setquestiondescription] = useState("");
	const [questionRequirement, setquestionRequirement] = useState("");

	const [attachement, setattachement] = useState(false);
	const [autoCalculated, setautoCalculated] = useState(false);
	
	const [optiontype, setoptiontype] = useState(false);
	const [mandatory, setmandatory] = useState(false);
	const [isMultipleChoice, setisMultipleChoice] = useState(false);
	const [isActive, setisActive] = useState(true);
	const [weightage, setweightage] = useState(0);
	const [filepath, setfilepath] = useState("");
	const [fileList, setFileList] = React.useState([]);
	const [fileName, setfileName] = useState("");
	const [eventType, seteventType] = useState("");
	const fileInputRef = useRef(null);
	const [postFileName, setPostFileName] = React.useState("");
	const inputDate = new Date(); // Replace with your date input
	let formattedDate = formatDate(inputDate);

	const [createdon, setCreatedon] = useState(formattedDate);

	const [libraryType, setlibraryType] = useState("QuestionLibrary");
	useEffect(() => {
		if (editRecordData && editRecordData?.id > 0) {
			console.log("effect", editRecordData);
			// ;
			//formik.setFieldValue('Id', editRecordData?.Id);
			getQuestionEditData();
		}
	}, []);

	useEffect(() => {
		getPurchasegrplist(1);
		PullLibraryAll();
		pullMenuMaster();
	}, [purchaseOrgList]);

	const [catId, setCatId] = useState(
		editRecordData?.catId ? editRecordData?.catId : 0
	);
	const onChangecategory = (e, value) => {
		console.log(value);
		if (value?.id > 0) {
			setCatId(value?.id);
			PullSubCategoryFindAll(value?.id);
		}
	};

	const [state, setState] = useState({
		opensidebar: false,
	});

	const toggleDrawer = (anchor, open) => (event) => {
		//
		if (open == false) {
			editRecordData(null);
		}
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};
	const onpurchaseOrgChange = (e, value) => {
		console.log(value);
		//console.log(e);
		//;
		let index = 0;
		//formik.setFieldValue("purchaseorg[0].purorgid", parseInt(val[0]?.id));
		//formik.setFieldValue('purchaseorg', val);
		setInputList(value);
	};

	const PullSubCategoryFindAll = (valueId) => {
		var data = {
			CustomerId: customerid,
			questioncategoryid: valueId,
			
			// questioncategory:valueId,
			// questionsubcategory: "",
			IsActive: "true",
			//pagenumber: 1,
		};
		console.log("sub post", data);
		SubCategoryFindAll(data, atoken).then((res) => {
			console.log("subcat", res);
			setSubCatlist(res);
		});
	};

	const [subCatId, setSubCatId] = useState(
		editRecordData?.subCatId ? editRecordData?.subCatId : 0
	);
	const onChangeSubcat = (e, value) => {
		console.log(value);
		//formik.setFieldValue('questionsubcategoryid', value?.id);
		setSubCatId(value?.id);
	};

	//LIBRARY LIST
	const [AllLibraryList, setLibraryList] = useState([]);
	const PullLibraryAll = () => {
		var data = {
			CustomerId: customerid,
			LibraryType: "QuestionLibrary",
			IsActive: true,
		};
		LibraryFindAll(data, atoken).then((res) => {
			setLibraryList(res);
		});
	};

	const openAddLibraryModal = () => {
		setLibraryModal(true);
	};

	const openAddCategoryModal = () => {
		setModal(true);
	};

	const closeModal = () => {
		setModal(false);
	};

	const openAddSubCategoryModal = () => {
		setSubModal(true);
	};
	const getsubcatDefault = (array) => {
		let arrayNew = [];
		//console.log("array",array)
		if (array?.length > 0) {
			array.map((index) => {
				subCatList.map((data) => {
					if (data.id == index?.id) {
						if (data) arrayNew.push(data);
					}
				});
			});
		}
		return arrayNew;
	};

	const getPurchOrgGrpDefault = (array) => {
		let arrayNew = [];
		console.log("array", array);
		if (array != null && array != "") {
			var arraydata = JSON.parse(array);
			arrayNew = arraydata;
			setinputOrgGrpList(arrayNew);
		}
		//setpurchaseorggrp(arrayNew);
		return arrayNew;
	};

	const getPurchOrgDefault = (array) => {
		let arrayNew = [];
		console.log("array", array);
		if (array != null && array != "") {
			var arraydata = JSON.parse(array);
			if (arraydata?.length > 0) {
				// setInputList(arraydata)
				arraydata.map((index) => {
					purchaseOrgList.map((data) => {
						if (data.id == index?.id) {
							if (data) arrayNew.push(data);
						}
					});
				});
			}
		}
		return arrayNew;
	};

	const [purchasegrpList, setpurchasegrpList] = useState([]);

	const getPurchasegrplist = (purchOrgId) => {
		var data = {
			customerId: customerid,
			purchOrgId: purchOrgId > 0 && purchOrgId != undefined ? purchOrgId : 1,
			token: atoken,
			pagenumber: 1,
			isActive: true,
		};
		getPurchaseGrp(data)
			.then((res) => {
				if (res && Array.isArray(res)) {
					// if (res?.length > 0)
					//
					setpurchasegrpList(res);
					//console.log(purchasegrpList);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	};

	const getPurchGrpDefault = (array) => {
		//
		let arrayNew = [];
		console.log("array", array);
		if (array != null && array != "") {
			var arraydata = JSON.parse(array);
			if (arraydata?.length > 0) {
				arraydata.map((index) => {
					purchasegrpList.map((data) => {
						if (data.id == index?.id) {
							if (data) arrayNew.push(data);
						}
					});
				});
			}
		}

		return arrayNew;
	};

	const [selectedPurchaseGrp, setSelectedPurchaseGrp] = useState([]);
	const onchangePurchaseGrp = (value) => {
		formik.setFieldValue("purchorggroup[0].purgrpid", parseInt(value[0]?.id));
		setSelectedPurchaseGrp(value);
	};

	const [inputList, setInputList] = useState([]);
	const handleInputChange = (e, index) => {
		const { name, value } = e.target;
		const list = [...inputList];
		list[index][name] = value;
		setInputList(list);
	};

	//const [eventType, setEventType] = useState("");
	// const eventTypeChange = (e, value) => {
	// 	//console.log(e);
	// 	// console.log(e?.target?.value);
	// 	setEventType(e?.target?.value);
	// 	//PullCategoryFindAll(eventType);
	// 	// console.log(catList);
	// };

	const validationSchema = yup.object({
		//file: yup.mixed().required(),
		libraryEntity: yup
			.string("select your library")
			.required("Please Select your library"),
		questiondescription: yup
			.string("Enter your Description")
			.required("Please Enter Question Description"),
	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			//token: atoken,
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
			customerId: customerid,
			libraryEntity: editRecordData?.libraryEntity
				? editRecordData?.libraryEntity
				: libraryEntity,
			libraryid: editRecordData?.libraryId ? editRecordData?.libraryId : 0,
			questioncategoryid: editRecordData?.questionCategoryId
				? catList[
						catList?.findIndex(
							(obj) => obj.id == editRecordData?.questionCategoryId
						)
				  ]
				: 0,
			questionCategory: editRecordData?.questionCategory
				? editRecordData?.questionCategory
				: questionCategory,
			questionsubcategoryid: editRecordData?.questionSubcategoryId
				? subCatList[
						subCatList?.findIndex(
							(obj) => obj.id == editRecordData?.questionSubcategoryId
						)
				  ]
				: 0,
				questionSubCategory:editRecordData?.questionSubCategory
				? editRecordData?.questionSubCategory
				: questionSubCategory,
			questiondescription: editRecordData?.questionDescription
				? `${editRecordData?.questionDescription}`
				: "",
				questionRequirement: editRecordData?.questionRequirement
				? `${editRecordData?.questionRequirement}`
				: "",
			// applyeventtype: editRecordData?.applyeventtype
			//   ? editRecordData?.applyeventtype
			//   : applyeventtype,
			eventType  :editRecordData?.eventType ?? eventType,
			attachedFileName: editRecordData?.attachedFileName
				? `${editRecordData?.attachedFileName}`
				: attachedFileName,
			attachement: editRecordData?.attachement
				? `${editRecordData?.attachement}`
				: false,
				autoCalculated: editRecordData?.autoCalculated
				? `${editRecordData?.autoCalculated}`
				: false,
				isMultipleChoice: editRecordData?.isMultipleChoice
				? `${editRecordData?.isMultipleChoice}`
				: false,
			// filepath: editRecordData?.filepath ? `${editRecordData?.filepath}` : "",
			weightage: editRecordData?.weightage,
			optiontype: editRecordData?.optionType ? true : false,
			mandatory: editRecordData?.mandatory ? true : false,
			
			purchaseorggrp: inputOrgGrpList,
			isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
			createdby: 1,
			modifiedby: 1,
		},
		validationSchema: validationSchema,

		onSubmit: (values) => {
			;
			if (!values.questiondescription) {
				setLoading(false); // Stop loading
				toast.error("Question Description is required!", {
					toastId:"descques"
				});
				return; 
			}
			setLoading(true);
			
			
		
			var filepathreturn = "";

			var datapost = {
				id: editRecordData?.id ? editRecordData?.id : 0,
				customerid: customerid,
				libraryid: libraryid,
				libraryEntity: libraryEntity,
				questioncategoryid: catId,
				questionCategory: questionCategory,
				questionsubcategoryid: subCatId,
				questionSubCategory:questionSubCategory,
				questiondescription: questiondescription,
				questionRequirement:questionRequirement,
				eventType: values.eventType,
				attachedFileName: attachedFileName,
				weightage: weightage,
				purchaseorggrp: inputOrgGrpList,
				attachement: attachement == undefined ? 0 : attachement,
				autoCalculated: autoCalculated,
				optiontype: (optiontype || isMultipleChoice) ? true:false,
				isMultipleChoice:isMultipleChoice?false:true,
				
				mandatory: mandatory,
				isActive: isActive,
			};
			if (editRecordData?.id > 0) {
				
				if (fileList) {
					
					var Data = {
						RequestedBy: "customer",
						CustomerId: customerid,
						Description: `QuestionLibrary/${libraryEntity}`,
					};

					uploadFilesOnAzure(Data, fileList, atoken).then((resdata) => {
						filepathreturn = resdata;
						var data = {
							id: editRecordData?.id ? editRecordData?.id : 0,
							customerid: customerid,
							libraryid: libraryid,
							libraryEntity: libraryEntity,
							questioncategoryid: catId, // catId == undefined ? 0 : catId,
							questionCategory: questionCategory,
							questionsubcategoryid: subCatId, 
							questionSubCategory: questionSubCategory,
							//subCatId == undefined ? 0 : subCatId,
							questiondescription: questiondescription,
							questionRequirement:questionRequirement,
							eventType: eventType,
							attachedFileName: filepathreturn
								? filepathreturn
								: attachedFileName,
							//filepath:
							weightage: weightage,
							purchaseorggrp: inputOrgGrpList, //?.map(t => t.id).toString(),  // values?.purchaseorg,
							attachement: attachement == undefined ? 0 : attachement,
							autoCalculated:  autoCalculated,
							optiontype: (optiontype || isMultipleChoice) ? true:false,
				isMultipleChoice:isMultipleChoice?false:true,
							mandatory: mandatory,
							isActive: isActive,
						};

						//       setLoading(true);
						// ;
						//       if (editRecordData?.id > 0) {
						//         console.log("update", data);
						UpdateQuestion(data, editRecordData?.id, atoken).then((res) => {
							setLoading(false);
							dispatch({
								type: actionTypes.SET_MSGALERTTYPE,
								value: "success",
							});
							dispatch({
								type: actionTypes.SET_MSGALERTDATA,
								value: res?.data?.message,
							});
							dispatch({ type: actionTypes.SET_MSGALERT, value: true });
							//callbackstep("update");
							setquestionunsavedChanges(false);
							clearedForm();
							handleReflectedData()
							//pullQuestionList(values.libraryid);
							toast.success("Question  updated successfully!", {
								position: toast.POSITION.TOP_CENTER,
								autoClose: 1000,
							});
							return true;
						});
					});
				} else {
					UpdateQuestion(datapost, editRecordData?.id, atoken).then((res) => {
						setLoading(false);

						//callbackstep("update");
						setquestionunsavedChanges(false);
						clearedForm();
						handleReflectedData()
						//pullQuestionList(values.libraryid);
						return true;
					});
				}
			} else {
				if (fileList) {
					var Data = {
						RequestedBy: "customer",
						CustomerId: customerid,
						Description: `QuestionLibrary/${libraryEntity}`,
					};
					uploadFilesOnAzure(Data, fileList, atoken).then((resdata) => {
						filepathreturn = resdata;
						var data = {
							id: editRecordData?.id ? editRecordData?.id : 0,
							customerid: customerid,
							libraryid: libraryid,
							libraryEntity: libraryEntity,
							questioncategoryid: catId,
							questionCategory: questionCategory,
							questionsubcategoryid: subCatId,
							questionSubCategory:questionSubCategory,
							questiondescription: questiondescription,
							questionRequirement:questionRequirement,
							eventType: eventType,

							attachedFileName: filepathreturn
								? filepathreturn
								: attachedFileName,
							weightage: weightage,
							purchaseorggrp: inputOrgGrpList, //?.map(t => t.id).toString(),  // values?.purchaseorg,
							attachement: attachement == undefined ? 0 : attachement,
							autoCalculated : autoCalculated,
							optiontype: (optiontype || isMultipleChoice) ? true:false,
				            isMultipleChoice:isMultipleChoice ? false:true,						
							mandatory: mandatory,
							isActive: isActive,
						};

						console.log("ADD", data);
						AddQuestion(data, atoken).then((res) => {
							setLoading(false);
							//console.log(res);
							dispatch({
								type: actionTypes.SET_MSGALERTTYPE,
								value: "success",
							});
							dispatch({
								type: actionTypes.SET_MSGALERTDATA,
								value: res?.data?.message,
							});
							dispatch({ type: actionTypes.SET_MSGALERT, value: true });
							//callbackstep("new");
							//pullQuestionList(values.libraryid);
							handleReflectedData();
							setquestionunsavedChanges(false);
							clearedForm();
							toast.success("Question  added successfully!", {
								position: toast.POSITION.TOP_CENTER,
								autoClose: 1000,
							});
							return true;
						});
					});
				} else {
					AddQuestion(datapost, atoken).then((res) => {
						setLoading(false);

						console.log("save", res);
						//callbackstep("add");
						setquestionunsavedChanges(false);
						clearedForm();
						handleReflectedData();
						//pullQuestionList(values.libraryid);
						return true;
					});
				}
			}
		}, // Make sure the onSubmit function is properly closed.
	});
	const getQuestionEditData = () => {
		formik.setFieldValue("id", editRecordData?.id);
		formik.setFieldValue("libraryId", editRecordData?.libraryId);
		setquestionRequirement(editRecordData?.questionRequirement)
		setapplyeventtype(editRecordData?.applyeventtype);
		setlibraryEntity(editRecordData?.libraryEntity);
		setlibraryid(editRecordData?.libraryId);
		if(editRecordData?.optionType && editRecordData?.isMultipleChoice){
            setoptiontype(true);
		}
		
		else if(editRecordData?.optionType && !editRecordData?.isMultipleChoice){
            setisMultipleChoice(true);
		}
		else{
			setoptiontype(false);
			setisMultipleChoice(false);
		}
		
        //setisMultipleChoice(editRecordData?.isMultipleChoice);
		if (editRecordData?.questioncategoryId > 0) {
			setCatId(editRecordData?.questioncategoryId);

			setSubCatId(editRecordData?.questionSubcategoryId);
			PullSubCategoryFindAll(editRecordData?.questioncategoryId);
		}

		setquestiondescription(editRecordData?.questionDescription);
		if (editRecordData?.purchaseorggrp != "") {
			getPurchOrgGrpDefault(editRecordData?.purchaseorg);
		}
		setweightage(editRecordData?.weightage);
		seteventType(editRecordData?.eventType);
		setattachement(editRecordData?.attachement);
		setautoCalculated(editRecordData?.autoCalculated);
		SetquestionCategory(editRecordData?.questionCategory);
		SetquestionSubCategory(editRecordData?.questionSubCategory);
		const attachedFileName = editRecordData?.attachedFileName;
		setattachedFileName(attachedFileName);
		if (attachedFileName && attachedFileName !== "") {
			const fileName = attachedFileName.split("/").pop();
			setdisplayAttachedName(fileName);
		}
		
		setmandatory(editRecordData?.mandatory);
		setisActive(editRecordData?.isActive);
	};

	const clearedForm = () => {
		
		setapplyeventtype("");
		SetquestionCategory("");

		//setlibraryid(0);
		setCatId(0);
		setSubCatId(0);
		setquestionRequirement("");
		setquestiondescription("");
		setinputOrgGrpList([]);
		setweightage(0);
		setattachement(false);
		setautoCalculated(false);
		setoptiontype(false);
		setisMultipleChoice(false);
		setmandatory(false);
		setisActive(true);
		setattachedFileName("");
		setdisplayAttachedName("");
		setfilepath([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = null;
		}
		
	};

	const [editorState, setEditorState] = useState("");
	const onEditorStateChange = (editorState) => {
		setEditorState(editorState);
	};
	const [editorState2, setEditorState2] = useState("");
	const onEditorStateChange2 = (editorState2) => {
		setEditorState2(editorState);
	};
	const [editorState3, setEditorState3] = useState("");
	const onEditorStateChange3 = (editorState3) => {
		setEditorState3(editorState3);
	};

	const handleLibraryChange = (e) => {
		formik.setFieldValue("libraryType", e.target.value);

		if (e.target.value === "new") {
			OpenModal();
		}
	};

	const [modal, setModal] = useState(false);
	const [LibraryModal, setLibraryModal] = useState(false);
	const [subModal, setSubModal] = useState(false);
	const OpenModal = () => setModal(true);
	const CloseModal = () => setModal(false);
	const CloseSubModal = () => setSubModal(false);

	const CloseLibraryModal = () => {
		setLibraryModal(false);
		
		// Set id of the last library
		const lastlibid = AllLibraryList[AllLibraryList.length - 1]?.id;
	
		if (!editRecordData && lastlibid) {
			const lastLibrary = AllLibraryList.find(library => library.id === lastlibid);
			
			if (lastLibrary) {
				setlibraryid(lastlibid);

				formik.setFieldValue('libraryid', lastlibid);
				formik.setFieldValue('libraryEntity', lastLibrary.libraryEntity);
				formik.setFieldValue('eventType', lastLibrary.eventType);
				setlibraryEntity(lastLibrary.libraryEntity);
				seteventType(lastLibrary.eventType);
			}
		}
	
		console.log("AllLibraryList", AllLibraryList);
	};
	const updateFolup = (value) => {
		console.log("updateFolup value", value);
		// setfollowupId(value)
		// setModal1(true)
	};

	const handleAddClick = () => {
		console.log("post", inputOrgGrpList);
		setinputOrgGrpList([
			...inputOrgGrpList,
			{ purchOrgId: 0, purchasegrpId: 0 },
		]);
	};

	const handleAssign = (e, index) => {
		const list = [...inputOrgGrpList];
		list[index]["purchasegrpId"] = e;
		setinputOrgGrpList(list);
	};

	const handleFollowupType = (e, index) => {
		const list = [...inputOrgGrpList];
		list[index]["purchOrgId"] = e;
		getPurchasegrplist(e);
		setinputOrgGrpList(list);
	};

	const handleRemoveClick = (index) => {
		const list = [...inputOrgGrpList];
		list.splice(index, 1);
		setinputOrgGrpList(list);
	};

	const onlyNumbers = (e) => {
		e.target.value = e.target.value.replace(/[^0-9]/g, "");
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

	//APPLYEVENT
	const [MenuMasterList, setMenuMasterList] = useState([]);
	const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
		};

		getMenuMaster(data, atoken).then((res) => {
			// console.log(res);
			setMenuMasterList(res);
		});
	};
	const onchangeEventType = (event, newValue) => {
		setapplyeventtype(event.target.value);
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
				setattachedFileName(event.target.files[0].name);
				setdisplayAttachedName(event.target.files[0].name);
				var foldername = "Questions/" + applyeventtype + questiondescription; // Example folder name
				setfilepath(foldername);
				setFileList(event.target.files[0]);
				setquestionunsavedChanges(true);
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

	const handleDownload = () => {
		if (editRecordData?.attachedFileName) {
			downloadFilesOnAzure(
				editRecordData.attachedFileName,
				displayAttachedName,
				atoken
			);
		} else {
			toast("File name is not available", {
				hideProgressBar: true,
				autoClose: 1000,
				type: "error",
			});
		}
	};
	const handlequesdescChange = (e) => {
		const input = e?.target?.value;
		// Remove single quote character from input
		const sanitizedInput = input.replace(/'/g, "");
		// Set the sanitized input

		formik?.setFieldValue("questiondescription", sanitizedInput);
		setquestiondescription(sanitizedInput);
		setquestionunsavedChanges(true);
	};
	const handlequesreqChange = (e) => {
		const input = e?.target?.value;
		// Remove single quote character from input
		const sanitizedInput = input.replace(/'/g, "");
		// Set the sanitized input

		formik?.setFieldValue("questionRequirement", sanitizedInput);
		setquestionRequirement(sanitizedInput);
		setquestionunsavedChanges(true);
	};
	const handleLibraryEntityChange = (e) => {
		
		const selectedValue = e.target.value;
		if (selectedValue === "Add NEW Library") {
			openAddLibraryModal();
		} else {
			formik?.setFieldValue("libraryEntity", selectedValue);
			PullLibraryAll(selectedValue);
			const selectedLibrary = AllLibraryList.find(
				(library) => library?.id === selectedValue
			);
			const eventtypeLib = selectedLibrary ? selectedLibrary.eventType : '';
			setlibraryid(selectedValue);
			if (selectedLibrary) {
				setlibraryEntity(selectedLibrary?.libraryEntity);
				formik.setFieldValue('eventType', eventtypeLib);
				seteventType(eventtypeLib);
				console.log("Setting eventtype to:", eventtypeLib);
			}
			setquestionunsavedChanges(true);
		}
		
	};
	const handleCategoryChange = (e) => {
		;
		const selectedValue = e.target.value;

		if (selectedValue === "new") {
			if (!libraryid) {
				toast.error(
					"Please select a library first before adding a new category."
				);
				setModal(false);
				return;
			}
			openAddCategoryModal(libraryid);
		} else {
			setCatId(selectedValue);
			const selectedCategory = catList.find((cat) => cat.id === selectedValue);
			SetquestionCategory(selectedCategory?.questioncategory);
			PullSubCategoryFindAll(selectedValue);

			// Check if selectedCategory and its libraryid is available
			const selectedLibrary = AllLibraryList.find(
				(library) => library.id === selectedCategory.libraryid
			);
			if (selectedLibrary) {
				setlibraryid(selectedLibrary.id);
			}
			setquestionunsavedChanges(true);
			// Now set the corresponding libraryid based on selected question category
			// const selectedLibrary = AllLibraryList.find(library => library?.id === selectedCategory?.libraryid);
			//     setlibraryid(selectedLibrary?.id); // Assuming selectedCategory has a libraryid property
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
		  setquestionunsavedChanges(true);
		}
	  };
	  
	return (
		<form onSubmit={formik.handleSubmit} autoComplete="off">
			<div className="row">
				<div className="col-12 col-md-6 mb-2">
					<FormControl fullWidth>
						<InputLabel id="library">Library *</InputLabel>
						<Select
							labelId="event"
							InputLabelProps={{
								shrink: true,
							}}
							variant="outlined"
							size="small"
							id="libraryid"
							name="libraryid"
							value={libraryid}
							label="Question Library *"
							onChange={handleLibraryEntityChange}
						>
							{AllLibraryList?.map((option, i) => (
								<MenuItem key={i} value={option?.id}>
									
									{`${option?.libraryEntity} - ${option?.eventType}`}
								</MenuItem>
							))}
							<MenuItem
								value={"Add NEW Library"}
								className="bggray"
								style={{
									color: "blue",
									fontSize: "13px",
									fontStyle: "italic",
									textDecoration: "underline",
									cursor: "pointer",
								}}
								
							>
								<ins>ADD NEW</ins>
							</MenuItem>
						</Select>
						{formik.errors.libraryEntity && formik.touched.libraryEntity && (
							<div className="error error-red" style={{ fontSize: "9px" }}>
								{formik.errors.libraryEntity}
							</div>
						)}
					</FormControl>
				</div>
				<div className="col-6  focus">
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
							onChange={(e) => {
								const newValue = onlyNumberwithdecimal(e); // Apply your function here
								if (newValue !== undefined) {
									setweightage(newValue);
								}
							}}
							error={
								formik.touched.weightage && Boolean(formik.errors.weightage)
							}
							helperText={formik.touched.weightage && formik.errors.weightage}
						/>
					</FormControl>
				</div>
				<div className="col-12 col-md-6 mb-2 mt-2 ">
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
							value={catId} //{formik.values.questioncategoryid}
							size="small"
							onChange={handleCategoryChange}
							//defaultValue='0168'
							// onChange={(e) => {
							//   setCatId(e?.target?.value);
							//   PullSubCategoryFindAll(e?.target?.value);
							//   //formik.setFieldValue("questioncategoryid", e?.target?.value);
							// }}

							// onChange={(e) => {
							//   const selectedValue = e?.target?.value;

							//   if (selectedValue === "new") {
							//     openAddCategoryModal();
							//   } else {
							//     setCatId(selectedValue);
							//     const selectedCategory = catList.find(cat => cat.id === selectedValue);
							//     SetquestionCategory(selectedCategory?.questioncategory);
							//     PullSubCategoryFindAll(selectedValue);

							//   }
							// }}
							error={
								formik.touched.questioncategoryid &&
								Boolean(formik.errors.questioncategoryid)
							}
							helperText={
								formik.touched.questioncategoryid &&
								formik.errors.questioncategoryid
							}
						>
							{catList?.map((option, i) => (
								<MenuItem key={i} value={option?.id}>
									{option?.questioncategory}
								</MenuItem>
							))}
							<MenuItem
								value={"new"}
								className="bggray"
								style={{
									color: "blue", // Change link color
									fontStyle: "italic",
									textDecoration: "underline", // Underline the link
									cursor: "pointer", // Change cursor to pointer on hover
								}}
								onClick={openAddCategoryModal}
							>
								<ins>ADD NEW</ins>
							</MenuItem>
						</Select>
					</FormControl>
				</div>

				<div className="col-12 col-md-6 mb-3 mt-2">
					<FormControl fullWidth>
						<InputLabel id="subcategory">Sub Category</InputLabel>
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
							// onChange={(e) => {
							//   setSubCatId(e?.target?.value);
							//   // formik.setFieldValue("questionsubcategoryid", e?.target?.value);
							// }}
							onChange={handleSubCatChange}
							// onChange={(e) => {
								
							// 	const selectedValue = e?.target?.value;

							// 	if (selectedValue === "new") {
							// 		openAddSubCategoryModal();
							// 	} else {
							// 		setSubCatId(selectedValue);
							// 	}
							// }}
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
							<MenuItem
								value={"new"}
								className="bggray"
								style={{
									color: "blue", // Change link color
									fontStyle: "italic",
									textDecoration: "underline", // Underline the link
									cursor: "pointer", // Change cursor to pointer on hover
								}}
								onClick={openAddSubCategoryModal}
							>
								<ins>ADD NEW</ins>
							</MenuItem>
						</Select>
					</FormControl>
				</div>

				<div className="col-12 mb-2 pb-0">
					<Box
						component="form"
						sx={{
							"& .MuiTextField-root": { m: 0, width: "25ch" },
						}}
						noValidate
						autoComplete="off"
					>
						<TextField
							className="pb-0 mb-0 w-100"
							variant="outlined"
							//id="questiondescription"
							name="questiondescription"
							label="Question *"
							id="questiondescription"
							multiline
							maxRows={4}
							value={questiondescription}
							onChange={handlequesdescChange}
							inputProps={{ maxLength: 2000 }}
							InputProps={{
								endAdornment: questiondescription && (
								  <InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
									  {questiondescription?.length}/2000
									</Typography>
								  </InputAdornment>
								),
							  }}
							// error={
							//   formik.touched.questiondescription &&
							//   Boolean(formik.errors.questiondescription)
							// }
							// helperText={
							//   formik.touched.questiondescription &&
							//   formik.errors.questiondescription
							// }
						/>{" "}
						{/* <div style={{ fontSize: "0.8em", color: "blue" }}>
							{questiondescription.length}/2000
						</div> */}
						{formik.errors.questiondescription &&
							formik.touched.questiondescription && (
								<div className="error error-red" style={{ fontSize: "9px" }}>
									{formik.errors.questiondescription}
								</div>
							)}
					</Box>
				</div>
				<div className='col-12 col-md-12 mb-2 mt-2'>
                        <TextFieldCell
                            id="questionRequirement"
                            name="questionRequirement"
                            label="Your Requirement"
                            multiline
                            rows={2}
                            placeholder=''
                            value={questionRequirement}
							onChange={handlequesreqChange}
                            maxLength={200}
                            InputProps={{
								endAdornment: formik.values.questionRequirement && (
								  <InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
									  {formik.values.questionRequirement.length}/200
									</Typography>
								  </InputAdornment>
								),
							  }}
                            error={formik.touched.questionRequirement && Boolean(formik.errors.questionRequirement)}
                            helperText={formik.touched.questionRequirement && formik.errors.questionRequirement}
                        />
                    </div>


				<div className="row">
					<div className="col-12 col-lg-4">
					<FormControlLabel
						control={
							<Checkbox
								name="optiontype"
								id="optiontype"
								checked={optiontype} 
								onChange={(e) => {
									const isChecked = e.target.checked;
									setoptiontype(isChecked);
									if (isChecked) {
										setisMultipleChoice(false); 
									}
								}}
							/>
						}
						label="Multi choice"
					/>
					
					
				
					</div>
					<div className="col-12 col-lg-4">
					<FormControlLabel
						control={
							<Checkbox
								name="attachement"
								id="attachement"
								checked={attachement}
								onChange={(e) => {
									setattachement(e?.target?.checked);
								}}
							/>
						}
						label="Attachment"
					/>
						
					
				</div>
				<div className="col-12 col-lg-4">
					<FormControlLabel
						control={
							<Checkbox
								name="autoCalculated"
								id="autoCalculated"
								checked={autoCalculated}
								onChange={(e) => {
									setautoCalculated(e?.target?.checked);
								}}
							/>
						}
						label="Auto Calculated"
					/>
				</div>
					<div className="col-12 col-lg-4">
					<FormControlLabel
						control={
							<Checkbox
								name="isMultipleChoice"
								id="isMultipleChoice"
								checked={isMultipleChoice}
								onChange={(e) => {
									const isChecked = e.target.checked;
									setisMultipleChoice(isChecked);
									if (isChecked) {
										setoptiontype(false); // Set Option Type to true when Single Choice is checked
									}
								}}
							
							/>
						}
						label="Single Choice"
					/>

					</div>
					<div className="col-12 col-lg-4">
						<FormGroup className="">
							<FormControlLabel
								control={
									<Checkbox
										name="mandatory"
										id="mandatory"
										checked={mandatory} //{formik.values.mandatory}
										// onChange={formik.handleChange}
										onChange={(e) => {
											setmandatory(e?.target?.checked);
										}}
										//defaultChecked = {editRecordData?.mandatory!='' ? true : false}
									/>
								}
								label="Mandatory"
							/>
						</FormGroup>
					</div>
					<div className="col-12 col-lg-4">
						<FormGroup className="">
							<FormControlLabel
								control={
									<Checkbox
										name="isActive"
										id="isActive"
										checked={isActive}
										onChange={(e) => {
											setisActive(e?.target?.checked);
										}}
									/>
								}
								label="Active"
							/>
						</FormGroup>
					</div>
				</div>
				
				
				<div className="col-12 col-md-8 mt-2">
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
						className="col-12 col-md-8 mb-5 mt-6"
						style={{ color: "blue", fontStyle: "italic" }}
					>
						<div id="attachedFileName">
						
								 {attachedFileName?.length > 0 && (
								<div className="d-flex align-items-center justify-content-between mt-2">
									<Button
										variant="text"
										size="small"
										className="attached-file-name"
										onClick={handleDownload}
									>
										{displayAttachedName}
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
				<div className="col-12 text-end">
					{/* <hr /> */}
					<LoadingButton
						variant="text"
						color="primary"
						className="me-3 text-capitalize"
						size="small"
						onClick={clearedForm}
					>
						Reset
					</LoadingButton>
					{!loading ? (
						<Button
							
							color="primary"
							variant="outlined"
							size="small"
							type="submit"
						>
							Submit
						</Button>
					) : (
						<LoadingButton className="" loading variant="contained">
							Submit ...
						</LoadingButton>
					)}
				</div>
			</div>
			<Modal
				size="lg"
				show={modal}
				backdrop="static"
				keyboard={false}
				value={"Add NEW CATEGORY"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => CloseModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">
							Manage Category
						</div>
					</Modal.Title>
					<IconButton onClick={() => CloseModal()} size="small" edge="start">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddQuestionCategory
							selectedCat={PullCategoryFindAll}
							libraryid={libraryid}
						/>
					</div>
				</Modal.Body>
			</Modal>

			<Modal
				size="lg"
				show={subModal}
				backdrop="static"
				keyboard={false}
				value={"Add NEW SUB CATEGORY"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => CloseSubModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">
							Manage SubCategory
						</div>
					</Modal.Title>
					<IconButton onClick={() => CloseSubModal()} size="small" edge="start">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddQuestionSubCategory catId={catId} selectedSubCat={PullSubCategoryFindAll} />
					</div>
				</Modal.Body>
			</Modal>

			{/* Library added shivangi*/}
			<Modal
				size="lg"
				show={LibraryModal}
				backdrop="static"
				keyboard={false}
				value={"Add NEW Library"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => CloseLibraryModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">
							Manage Library
						</div>
					</Modal.Title>
					<IconButton
						onClick={() => CloseLibraryModal()}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddComLibrary
							selectedLib={PullLibraryAll}
							libraryType={libraryType}
						/>
					</div>
				</Modal.Body>
			</Modal>
		</form>
	);
};

export default AddUpdateQuestion;
