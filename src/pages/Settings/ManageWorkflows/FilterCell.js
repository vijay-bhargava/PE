import React, { useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  customerid,
  getworkflowlist,
  
} from "../../../utils/workflow";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { formatDate } from "../../../utils/common/utility";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useRef } from "react";
const domain = process.env.REACT_APP_API_CALL;
const customerId = process.env.REACT_APP_CUSTOMERID;

const FilterCell = ({callbackwflist}) => {
  
  //const { callbackwflist, Setcallbackwflist } = props;
  //const [recorddata, setRecorddata] = useState();
  const [loading, setLoading] = useState(false);
  const validationSchema = yup.object({
       
  });
 
  const formik = useFormik({
    initialValues: {
      customerid: 1,
      wfName: "",
      eventType: "",
      required: true,
      status: true,
      userid: 0,
      createdon:'',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      
      console.log(values);
      
      const inputDate = new Date(); // Replace with your date input
      let formattedDate = formatDate(inputDate);
        
      callbackwflist(   
        {
          customerid: values.customerid,
          wfName: values.wfName,  
          eventType: values.eventType,
          required: values.required,
          status: values.status,
          createdon: formattedDate,
          pagenumber:1,
          userid:0
        }
      )
     
  }})


  const formRef = useRef();

   const handleResetClick=()=>{
   // 
   const inputDate = new Date(); // Replace with your date input
   let formattedDate = formatDate(inputDate);
   formik.resetForm();
    formRef.current.reset();
    callbackwflist({
      customerid: 1,
      wfName:"",  
      eventType:"",
      required: true,
      status: true,
      createdon: formattedDate,
      pagenumber:1,
      userid:0
    });
    
  }

  return (
    <>
      <div className="col-12 col-md-4 col-lg-3 border-start p-0">
        <div className="d-flex flex-column min-vh-100">
          <div className="bg-white border-bottom minh50px d-flex align-items-center ps-2 pe-2">
            <div className="row">
              <div className="col-12">
                <div className="f14">Filters</div>
              </div>
            </div>
          </div>
          <form onSubmit={formik.handleSubmit} ref={formRef} autoComplete="off">
            <div className="flex-grow-1">
              <div className="p-3">
                <div className="row">
                  <div className="col-12 mb-4">
                    <TextFieldCell
                      id="wfName"
                      name="workflow Title"
                      label="Workflow Title"
                      placeholder=""
                      value={formik.values.wfName}
                      onChange={(e) => {
                        formik.setFieldValue("wfName", e.target.value);
                      }}
                    />
                  </div>
                  <div className="col-12 mb-4">
                    <FormControl fullWidth>
                      <InputLabel id="eventtype">Event Type</InputLabel>
                      <Select
                        labelId="eventtype"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="outlined"
                        size="small"
                        id=""
                        name=""
                        value={formik.values.eventType}
                        label="Event Type"
                        // onChange={handleChange}
                        onChange={(e) => {
                          formik.setFieldValue("eventType", e.target.value);
                        }}
                      >
                         <MenuItem value={"eRFQ"}>RFQ</MenuItem> 
                        <MenuItem value={"RA"}>RA</MenuItem>
                        <MenuItem value={"FA"}>FA</MenuItem>
                        <MenuItem value={"VQ"}>VQ</MenuItem>
                        <MenuItem value={"NFA"}>NFA</MenuItem>
                        <MenuItem value={"VO"}>Vendor Onboarding</MenuItem>
                        <MenuItem value={"RFI"}>RFI</MenuItem>
                        <MenuItem value={"RFI"}>RFI</MenuItem>
                        <MenuItem value={"PO"}>PO</MenuItem>
                        <MenuItem value={"Invoice"}>Invoice</MenuItem> 
                      </Select>
                    </FormControl>
                  </div>
                  {/* <div className='col-12 mb-4'>
                                            <FormControl fullWidth>
                                                <InputLabel id="Workflowtype">Workflow Type</InputLabel>
                                                <Select
                                                    labelId="Workflowtype"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    variant="outlined"
                                                    size='small'
                                                    id="Workflowtype"
                                                    name=""
                                                    //value={1}
                                                    label="Workflow Type"
                                                    value= {formik.values.wfName}
                                                  
                                                // onChange={handleChange}
                                                    onChange={(e) => {
                                                    formik.setFieldValue("eventtype", e.target.value);
                                                }}
                                                //onChange={handleChange}
                                                >
                                                    <MenuItem value={1}>All</MenuItem>
                                                    <MenuItem value={2}>Technical</MenuItem>
                                                    <MenuItem value={3}>Commercial</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div> */}
                  {/* <div className="col-12 mb-4">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DesktopDatePicker
                        variant="outlined"
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            fullWidth: true,
                            size: "small",
                            InputLabelProps: { shrink: true },
                          },
                        }}
                        format={"dd/MM/yyyy"}
                        value={formik.values.createdon}
                        onChange={(val) => {
                          console.log(val);
                          formik.setFieldValue("createdon", val);
                        }}
                        label="Date Created"
                        renderInput={(params) => (
                          <TextField
                            variant="standard"
                            className="w-100"
                            {...params}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </div> */}
                  {/* <div className='col-12 mb-4'>
                                            <Autocomplete
                                                disablePortal
                                                multiple
                                                id=""
                                                size='small'
                                               // options={top100Films}
                                                fullWidth
                                                renderInput={(params) => <TextField {...params} InputLabelProps={{
                                                    shrink: true,
                                                }} label="By Users" />}
                                            />
                                        </div> */}
                  <div className="col-12 mb-4">
                    <FormControl fullWidth>
                      <InputLabel id="Required">Required</InputLabel>
                      <Select
                        labelId="Required"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        variant="outlined"
                        size="small"
                        id="required"
                        name=""
                        //value={1}
                        label="Required"
                        value={formik.values.required}
                        onChange={(e) => {
                          formik.setFieldValue("required", e.target.value);
                        }}
                        //onChange={handleChange}
                      >
                        
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
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
                        id="status"
                        name=""
                        //value={1}
                        label="Status"
                        value={formik.values.status}
                        onChange={(e) => {
                       //   ;
                          formik.setFieldValue("status", e.target.value);
                        }}
                        //onChange={handleChange}
                      >  
                        <MenuItem value={true}>Active</MenuItem>
                        <MenuItem value={false}>Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-12 text-end">
                    <LoadingButton
                      variant="text"
                      color="primary"
                      className="me-3 text-capitalize"
                      size="small"
                      onClick={handleResetClick}
                    >
                      Reset 
                    </LoadingButton>
                    {!loading ? (
                          <Button
                            color="success"
                            variant="outlined"
                            size="small"
                            type="submit"
                          >
                            Search
                          </Button>
                        ) : (
                          <LoadingButton
                            className=""
                            loading
                            variant="contained"
                          >
                            Searching ...
                          </LoadingButton>
                        )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
const top100Films = [
  { label: "User 1", year: 1952 },
  { label: "User 2", year: 1995 },
  { label: "User 3", year: 1948 },
  { label: "User 1erew", year: 1921 },
  { label: "User sdf", year: 2009 },
  { label: "User sdfdsf", year: 2000 },
  { label: "User dsfdsfsdf", year: 2009 },
  { label: "User sdfsdf", year: 1975 },
];
export default FilterCell;
