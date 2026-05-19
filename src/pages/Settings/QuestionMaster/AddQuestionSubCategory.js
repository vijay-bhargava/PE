import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Drawer,FormHelperText,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import { useCallback } from "react";
import Pagination from "@mui/material/Pagination";
import { LoadingButton } from "@mui/lab";
import { HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import * as yup from "yup";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFormik } from "formik";
import { isTokenExpired } from "../../../utils/common";
import CryptoJS from 'crypto-js';
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { actionTypes, useStateValue } from "../../../store";
import { ApiClient,api } from "../../../Apiclient";

import {
  AddSubCategory,
  SubCategoryFindAll,
  UpdateSubCategory,
  CategoryFindAll,
} from "../../../utils/questionlibrary";

import SubCatResultCell from "./SubCatResultCell";
import NoRecordCell from "../../../components/NoRecordCell";

const AddQuestionSubCategory = (props) => {
    const apiClient = new ApiClient(api);
        const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
    
 const updateToken = async () => {    
    
    const res= await isTokenExpired(atoken,rtoken,customerid);      
    if (res) {
    if (res?.accessToken != '') {
            dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken });
            var userAccessToken = CryptoJS.AES.encrypt(`${res.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
            setCookie("patkn", userAccessToken, { path: '/', maxAge: 86400 });
          }
          if (res?.refreshToken != '') {
            dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken });
            var userRefreshToken = CryptoJS.AES.encrypt(`${res.refreshToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
            setCookie("prtkn", userRefreshToken, { path: '/', maxAge: 86400 });
    }
     return true
  }   
    else {
    return false;
  }
  }
  const [loading, setLoading] = useState(false);
  const [{ atoken, rtoken ,customerid}, dispatch] = useStateValue();
  const [editRecordData, seteditRecordData] = useState(null);
  const [questioncategoryid, setQuestionCategoryId] = useState(
    editRecordData?.questioncategoryid ? editRecordData?.questioncategoryid : 0
  );
  const [questionsubcategory, setQuestionSubCategory] = useState("");
  const [questioncategory, Setquestioncategory] = useState("");
  const [isActive, setIsactive] = useState(true);
  const [totalRecords, setTotalRecords] = useState("");
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const handleChange = (event, value) => {
    setPage(value);
  };

  const [state, setState] = useState({
    right: false,
    viewTicketSidebar: false,
    rightLog: false,
  });

  const showSubCat = () => {
    props.selectedSubCat(props.catId);
  };

  useEffect(() => {
    //
    if (editRecordData && editRecordData?.id > 0) {
      prefilledDocument();
    }
  }, []);

  useEffect(() => {
    PullCategoryFindAll();
    pullSubCategoryList();
  }, [page]);

  const initialValues = {
    id: editRecordData?.id ? `${editRecordData?.id}` : 0,
    customerId: customerid,
    questioncategoryid: editRecordData?.questioncategoryid
      ? `${editRecordData?.questioncategoryid}`
      : questioncategoryid,
    questionsubcategory: editRecordData?.questionsubcategory
      ? editRecordData?.questionsubcategory
      : questionsubcategory,
      questioncategory: editRecordData?.questioncategory
      ? editRecordData?.questioncategory
      : questioncategory,
      isActive: editRecordData?.isActive ? editRecordData?.isActive : true,

  };

  // const onSubmit = (values) => {
  //   var data = {
  //     id: editRecordData?.id ? editRecordData?.id : 0,
  //     customerId: customerid,
  //     questioncategoryid: questioncategoryid,
  //     questioncategory:questioncategory,
  //     questionsubcategory: questionsubcategory,
  //     isActive: isActive,
     
  //   };
  //   setLoading(true);

  //   console.log("values", values);
  //   // api call to save data
  //   if (editRecordData?.id > 0) {

  //     UpdateSubCategory(data,editRecordData?.id,atoken).then((res) => {
  //       setLoading(false);
  //       pullSubCategoryList();
  //       dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
  //       dispatch({
  //         type: actionTypes.SET_MSGALERTDATA,
  //         value: res?.data?.message,
  //       });
  //       dispatch({ type: actionTypes.SET_MSGALERT, value: true });
  //       // callbackstep("update");
  //       clearfilledDocument();
  //       toast.success("Sub Category updated successfully!", {
  //        toastId: "UserSubCategory"
  //       });
  //       showSubCat();
  //       return true;
  //     });
  //   } else {
  //     AddSubCategory(data,atoken).then((res) => {
  //       setLoading(false);
  //       pullSubCategoryList();
  //       dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
  //       dispatch({
  //         type: actionTypes.SET_MSGALERTDATA,
  //         value: res?.data?.message,
  //       });
  //       dispatch({ type: actionTypes.SET_MSGALERT, value: true });

  //       console.log("save", res);
  //       //  formRef.current.reset();
  //       //
  //       // callbackstep("add");
  //       clearfilledDocument();
  //       toast.success("Sub Category added successfully!", {
  //         position: toast.POSITION.TOP_CENTER,
  //         autoClose:1000,
  //       });
  //       showSubCat();
  //       return true;
  //     });
  //   }
  // };
const onSubmit = async (values) => {
    var data = {
      id: editRecordData?.id ? editRecordData?.id : 0,
      customerId: customerid,
      questioncategoryid: questioncategoryid,
      questioncategory:questioncategory,
      questionsubcategory: questionsubcategory,
      isActive: isActive,
     
    };
    
    setLoading(true);
    console.log("values", values);
    
    if (editRecordData?.id > 0) {
      // Update operation
      const isTokenExpired = await updateToken(); // Token check if needed
      const res = await apiClient.post(`api/QSubCategory/Update`, data, atoken); // Use API endpoint for update
      if (res) {
      pullSubCategoryList(); // Refresh category list after update 
      dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
      dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
      dispatch({ type: actionTypes.SET_MSGALERT, value: true });
      clearfilledDocument();
      toast.success("SubCategory updated successfully!", { toastId: "UserCategory" });
      showSubCat(); // Handle UI change or redirection if needed
      }
    } else {
      // Add operation
      const isTokenExpired = await updateToken(); // Token check if needed
      const res = await apiClient.post(`api/QSubCategory/Add`, data, atoken); // Use API endpoint for add
      if (res) {
      pullSubCategoryList(); // Refresh category list after adding
      dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
      dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
      dispatch({ type: actionTypes.SET_MSGALERT, value: true });
      clearfilledDocument();
      toast.success("SubCategory added successfully!", { toastId: "UserCategoryadded" });
      showSubCat(); // Handle UI change or redirection if needed
      }
    }
    
    setLoading(false); // Stop loading state after operation
    };
  const validationSchema = yup.object({
    questioncategoryid: yup.string().required("Please Select QuestionCategory"),
    questionsubcategory: yup.string("").required("Please Enter SubCategory"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit,
    validationSchema,
  
    
  });
  
  console.log("form values: ", formik.errors);

  const prefilledDocument = () => {
    ;
    formik.setFieldValue("id", editRecordData?.id);
    setQuestionCategoryId(editRecordData?.questioncategoryid);
    Setquestioncategory(editRecordData?.questioncategory);
    setQuestionSubCategory(editRecordData?.questionsubcategory);
    setIsactive(editRecordData?.isActive);
  };

  const clearfilledDocument = () => {
    seteditRecordData([]);
    formik.setFieldValue("id", 0);
    Setquestioncategory("");
    setQuestionCategoryId(0);
    setQuestionSubCategory("");
    setIsactive(true);
    
  };

  const [SubCategoryList, setSubCategoryList] = useState([]);

  // const pullSubCategoryList = () => {
  //   var data = {
  //     CustomerId: customerid,
  //     SortingColumn: "Id"
  //   };
  //   setLoading(true);
  //   SubCategoryFindAll(data,atoken).then((res) => {
  //     //console.log(res);
  //     setGridloading(true)
  //     if (res != "" && res != undefined) {
  //       setSubCategoryList(res);
  //       setTotalRecords(res[0]?.totalrecords);
  //       setPageCount(Math.ceil(res[0]?.totalrecords / 10));
  //     }
  //     setLoading(false);
  //     setGridloading(false)
  //   });
  // };
	const pullSubCategoryList = async () => {
		;
		const isTokenExpired = await updateToken();
		const SortingColumn = "Id";
		
	
		;
		// Correctly passing the token in the headers
		const res = await apiClient.get(
			`api/QSubCategory/Find?CustomerId=${customerid}&SortingColumn=${SortingColumn}`,
			atoken
		);
		 
		if (res) {
      setSubCategoryList(res?.result);
			setTotalRecords(res[0]?.totalrecords);
			setPageCount(Math.ceil(res[0]?.totalrecords / 10));
		}
		
		setGridloading(false);
	};
  const callbackedit = useCallback((data) => {
    ;
    setQuestionCategoryId(data.questioncategoryid);
   Setquestioncategory(data?.questioncategory);
   setQuestionSubCategory(data?.questionsubcategory);
    setIsactive(data.isActive);
    seteditRecordData(data);
    setState({ ...state, addnewfield: true });
  }, []);

  const [catAllList, setCatAllList] = useState([]);
  const PullCategoryFindAll = () => {
    
    var data = {
      CustomerId: customerid,
      IsActive: "true"
    };
    CategoryFindAll(data,atoken).then((res) => {
      
      // console.log(res);
      setCatAllList(res);
    });
  };


  const [gridloading, setGridloading] = useState(true);
const columns = [
  {
    field: "questioncategory",
    headerName: "Category",
    width: 150, 
  },

  {
    field: "questionsubcategory",
    headerName: "Sub Category",
    width: 150, 
  },

  {
    field: "isActive",
    headerName: "Status",
    width: 95,
    renderCell: (params) => (
      params.formattedValue ? "Active" : "InActive"
      
    )
  },
  {
    field: "action",
    headerName: "Action",
    width: 60,
    renderCell: (params) => (
      <IconButton
          size="small"
          className="bg-white"
          onClick={() => callbackedit(params?.row)}
        >
          <HiPencilAlt className="f17 text-primary" />
        </IconButton>
      
    )
  }
 
];
const getRowId = (row) => {
  //console.log('getrowid', row.id)
  return row.id;
}

const handleCategoryChange = (e) => {
  const selectedCategoryId = e.target.value;
  const selectedCategory = catAllList.find(cat => cat.id === selectedCategoryId);
  setQuestionCategoryId(selectedCategoryId);
  Setquestioncategory(selectedCategory?.questioncategory);
};

  return (
    <>
      <div className="d-flex flex-row">
        <form
          onSubmit={formik.handleSubmit}
          autoComplete="off"
          className="col-12 col-md-8 col-lg-4 p-0"
        >
          <div className="d-flex flex-column min-vh-50">
          <div className="col-12 mb-4 focus">
  <FormControl fullWidth error={formik.touched.questioncategoryid && Boolean(formik.errors.questioncategoryid)}>
    <InputLabel id="category">Category</InputLabel>
    <Select
      labelId="questioncategoryid"
      InputLabelProps={{
        shrink: true,
      }}
      label="Category"
      id="questioncategoryid"
      name="questioncategoryid"
      variant="outlined"
      value={questioncategoryid}
      size="small"
      // onChange={(e) => {
      //   setQuestionCategoryId(e?.target?.value);
      //   setQuestionCategoryId(e?.target?.value.questioncategory);
      
      // }}
      onChange={handleCategoryChange}

      onBlur={formik.handleBlur}
    >
      {catAllList?.map((option, i) => (
        <MenuItem key={i} value={option?.id}>
          {option?.questioncategory}
        </MenuItem>
      ))}
    </Select>
    {formik.touched.questioncategoryid && formik.errors.questioncategoryid && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.questioncategoryid}
      </FormHelperText>
    )}
  </FormControl>
</div>

            <div className="col-12 mb-4 focus">
              <TextFieldCell
                id="questionsubcategory"
                required
                name="questionsubcategory"
                label="Sub-Category "
                placeholder=""
                value={questionsubcategory}
                onChange={(e) => {
                  setQuestionSubCategory(e?.target?.value);
                }}
                maxLength={50}
                InputProps={{
                  endAdornment: questionsubcategory && (
                    <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary">
                      {questionsubcategory?.length}/50
                    </Typography>
                    </InputAdornment>
                  ),
                  }}
              />
              {formik.errors.questionsubcategory &&
                formik.touched.questionsubcategory && (
                  <div className="error error-red small-font">
                    {formik.errors.questionsubcategory}
                  </div>
                )}
            </div>
             <div className="col-12 mb-4">
              <FormControl fullWidth>
                <InputLabel id="Status">Status</InputLabel>
                <Select
                  labelId="Status"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  variant="outlined"
                  size="small"
                  id="isActive"
                  name="isActive"
                  value={isActive}
                  label="Status"
                  onChange={(e) => {
                    setIsactive(e?.target?.value);
                  }}
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>InActive</MenuItem>
                </Select>
              </FormControl>
            </div> 
            <div className="col-12 text-end">
             
              {!loading ? (
                <>
         
                <Button color="primary" variant="contained" size="medium" onClick={clearfilledDocument}>

                Reset
              </Button>
              <span style={{ margin: '0 5px' }}></span> 
                <Button
                 
                   color="primary"
                  variant="outlined"
                    size="medium"
                
                  type="submit"
                  disabled={!questioncategoryid} 
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
        </form>

        <div className="col-12 col-md-8 col-lg-8 p-0 ms-4 border-start">
          <div className="d-flex flex-column min-vh-50">
            <div className="flex-grow-1 p-2">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-12 mb-3">
                    {/* <div className=" col-12 pt-2 pb-1 rounded border-bottom ms-0 me-0 mb-3 bggray">
                      <div className="col-12 col-md-12">
                        <div className="row text-left f12 lingh14 text-muted col-lg col-12">
                          <div className="col-lg-5 ms-1">
                            <div>Category</div>
                          </div>
                          <div className="col-lg-5">
                            <div>Sub-Category</div>
                          </div>
                          <div className="col-lg-1">
                            <div>Status</div>
                          </div>
                        </div>
                      </div>
                    </div> */}
                    {/* {SubCategoryList && SubCategoryList?.length > 0 ? (
                      SubCategoryList?.map((item, i) => (
                        <>
                          <SubCatResultCell
                            key={i}
                            itemin={item}
                            callbackedit={callbackedit}
                          />
                        </>
                      ))
                    ) : (
                      <>
                        <NoRecordCell />
                      </>
                    )} */}
                                   <DataGrid

// onRowClick={handleRowClick}
getRowId={getRowId}
rows={SubCategoryList}
loading={gridloading}
style={{height:"auto"}}
 columns={columns}

// getRowClassName={(params) =>
//   //params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
//   setSelectedRow(params.row)
// }


rowHeight={35}
columnHeaderHeight={35}
className='f13 bg-white'
disableRowSelectionOnClick
slots={{ toolbar: GridToolbar }}
slotProps={{
  toolbar: {
    showQuickFilter: true,
  },
}}

/>
                  </div>
                  <div className="pagination_wrapper mb-3 mt-3">
                    <div className="d-flex align-items-center">
                      {/* <div className="flex-grow-1 ">
                        Records: {totalRecords}
                      </div>
                      <div className="">
                        <Pagination
                          color="primary"
                          variant="outlined"
                          count={pageCount}
                          page={page}
                          onChange={handleChange}
                        />
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddQuestionSubCategory;
