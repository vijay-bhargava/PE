import React, { useState, useEffect, useCallback } from "react";
import {
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../../assets/css/base.css"
import { BackButton } from "./component";
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ApiClient, api } from "../../Apiclient";
import { UpdateUom, getUomList } from "./utility";
import MasterFormPanel, { MfpEditBtn } from "../../components/MasterFormPanel/MasterFormPanel";

const AddUpdateUom = ({ handleUomList, isModal = false }) => {

  const [{ atoken, rtoken, customerid, customersuffix, managerId }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [uom, setuom] = useState("");
  const [editRecordData, seteditRecordData] = useState(null);


  const [loading, setLoading] = useState(false);

  const [isActive, setisActive] = useState(true);
  useEffect(() => {
    if (editRecordData) {
      prefilleduom();
    }
  }, []);

  useEffect(() => {
    pullUomList();
  }, []);


  const validationSchema = yup.object({
    uom: yup.string().required("Please Enter Uom"),

  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: editRecordData?.id ? `${editRecordData?.id}` : 0,
      uom: editRecordData?.uom ? editRecordData?.uom : uom,
      isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {

      if (!values.uom) {
        setLoading(false);
        toast.error("Please enter Uom.", { toastId: "uomjhd" });
        return;
      }

      setLoading(true);

      var data = {
        id: editRecordData?.id ? editRecordData?.id : 0,
        uom: values?.uom,
        isActive: isActive,
      };

      if (editRecordData?.id > 0) {
        UpdateUom(data, editRecordData?.id, atoken).then((res) => {
          setLoading(false);
          pullUomList();
          dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
          dispatch({
            type: actionTypes.SET_MSGALERTDATA,
            value: res?.data?.message,
          });
          dispatch({ type: actionTypes.SET_MSGALERT, value: true });
          //callbackstep("update");
          clearfilleduom();
          toast.success("Uom updated successfully!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });

          return true;
        });
      } else {
        let data = {
          customerId: values?.customerid,
          id: 0,
          uom: values?.uom,
          isActive: values?.isActive,
        };
        const res = await apiClient.postres("/api/UOM/Add", data, atoken)

        if (res) {

          pullUomList();

          dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
          dispatch({
            type: actionTypes.SET_MSGALERTDATA,
            value: res?.data?.message,
          });
          dispatch({ type: actionTypes.SET_MSGALERT, value: true });
          clearfilleduom();

          toast.success("Uom added successfully!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });

          setLoading(false);
          return true;
        }

        setLoading(false);
        // AddUom(values, atoken).then((res) => {


        // })
        // .catch((error) => {
        //   setLoading(false);

        //   if (error.message === "Role already exists") {
        //     toast.error("User already exists!", {
        //       position: toast.POSITION.TOP_CENTER,
        //       autoClose: 1000,
        //     });
        //   } else {
        //     toast.error("Role already exists.", {
        //       position: toast.POSITION.TOP_CENTER,
        //       autoClose: 1000,
        //     });
        //   }
        //   // Handle other errors if necessary
        // });


      }
    },
  });

  const prefilleduom = () => {

    if (editRecordData) {
      formik.setFieldValue("id", editRecordData.id);
      setuom(editRecordData.uom);
      setisActive(editRecordData.isActive);
    }
  };

  const clearfilleduom = () => {
    seteditRecordData([]);
    formik.setFieldValue("id", 0);
    setuom("");

    //	setisActive(0);

  };
  const Resetuom = () => {
    // seteditRecordData([]);
    //formik.setFieldValue("id", 0);
    setuom("");

    // setisActive(1);

  };
  // const handleChangeuom = (event) => {
  // 	const { value } = event.target;
  // 	//const cleanedValue = removeSpecialCharactersAndNumbers(value);

  // 	setuom(value);
  //   formik.setFieldValue("uom",value);
  // };
  const handleChangeuom = (event) => {
    const { value } = event.target;

    const sanitizedValue = value.replace(/<script.*?>.*?<\/script>/gi, '').replace(/<.*?>/g, '');
    setuom(sanitizedValue);
    formik.setFieldValue("uom", sanitizedValue);
  };


  const [userList, setUserList] = useState([]);
  const pullUomList = () => {
    var data = {
      CustomerId: customerid,

    };
    setLoading(true);
    getUomList(data, atoken).then((res) => {

      setGridloading(true);
      if (res != "" && res != undefined) {
        setUserList(res);
        setGridloading(false);
        if (typeof handleUomList === 'function') handleUomList(res);
      }
      setLoading(false);
      setGridloading(false);
    });
  };

  const callbackedit = useCallback((data) => {
    setuom(data.uom);

    setisActive(data.isActive);
    seteditRecordData(data);
  }, []);

  const [gridloading, setGridloading] = useState(true);
  const columns = [
    {
      field: "uom",
      headerName: "UOM",
      flex: 2,
      minWidth: 160,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className={`badge-status ${params.value ? "badge-active" : "badge-inactive"}`}>
          {params.value ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      field: "action",
      headerName: "Action",
      width: 80,
      sortable: false,
      renderCell: (params) => <MfpEditBtn onClick={() => callbackedit(params?.row)} />
    }

  ];
  const getRowId = (row) => {
    return row.id;
  }
  return (
    <div
      className={`bg-white rounded-default w-100 d-flex flex-column ${!isModal ? "p-3 shadow-sm" : "p-0"}`}
      style={!isModal ? { height: "90vh" } : { height: "100%" }}
    >
      {!isModal && (
        <div className="d-flex align-items-center border-bottom rounded-default mb-3 pb-2">
          <BackButton title={<span className="page-heading">UOM</span>} />
        </div>
      )}

      <div className="flex-grow-1" style={{ minHeight: 0 }}>
        <MasterFormPanel
          title="UOM"
          isModal={true}
          onReset={Resetuom}
          onSubmit={formik.handleSubmit}
          loading={loading}
          columns={columns}
          rows={userList}
          gridLoading={gridloading}
          getRowId={getRowId}
        >
          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">
              UOM <span className="rfq-required-star">*</span>
            </label>
            <TextField
              id="uom"
              name="uom"
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Enter UOM"
              label={null}
              value={uom}
              onChange={handleChangeuom}
              inputProps={{ maxLength: 100 }}
              InputProps={{
                endAdornment: uom ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      {uom.length}/100
                    </Typography>
                  </InputAdornment>
                ) : null,
              }}
            />
            {formik.errors.uom && formik.touched.uom && (
              <div className="error error-red" style={{ fontSize: "9px" }}>
                {formik.errors.uom}
              </div>
            )}
          </div>

          <div className="mfp-field mfp-field--sm">
            <label className="pe-field-label">Status</label>
            <FormControl fullWidth size="small">
              <Select
                variant="outlined"
                size="small"
                value={isActive}
                onChange={(e) => setisActive(e.target.value)}
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>
        </MasterFormPanel>
      </div>
    </div>
  );
}
export default AddUpdateUom;
