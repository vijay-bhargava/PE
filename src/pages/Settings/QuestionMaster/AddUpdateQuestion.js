import React, { useState, useEffect, useRef } from "react";
import {
	Checkbox,
	FormControlLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
	InputAdornment,
} from "@mui/material";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import AddQuestionCategory from "./AddQuestionCategory";
import AddQuestionSubCategory from "./AddQuestionSubCategory";
import PEModal from "../../../components/PEModal";
import "../../../assets/css/base.css";
import "../../../assets/css/design-system.css";
import "../../../assets/css/rfq-detail-v2.css";
import {
	HiOutlineX,
	HiDownload,
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
	pullQuestionList, setquestionunsavedChanges, handleReflectedData
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
			questionSubCategory: editRecordData?.questionSubCategory
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
			eventType: editRecordData?.eventType ?? eventType,
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
					toastId: "descques"
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
				questionSubCategory: questionSubCategory,
				questiondescription: questiondescription,
				questionRequirement: questionRequirement,
				eventType: values.eventType,
				attachedFileName: attachedFileName,
				weightage: weightage,
				purchaseorggrp: inputOrgGrpList,
				attachement: attachement == undefined ? 0 : attachement,
				autoCalculated: autoCalculated,
				optiontype: (optiontype || isMultipleChoice) ? true : false,
				isMultipleChoice: isMultipleChoice ? false : true,

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
							questionRequirement: questionRequirement,
							eventType: eventType,
							attachedFileName: filepathreturn
								? filepathreturn
								: attachedFileName,
							//filepath:
							weightage: weightage,
							purchaseorggrp: inputOrgGrpList, //?.map(t => t.id).toString(),  // values?.purchaseorg,
							attachement: attachement == undefined ? 0 : attachement,
							autoCalculated: autoCalculated,
							optiontype: (optiontype || isMultipleChoice) ? true : false,
							isMultipleChoice: isMultipleChoice ? false : true,
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
							questionSubCategory: questionSubCategory,
							questiondescription: questiondescription,
							questionRequirement: questionRequirement,
							eventType: eventType,

							attachedFileName: filepathreturn
								? filepathreturn
								: attachedFileName,
							weightage: weightage,
							purchaseorggrp: inputOrgGrpList, //?.map(t => t.id).toString(),  // values?.purchaseorg,
							attachement: attachement == undefined ? 0 : attachement,
							autoCalculated: autoCalculated,
							optiontype: (optiontype || isMultipleChoice) ? true : false,
							isMultipleChoice: isMultipleChoice ? false : true,
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
		if (editRecordData?.optionType && editRecordData?.isMultipleChoice) {
			setoptiontype(true);
		}

		else if (editRecordData?.optionType && !editRecordData?.isMultipleChoice) {
			setisMultipleChoice(true);
		}
		else {
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
			else {
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
		<>
			<form id="add-question-form" onSubmit={formik.handleSubmit} autoComplete="off">
				<div className="row g-3">

					{/* Library */}
					<div className="col-12 col-md-6">
						<label className="pe-field-label">Library <span className="rfq-required-star">*</span></label>
						<Select
							fullWidth
							variant="outlined"
							size="small"
							id="libraryid"
							name="libraryid"
							value={libraryid}
							onChange={handleLibraryEntityChange}
							className="f13"
						>
							<MenuItem value={"Add NEW Library"} className="dropdown-add-new f13">
								ADD NEW
							</MenuItem>
							{AllLibraryList?.map((option, i) => (
								<MenuItem key={i} value={option?.id} className="f13">
									{`${option?.libraryEntity} - ${option?.eventType}`}
								</MenuItem>
							))}
						</Select>
						{formik.errors.libraryEntity && formik.touched.libraryEntity && (
							<div className="f11" style={{ color: 'var(--pe-danger)' }}>{formik.errors.libraryEntity}</div>
						)}
					</div>

					{/* Weightage */}
					<div className="col-12 col-md-6">
						<label className="pe-field-label">Question Weightage (%)</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							id="weightage"
							name="weightage"
							className="f13"
							inputProps={{ maxLength: 5 }}
							value={weightage}
							onInput={(e) => onlyNumberwithdecimal(e)}
							onChange={(e) => {
								const newValue = onlyNumberwithdecimal(e);
								if (newValue !== undefined) setweightage(newValue);
							}}
						/>
					</div>

					{/* Category */}
					<div className="col-12 col-md-6">
						<label className="pe-field-label">Category</label>
						<Select
							fullWidth
							variant="outlined"
							size="small"
							id="questioncategoryid"
							name="questioncategoryid"
							value={catId}
							onChange={handleCategoryChange}
							className="f13"
						>
							<MenuItem value={"new"} className="dropdown-add-new f13" onClick={openAddCategoryModal}>
								ADD NEW
							</MenuItem>
							{catList?.map((option, i) => (
								<MenuItem key={i} value={option?.id} className="f13">{option?.questioncategory}</MenuItem>
							))}
						</Select>
					</div>

					{/* Sub Category */}
					<div className="col-12 col-md-6">
						<label className="pe-field-label">Sub Category</label>
						<Select
							fullWidth
							variant="outlined"
							size="small"
							id="questionsubcategoryid"
							name="questionsubcategoryid"
							value={subCatId}
							onChange={handleSubCatChange}
							className="f13"
						>
							<MenuItem value={"new"} className="dropdown-add-new f13" onClick={openAddSubCategoryModal}>
								ADD NEW
							</MenuItem>
							{subCatList?.map((option, i) => (
								<MenuItem key={i} value={option?.id} className="f13">{option?.questionsubcategory}</MenuItem>
							))}
						</Select>
					</div>

					{/* Question */}
					<div className="col-12 col-md-6">
						<label className="pe-field-label">Question <span className="rfq-required-star">*</span></label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							id="questiondescription"
							name="questiondescription"
							multiline
							minRows={2}
							maxRows={4}
							className="f13"
							value={questiondescription}
							onChange={handlequesdescChange}
							inputProps={{ maxLength: 2000 }}
							InputProps={{
								endAdornment: questiondescription && (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary" style={{ fontSize: 11 }}>
											{questiondescription?.length}/2000
										</Typography>
									</InputAdornment>
								),
							}}
						/>
						{formik.errors.questiondescription && formik.touched.questiondescription && (
							<div className="f11" style={{ color: 'var(--pe-danger)' }}>{formik.errors.questiondescription}</div>
						)}
					</div>

					{/* Your Requirement */}
					<div className="col-12 col-md-6">
						<label className="pe-field-label">Your Requirement</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							id="questionRequirement"
							name="questionRequirement"
							multiline
							rows={2}
							className="f13"
							value={questionRequirement}
							onChange={handlequesreqChange}
							inputProps={{ maxLength: 200 }}
							InputProps={{
								endAdornment: questionRequirement && (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary" style={{ fontSize: 11 }}>
											{questionRequirement?.length}/200
										</Typography>
									</InputAdornment>
								),
							}}
						/>
					</div>

					{/* Checkboxes */}
					<div className="col-12">
						<div className="d-flex flex-wrap" style={{ gap: '4px 24px' }}>
							{[
								{ label: 'Multi Choice', checked: optiontype, onChange: (e) => { setoptiontype(e.target.checked); if (e.target.checked) setisMultipleChoice(false); } },
								{ label: 'Single Choice', checked: isMultipleChoice, onChange: (e) => { setisMultipleChoice(e.target.checked); if (e.target.checked) setoptiontype(false); } },
								{ label: 'Attachment', checked: attachement, onChange: (e) => setattachement(e.target.checked) },
								{ label: 'Mandatory', checked: mandatory, onChange: (e) => setmandatory(e.target.checked) },
								{ label: 'Auto Calculated', checked: autoCalculated, onChange: (e) => setautoCalculated(e.target.checked) },
								{ label: 'Active', checked: isActive, onChange: (e) => setisActive(e.target.checked) },
							].map(({ label, checked, onChange }) => (
								<FormControlLabel
									key={label}
									label={<span className="f13" style={{ color: 'var(--pe-text)' }}>{label}</span>}
									control={<Checkbox size="small" checked={checked} onChange={onChange} />}
									style={{ margin: 0 }}
								/>
							))}
						</div>
					</div>

					{/* File attachment */}
					<div className="col-12">
						<label className="pe-field-label">Attachment</label>
						<input
							type="file"
							className="f13"
							accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							onChange={handleFileChange}
							ref={fileInputRef}
							style={{
								display: 'block', width: '100%', padding: '5px 8px',
								border: '1px solid #d1d5db', borderRadius: 6,
								fontSize: 13, color: 'var(--pe-text)', background: '#fff',
							}}
						/>
						{attachedFileName?.length > 0 && (
							<div className="d-flex align-items-center gap-2 mt-2">
								<button type="button" className="pe-btn pe-btn--ghost" style={{ fontSize: 12, padding: '2px 8px' }} onClick={handleDownload}>
									<HiDownload style={{ fontSize: 13 }} /> {displayAttachedName}
								</button>
								<button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={handleRemoveattachmentClick}>
									<HiOutlineX />
								</button>
							</div>
						)}
					</div>

				</div>
			</form>

			{/* Manage Category Modal */}
			<PEModal
				open={modal} onClose={CloseModal}
				title="Manage Category" size="lg"
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
			>
				<AddQuestionCategory selectedCat={PullCategoryFindAll} libraryid={libraryid} />
			</PEModal>

			{/* Manage Sub Category Modal */}
			<PEModal open={subModal}
				onClose={CloseSubModal} title="Manage Sub Category"
				size="lg" bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
			>
				<AddQuestionSubCategory catId={catId} selectedSubCat={PullSubCategoryFindAll} />
			</PEModal>

			{/* Manage Library Modal */}
			<PEModal open={LibraryModal}
				onClose={CloseLibraryModal}
				title="Manage Library" size="lg"
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
			>
				<AddComLibrary selectedLib={PullLibraryAll} libraryType={libraryType} />
			</PEModal>
		</>
	);
};

export default AddUpdateQuestion;
