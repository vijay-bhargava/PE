import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,FormHelperText,
  MenuItem,
  Select,
  TextField,
  Autocomplete,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Modal } from "react-bootstrap";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import { Form } from "react-bootstrap";
//import AddQuestionSubCategory from "./AddQuestionSubCategory";
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
import { AddUser,FindUser,UpdateUser, getUserRoles,} from "../../../utils/users";
import { OrgGroupMasterList, filteroptionDialingCode, formatDate, getBusinessUnitList, getCurrentDateonFormat, getCurrentTimeonFormat, getPurchaseOrgList, getUserDepartment, getUserDepartmentList, getUserDesignation } from "../../../utils/common/utility"; 
import { getPurchaseGrp } from "../../../utils/workflow";  
import AddComLibrary from "../CommercialTerms/AddComLibrary";
import {  uploadFilesOnAzure,} from "../../../utils/documentlibrary";
import { downloadFilesOnAzure, findObjByValueFromArray, getCountry, getTimeZone, removeNonNumeric, removeSpecialCharactersAndNumbers } from "../../../utils/common";
import PurchaseOrgGrp from "../../../utils/common/PurchaseOrgGrp";

import AddUpdateRole from "../RoleManagement/AddUpdateRole";
import AddDepartment from "./AddDepartment";
import AddDesignation from "./AddDesignation";
import PurchaseOrg from "../../../utils/common/PurchaseOrg";
import AddLegalEntity from "../../../utils/common/AddLegalEntity";
import { AddBusiness } from "@mui/icons-material";
import AddBusinessUnit from "../../../utils/common/AddBusinessUnit";
import { api, ApiClient } from "../../../Apiclient";


const AddUpdateUser = ({
  callbackstep,   
  editRecordData,RoleList,handleRoleList,setUserUnsavedChanges
}) => {
  const [{ atoken, rtoken ,customerid,customersuffix,usertimezone,userdialingcode,userDetail}, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [loading, setLoading] = useState(false);  
  const [groupLoading, setGroupLoading] = useState(false);  
  const [subCatList, setSubCatlist] = useState([]);
  const [questionCategory, SetquestionCategory] = useState("");
  const [managerId, SetmanagerId] = useState(0);
  const [inputOrgGrpList, setinputOrgGrpList] = useState([]);
  const [displayAttachedName, setdisplayAttachedName] = useState("");
  const [attachedFileName, setattachedFileName] = useState(null);
  const [name, setname] = useState("");
  const [managerName, setManagerName] = useState("");
  const [designation, setdesignation] = useState("");
  const [designationId, setdesignationId] = useState(0);
  const [departmentName, setdepartmentName] = useState("");
  const [departmentId, setdepartmentId] = useState(0);
  const [roleId, setroleId] = useState(0);
  const [roleName, setroleName] = useState("");
  const [email, setemail] = useState("");
  const [phoneNumber, setphoneNumber] = useState("");
  const [dialingCode, setDialingCode] = useState(userdialingcode);
  const [isActive, setisActive] = useState(true);
  const [orgId, setorgId] = useState();
  const [orgName, setorgName] = useState("");
  const [purchaseOrgGrpModal, setPurchaseOrgGrpModal] = useState(false);
  const [RoleModal, setRoleModal] = useState(false);
  const [DeapartmentModal, setDepartmentModal] = useState(false);
  const [DesignationModal, setDesignationModal] = useState(false);
  const [LegalEntityModal, setLegalEntityModal] = useState(false);
  const [BusinessModal, setBusinessModal] = useState(false);
  const [timeZone, setTimeZone] = useState(null); 
  const [legalId, setlegalId] = useState(0);
  const [legalEntityList, setlegalEntityList] = useState([]);
  const [legalEntity, setlegalEntity] = useState("");

  const [group, setgroup] = useState([]);
  const [userOrgGroup, setuserOrgGroup] = useState([]);
  const [userOrgGroups, setuserOrgGroups] = useState([]);
 
  const ClosePurcgaseOrgModal = () => setPurchaseOrgModal(false);
  const ClosePurcgaseOrgGrpModal = () =>{
    
     setPurchaseOrgGrpModal(false);
  }
  const CloseRoleModal = () => setRoleModal(false);
  const CloseDepartmentModal = () => setDepartmentModal(false);
  const CloseDesignationModal = () => setDesignationModal(false);
  const CloseLegalEntityModal = () => setLegalEntityModal(false);
  const CloseBusinessModal = () => setBusinessModal(false);
  const [purchaseOrgModal, setPurchaseOrgModal] = useState(false);
  const [orggroups, setorggroups] = useState([]);

  const [userDepartments, setuserDepartments] = useState([]);  
  const [userAssignDepartment, setuserAssignDepartment] = useState([]);

  const handleOpenPurchaseOrgModal = () => {
    setPurchaseOrgModal(true);
  };

  const handleDesignationList=(array)=>{
    const arrayfilter =array.filter((x)=>x.departmentId==departmentId)
    setUserDesignation(arrayfilter);
  }
 
 const handleOpenDepartmentModal = () => {
  
  setDepartmentModal(true); 
};
const handleOpenDesignationModal = () => {
  setDepartmentModal(true); 
};
  const handleClosePurchaseOrgModal = () => {
    setPurchaseOrgModal(false);
  };
  const [postFileName, setPostFileName] = React.useState("");
  const inputDate = new Date(); 
  let formattedDate = formatDate(inputDate);

  const [createdon, setCreatedon] = useState(formattedDate);

  const [libraryType, setlibraryType] = useState("QuestionLibrary");
  const [TimezoneList, setTimezoneList] = useState([]);
  const [businessUnitName, setBusinessUnitName] = useState('');
  const [busUnitId, setbusUnitId] = useState(0);
  const [businessUnitList, setBusinessUnitList] = useState([]);
  const [timeLocalelist,setTimeLocaleList]= useState(null);
  //pull timelocale data 
  useEffect(()=>{
    getTimeLocale()
  },[])

  const getTimeLocale = async () => {
    try {
        ;
        const res = await apiClient.getres(`/api/TimeLocale/FindAll`, atoken);
        if (res) {
            // Extract only the active language patterns (isActive: true)
           
            const activeLanguagePatterns = res.data.languagePattern.filter(item => item.isActive === true);

            
            // You can use the filtered `activeLanguagePatterns` as needed
            console.log('Active Language Patterns:', activeLanguagePatterns);
                        setTimeLocaleList(res?.data);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};



  useEffect(() => {
    
    if (editRecordData ) {
      prefilleduser();
    }
    else{
      if(TimezoneList && TimezoneList.length>0){
   
        const obj =findObjByValueFromArray(TimezoneList,editRecordData?.timeZone || usertimezone,"localeName")
      console.log(TimezoneList, usertimezone, "localeName")
      
      formik.setFieldValue("timeZone", obj);
      }
      
    }
  
  }, [TimezoneList,timeLocalelist]);

  useEffect(() => { 
    
    pullUsersList();
    PullLegalEntity();
    
    PullTimezone();
    pullDialCodeList();
  }, []);

  useEffect(() => {
    
    PullPurchaseOrgAll({
      CustomerId:customerid,
      SortingColumn: "OrgName",
    
    }

    ); 
    
  }, []);

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

  
  const [userRoleId, setUserRoleId] = useState([]);
  const [usergrpId, setusergrpId] = useState([]); 
 
 const [selectedRoles, setSelectedRoles] = useState([]);
  
 const getGroupDefault = (arraylist) => { 
  
        let arrayNew=[];
        if (arraylist?.length > 0) {
            purchaseGroupAllList?.map((data) => {

              arraylist?.map((array) => {
                
                if (data.id == array.orgGroupId) {
                  arrayNew.push(data);
                }

              })
              
            }); 
        }
        return arrayNew;
};



  const handleChangeGroup = (event, newValues) => {
    if (newValues) {
      const updatedGroups = newValues?.map((newValue) => ({ 
        id: 0,
        userId: editRecordData?.id ? editRecordData?.id : 0,
        orgGroupId: newValue.id,
        orgGroupName: newValue.groupName
      }));
      setorggroups(updatedGroups);
      setusergrpId(updatedGroups);
     
      if (newValues.some((option) => option.id === "new")) {
        setPurchaseOrgGrpModal(true);
      }
    } else {
      console.error("New value is undefined or null.");
    }
  };
  
  const handleChangeDepartment = (event, newValues) => {
     
    if (newValues) {
      if (newValues.some((option) => option.id === "new")) {
        handleOpenDepartmentModal(true); 
      }
      else {
          const updatedDepartment = newValues?.map((newValue) => ({
            id: newValue.id,
            departmentName: newValue.departmentName
          }));

          const updatedAssignDepartment = newValues?.map((newValue) => ({
            departmentId: newValue.id,
            departmentName: newValue.departmentName,
            userId : editRecordData?.id || 0,
            customerid : customerid
          }));

         setuserAssignDepartment(updatedAssignDepartment); 
         setuserDepartments(updatedDepartment);
        
         
       
     }
    
  
     
    } else {
      console.error("New value is undefined or null.");
    }
  };

  const [BusinessList, setBusinessList] = useState([]);
  const PullBusinessUnit = (legalId) => {
    
    var data = {
      CustomerId: customerid,
      LegalEntityId: legalId,
    };
    
getBusinessUnitList(data, atoken).then((res) => { 
  
      if (res != "" && res != undefined) {
        
        setBusinessList(res);
   
     
      }
      setLoading(false);
      
    });
  };
  const handleBusinessUnitList = (array) => {
    setBusinessList(array);
	};
const handleRoleChange = (e) => {
  const selectedId = e.target.value;
 if (selectedId === "new") {
    setRoleModal(true);
  } else {
    const selectedRole = RoleList?.find(cat => cat.id === selectedId);
    setroleId(selectedId); 
    setroleName(selectedRole.name);
    formik.setFieldValue("roleId",selectedId)
    formik.setFieldValue("roleName",selectedRole.name)
  }
};



  const [userList, setUserList] = useState([]);

 
    

  const pullUsersList = () => {
    var data = {
      CustomerId: customerid,
    };
    
    setLoading(true);
    FindUser(data, atoken)
      .then((res) => {
        console.log(res); 
        if (res && res?.length > 0) {
          // Prepend "None" option to the user list
          setUserList([{ id: "", name: "None" }, ...res]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user list:", error);
        setLoading(false);
      });
  };
  const PullLegalEntity = () => {
    var data = {
      CustomerId: customerid,
     
    };

     getUserDepartment(data, atoken).then((res) => { 
      //setGridloading(true);
      if (res != "" && res != undefined) {
          setlegalEntityList(res);
   
       
      }
      setLoading(false);
      //setGridloading(false);
    });
  };
  // const pullUsersList = () => {
  //   var data = {
  //     CustomerId: customerid,
  //   };
    
  //   setLoading(true);
  //   FindUser(data, atoken)
  //     .then((res) => {
  //       console.log(res); 
  //       if (res && res.length > 0) {
  //         // Prepend "None" option to the user list
  //         setUserList([{ id: "", name: "None" }, ...res]);
  //       }
  //       setLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Error fetching user list:", error);
  //       setLoading(false);
  //     });
  // };
  
  
  const [DialCodeList, setDialCodeList] = useState([]);

  const pullDialCodeList = () => {
  
    setLoading(true);
    getCountry(atoken)
      .then((res) => {
        if (res && res.length > 0) {
          setDialCodeList(res);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user list:", error);
        setLoading(false);
      });
  };
  const [UserDepartmentAll, setUserDepartmentAll] = useState([]);
  
  const [timezoneid, settimezoneid] = useState(0);
  const [UserDesignation, setUserDesignation] = useState([]);
  const PullUserDesignation = (departmentId) => {
    var data={ 
      CustomerId:customerid,
      DepartmentId:departmentId,
      IsActive:true
    }
     getUserDesignation(data, atoken).then((res) => {

     setUserDesignation(res);
    });
  };

  const [UserDepartment, setUserDepartment] = useState([]);
  const PullUserDepartment = (BusinessUnitId) => {
    var data={ 
      CustomerId:customerid,
      BusinessUnitId: BusinessUnitId
      // BusinessUnitId: busUnitId, 
    }
   
    getUserDepartmentList(data, atoken).then((res) => { 
      
       const uniqueMap = {};
			const uniqueArray = res?.filter((item) => {
				if (!uniqueMap[item?.name]) {
					uniqueMap[item?.name] = true;
					return true;
				}

				return false;
			});
      // const uniqueBusinessUnitMap = {};
      // const uniqueBusinessUnits = res?.filter((item) => {
      //     if (!uniqueBusinessUnitMap[item?.businessUnitName]) {
      //         uniqueBusinessUnitMap[item?.businessUnitName] = true;
      //         return true;
      //     }
      //     return false;
      // });
      
    
      // setlegalEntityList(uniqueArray);
      // if(uniqueArray?.length>0)
      // {
        
      //   setlegalId(uniqueArray[0]?.id);
      // }

      // if (uniqueBusinessUnits?.length > 0) {
      //   setBusinessUnitList(uniqueBusinessUnits);
      //   setBusinessUnitName(uniqueBusinessUnits[0]?.businessUnitName);
      // }

// console.log("uniqueBusinessUnits",uniqueBusinessUnits);
      
      setUserDepartment(res);
     
    });
  };
 
  const handleDepartmentList = (array) => {
     
    const arrayfilter =array.filter((x)=>x.businessUnitId==busUnitId)
		setUserDepartment(arrayfilter);
	};
  
  const handleLegalEntityList = (array) => {
		setlegalEntityList(array);
	};
  const handlepurchaseorgList = (array) => {
		setPurchaseAllList(array);
	};
  
  const PullTimezone = () => {
    var data = {
      CustomerId: customerid
    };

    getTimeZone(atoken).then((res) => {
      // console.log(res);
      
      setTimezoneList(res);

    });
  };

  const validationSchema = yup.object({
    name: yup.string().required("Please Enter User Name"),
    email:yup.string().required("Please Enter Email Id"),
    // phoneNumber:yup.string().required("Please Enter Phone Number"),
    phoneNumber: yup.string()
    .min(5, 'Phone number must be at least 5 characters')
    .max(15, 'Phone number cannot exceed 15 characters')
    .required('Phone number is required'),
    timeZone:yup.object().required("Please Select Timezone"),
    departmentId:yup.string().required("Please Select Department"),
  });
  const formik = useFormik({
   // enableReinitialize: true,
    initialValues: {
      id: editRecordData?.id ? `${editRecordData?.id}` : 0,
      
      name: editRecordData?.name
        ? editRecordData?.name
        : name,
        businessUnitName: editRecordData?.businessUnitName ?editRecordData?.businessUnitName : businessUnitName,
        managerName: editRecordData?.managerName
        ? editRecordData?.managerName
        : managerName,
        orgId:editRecordData?.orgId ? editRecordData?.orgId : orgId,
        designationId: editRecordData?.designationId ? editRecordData?.designationId : designationId,

        designation: editRecordData?.designation
        ? editRecordData?.designation
        : designation,
        legalId:editRecordData?.legalId ? editRecordData?.legalId : legalId,
        legalEntity:editRecordData?.legalEntity ? editRecordData?.legalEntity : legalEntity,
        departmentId: editRecordData?.departmentId ? editRecordData?.departmentId : departmentId,
        departmentName: editRecordData?.departmentName ? editRecordData?.departmentName : departmentName,
        timeZone:  null,
      email: editRecordData?.email ? editRecordData?.email : email,
      managerId: editRecordData?.managerId ? editRecordData?.managerId : 0,
      phoneNumber: editRecordData?.phoneNumber ? editRecordData?.phoneNumber : phoneNumber,
      orgName: editRecordData?.orgName ? editRecordData?.orgName : orgName,
      dialingCode:editRecordData?.dialingCode ? editRecordData?.dialingCode : dialingCode,
      roleName:editRecordData?.roleName ? editRecordData?.roleName : roleName,
      roleId:editRecordData?.roleId ? editRecordData?.roleId : roleId,
      busUnitId:editRecordData?.busUnitId ? editRecordData?.busUnitId : busUnitId,
    
      userOrgGroup: Array.isArray(editRecordData?.orggroups)
      ? JSON.parse(editRecordData.orggroups)
      : orggroups,

      userAssignDepartment : editRecordData?.userAssignDepartment ? editRecordData?.userAssignDepartment : userAssignDepartment,
      isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
      timePattern:null,
      datePattern:null,
      languagePattern:null,
      createdby: 1,
      timezoneid:editRecordData?.timezoneid ? editRecordData?.timezoneid : 0,
    },
    //validationSchema: validationSchema,
    onSubmit: (values) => {
    
      setLoading(true);
      if (!values.name) {
        setLoading(false);
        toast.error("User Name is required.", { toastId: "nameRequired" });
        return;
    }

    if (!values.email) {
        setLoading(false);
        toast.error("Email Id is required.", { toastId: "emailRequired" });
        return;
    }
  
      if (!values.phoneNumber) {
        setLoading(false);
        toast.error("Phone number is required.", { toastId: "phoneNumberRequired" });
        return;
      }
      if (!values.legalId) {
        setLoading(false);
        toast.error("Legal entity is required.", { toastId: "legalEntityRequired" });
        return;
      }
      // if (!values.businessUnitName) {
      //   setLoading(false);
      //   toast.error("Business Unit is required.", { toastId: "businessUnitRequired" });
      //   return;
      // }
      // if (!values.departmentId) {
      //   setLoading(false);
      //   toast.error("Department is required.", { toastId: "departmentRequired" });
      //   return;
      // }
      // if (!values.designationId) {
      //   setLoading(false);
      //   toast.error("Please select a designation.",{ toastId: "selectdesignation" });
      //   return;
      // }
      if (!values.roleId) {
        setLoading(false);
        toast.error("Please select a role.",{ toastId: "selectrole" });
        return;
      }
     
    
      var data = {
        id: editRecordData?.id ? editRecordData?.id : 0,
        name: formik.values?.name,
        managerName:managerName,
        dialingCode:formik.values?.dialingCode,
        designationId: designationId,
        designation: designation,
        businessUnitName:businessUnitName,
        busUnitId:busUnitId,
       departmentId:departmentId,
        departmentName:departmentName,
        legalId:legalId,
        legalEntity:legalEntity,
        email: formik.values?.email,
        timeZone:formik.values?.timeZone,
        phoneNumber: formik.values?.phoneNumber,
        managerId:managerId,
        orgId:orgId,
        orgName:orgName,
       // userAssignDepartment : userAssignDepartment,
        roleId:roleId,
        roleName:roleName,
      //  userOrgGroup:orggroups,
      userOrgGroup: Array.isArray(orggroups)
    ? JSON.stringify(orggroups) 
    : orggroups,
    
        isActive: isActive,
        datePattern:values?.datePattern?.options,
        dateLocale:values?.datePattern?.locale,
        timePattern:values?.timePattern?.options,
        timeLocale:values?.timePattern?.locale,
        languagePattern:values?.languagePattern?.options,
        timezoneid:values?.timeZone?.id,
      };
    
      console.log("values", values);
      

      if (editRecordData?.id > 0) {
        UpdateUser(data, editRecordData?.id, atoken).then((res) => {
          setLoading(false);
          dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
          dispatch({
            type: actionTypes.SET_MSGALERTDATA,
            value: res?.data?.message,
          });
          dispatch({ type: actionTypes.SET_MSGALERT, value: true });
          callbackstep("update");
          setUserUnsavedChanges(false);
          clearfilleduser();
          toast.success("User updated successfully!", {
            toastId: "selectsuccessfully" 
          });
          return true;
        });
      } else {
        AddUser(data, atoken).then((res) => {
          setLoading(false);
    dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
    dispatch({
      type: actionTypes.SET_MSGALERTDATA,
      value: res?.data?.message,
    });
    dispatch({ type: actionTypes.SET_MSGALERT, value: true });
    callbackstep("add");
    setUserUnsavedChanges(false);
    clearfilleduser();

    toast.success("User added successfully!", {
      toastId: "selectUsersuccessfully" 
    });

    return true;
  })
  .catch((error) => {
    setLoading(false);
    console.error("Error adding user:", error);
    if (error.message === "User already exists") {
      toast.error("User already exists!", {
          toastId: "alreadysuccessfully"
      });
    } else {
      toast.error("User already exists.", {
        toastId: "alreadyexists"
      });
    }
    // Handle other errors if necessary
  });

        
      }
    }, 
  });

  const prefilleduser = () => {
    
    if (editRecordData && timeLocalelist && TimezoneList && TimezoneList.length>0) {
      formik.setFieldValue("id", editRecordData?.id);
      setname(editRecordData?.name);
      setdesignation(editRecordData?.designation);
      setphoneNumber(editRecordData?.phoneNumber);
      setemail(editRecordData?.email);
      PullUserDesignation(editRecordData?.departmentId);
      setdesignationId(editRecordData?.designationId);
      setdesignation(editRecordData?.designation);
      setisActive(editRecordData?.isActive);
      PullLegalEntity(editRecordData?.busUnitId);
      
      PullBusinessUnit(editRecordData?.legalId);
      PullUserDepartment(editRecordData?.busUnitId);
      setbusUnitId(editRecordData?.busUnitId);
      setBusinessUnitName(editRecordData?.businessUnitName);
      setorgId(editRecordData?.orgId);
      setorgName(editRecordData?.orgName);
      PullPurchaseGroupAll(editRecordData?.orgId);
      SetmanagerId(editRecordData?.managerId);
      setManagerName(editRecordData?.managerName);
      //setlegalId(editRecordData?.legalId??userDetail.legalId);
      setlegalId(editRecordData?.legalId);
      setlegalEntity(editRecordData?.legalEntity);
      //setTimeZone(editRecordData?.timeZone??usertimezone);
      const obj =findObjByValueFromArray(TimezoneList,editRecordData?.timeZone || usertimezone,"localeName")
      console.log(TimezoneList, editRecordData?.timeZone || usertimezone, "localeName")
      
      formik.setFieldValue("timeZone", obj);
      

      setroleId(editRecordData?.roleId);
      setroleName(editRecordData?.roleName);
      setDialingCode(editRecordData?.dialingCode);
      //PullUserDepartment(editRecordData?.departmentId);
   // setdepartmentId(editRecordData?.departmentId);
     // setdepartmentId(editRecordData?.designationId);
     setdepartmentId(editRecordData?.departmentId);
       setdepartmentName(editRecordData?.departmentName);
      //setusergrpId(editRecordData?.userOrgGroup); 

    // setuserAssignDepartment(editRecordData?.userAssignDepartment)

    // const userDepartmentsValue = editRecordData.userDepartments
    //   ? JSON.parse(editRecordData.userDepartments)
    //   : []; 

    //   setuserDepartments(userDepartmentsValue);


    const userOrgGroupValue = editRecordData.userOrgGroup
      ? (editRecordData.userOrgGroup)  
      : [];

      setusergrpId(userOrgGroupValue);   

	// if (editRecordData?.userOrgGroup) {
	// 	const orgGroupNames = editRecordData.userOrgGroup.map(group => group.orgGroupName);
	// 	setusergrpId(orgGroupNames);
	// }

  //setting timelocale related data
  
  const datepatternobj =findObjByValueFromArray(timeLocalelist?.datePattern,editRecordData?.datePattern,"options")
  const timepatternobj =findObjByValueFromArray(timeLocalelist?.timePattern,editRecordData?.timePattern,"options")
  const languagepatternobj =findObjByValueFromArray(timeLocalelist?.languagePattern,editRecordData?.languagePattern,"options")
  
  
  formik.setFieldValue("datePattern", datepatternobj);
  formik.setFieldValue("timePattern", timepatternobj);
  formik.setFieldValue("languagePattern", languagepatternobj);
	  
    } 
  };

  const clearfilleduser = () => {
    formik.setFieldValue("id", 0);
    setname("");
    setdesignation("");
    setdesignationId(0)
    setemail("");
    setdesignation("");
    setisActive(false);
    setphoneNumber("");
    setroleId(0);
    setroleName("");
    setDialingCode("");
    setroleName("");
   // setTimeZone("");
    setdepartmentId(0);
    setdepartmentName("");
    SetmanagerId(0);
    setManagerName("");
    setorgId(0);
    setlegalId(0);
    setlegalEntity("");
    setuserDepartments([]);
    setorggroups([]);
    setusergrpId(0);
    setuserAssignDepartment([])
    
  };

  const handleEmailChange = (e) => {
    const input = e?.target?.value;
    const sanitizedInput = input.replace(/[^a-zA-Z0-9@.]/g, "");
    setemail(sanitizedInput);
  };
  const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
  const PullPurchaseGroupAll = (orgMstId) => {
    
    var data = {
      CustomerId: customerid,
     OrgMstId: orgMstId, 
    };
   
    setGroupLoading(true);
    OrgGroupMasterList(data, atoken).then((res) => {

      if (res != "" && res != undefined) {
   
        setPurchaseGroupAllList(res);
    
      }
      setGroupLoading(false);
    });
  };

  const getRoleDefault = (roleId) => {
    if (roleId > 0) { 
      const defaultRole = RoleList?.find(data => data.id === roleId);
      return defaultRole ? defaultRole : null;
    }
    return null;
  };


  const onchangeRole = (event, array) => {
    ;
    let arrayNew = [];
    if (array?.length > 0) {
      array.forEach((index) => {
        RoleList.forEach((data) => {
          if (data.id === index?.id) {
            arrayNew.push(data);
          }
        });
      });
    }
    return arrayNew;
  };
  
  const onchangePurchOrg = (event, newvalue) => {
    if (newvalue) {
      setorgId(newvalue.id);
      setorgName(newvalue.orgName || ""); // Update organisation name with newvalue.orgName
      PullPurchaseGroupAll(newvalue.id); // Fetch groups for the selected orgMstId
      setUserUnsavedChanges(true);
    } else {
      setorgId("");
      setorgName("");
      setuserOrgGroup([]);
      setPurchaseGroupAllList([]); // Clear list when no organization is selected
    }
  };
  
   
  // const onchangePurchOrg = (event, newvalue) => {
  //   ;
  //   if (newvalue) {
  //     setorgId(newvalue.id);
  //     setorgName(newvalue.orgName || ""); // Update organisationname with newvalue.orgName
  //     PullPurchaseGroupAll(newvalue.id);
  //     setUserUnsavedChanges(true);
  //   } else {
  //     setorgId("");
  //     setorgName("");
  //     setuserOrgGroup([]);
  //     setPurchaseGroupAllList([]);
  //   }
  // };
  const [purchaseAllList, setPurchaseAllList] = useState([]);
  const PullPurchaseOrgAll = () => {
    //
    var data = {
      CustomerId: customerid,
      IsActive:true
     
    };
    getPurchaseOrgList(data, atoken).then((resp) => {
    setPurchaseAllList(resp);
    });
  };




  const getOrganisationDefault = (orgId) => {
    if (orgId && orgId > 0) {
      const selectedOrganization = purchaseAllList.find(
        (data) => data.id === orgId
      );
      return selectedOrganization || null;
    }
    return null;
  };

  // const handlePhoneChange = (e) => {
  //   const { value } = e.target;
  //   const cleanedValue = removeNonNumeric(value);
  //   formik.setFieldValue('phoneNumber', cleanedValue);
  //   setUserUnsavedChanges(true);
  // };
  const handlePhoneChange = (e) => {
   
    let { value } = e.target;
  
    // Step 1: Remove all non-numeric characters (keep only digits)
    const cleanedValue = value.replace(/\D/g, ''); // \D matches anything that is not a digit
  
    // Step 2: Check if the value contains consecutive zeros (00)
    // if (cleanedValue.includes('00')) {
    //   // If there are consecutive zeros, show error in Formik
    //   formik.setFieldError('phoneNumber', 'Phone number cannot contain consecutive zeros.');
    //   return;
    // }
  
    // Step 3: Check for minimum length of 10 digits
  
    if (cleanedValue?.length < 10) {
     
      formik.setFieldError('phoneNumber', 'Phone number must be at least 10 digits.');
      formik.setFieldValue('phoneNumber', cleanedValue);
       // Update Formik field with cleaned value
      return;
    }
   
    // Step 4: Check for maximum length of 15 digits
    if (cleanedValue?.length > 15) {
      formik.setFieldError('phoneNumber', 'Phone number cannot exceed 15 digits.');
      return; // If it exceeds 15 digits, do not update the value
    }
  
    // If the value passed all validations, update Formik's field value
    formik.setFieldValue('phoneNumber', cleanedValue);
    
    // Clear the error if the value is valid now
    formik.setFieldError('phoneNumber', '');
    
    // Mark that there are unsaved changes (if needed)
    setUserUnsavedChanges(true);
  };
  
  
  const handleNameChange = (event) => {
    const { value } = event.target;
    const cleanedValue = removeSpecialCharactersAndNumbers(value);
    setname(cleanedValue);
  };
 
  const handleManagerNameChange = (event) => {
    const { value } = event.target;
    const cleanedValue = removeSpecialCharactersAndNumbers(value);
    setManagerName(cleanedValue);
  };


  const handleTimezoneChange = (value) => {
    const selectedId = value;
    formik?.setFieldValue(
      "timeZone",
      selectedId
  );

  setUserUnsavedChanges(true);
    console.log(""+selectedId);
   // setTimeZone(selectedId);
  };

 
  
  
  
  // const handleManageId = (e) => {
  //   const selectedId = e.target.value;
  //   const selectedManager = userList.find(user => user.id === selectedId);
  //   if (selectedManager) {
  //     SetmanagerId(selectedId);
  //     setManagerName(selectedManager.name);
  //   }
  // };

  // const handleManageId = (e) => {
  //   const selectedId = e.target.value;
  //   SetmanagerId(selectedId);
  
  //   if (selectedId === "") {
  //     setManagerName(""); // Clear the manager name if "None" is selected
  //   } else {
  //     const selectedManager = userList.find(user => user.id === selectedId);
  //     if (selectedManager) {
  //       setManagerName(selectedManager.name);
  //     }
  //   }
  // };
  const handleManageId = (e) => {
  
    const selectedId = e.target.value;
    SetmanagerId(selectedId);
  
    if (selectedId === "") {
      SetmanagerId(0);
      setManagerName("");  // Clear the manager name if "None" is selected
    } else {
      const selectedManager = userList.find(user => user.id === selectedId);
      if (selectedManager) {
        setManagerName(selectedManager.name);
        setUserUnsavedChanges(true);
      }
    }
  };
  
 
//   const handleDialChange = (e) => {
//     ;
//     const selectedDialCode = e.target.value;
//    const selectedCode = DialCodeList.find(country => country?.dialingCode === selectedDialCode);
//    ;
//    setDialingCode(selectedDialCode);

// };
const handleDialChange = (event, newValue) => {
  if (newValue) {
      setDialingCode(newValue.dialingCode);
      formik.setFieldValue("dialingCode", newValue.dialingCode); 
      setUserUnsavedChanges(true);// Update Formik field value
  }
};

// };
  const getDepartmentDefault = (arraylist) => { 
  
        let arrayNew=[];
        if (arraylist?.length > 0) {
            UserDepartment?.map((data) => {

              arraylist?.map((array) => {
                
                if (data.id == array.id) {
                  arrayNew.push(data);
                }

              })
              
            }); 
        }
        return arrayNew;
};


const handleDesignationChange = (e) => {

  const selectedId = e.target.value;
  if (selectedId === "new") {
    setDesignationModal(true);
  } else {
  const selecteddesignation = UserDesignation.find(cat => cat.id === selectedId);
  setdesignationId(selectedId); 
  setdesignation(selecteddesignation.name);
  formik.setFieldValue("designationId",selectedId)
  formik.setFieldValue("designation",selecteddesignation.name)
  setUserUnsavedChanges(true);
  }
};
const handleDepartmentChange = (e) => {
  
  const selectedId = e.target.value;
  PullUserDesignation(selectedId);
  if (selectedId === "new") {
    setDepartmentModal(true);
  }else{
    const selectedDepartment = UserDepartment.find(cat => cat.id === selectedId);
    setdepartmentId(selectedId); 
    setdepartmentName(selectedDepartment?.name); 
    formik.setFieldValue("departmentId",selectedId)
    formik.setFieldValue("departmentName",selectedDepartment.name)
    };
  }



const handleLegalChange = (e) => { 
 
  const selectedId = e?.target?.value;

  if (selectedId === "Add NEW") {
    setLegalEntityModal(true);
    return; 
  }
  
  const selectedlegal = legalEntityList?.find(cat => cat?.id === selectedId);
  //setBusinessUnitName(selectedlegal?.businessUnitName);
  setlegalId(selectedId); 
  setlegalEntity(selectedlegal?.name);
  formik.setFieldValue("legalId", selectedId);
  formik.setFieldValue("legalEntity", selectedlegal?.name);
  //setTimeZone(selectedlegal?.timeZone);
  
//   formik?.setFieldValue(
//     "timeZone",
//     selectedlegal?.timeZone
// );
  setDialingCode(selectedlegal?.dialingCode);
  PullBusinessUnit(selectedId);
  }
  // const handlebusinesschange = (e) => {
  //   const selectedValue = e?.target?.value;
  
  //   if (selectedValue === "new") {
  //     setBusinessModal(true); 
  //     return;
  //   }
  
   
  //   const selectedBusinessUnit = BusinessList?.find(option => option?.name === selectedValue);
  
  //   if (selectedBusinessUnit) {
  //     setBusinessUnitName(selectedBusinessUnit.name);
  //     setbusUnitId(selectedBusinessUnit.id);
  //   }
  // };
  
  
  const handlebusinesschange = (e) => {
     
    const selectedValue = e?.target?.value;

    if (selectedValue === "new") {
      setBusinessModal(true);
      return;
    }

    const selectedBusinessUnit = BusinessList?.find(option => option?.id === selectedValue);

    if (selectedBusinessUnit) {
      setbusUnitId(selectedBusinessUnit.id);
      setBusinessUnitName(selectedBusinessUnit.name);
      formik.setFieldValue("busUnitId", selectedBusinessUnit.id);
      formik.setFieldValue("businessUnitName", selectedBusinessUnit.name);
      PullUserDepartment(selectedBusinessUnit.id);
    }
  };
	  
 
  
  
  return (
    <form onSubmit={formik.handleSubmit} autoComplete="off">
    <div className="row">
      <div className="col-12 col-md-6 mb-3">
      <TextField
      size="small"
      className="w-100"
  id="name"
  name="name"
  label="User Name *"
  placeholder=""
  value={formik.values.name} // Use Formik's value
  onChange={formik.handleChange} // Use Formik's onChange
  onBlur={formik.handleBlur} // Use Formik's onBlur
  inputProps={{ maxLength: 100 }}
  InputProps={{
    endAdornment: formik.values.name && (
      <InputAdornment position="end">
        <Typography variant="body2" color="textSecondary">
          {formik.values.name.length}/100
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
      <div className="col-12 col-md-6 mb-3">
  <input type="hidden" className="d-none" name="email" id="email"></input>
  <TextField
    id="email"
    size="small"
      className="w-100"
    name="email"
    label="Email Id *"
    placeholder=""
    value={formik.values.email} // Use Formik's value
    onChange={formik.handleChange} // Use Formik's onChange
    onBlur={formik.handleBlur} // Use Formik's onBlur
    inputProps={{ maxLength: 100 }}
    InputProps={{
      endAdornment: formik.values.email && (
        <InputAdornment position="end">
          <Typography variant="body2" color="textSecondary">
            {formik.values.email?.length}/100
          </Typography>
        </InputAdornment>
      ),
    }}
  />
  {formik.errors.email && formik.touched.email && (
    <div className="error error-red" style={{ fontSize: '9px' }}>
      {formik.errors.email}
    </div>
  )}
</div>

<div className="col-2 mb-2 focus">
      <Autocomplete
        id="dialingCode"
        options={DialCodeList}
        getOptionLabel={(option) => option.dialingCode}
        filterOptions={filteroptionDialingCode}
        value={DialCodeList.find((option) => option.dialingCode === dialingCode) || null}
        onChange={handleDialChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Dial Code"
            variant="outlined"
            size="small"
            // error={props.formik.touched.dialingCode && Boolean(props.formik.errors.dialingCode)}
            // helperText={props.formik.touched.dialingCode && props.formik.errors.dialingCode}
          />
        )}
      />
    </div>

      <div className="col-6 col-md-4 mb-3">
      <TextField
    id="phoneNumber"
    size="small"
      className="w-100"
    name="phoneNumber"
    label="Phone Number*"
    placeholder=""
    value={formik.values.phoneNumber} // Use Formik's value
    onChange={handlePhoneChange} // Custom onChange function
    onBlur={formik.handleBlur} // Use Formik's onBlur
    inputProps={{ maxLength: 15 ,minLength:5 }} // Limit input length
    InputProps={{
      endAdornment: formik.values.phoneNumber && (
        <InputAdornment position="end">
          <Typography variant="body2" color="textSecondary">
            {formik.values.phoneNumber.length}/15
          </Typography>
        </InputAdornment>
      ),
    }}
  />
          {formik.errors.phoneNumber && formik.touched.phoneNumber && (
    <div className="error error-red" style={{ fontSize: '9px' }}>
      {formik.errors.phoneNumber}
    </div>
  )}
      </div>
 <div className="col-6 mb-4">
      <FormControl fullWidth error={formik.touched.timeZone && Boolean(formik.errors.timeZone)}>
        <InputLabel id="timeZone"></InputLabel>
        <Autocomplete
          id="timeZoneAutocomplete"
          options={TimezoneList}
          getOptionLabel={(option) => option.timezonelong}
          value={formik.values?.timeZone}
          onChange={(event, newValue) => {
             
            handleTimezoneChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Preferred Time/Zone *"
              variant="outlined"
              size="small"
              id="timeZone"
              name="timeZone"
             onBlur={formik.handleBlur}
              error={formik.touched.timeZone && Boolean(formik.errors.timeZone)}
              helperText={formik.errors.timeZone}
            />
          )}
        />
      </FormControl>
    </div>
<div className="col-6 mb-4 focus">
  <FormControl fullWidth error={formik.touched.designationId && Boolean(formik.errors.designationId)}>
    <InputLabel id="roleId">Role *</InputLabel>
    <Select
      labelId="roleId"
      InputLabelProps={{
        shrink: true,
      }}
      label="Role *"
      id="roleId"
      name="roleId"
      variant="outlined"
      value={roleId}
      size="small"
     
      onChange={handleRoleChange}

      onBlur={formik.handleBlur}
    >
      {RoleList?.map((option, i) => (
        <MenuItem key={i} value={option?.id}>
          {option?.name}
        </MenuItem>
      ))}
          {/* <MenuItem
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
                </MenuItem> */}
    </Select>
    {formik.touched.designationId && formik.errors.designationId && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.designationId}
      </FormHelperText>
    )}
  </FormControl>
</div>
      <div className="col-6 mb-4 focus">
  <FormControl fullWidth error={formik.touched.designationId && Boolean(formik.errors.designationId)}>
    <InputLabel id="legalId">Legal Entity*</InputLabel>
    <Select
      labelId="legalId"
      InputLabelProps={{
        shrink: true,
      }}
      label="Legal Entity"
      id="legalId"
      name="legalId"
      variant="outlined"
      
      value={legalId}
      size="small"
     
      onChange={handleLegalChange}

      onBlur={formik.handleBlur}
    >
      {legalEntityList?.map((option, i) => (
        <MenuItem key={i} value={option?.id}>
          {option?.name}
        </MenuItem>
      ))}
      <MenuItem
                  value={"Add NEW"}
                  className="bggray"
                  style={{
                    color: "blue", 
                    fontStyle: "italic",
                    fontSize: "12px",
                    textDecoration: "underline", 
                    cursor: "pointer", 
                  }}
                >
                  <ins>ADD NEW</ins>
                </MenuItem>
    </Select>
    {formik.touched.legalId && formik.errors.legalId && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.legalId}
      </FormHelperText>
    )}
  </FormControl>
</div>
<div className="col-6 mb-4 focus">
  <FormControl fullWidth error={formik.touched.businessUnitName && Boolean(formik.errors.businessUnitName)}>
    <InputLabel id="busUnitId">Business Unit </InputLabel>
    <Select
      labelId="busUnitId"
      InputLabelProps={{ shrink: true }}
      label="Business Unit"
      id="busUnitId"
      name="businessUnitName"
      variant="outlined"
      value={busUnitId}
      size="small"
      onChange={handlebusinesschange}
      onBlur={formik.handleBlur}
    >
      {BusinessList?.map((option, i) => (
        <MenuItem key={i} value={option?.id}>
          {option?.name}
        </MenuItem>
      ))}
      <MenuItem
        value="new"
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
    {formik.touched.businessUnitName && formik.errors.businessUnitName && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.businessUnitName}
      </FormHelperText>
    )}
  </FormControl>
</div>


{/* <div className="col-6 mb-4 focus">
<Autocomplete
  multiple  
  limitTags={2}
  id="departmentId"
  name="departmentId"
  className="f14"
  options={[
    ...UserDepartment,
     { id: "new", name: "Add New" },
 
  ]}
   size="small"
  getOptionLabel={(option) => option.name}
  value={getDepartmentDefault(userDepartments)}
  onChange={handleChangeDepartment}
  filterSelectedOptions
  renderOption={(props, option) => (
    <Box
      component="li"
      {...props}
      style={
        option.id === "new"
          ? {
              fontStyle: "italic",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }
          : {}
      }
    >
      {option.name}
    </Box>
  )}
  renderInput={(params, data) => (
    <TextField
      {...params}
      variant="outlined"
      size="small"
      placeholder=""
      id="department"
      name="department"
      label="Department *"
      error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
      helperText={formik.touched.departmentId && formik.errors.departmentId}
     
    />
   
  )}
/>
</div> */}
				<div className="col-12 col-md-6 mb-3">
  <FormControl fullWidth error={formik.touched.designationId && Boolean(formik.errors.designationId)}>
    <InputLabel id="departmentId">Department </InputLabel>
    <Select
      labelId="departmentId"
      InputLabelProps={{
        shrink: true,
      }}
      label="Department "
      id="departmentId"
      name="departmentId"
      variant="outlined"
      value={departmentId}
      size="small"
     
      onChange={handleDepartmentChange}

      onBlur={formik.handleBlur}
    >
      {UserDepartment?.map((option, i) => (
        <MenuItem key={i} value={option?.id}>
          {option?.name}
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
    {formik.touched.designationId && formik.errors.designationId && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.departmentId}
      </FormHelperText>
    )}
  </FormControl>
</div>
<div className="col-6  focus">
  <FormControl fullWidth error={formik.touched.designationId && Boolean(formik.errors.designationId)}>
    <InputLabel id="designationId">Designation </InputLabel>
    <Select
      labelId="designationId"
      InputLabelProps={{
        shrink: true,
      }}
      label="Designation "
      id="designationId"
      name="designationId"
      variant="outlined"
      value={designationId}
      size="small"
     
      onChange={handleDesignationChange}

      onBlur={formik.handleBlur}
    >
      {UserDesignation?.map((option, i) => (
        <MenuItem key={i} value={option?.id}>
          {option?.name}
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
    {formik.touched.designationId && formik.errors.designationId && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.designationId}
      </FormHelperText>
    )}
  </FormControl>
</div>
{/* <div className="col-6  mb-4 focus">
  <FormControl fullWidth error={formik.touched.managerId && Boolean(formik.errors.managerId)}  >
    <InputLabel id="managerId">Manager</InputLabel>
    <Select
      labelId="managerId"
      InputLabelProps={{
        shrink: true,
      }}
      label="Manager"
      id="managerId"
      name="managerId"
      variant="outlined"
      value={managerId || ""}
      className="w-100"
      size="small"
      onBlur={formik.handleBlur}
      onChange={handleManageId} 
    >
      
      {userList?.map((option, i) => (
        <MenuItem key={i} value={option?.id}> 
          {option?.name }
        </MenuItem>
      ))}
    </Select>
    {formik.touched.managerId && formik.errors.managerId && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.managerId}
      </FormHelperText>
    )}
  </FormControl>

 </div> */}
<div className="col-6 mb-4 focus">
  <FormControl fullWidth error={formik.touched.managerId && Boolean(formik.errors.managerId)}>
    <InputLabel id="managerId">Manager</InputLabel>
    <Select
      labelId="managerId"
      InputLabelProps={{
        shrink: true,
      }}
      label="Manager"
      id="managerId"
      name="managerId"
      variant="outlined"
      value={managerId || ""}  // Default to "" if managerId is undefined
      className="w-100"
      size="small"
      onBlur={formik.handleBlur}
      onChange={handleManageId}
    >
      {userList?.map((option) => (
        <MenuItem key={option?.id} value={option?.id}>
          {option?.name}
        </MenuItem>
      ))}
    </Select>
    {formik.touched.managerId && formik.errors.managerId && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.managerId}
      </FormHelperText>
    )}
  </FormControl>
</div>

<div className="col-6 focus">
    <Autocomplete
    size="small"
      id="orgId"
      name="orgId"
      className="mb-4 f14"
      sx={{ width: "100%" }}
      options={[
        ...purchaseAllList,
        { id: "new", orgName: "Add New" },
      ]}
      value={getOrganisationDefault(orgId)}
      getOptionLabel={(option) => option.orgName}
      onChange={(event, newvalue) => {
        if (newvalue?.id === "new") {
          handleOpenPurchaseOrgModal();
        } else {
          onchangePurchOrg(event, newvalue);
        }
      }}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          style={
            option.id === "new"
              ? {
                  fontStyle: "italic",
                  color: "blue",
                  cursor: "pointer",
                  textDecoration: "underline",
                }
              : {}
          }
        >
          {option.orgName}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
         variant="outlined"
      size="small"
          {...params}
          label="Purchase Organization"
        />
      )}
    />
  </div>



{/* <div className="col-6 ">
<Autocomplete
  multiple
  id="orggroups"
  name="orggroups"
  className=" f14"
  options={[
    ...purchaseGroupAllList,
    { id: "new", groupName: "Add New" },
  ]}
  getOptionLabel={(option) => option.groupName}

  value={getGroupDefault(usergrpId)} 
  onChange={handleChangeGroup}
  filterSelectedOptions
  renderOption={(props, option) => (
    <Box
      component="li"
      {...props}
      style={
        option.id === "new"
          ? {
              fontStyle: "italic",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }
          : {}
      }
    >
      {option.groupName}
    </Box>
  )}
  renderInput={(params, data) => (
    <TextField
      {...params}
      variant="outlined"
      size="small"
      placeholder=""
      label="Purchase Group"
    />
  )}
/>
</div> */}
<div className="col-6">
  <Autocomplete
    multiple
    id="orggroups"
    name="orggroups"
    className="f14"
    options={[
      ...purchaseGroupAllList,
      { id: "new", groupName: "Add New" }, // Ensure "Add New" entry has groupName
    ]}
    getOptionLabel={(option) => option?.groupName || "Unnamed Group"} // Fallback value if groupName is missing
    value={getGroupDefault(usergrpId)}
    onChange={handleChangeGroup}
    filterSelectedOptions
    renderOption={(props, option) => (
      <Box
        component="li"
        {...props}
        style={
          option?.id === "new"
            ? {
                fontStyle: "italic",
                color: "blue",
                cursor: "pointer",
                textDecoration: "underline",
              }
            : {}
        }
      >
        {option?.groupName || "Unnamed Group"} {/* Added fallback */}
      </Box>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        size="small"
        placeholder=""
        label="Purchase Group"
      />
    )}
  />
</div>

<div className="col-4 ">
<Autocomplete
  
  id="datePattern"
  name="datePattern"
  className=" f14"
  options={timeLocalelist ?timeLocalelist?.datePattern : []}
 
  getOptionLabel={(option) => option?.format}
  value ={formik?.values?.datePattern}
  onChange={(e,v)=>{
    formik.setFieldValue("datePattern",v)
  }}
  filterSelectedOptions
  renderOption={(props, option) => (
    <Box
      component="li"
      {...props}
      style={
        option.id === "new"
          ? {
              fontStyle: "italic",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }
          : {}
      }
    >
      {`${getCurrentDateonFormat(option?.locale,option?.options,option?.format)} ${option?.format}`}
    </Box>
  )}
  renderInput={(params, data) => (
    <TextField
      {...params}
      variant="outlined"
      size="small"
      placeholder=""
      label="Date Pattern"
    />
  )}
/>
</div>
<div className="col-4 ">
<Autocomplete
  
  id="timePattern"
  name="timePattern"
  className=" f14"
  options={timeLocalelist ?timeLocalelist?.timePattern?.filter(x=>x.isActive) : []}
 
  getOptionLabel={(option) => option?.format}

  value ={formik?.values?.timePattern}
  onChange={(e,v)=>{
    formik.setFieldValue("timePattern",v)
  }}
  filterSelectedOptions
  renderOption={(props, option) => (
    <Box
      component="li"
      {...props}
      style={
        option.id === "new"
          ? {
              fontStyle: "italic",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }
          : {}
      }
    >
     
      {`${getCurrentTimeonFormat(option?.options,option?.format)} ${option?.format}`}
    </Box>
  )}
  renderInput={(params, data) => (
    <TextField
      {...params}
      variant="outlined"
      size="small"
      placeholder=""
      label="Time Pattern"
    />
  )}
/>
</div>
<div className="col-4">
<Autocomplete
  
  id="languagePattern"
  name="languagePattern"
  className=" f14"
  options={timeLocalelist ?timeLocalelist?.languagePattern?.filter(x=>x.isActive) : []}
 
  getOptionLabel={(option) => option?.format}
  value ={formik?.values?.languagePattern}
  onChange={(e,v)=>{
    formik.setFieldValue("languagePattern",v)
  }}
  filterSelectedOptions
  renderOption={(props, option) => (
    <Box
      component="li"
      {...props}
      style={
        option.id === "new"
          ? {
              fontStyle: "italic",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }
          : {}
      }
    >
      {option?.format}
    </Box>
  )}
  renderInput={(params, data) => (
    <TextField
      {...params}
      variant="outlined"
      size="small"
      placeholder=""
      label="Language"
    />
  )}
/>
</div>
<div className="col-6 mt-4 mb-3 d-flex justify-content-start">
          <FormControlLabel
            control={
              <Checkbox
                name="isActive"
                id="isActive"
                className=""
                checked={isActive}
                onChange={(e) => {
                  setisActive(e?.target?.checked);
                }}
              />
            }
            label="Active "
          />
         
        </div>
     

 

      <div className="col-12 text-end">
        {!loading ? (
          <>
          
                       <Button color="primary" variant="contained" size="medium" onClick={clearfilleduser}>

                Reset
              </Button>
             
              <span style={{ margin: '0 5px' }}></span> 
          <Button
           
    
            type="submit"

              color="primary"
            variant="outlined"
            size="medium"
          >
            Submit
          </Button>
          </>
        ) : (
          <LoadingButton className="" loading variant="contained">
            Submit ...
          </LoadingButton>
        )}
      </div>
    </div>
    <Modal
            size="lg"
            show={purchaseOrgModal}
            backdrop="static"
            keyboard={false}
            value={"Add NEW CATEGORY"}
            className="zindex1280"
            backdropClassName="zindex1280"
            centered
            contentClassName="border-0"
            onHide={() => ClosePurcgaseOrgModal()}
          >
            <Modal.Header className="pt-2 pb-2 bgheaderCards">
              <Modal.Title id="modal-heading">
                <div className="d-flex align-items-center f14 text-white">
                  Purchase Organization
                </div>
              </Modal.Title>
              <IconButton
                onClick={() => ClosePurcgaseOrgModal()}
                size="small"
                edge="start"
              >
                <HiOutlineX className="f20 text-white" />
              </IconButton>
            </Modal.Header>
            <Modal.Body className="p-0">
              <div className="p-3">
                <PurchaseOrg isModal={true} handlepurchaseorgList={handlepurchaseorgList} />
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            size="xl"
            show={purchaseOrgGrpModal}
            backdrop="static"
            keyboard={false}
            value={"Add NEW CATEGORY"}
            className="zindex1280"
            backdropClassName="zindex1280"
            centered
            contentClassName="border-0"
            onHide={() => ClosePurcgaseOrgGrpModal()}
          >
            <Modal.Header className="pt-2 pb-2 bgheaderCards">
              <Modal.Title id="modal-heading">
                <div className="d-flex align-items-center f14 text-white">
                  Purchase Organization Group
                </div>
              </Modal.Title>
              <IconButton
                onClick={() => ClosePurcgaseOrgGrpModal()}
                size="small"
                edge="start"
              >
                <HiOutlineX className="f20 text-white" />
              </IconButton>
            </Modal.Header>
            <Modal.Body className="p-0">
              <div className="p-3" onClick={(e) => e.stopPropagation()}>
                <PurchaseOrgGrp isModal={true} selectedPurOrggrp={PullPurchaseGroupAll} selectedOrgMstId={orgId} />
              </div>
            </Modal.Body>
          </Modal>
          <Modal
            size="lg"
            show={RoleModal}
            backdrop="static"
            keyboard={false}
            value={"Add NEW CATEGORY"}
            className="zindex1280"
            backdropClassName="zindex1280"
            centered
            contentClassName="border-0"
            onHide={() => CloseRoleModal()}
          >
            <Modal.Header className="pt-2 pb-2 bgheaderCards">
              <Modal.Title id="modal-heading">
                <div className="d-flex align-items-center f14 text-white">
                  Manage  Role 
                </div>
              </Modal.Title>
              <IconButton
                onClick={() => CloseRoleModal()}
                size="small"
                edge="start"
              >
                <HiOutlineX className="f20 text-white" />
              </IconButton>
            </Modal.Header>
            <Modal.Body className="p-0">
              <div className="p-3">
                <AddUpdateRole handleRoleList={handleRoleList}  />
              </div>
            </Modal.Body>
          </Modal>
          <Modal
            size="xl"
            show={DeapartmentModal}
            backdrop="static"
            keyboard={false}
            value={"Add NEW CATEGORY"}
            className="zindex1280"
            backdropClassName="zindex1280"
            centered
            contentClassName="border-0"
            onHide={() => CloseDepartmentModal()}
          >
            <Modal.Header className="pt-2 pb-2 bgheaderCards">
              <Modal.Title id="modal-heading">
                <div className="d-flex align-items-center f14 text-white">
                  Manage Department
                </div>
              </Modal.Title>
              <IconButton
                onClick={() => CloseDepartmentModal()}
                size="small"
                edge="start"
              >
                <HiOutlineX className="f20 text-white" />
              </IconButton>
            </Modal.Header>
            <Modal.Body className="p-0">
              <div className="p-3">
                <AddDepartment 
                handleDepartmentList={handleDepartmentList}  />
              </div>
            </Modal.Body>
          </Modal>
          <Modal
            size="xl"
            show={DesignationModal}
            backdrop="static"
            keyboard={false}
            value={"Add NEW CATEGORY"}
            className="zindex1280"
            backdropClassName="zindex1280"
            centered
            contentClassName="border-0"
            onHide={() => CloseDesignationModal()}
          >
            <Modal.Header className="pt-2 pb-2 bgheaderCards">
              <Modal.Title id="modal-heading">
                <div className="d-flex align-items-center f14 text-white">
                  Manage Designation
                </div>
              </Modal.Title>
              <IconButton
                onClick={() => CloseDesignationModal()}
                size="small"
                edge="start"
              >
                <HiOutlineX className="f20 text-white" />
              </IconButton>
            </Modal.Header>
            <Modal.Body className="p-0">
              <div className="p-3">
                <AddDesignation handleDesignationList={handleDesignationList}  />
              </div>
            </Modal.Body>
          </Modal>
          <Modal
            size="lg"
            show={LegalEntityModal}
            backdrop="static"
            keyboard={false}
            value={"Add NEW "}
            className="zindex1280"
            backdropClassName="zindex1280"
            centered
            contentClassName="border-0"
            onHide={() => CloseLegalEntityModal()}
          >
            <Modal.Header className="pt-2 pb-2 bgheaderCards">
              <Modal.Title id="modal-heading">
                <div className="d-flex align-items-center f14 text-white">
                  Manage Legal Entity
                </div>
              </Modal.Title>
              <IconButton
                onClick={() => CloseLegalEntityModal()}
                size="small"
                edge="start"
              >
                <HiOutlineX className="f20 text-white" />
              </IconButton>
            </Modal.Header>
            <Modal.Body className="p-0">
              <div className="p-3">
                <AddLegalEntity 
                handleLegalEntityList={handleLegalEntityList}
                 />
              </div>
            </Modal.Body>
          </Modal>
          <Modal
            size="xl"
            show={BusinessModal}
            backdrop="static"
            keyboard={false}
            value={"Add NEW "}
            className="zindex1280"
            backdropClassName="zindex1280"
            centered
            contentClassName="border-0"
            onHide={() => CloseBusinessModal()}
          >
            <Modal.Header className="pt-2 pb-2 bgheaderCards">
              <Modal.Title id="modal-heading">
                <div className="d-flex align-items-center f14 text-white">
                  Manage Business 
                </div>
              </Modal.Title>
              <IconButton
                onClick={() => CloseBusinessModal()}
                size="small"
                edge="start"
              >
                <HiOutlineX className="f20 text-white" />
              </IconButton>
            </Modal.Header>
            <Modal.Body className="p-0">
              <div className="p-3">
                <AddBusinessUnit 
                handleBusinessUnitList={handleBusinessUnitList} />
              </div>
            </Modal.Body>
          </Modal>
  </form>
  );
};

export default AddUpdateUser;
