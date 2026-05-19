import React, { useCallback, useState, useEffect } from "react";
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
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { HiOutlineX, HiPlusSm, HiX } from "react-icons/hi";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { Modal } from "react-bootstrap";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { actionTypes, useStateValue } from "../../../store";
import { useFormik } from "formik";
import {
  saveCommercialList,
  updateCommercial,
 
} from "../../../utils/commerciallibrary";
import CryptoJS from 'crypto-js';
import { ApiClient, api } from "../../../Apiclient";
import { useCookies } from "react-cookie";
import { isTokenExpired } from "../../../utils/common";

const AddUpdategradeName = ({ callbackstep, editRecordData, seteditRecordData }) => {
  const [{ atoken, rtoken, customerid, customersuffix }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
  
  const updateToken = async () => {    
    const res = await isTokenExpired(atoken, rtoken, customerid);      
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
  const [gradeName, setgradeName] = useState("");
  const [fromScore, setFromScore] = useState("");
  const [toScore, setToScore] = useState("");

  useEffect(() => {
    if (editRecordData) {
      formikgradeNameUpdate.setFieldValue("id", editRecordData?.id);
      prefilledgradeName();
    }
  }, []);

  const validationSchema = yup.object({
    gradeName: yup
      .string("Please Enter a gradeName Name")
      .required("Please Enter gradeName Name"),
    fromScore: yup
      .number("Please Enter a valid number")
      .required("Please Enter From Score")
      .min(0, "From Score must be 0 or greater")
      .max(100, "From Score must be 100 or less"),
    toScore: yup
      .number("Please Enter a valid number")
      .required("Please Enter To Score")
      .min(0, "To Score must be 0 or greater")
      .max(100, "To Score must be 100 or less")
      .test('score-range', 'To Score must be greater than From Score', function(value) {
        const { fromScore } = this.parent;
        return !fromScore || !value || Number(value) > Number(fromScore);
      })
  });

  const formikgradeNameUpdate = useFormik({
    enableReinitialize: true,
    initialValues: {
      gradeName: editRecordData?.gradeName ? editRecordData?.gradeName : gradeName,
      fromScore: editRecordData?.fromScore ? editRecordData?.fromScore : fromScore,
      toScore: editRecordData?.toScore ? editRecordData?.toScore : toScore,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
  
      var data = {
        gradeName: values.gradeName,
        fromScore: Number(values.fromScore),
        toScore: Number(values.toScore)
      };
  
      if (editRecordData?.id > 0) {
        const isTokenExpired = await updateToken();  
        const res = await apiClient.put(`/api/GradeMaster/${editRecordData?.id}/Update`,data,atoken
);
        if (res) {
          callbackstep("update");
          toast.success("grade updated successfully!", {
            toastId: "PRgradeNameUpdate",
          });
        }
      } else {
        const isTokenExpired = await updateToken();  
        const res = await apiClient.post(`/api/GradeMaster/Add`, data, atoken);
        if (res) {
          callbackstep("add");
          toast.success("grade added successfully!", {
            toastId: "PRgradeNameAdd",
          });
        }
      }
      setLoading(false);
    }, 
  });
  
  const prefilledgradeName = () => {
    formikgradeNameUpdate.setFieldValue("id", editRecordData?.id);
    setgradeName(editRecordData?.grade);
    setFromScore(editRecordData?.fromScore);
    setToScore(editRecordData?.toScore);
  };

  const clearfilledgradeName = () => {
    setgradeName("");
    setFromScore("");
    setToScore("");
    formikgradeNameUpdate.resetForm();
  };

  const handlegradeNameChange = (e) => {
    const input = e?.target?.value;
    const sanitizedInput = input.replace(/'/g, "");
    setgradeName(sanitizedInput);
    formikgradeNameUpdate?.setFieldValue("gradeName", sanitizedInput);
  };

  const handleFromScoreChange = (e) => {
    const value = e?.target?.value;
    setFromScore(value);
    formikgradeNameUpdate?.setFieldValue("fromScore", value);
  };

  const handleToScoreChange = (e) => {
    const value = e?.target?.value;
    setToScore(value);
    formikgradeNameUpdate?.setFieldValue("toScore", value);
  };

  return (
    <>
      <form onSubmit={formikgradeNameUpdate.handleSubmit} autoComplete="off">
        <div className="row mt-2">
          <div className="col-12 col-md-12">
            <TextFieldCell
              id="gradeName"
              name="gradeName"
              label="grade Name *"
              value={gradeName}
              inputProps={{ maxLength: 50 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary">
                      {gradeName?.length}/50
                    </Typography>
                  </InputAdornment>
                ),
              }}
              onChange={handlegradeNameChange}
            />
            {formikgradeNameUpdate.errors.gradeName && formikgradeNameUpdate.touched.gradeName && (
              <div className="error error-red" style={{ fontSize: '9px' }}>
                {formikgradeNameUpdate.errors.gradeName}
              </div>
            )} 
          </div>

          <div className="col-12 col-md-6 mt-3">
            <TextFieldCell
              id="fromScore"
              name="fromScore"
              label="From Score *"
              type="number"
              value={fromScore}
              inputProps={{ min: 0, max: 100, step: "0.01" }}
              onChange={handleFromScoreChange}
            />
            {formikgradeNameUpdate.errors.fromScore && formikgradeNameUpdate.touched.fromScore && (
              <div className="error error-red" style={{ fontSize: '9px' }}>
                {formikgradeNameUpdate.errors.fromScore}
              </div>
            )} 
          </div>

          <div className="col-12 col-md-6 mt-3">
            <TextFieldCell
              id="toScore"
              name="toScore"
              label="To Score *"
              type="number"
              value={toScore}
              inputProps={{ min: 0, max: 100, step: "0.01" }}
              onChange={handleToScoreChange}
            />
            {formikgradeNameUpdate.errors.toScore && formikgradeNameUpdate.touched.toScore && (
              <div className="error error-red" style={{ fontSize: '9px' }}>
                {formikgradeNameUpdate.errors.toScore}
              </div>
            )} 
          </div>

          <div className="col-12 text-end me-0 pe-2 mt-4">
            <LoadingButton
              variant="text"
              type="reset"
              color="primary"
              className="me-2 text-capitalize"
              size="small"
              onClick={clearfilledgradeName}
            >
              Reset
            </LoadingButton>
            <LoadingButton
              type="submit"
              variant="outlined"
              color="primary"
              className="text-capitalize"
              size="small"
              loading={loading}
            >
              Submit
            </LoadingButton>
          </div>
        </div>
      </form>
    </>
  );
};

export default AddUpdategradeName;