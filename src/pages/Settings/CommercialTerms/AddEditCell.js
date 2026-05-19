import React, { useCallback, useState, useEffect , useRef} from "react";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Drawer,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  FormGroup,
  Tooltip,
  InputAdornment,
  Typography,
  TextareaAutosize,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { HiOutlineX, HiPlusSm, HiX } from "react-icons/hi";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { Modal } from "react-bootstrap";
import * as yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { actionTypes, useStateValue } from "../../../store";
import { useFormik } from "formik";
import AddComLibrary from "./AddComLibrary";


import {
  saveCommercialList,
  updateCommercial,
  GetTablesColumns,
  getCommLibList,
  getMenuMaster,
  UOMMasterList
} from "../../../utils/commerciallibrary";
import { LibraryFindAll } from "../../../utils/questionlibrary/index.js";
import { fetchCurrency, fetchMasters } from "../../../utils/common/index.js";
import AddUpdateUom from "../../../utils/common/AddUpdateUom.js";
import { Delete, RemoveCircleOutline } from "@mui/icons-material";

const AddEditCell = ({ callbackstep, editRecordData ,pullCommercialList,handleReflectedComData,seteditRecordData}) => {
  const [libraryEntity, setlibraryEntity] = useState("");
  const [loading, setLoading] = useState(false);
  const [OpenUomModal, setOpenUomModal] = useState(false);
  // const CloseModalUom = () => setOpenUomModal(false);
  const CloseModalUom = () =>{
 

		setOpenUomModal(false)
		// //to set id of last library
		// const lastuom = UOMMaster[UOMMaster.length-1].id
		// if(!editRecordData){
		// 	setvaluetype(lastuom)
    //   formik.setFieldValue('valuetype', lastuom);
		// }
            
		
		
		console.log("UOMMaster",UOMMaster)
	};
  const [records, setRecords] = useState([]);
  const [libraryType, setlibraryType] = useState("CommercialLibrary");
  const addUserList = useCallback((passData) => {
    var dataMatch = records.map((t) => t.id);
    if (dataMatch.includes(passData?.id)) {
    } else {
      if (passData?.id > 0) {
        setRecords((records) => [...records, passData]);
      }
    }
  }, []);

  const callbackremoveitem = useCallback(
    (value) => {
      const list = [...records];
      var index = list.findIndex(function (o) {
        return o.id === value;
      });
      if (index !== -1) {
        list.splice(index, 1);
        setRecords(list);
      }
    },
    [records]
  );
  const [{ atoken, rtoken,customerid }, dispatch] = useStateValue();
  const [modal, setModal] = useState(false);
  const CloseModal = () => setModal(false);
  const OpenModal = () => setModal(true);
  const [isActive, setisActive] = useState(true);
  const [isGrandTotal, setisGrandTotal] = useState(false);
  
  const [name, setname] = useState("");
 
  const [libraryId, setlibraryId] = useState(0);
  const [libraryName, setlibraryName] = useState("");
  const [currencyType, setcurrencyType] = useState("");
  
 
  const [valuetype, setvaluetype] = useState("");
  const [isdefault, setisdefault] = useState(false);
  const [orderseq, setorderseq] = useState(0);
  const [level, setlevel] = useState("");
  const [commValue, setCommValue] = useState(0);
  const [formulavalue,setformulavalue] = useState("");
  const [tooltipMessage, setTooltipMessage] = useState("");

  const [LibraryModal, setLibraryModal] = useState(false);
  // const CloseLibraryModal = () => setLibraryModal(false);
  // const CloseLibraryModal = () =>{
	// 	setLibraryModal(false)
		
	// 	//to set id of last library
	// 	const lastlibid = AllLibraryList[AllLibraryList.length-1].id
	// 	if(!editRecordData){
	// 		setlibraryId(lastlibid)
	// 	}
            
		
		
	// 	console.log("AllLibraryList",AllLibraryList)
	// };



  const CloseLibraryModal = () => {
		setLibraryModal(false);
		
		// Set id of the last library
		const lastlibid = AllLibraryList[AllLibraryList.length - 1]?.id;
	
		if (!editRecordData && lastlibid) {
			const lastLibrary = AllLibraryList.find(library => library.id === lastlibid);
			
			if (lastLibrary) {
				setlibraryId(lastlibid);

				formik.setFieldValue('libraryId', lastlibid);
				formik.setFieldValue('libraryEntity', lastLibrary.libraryEntity);
				formik.setFieldValue('eventtype', lastLibrary.eventType);
				setlibraryEntity(lastLibrary.libraryEntity);
        pullgetCommLibList(lastlibid);
				seteventtype(lastLibrary.eventType);
			}
		}
	
		console.log("AllLibraryList", AllLibraryList);
	};
  const openAddLibraryModal = () => {
    setLibraryModal(true);
  };
  const [fieldName, setFieldName] = useState("");
  const[FormulaFieldName,setFormulaFieldName]= useState("");
  const [simpleOperator, setsimpleOperator] = useState("");
  useEffect(() => {
  
    if (editRecordData) {
      formik.setFieldValue("id", editRecordData?.id);
      prefilledCommercial();
    
    }
  }, []);
 
  
  useEffect(() => {
    pullMenuMaster();
    pullCurrencyMaster();
    pullUOMMasterList();
    PullLibraryAll();
    pullTablesColumns();
  }, []);
  const [eventtype, seteventtype] = useState("");
  const [resultColumnsData, setResultColumnsData] = useState([]);
  const pullTablesColumns = () => {
    var data = {
      customerid:customerid ,
      eventtype: eventtype,
    };
    setLoading(true);
    GetTablesColumns(data, atoken).then((res) => {
      setLoading(false);
      if (res?.length) {
        setResultColumnsData(res);
        return true;
      }
    });
  };

  const [isFormulaFieldDisabled, setIsFormulaFieldDisabled] = useState(false);
  const [resultCommLib, setResultCommLib] = useState([]); 

  const pullgetCommLibList = (libraryId) => {
    setLoading(true);
    getCommLibList({ LibraryId: libraryId?.toString() }, atoken)
      .then((res) => {      
        setLoading(false);
        if (res && res.length > 0) {
          setResultCommLib(res);
        }
        else
        {
          setResultCommLib([]);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching CommLibList:", error);
      });
  };

  const validationSchema = yup.object({
    libraryEntity: yup
    .string("select your library")
    .required("Please Select your library"),
      name: yup
      .string("Please Enter a Title")
      .required("Title is required"),
  
  });
  // const validationSchema = yup.object({
  //   libraryEntity: yup
  //     .string()
  //     .required("Please select your library"),
  //   name: yup
  //     .string()
  //     .required("Title is required"),
  //   commValue: yup
  //     .mixed()
  //     .test('exclusive-fields', 'Please fill either "Value" or "Formula", not both.', function(commValue) {
  //       const { formulavalue } = this.parent; 
  //       if ((commValue && formulavalue) || (!commValue && !formulavalue)) {
  //         toast.info('Please fill either "Value" or "Formula", not both.');
  //         return false; 
  //       }
  //       return true; 
  //     }),
  //   formulavalue: yup
  //     .mixed()
  //     .test('exclusive-fields', 'Please fill either "Value" or "Formula", not both.', function(formulaValue) {
  //       const { commValue } = this.parent; 
  //       if ((commValue && formulaValue) || (!commValue && !formulaValue)) {
  //         return false; 
  //       }
  //       return true; 
  //     })
  // });
  
  const [isFixedValueEnabled, setIsFixedValueEnabled] = useState(true);
const [isFormulaFieldEnabled, setIsFormulaFieldEnabled] = useState(true);
const [fieldNameGroup, setfieldNameGroup] = useState([]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: editRecordData?.id ? `${editRecordData?.id}` : 0,
      customerid: customerid,
      libraryEntity:editRecordData?.libraryEntity ? editRecordData?.libraryEntity : libraryEntity,
      libraryName: editRecordData?.libraryName
        ? editRecordData?.libraryName
        : libraryName,
      libraryId: editRecordData?.libraryId
        ? editRecordData?.libraryId
        : libraryId,
      name: editRecordData?.name ? `${editRecordData?.name}` : name,
      fieldName:editRecordData?.fieldName ? `${editRecordData?.fieldName}` : fieldName,
    eventtype  :editRecordData?.eventtype ?? eventtype,
    
      level: editRecordData?.level ? editRecordData?.level : level,
      commValue:  commValue,
      valuetype: editRecordData?.valuetype
        ? editRecordData?.valuetype
        : valuetype,
      isdefault: editRecordData?.isdefault ? editRecordData?.isdefault : true,
      formulavalue:  formulavalue,
      orderseq: 0,
      currencyType: editRecordData?.currencyType
      ? editRecordData?.currencyType
      : currencyType,
      isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
      isGrandTotal:editRecordData?.isGrandTotal ? editRecordData?.isGrandTotal : false,
      createdby: 1,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log(values)
      
      setLoading(true);

  
      // const eventtype = values?.eventtype;
      var data = {
        id: editRecordData?.id ? editRecordData?.id : 0,
        customerid: customerid,
        libraryName: libraryName,
        libraryId: libraryId,
        libraryEntity:libraryEntity,
        currencyType:currencyType,
        name: name,
        fieldName:fieldName,
        eventtype: values.eventtype,
        commValue: commValue,
        valuetype: valuetype,
        formulavalue: formulavalue ? formulavalue.replace(/\s+/g, ' ').trim() : '',
        isdefault: isdefault,
        isActive: isActive,
        isGrandTotal:isGrandTotal,
        orderseq: orderseq,
        createdby: 1,
      };

      //console.log("values", values);
      // api call to save data
      if (editRecordData?.id > 0) {
        updateCommercial(data, editRecordData?.id,FormulaFieldName, atoken).then((res) => {
          setLoading(false);
          dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
          dispatch({
            type: actionTypes.SET_MSGALERTDATA,
            value: res?.data?.message,
          });
          dispatch({ type: actionTypes.SET_MSGALERT, value: true });
          clearfilledCommercial();
          //pullCommercialList(values.libraryId);
          seteditRecordData(null);
          handleReflectedComData();
          toast.success("Commercial terms updated successfully!", {
           toastId: "commercial_terms_updated"
          });
          return true;
        });
      } else {
        saveCommercialList(values,FormulaFieldName, atoken).then((res) => {
          setLoading(false);
          dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
          dispatch({
            type: actionTypes.SET_MSGALERTDATA,
            value: res?.data?.message,
          });
          dispatch({ type: actionTypes.SET_MSGALERT, value: true });
          //callbackstep("add");
          clearfilledCommercial();
          handleReflectedComData();
          pullgetCommLibList(values.libraryId);
         // pullCommercialList(values.libraryId);
          toast.success("Commercial terms added successfully!", {
           toastId: "commercial_added"
          });
        

          return true;
        });
      }
    }, 
  });

  const prefilledCommercial = () => {
 
    formik.setFieldValue("id", editRecordData.id);
    setlibraryName(editRecordData?.libraryName);
    setlibraryEntity(editRecordData?.libraryEntity);
    setlibraryId(editRecordData?.libraryId);
    pullgetCommLibList(editRecordData?.libraryId);
    setname(editRecordData?.name);
    setcurrencyType(editRecordData?.currencyType);
    seteventtype(editRecordData?.eventtype);
    setisActive(editRecordData?.isActive);
    setisGrandTotal(editRecordData?.isGrandTotal);
    setisdefault(editRecordData?.isdefault);
    setvaluetype(editRecordData?.valuetype);
    setformulavalue(editRecordData?.formulavalue);
    setFieldName(editRecordData?.fieldName||"");
    setorderseq(editRecordData?.orderseq);
    setlevel(editRecordData?.level);
    setCommValue(editRecordData?.commValue);
    //to set
    
    // const fieldNameGroup=editRecordData?.fieldNameGroup ?editRecordData?.fieldNameGroup.split(","):[];
    // setFormulaFieldName(fieldNameGroup)

      const group = editRecordData?.fieldNameGroup
    ? editRecordData.fieldNameGroup.split(",")
    : [];

  setFormulaFieldName(group);
  setfieldNameGroup(group);
    
  };
  const clearfilledCommercial = () => {
    formik.setFieldValue("id", 0);
   // setlibraryName("");
    //setlibraryEntity("");
   // setlibraryId(0);
    setname("");
   // seteventtype("");
    //setisActive(false);
    setvaluetype("");
    setisdefault(false);
    setFieldName("")
    setformulavalue("");
    setorderseq(0);
    setlevel("");
    setCommValue(0)
    setisGrandTotal(false);
    // formik.setFieldValue("isactive", editRecordData.isactive);
    // formik.setFieldValue("required", editRecordData.required);
  };

  //LIBRARY LIST
  const [AllLibraryList, setLibraryList] = useState([]);
  const PullLibraryAll = () => {
    var data = {
      CustomerId: customerid,
      LibraryType:'CommercialLibrary',
      IsActive:true
     
    };
    LibraryFindAll(data,atoken).then((res) => {
      setLibraryList(res);
    });
  };

  const handleLibraryChange = (e) => {
    
    const selectedValue = e?.target?.value; 
    if (selectedValue === "Add NEW Library") {
        openAddLibraryModal();
    } 
    else {
      setFormulaFieldName([]);
      setformulavalue(''); // Clear the formula field value
      setSelectedOperator(null); 
      formik?.setFieldValue(
        "libraryEntity",
        selectedValue
      );
        pullgetCommLibList(selectedValue);
        const selectedLibrary = AllLibraryList?.find(library => library?.id === selectedValue);
        const eventtypeLib = selectedLibrary ? selectedLibrary.eventType : '';
        setlibraryId(selectedValue);
        if (selectedLibrary) {
            setlibraryEntity(selectedLibrary?.libraryEntity);
            formik.setFieldValue('eventtype', eventtypeLib);
            seteventtype(eventtypeLib);
            console.log("Setting eventtype to:", eventtypeLib);
        }
    }
}




const [UOMMaster, setUOMMaster] = useState([]);
const pullUOMMasterList = () => {
  var data = {
    CustomerId:customerid,
    IsActive: true
   
  };

  UOMMasterList(data, atoken).then((res) => {
    console.log('uom ',res);
    setUOMMaster(res);
  });
};
const handleUomList=(array)=>{


 setUOMMaster(array);
//  if (array.length > 0) {
//   setvaluetype(array[array.length - 1].id); // Set the ID of the last UOM 
// } else {
//   setvaluetype(null); // Reset if the array is empty
// }
  }

  const [MenuMasterList, setMenuMasterList] = useState([]);
  const pullMenuMaster = () => {
    var data = {
      MenuType: "Event",
    };

    getMenuMaster(data, atoken).then((res) => {
    setMenuMasterList(res);
    });
  };
  const onchangeEventType = (event, newValue) => {
    seteventtype(event.target.value);
  };

  const [CurrencyList, setCurrencyList] = useState([]);
  const pullCurrencyMaster = () => {
  

    fetchCurrency(atoken).then((res) => {
 
      setCurrencyList(res);
    });
  };


  const [lastOperator, setLastOperator] = useState(""); // Track the last operator

  const [selectedField, setSelectedField] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  // const handleFieldSelect = (field) => {
    
  //   console.log(FormulaFieldName)
  //   const selectedField = field || '';

  //   if (!selectedField) {
  //     // Reset if no field is selected
  //     setformulavalue('');
  //     setFormulaFieldName([]);
  //     return;
  //   }

  //   if (simpleOperator) {
  //     setFormulaFieldName((prevFieldNames) => [...prevFieldNames, selectedField]);
  //     setformulavalue((prevFormulaValue) => {
  //       const lastChar = prevFormulaValue.trim().slice(-1);
  //       return ["+", "-", "*", "/", "{", "}", "<", ">", "<=", ">=", "%", "(", ")"].includes(lastChar)
  //         ? `${prevFormulaValue} ${selectedField}`
  //         : `${prevFormulaValue} ${simpleOperator} ${selectedField}`;
  //     });
  //   } else {
  //     setFormulaFieldName([selectedField]);
  //     setformulavalue(selectedField);
  //   }
  //   setIsFixedValueEnabled(false);
  // };
  const handleFieldSelect = (field) => {
    const selectedField = field || '';
 
    if (!selectedField) {
        // Reset if no field is selected
        setformulavalue('');
        setFormulaFieldName([]);
        return;
    }
 
    // Track the field in state
    if (formulavalue) {
        setFormulaFieldName((prevFieldNames) => [...prevFieldNames, selectedField]);
    } else {
        setFormulaFieldName([selectedField]);
    }
 
    // Get current cursor position and text
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const value = textarea.value;
 
    // Split text at cursor position
    const beforeCursor = value.substring(0, cursorPos).trim();
    const afterCursor = value.substring(cursorPos).trim();
 
    // Get surrounding characters
    const lastCharBeforeCursor = beforeCursor.slice(-1);
    const firstCharAfterCursor = afterCursor.charAt(0);
 
    // Define characters that require spacing
    const operatorsBefore = ['+', '-', '*', '/', '%', '(', '{', '=', '<', '>', ''];
    const operatorsAfter = [')', '}', '+', '-', '*', '/', '%', '=', '<', '>', ''];
 
    // Build the new value with minimal spacing
    let newValue;
    if (!beforeCursor) {
        // If inserting at the start
        newValue = `${selectedField}${afterCursor ? ' ' + afterCursor : ''}`;
    } else if (!afterCursor) {
        // If inserting at the end
        newValue = `${beforeCursor}${operatorsBefore.includes(lastCharBeforeCursor) ? '' : ' '}${selectedField}`;
    } else {
        // If inserting between text
        const needSpaceBefore = !operatorsBefore.includes(lastCharBeforeCursor);
        const needSpaceAfter = !operatorsAfter.includes(firstCharAfterCursor);
       
        newValue = `${beforeCursor}${needSpaceBefore ? ' ' : ''}${selectedField}${needSpaceAfter ? ' ' : ''}${afterCursor}`;
    }
 
    setformulavalue(newValue.trim());
 
    // Calculate new cursor position after the field
    const newCursorPos = beforeCursor.length + selectedField.length + (beforeCursor ? 1 : 0);
   
    // Set cursor position after render
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
 
    setIsFixedValueEnabled(false);
};
 

  // const handleOperatorSelect = (operator) => {
  //   setsimpleOperator(operator);
  
  //   setformulavalue((prevFormulaValue) => {
  //     const trimmedFormula = prevFormulaValue.trim();
  //     const lastChar = trimmedFormula.slice(-1);
  //     return ["+", "-", "*", "/", "=", "{", "}", "<", ">", "<=", ">=", "%", "(", ")"].includes(lastChar)
  //       ? trimmedFormula.replace(/[\+\-\*\/\=\{\}\<\>\(\)\<\=\>\=]$/, ` ${operator}`)
  //       : `${prevFormulaValue} ${operator}`;
  //   });
  //   setSelectedOperator(operator);
  // };
//   const handleOperatorSelect = (operator) => {
//     setsimpleOperator(operator);

//     setformulavalue((prevFormulaValue) => {
//         const trimmedFormula = prevFormulaValue.trim();
//         const lastChar = trimmedFormula.slice(-1);
        
//         // Allowed characters after which an operator can be added
//         const allowedAfter = [')', '}', '+', '-', '*', '/','%', '='];

//         return allowedAfter.includes(lastChar)
//             ? `${trimmedFormula} ${operator}` // Just append if the last char is allowed
//             : `${prevFormulaValue} ${operator}`; // Otherwise, append normally
//     });
    
//     setSelectedOperator(operator);
// };
const handleOperatorSelect = (operator) => {
  if (operator === "None") {
      setsimpleOperator(null);  
      setSelectedOperator(null);
      setformulavalue((prevFormulaValue) => prevFormulaValue.trim());
      return;
  }
 
  setsimpleOperator(operator);
  setSelectedOperator(operator);
 
  // Get the current textarea value and cursor position
  const textarea = textareaRef.current;
  const cursorPos = textarea.selectionStart;
  const value = textarea.value;
 
  // Split text at cursor position
  const beforeCursor = value.substring(0, cursorPos);
  const afterCursor = value.substring(cursorPos);
 
  // Get last character before cursor and first character after cursor
  const lastCharBeforeCursor = beforeCursor.trim().slice(-1);
  const firstCharAfterCursor = afterCursor.trim().charAt(0);
 
  // Define allowed characters before and after operators
  const allowedBefore = [')', '}', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '_'];
  const allowedAfter = ['(', '{', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '_'];
 
  // Build the new value with minimal spacing
  let newValue;
  if (beforeCursor.trim() === '') {
    // If inserting at the start, don't add space before
    newValue = `${operator}${afterCursor.trim()}`;
  } else if (afterCursor.trim() === '') {
    // If inserting at the end, don't add space after
    newValue = `${beforeCursor.trim()}${operator}`;
  } else {
    // If inserting between characters
    const needSpaceBefore = !['(', '{'].includes(operator) && allowedBefore.includes(lastCharBeforeCursor);
    const needSpaceAfter = ![')', '}'].includes(operator) && allowedAfter.includes(firstCharAfterCursor);
   
    newValue = `${beforeCursor.trim()}${needSpaceBefore ? ' ' : ''}${operator}${needSpaceAfter ? ' ' : ''}${afterCursor.trim()}`;
  }
 
  setformulavalue(newValue.trim());
 
  // Calculate new cursor position after the operator
  const newCursorPos = beforeCursor.length + operator.length;
 
  // Set cursor position after render
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);
};
 

const handleTextareaChange = (e) => {
    // Normalize spaces and trim: replace multiple spaces with single space and trim ends
    const normalizedValue = e.target.value.replace(/\s+/g, ' ').trim();
    setformulavalue(normalizedValue);
    setCursorPosition(e.target.selectionStart);
  };

  const handleFormulaFieds = (e) => {
    const selectedField = e?.target?.value || "";

    if (!selectedField) {
     
        setformulavalue("");
        setFormulaFieldName([]);
        setLastOperator(""); // Clear last operator
        return;
    }

    // If there's an operator, append the field with the operator
    if (simpleOperator) {
      setFormulaFieldName((prevFieldNames) => [...prevFieldNames, selectedField]);
        setformulavalue((prevFormulaValue) => {
            // Check if the formula already has an operator
            const lastChar = prevFormulaValue.trim().slice(-1);

            // Append field with operator if last character is not an operator
            if (["+", "-", "*", "/",'%', "{", "}", "<", ">", "<=", ">=", "%", "(", ")"].includes(lastChar)) {
                return `${prevFormulaValue} ${selectedField}`;
            } else {
                return `${prevFormulaValue} ${simpleOperator} ${selectedField}`;
            }
        });
        setLastOperator(""); 
    } else {
        // No operator; just set the field
        setFormulaFieldName([selectedField]);
        setformulavalue(selectedField);
    }
};




const handleOperatorChange = (event) => {
  const selectedOperator = event?.target?.value;
  
  // Update state with the selected operator
  setsimpleOperator(selectedOperator);

};
  const handleCommValueChange = (e) => {
    let newValue = e.target.value;
    newValue = newValue.replace(/[^0-9.]/g, '');
    const decimalCount = (newValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }
    setCommValue(newValue);
    if (newValue) {
      setIsFormulaFieldEnabled(false);
    } else {
      setIsFormulaFieldEnabled(true);
    }
  };
  

  // const handleClear = () => {
  //   setFormulaFieldName([]);
  //     setformulavalue('');
  //     setIsFixedValueEnabled(true);
  // };
  const handleClear = () => {
    setFormulaFieldName([]);
   
    setfieldNameGroup([]);
    setformulavalue('');
    setIsFixedValueEnabled(true);
    setSelectedOperator(''); // Clear the selected operator
    setsimpleOperator(''); // Clear the simple operator if applicable
  };
  
  const updateSelectedUom = (newUom) => {
    setvaluetype(newUom);
    setOpenUomModal(false); // Close modal after adding
  };

const handleUomChange = (e) => {
  
  const selectedValue = e.target.value;

  if (selectedValue === "new") {
    setOpenUomModal(true);

    setvaluetype(null); 
  } else {
    const selectedOption = UOMMaster.find(option => option?.uom === selectedValue);
    setvaluetype(selectedOption?.id); 
    setvaluetype(selectedValue); 
   
  }
};
const handleNewUomAdded = (newUom) => {
  setvaluetype(newUom.id); // Update the valuetype to the new UOM's id
};
const handleNameChange = (e) => {
  const newName = e.target.value;
  setname(newName);
  
  // Replace spaces with underscores and remove special characters
  const formattedFieldName = newName
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, '') // Remove special characters
    .toLowerCase(); // Convert to lowercase
  
  setFieldName(formattedFieldName);
};



  return (
    <>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <div className="row mt-2">
          <div className="col-12 col-md-12 mb-4">
            <FormControl fullWidth>
              <InputLabel id="libraryId">Library *</InputLabel>

              <Select
                labelId="event"
                InputLabelProps={{
                  shrink: true,
                }}
                label="Library *"
                variant="outlined"
                size="small"
                id="libraryId"
                name="libraryId"
                value={libraryId}
                onChange={handleLibraryChange}
              >
                {AllLibraryList?.map((option, i) => (
                  <MenuItem key={i} value={option?.id}>
                    {/* {option?.libraryEntity} */}
                    {`${option?.libraryEntity} - ${option?.eventType}`}
                  </MenuItem>
                ))}

                <MenuItem
                  value={"Add NEW Library"}
                  className="bggray"
                  style={{
                    color: "blue", // Change link color
                    fontStyle: "italic",
                    fontSize: "12px",
                    textDecoration: "underline", // Underline the link
                    cursor: "pointer", // Change cursor to pointer on hover
                  }}
                >
                  <ins>ADD NEW</ins>
                </MenuItem>
              </Select>
              {formik?.errors?.libraryEntity && formik?.touched?.libraryEntity && (
      <div className="error error-red" style={{ fontSize: "9px" }}>
        {formik?.errors?.libraryEntity}
      </div>
    )}
            </FormControl>
          </div>
          <div className="col-12 col-md-6 mb-4">
            <TextFieldCell
              id="name"
              name="name"
              label="Title *"
              value={name}
              maxLength={100} 
              onChange={handleNameChange}
              inputProps={{ maxLength: 100 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary">
                    {name?.length}/100
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
                {formik.errors.name && formik.touched.name && (
          <div className="error error-red"style={{ fontSize: '9px' }}>
            {formik.errors.name}
           </div>
        )} 
          </div>
          <div className="col-12 col-md-6 mb-4">
        <TextField
          id="fieldName"
          size="small"
          name="fieldName"
          label="Field Name"
          value={fieldName}
          maxLength={100}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="body2" color="textSecondary">
                  {fieldName.length}/100
                </Typography>
              </InputAdornment>
            ),
          }}
          variant="outlined"
          fullWidth
        />
        {formik.errors.fieldName && formik.touched.fieldName && (
          <div className="error error-red" style={{ fontSize: '9px' }}>
            {formik.errors.fieldName}
          </div>
        )}
      </div>
          <div className="col-12 col-md-6 mb-3">
            <FormControl fullWidth>
              <InputLabel id="valueType">UOM </InputLabel> 
              <Select
                labelId="event"
                InputLabelProps={{
                  shrink: true,
                }}
                label="Type *"
                variant="outlined"
                size="small"
                id="valuetype"
                name="valuetype"
                //value={UOMMaster.find(option => option.id === valuetype)?.uom || ""}
                value={valuetype}
                // onChange={(e) => {
                //   setvaluetype(e?.target?.value);
                // }}
                onChange={handleUomChange}
              >
             
                {UOMMaster?.map((option, i) => (
                  <MenuItem key={i} value={option?.uom}>
                    {option?.uom}
                  </MenuItem>
                ))}
                 <MenuItem
                  value={"new"}
                  className="bggray"
                  style={{
                    color: "blue",
                    fontSize: "13PX",
                    fontStyle: "italic",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
               
                >
                  <ins>ADD NEW</ins>
                </MenuItem>
              </Select>
         
            </FormControl>
          </div>
<div className="col-12 col-md-6 mb-4">
        <TextFieldCell
          id="commValue"
          name="commValue"
          label="Fixed Value"
          placeholder=""
          value={commValue}  
          // onChange={(e) => {
          //   setCommValue(e?.target?.value);
          // }}
          onChange={handleCommValueChange}
          disabled={!isFixedValueEnabled}
          
        /> 

      </div>
      <div className="row me-0 pe-0">
        <div className="col-md-9">
        <div className="custom-select">
       
        <div className="options" style={{ maxHeight: '100px', height: "100px", overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '5px' }}>
  <div className="f14 fw500">Select Formula Field</div>

  {resultCommLib?.filter(option => option?.fieldName !== fieldName)
    .map((option, i) => (
      <Tooltip 
        title={tooltipMessage} 
        arrow
        key={i}
      >
        {/* <div
          onClick={() => handleFieldSelect(option.fieldName)}
          className={`option-item ${FormulaFieldName.includes(option.fieldName) ? 'selected' : ''}`}
        > */}
                  <div
          onClick={() => isFormulaFieldEnabled && handleFieldSelect(option.fieldName)} // Only allow if enabled
          className={`option-item ${FormulaFieldName.includes(option.fieldName) ? 'selected' : ''} ${!isFormulaFieldEnabled ? 'disabled' : ''}`} // Add disabled class
        >

          {option.fieldName}
        </div>
      </Tooltip>
    ))}

  {/* Show Price option regardless of condition */}
  {/* <div onClick={() => handleFieldSelect('Price')} className="option-item">Price</div> */}
  {/* <div onClick={() => isFormulaFieldEnabled && handleFieldSelect('Price')} className={`option-item ${!isFormulaFieldEnabled ? 'disabled' : ''}`}>Price</div> */}
</div>

       </div>
       </div>
             <div className="col-md-3 me-0 pe-0  mb-4">
      <div className="custom-select">
    
        <div className="options" style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '5px' }}>
          <div className="f14 fw500">Select Operator</div>
          {['None','+', '-', '*', '/','%', '=', '{', '}', '<', '>', '<=', '>=', '(', ')'].map((operator, index) => (
            <div
              key={index}
              onClick={() => handleOperatorSelect(operator)}
              className={`option-item ${selectedOperator === operator ? 'selected' : ''}`}
            >
              {operator}
            </div>
          ))}
        </div>
      </div>

             </div>

      <div className="textarea-container position-relative me-0 pe-0">
        <TextareaAutosize
          ref={textareaRef}
          minRows={4}
          id="formulavalue"
          name="formulavalue"
          placeholder="Formula Editor"
          className="w-100 formulaEditor"
          value={formulavalue}
          onChange={handleTextareaChange}
          onSelect={(e) => setCursorPosition(e.target.selectionStart)}
        />
        {formulavalue && (
          <IconButton
            className="position-absolute top-0 end-0"
            onClick={handleClear}
            aria-label="Clear"
          >
            <Delete className="f17 text-danger" />
          </IconButton>
        )}
      </div>
    </div>

          <div className="col-12 mb-2">
            <FormGroup className="d-flex flex-row">
              <FormControlLabel
                control={
                  <Checkbox
                    name="isActive"
                    id="isActive"
                    checked={isActive} //{formik.values.isactive}
                    onChange={(e) => {
                      setisActive(e?.target?.checked);
                    }}
                  />
                }
                label="Active"
              />
                {/* <FormControlLabel
                control={
                  <Checkbox
                    name="isGrandTotal"
                    id="isGrandTotal"
                    checked={isGrandTotal} 
                    onChange={(e) => {
                      setisGrandTotal(e?.target?.checked);
                    }}
                  />
                }
                label="Grand Total"
              /> */}
            </FormGroup>
       
        
            
       
          </div>
         
          <div className="col-12 text-end">
            <LoadingButton
              variant="text"
              color="primary"
              className="me-3 text-capitalize"
              size="small"
              onClick={clearfilledCommercial}
            >
              Reset
            </LoadingButton>
            <LoadingButton
              // loading
              loading={loading}
              type="submit"
              variant="outlined"
              // onClick={() => router.push(`/sdsdsd/${actibeModuleID}`)}
              color="primary"
              className="text-capitalize"
              size="small"
            >
              Submit
            </LoadingButton>
          </div>
        </div>
        <Modal
            size="lg"
            show={OpenUomModal}
            backdrop="static"
            keyboard={false}
            value={"Add NEW CATEGORY"}
            className="zindex1280"
            backdropClassName="zindex1280"
            centered
            contentClassName="border-0"
            onHide={() => CloseModalUom()}
          >
            <Modal.Header className="pt-2 pb-2 bgheaderCards">
              <Modal.Title id="modal-heading">
                <div className="d-flex align-items-center f14 text-white">
                  Manage  UOM 
                </div>
              </Modal.Title>
              <IconButton
                onClick={() => CloseModalUom()}
                size="small"
                edge="start"
              >
                <HiOutlineX className="f20 text-white" />
              </IconButton>
            </Modal.Header>
            <Modal.Body className="p-0">
              <div className="p-3">
                
                <AddUpdateUom handleUomList={handleUomList} />
              </div>
            </Modal.Body>
          </Modal>
      </form>

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
            <AddComLibrary selectedLib={PullLibraryAll} libraryType={libraryType}  />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddEditCell;
