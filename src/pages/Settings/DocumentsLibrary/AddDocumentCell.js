import React, { useCallback, useState, useEffect, useRef } from "react";
import { LoadingButton } from "@mui/lab";
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import { HiOutlineX } from "react-icons/hi";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { Form } from "react-bootstrap";
import { formatDate, getMenuMaster } from "../../../utils/common/utility";
import * as yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OutlinedInput from "@mui/material/OutlinedInput";
import { useFormik } from "formik";
import { useStateValue } from "../../../store";
import {
    saveDocumentLibrary,
    updateDocumentLibrary,
    uploadFilesOnAzure,
} from "../../../utils/documentlibrary";

import { downloadFilesOnAzure, getExtension, validateFileSize } from "../../../utils/common";
import { UploadFile } from "@mui/icons-material";
import { api, ApiClient } from "../../../Apiclient";

const AddDocumentCell = ({
    callbackstep,
    editRecordData,
    seteditRecordData,
    setUnsavedChanges
}) => {
    const [{ atoken, rtoken,customersuffix,customerid }, dispatch] = useStateValue();
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
        const [isEditMode, setIsEditMode] = useState(false);
    const addUserList = useCallback((passData) => {
        console.log("dfdf", passData);
        var dataMatch = records.map((t) => t.id);
        if (dataMatch.includes(passData?.id)) {
            console.log("Already selected");
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
   
    const [modal, setModal] = useState(false);
    const CloseModal = () => setModal(false);
    const OpenModal = () => setModal(true);

   
   
    const [filepath, setfilepath] = useState("");
    const [file, setFile] = useState(null);
    const [attachment, setattachment] = useState(null);
   
    const inputDate = new Date(); // Replace with your date input
    let formattedDate = formatDate(inputDate);
    const fileInputRef = useRef(null);
    const [modifiedon, setmodified] = useState(formattedDate);
    const apiClient = new ApiClient(customersuffix);
    useEffect(() => {
        pullMenuMaster();
        if (editRecordData && editRecordData?.id > 0) {
            prefilledDocument();
        }
    }, [editRecordData]);

    const validationSchema = yup.object({
        attachmentdesc: yup
            .string("Enter attachment description")
            .required("Document Title  is required")
            .max(100, "Document Title must be at most 100 characters long"),

            eventtype: yup.array().test(
                'min-length',
                'Please Select event',
                (value) => {
               
                  if (!value) {
                   
                    return false;
                  }
                  if (value.length <= 0) {
                   
                    return false;
                  }
                 
                  return true;
                }
              ),
       

    });
    const SavingDocument = async (values) => {
        setLoading(true);
       
        var filepathreturn = "";
       
        var datapost = {
            id: editRecordData?.id ? editRecordData?.id : 0,
            customerId: customerid,
            eventtype: values?.eventtype,
            attachmentdesc: values?.attachmentdesc,
            required: values?.required,
            isactive: values?.isactive,
            filepath: filepath,
            attachment: attachment,
            modifiedon: modifiedon,
        };

        if (editRecordData?.id > 0) {
            if (fileList) {
                var Data = {
                    RequestedBy: "customer",
                    CustomerId: customerid,
                    Description: "DocumentLibrary",
                    EventType: values?.eventtype,
                };

                uploadFilesOnAzure(Data, fileList, atoken).then(async (resdata) => {
                    filepathreturn = resdata;

                    var data = {
                        id: editRecordData?.id ? editRecordData?.id : 0,
                        customerId: customerid,
                        eventtype: values?.eventtype,
                        attachmentdesc:values?.attachmentdesc,
                        required: values?.required,
                        isactive: values?.isactive,
                        filepath: filepathreturn ? filepathreturn : filepath,
                        attachment: postFileName ? postFileName : attachment,
                        modifiedon: modifiedon,
                    };
                    if (data.eventtype.length > 0) {
                        updateDocumentLibrary(data, editRecordData?.id, atoken).then(
                            (res) => {
                                setLoading(false);
                                callbackstep("update");
                                clearfilledDocument();
                                setUnsavedChanges(false);
                                toast.success("Document updated successfully!", {
                                toastId: "DOC_UPDATED",
                                });
                                return true;
                            }
                        );
                    } else {
                        let payload = {
                            id: editRecordData?.id,
                            customerid: data.customerId,
                            eventtype: "",
                            attachmentdesc: data?.attachmentdesc,
                            attachment: data?.attachment,
                            filepath: data?.filepath,
                            required: data?.required,
                            isactive: data?.isactive,
                        };
                        const res = await apiClient.postres(
                            `api/Doclib/Update`,
                            payload,
                            atoken
                        );
            if (res) {
              setLoading(false);
                            callbackstep("update");
                            setUnsavedChanges(false);
                            clearfilledDocument();
                            toast.success("Document updated successfully!", {
                            toastId: "Documentss"
              });
              return true;
                        }
                    }
                });
            } else {
                updateDocumentLibrary(datapost, editRecordData?.id, atoken).then(
                    async (res) => {
                        setLoading(false);
                        callbackstep("update");
                        setUnsavedChanges(false);
                        clearfilledDocument();
                        return true;
                    }
                );
            }
        } else {
            if (fileList) {
                var Data = {
                    RequestedBy: "customer",
                    CustomerId: customerid,
                    Description: "DocumentLibrary",
                    EventType: values?.eventtype,
                };
                uploadFilesOnAzure(Data, fileList, atoken).then(async (resdata) => {
                    filepathreturn = resdata;

                    var data = {
                        id: editRecordData?.id ? editRecordData?.id : 0,
                        customerId: customerid,
                        eventtype: values?.eventtype,
                        attachmentdesc: values?.attachmentdesc,
                        required: values?.required,
                        isactive: values?.isactive,
                        filepath: filepathreturn ? filepathreturn : filepath,
                        attachment: postFileName ? postFileName : attachment,
                        modifiedon: modifiedon,
                    };
                   
                    if (data.eventtype.length > 0) {
                        saveDocumentLibrary(data, atoken).then((res) => {
                            console.log("saving document", res);
                           
                            setLoading(false);

                            console.log("save", res);
                            //  formRef.current.reset();
                            // ;
                            callbackstep("add");
                            setUnsavedChanges(false);
                            clearfilledDocument();
                            toast.success("Document added successfully!", {
                                toastId: "added_document"
                            });
                            return true;
                        });
                    } else {
                        let payload = {
                            id: 0,
                            customerId: data.customerId,
                            eventtype: "",
                            attachmentdesc: data?.attachmentdesc,
                            attachment: data?.attachment,
                            filepath: data?.filepath || "",
                            required: data?.required,
                            isactive: data?.isactive,
                        };
                        const res = await apiClient.postres(
                            `/api/Doclib/Add`,
                            payload,
                            atoken
                        );
            if (res) {
              setLoading(false);
              callbackstep("add");
              setUnsavedChanges(false);
                            clearfilledDocument();
                            toast.success("Document added successfully!", {
                            toastId: "saveddocument"
              });
              return true;
                        }
                    }
                });
            } else {
                saveDocumentLibrary(datapost, atoken).then((res) => {
                    setLoading(false);
                    console.log("save", res);
                    callbackstep("add");
                    setUnsavedChanges(false);
                    clearfilledDocument();
                    return true;
                });
            }
        }
    };
    const formik = useFormik({
        enableReinitialize: true,

        initialValues: {
            id: 0,
            customerId: customerid,
            attachmentdesc: "",
            eventtype:  [],
            attachment: "",

            filepath:"",
            required:  true,
            isactive: true,
            createdby: 1,
            modifiedby: 1,
            modifiedon: modifiedon,
        },

        validationSchema: validationSchema,
        onSubmit: (values) => {
           
            SavingDocument(values);
        },
    });

    const [fileList, setFileList] = React.useState([]);
    const [fileLimit, setFileLimit] = useState(false);
    const [postFileName, setPostFileName] = React.useState("");

    const MAX_COUNT = 3;

    const handleUploadFiles = (file) => {
       
        const filename = file[0].name;

        return filename;
    };

    const handleFileRemove = (index) => {
        setFileList([]);
        setFileLimit(false);
        setattachment(null);
        setfilepath("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        } // Clear the attachment
    };


   

    function handleFileChange(event) {
        if (event) {
            if (!validateFileSize(event))
                {
                    setPostFileName("");
   
   
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                    return;
                }
                else{
                    let file = event.target.files[0];
                    const fileName = file.name;
                    setPostFileName(fileName);
                }

            const fileName = event.target.files[0].name;
            if (fileName.length > 50) {
                toast.error("Attachment name must be 50 characters or fewer.", {
                    toastId: "Attachment"
                });
                event.target.value = null;
                return;
            }
            setattachment(fileName);
            var foldername = "Documents/" + formik?.values?.eventtype + formik?.values?.attachmentdesc; // Example folder name
            setfilepath(foldername);
            setFileList(event.target.files[0]);
            setUnsavedChanges(true);
        }
    }

    const prefilledDocument = () => {
       
        formik.setFieldValue("id", editRecordData?.id);
        formik.setFieldValue("attachmentdesc", editRecordData?.attachmentdesc);
        formik.setFieldValue("eventtype",editRecordData?.eventtype ? editRecordData?.eventtype.split(",") : []);
        formik.setFieldValue("isactive", editRecordData?.isactive);
        formik.setFieldValue("required", editRecordData?.required);
       
        setfilepath(editRecordData?.filepath);
        setattachment(editRecordData?.attachment);
        setIsEditMode(true);
    };
    const clearfilledDocument = () => {
       
       
        seteditRecordData([]);
        formik.setFieldValue("id", 0);
        formik.setFieldValue("required", false);
        formik.setFieldValue("eventtype", []);
        formik.setFieldValue("attachmentdesc","");
       
       
        setFileList([]);
        setPostFileName("");
        setattachment("");
        setfilepath("");
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };
    const ResetDocument = () => {
       
       
   
        formik.setFieldValue("required", false);
        formik.setFieldValue("eventtype", []);
        formik.setFieldValue("attachmentdesc","");
       
       
        setFileList([]);
        setPostFileName("");
        setattachment("");
        setfilepath("");
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };
    const onchangeEventType = (event) => {
       
        const selectedValues = Array.isArray(event.target.value)
            ? event.target.value
            : [event.target.value];
       
       
       
        formik.setFieldValue("eventtype", selectedValues);
        setUnsavedChanges(true);
    };
    const [MenuMasterList, setMenuMasterList] = useState([]);
    const pullMenuMaster = () => {
        var data = {
            MenuType: "Event",
        };

        getMenuMaster(data, atoken).then((res) => {
            console.log(res);
            setMenuMasterList(res);
        });
    };

    const handleDownload = () => {
        if (editRecordData?.filepath) {
            downloadFilesOnAzure(editRecordData.filepath, attachment, atoken);
        }
    };

    const handleRemoveClick = () => {
        console.log("Remove button clicked");
        setFileList([]);
        setPostFileName("");
        setattachment("");
        setfilepath("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    const handleAttachmentdescChange = (e) => {
        const input = e?.target?.value;
        // Remove single quote character from input
        const sanitizedInput = input.replace(/'/g, "");
        // Set the sanitized input
        formik.setFieldValue("attachmentdesc",sanitizedInput)
        setUnsavedChanges(true);
    };

    const handleClick = () => {
        fileInputRef.current.click(); // Trigger the file input when the icon is clicked
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit} autoComplete="off">
                <div className="row mt-2">
                    <div className="col-12 col-md-6 mb-3">
                        <TextFieldCell
                            id="attachmentdesc"
                            name="attachmentdesc"
                            label="Document Title *"
                            placeholder=""
                            value={formik.values.attachmentdesc}
                            inputProps={{ maxLength: 100 }}
                            maxLength={100}
                            InputProps={{
                                endAdornment: formik.values.attachmentdesc && (
                                    <InputAdornment position="end">
                                        <Typography variant="body2" color="textSecondary">
                                            {formik.values.attachmentdesc?.length}/100
                                        </Typography>
                                    </InputAdornment>
                                ),
                            }}
                            onChange={handleAttachmentdescChange}
                        />
                        {formik.errors.attachmentdesc && formik.touched.attachmentdesc && (
                            <div className="error error-red" style={{ fontSize: "9px" }}>
                                {formik.errors.attachmentdesc}
                            </div>
                        )}
                    </div>
                    <div className="col-12 col-md-6 mb-3">
  <FormControl fullWidth className="documentForm">
    <InputLabel id="eventtype">Event Type *</InputLabel>
    <Select
      labelId="eventtype"
      InputLabelProps={{
        shrink: true,
      }}
      variant="outlined"
      size="small"
      id="eventtype"
      name="eventtype"
    //   multiple
      multiple={!isEditMode}
      value={formik?.values?.eventtype}
      onChange={onchangeEventType}
      input={<OutlinedInput label="Event Type *" />}
      renderValue={(selected) => {
        // Only show selected values as a comma-separated string without checkboxes
        return selected.length === 0
          ? 'Select Event'
          : selected
              .map((item) => {
                const selectedOption = MenuMasterList.find(
                  (option) => option.menuIdentity === item
                );
                return selectedOption ? selectedOption.menuName : '';
              })
              .join(', ');
      }}
    >
      {MenuMasterList?.map((option, i) => (
        <MenuItem key={i} value={option?.menuIdentity}>
          <Checkbox checked={formik?.values?.eventtype.indexOf(option?.menuIdentity) > -1} />
          <ListItemText primary={option?.menuName} />
        </MenuItem>
      ))}
    </Select>

    {/* Display validation errors if present */}
    {formik.errors.eventtype && formik.touched.eventtype && (
      <div className="error error-red" style={{ fontSize: "9px" }}>
        {formik.errors.eventtype}
      </div>
    )}
  </FormControl>
</div>

                   

                    <div className="row">
                        <div className="row ">
                            <div className="col-md-9">
                                <Form.Group controlId="formFile" className="" style={{width:"70%"}}>
                                    <Form.Control
                                        type="file"
                                        size="sm"
                                        accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                    />
                                </Form.Group>
                                <div
                                    className="col-12 col-md-12  mt-6"
                                    style={{ color: "blue", fontStyle: "italic" }}
                                >
                                    <div id="attachedFileName">
                                        {attachment && (
                                            <div className="d-flex align-items-center justify-content-start  mt-2">
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    className="attached-file-name"
                                                    onClick={handleDownload}
                                                >
                                                    {attachment}
                                                </Button>
                                                {/* {attachedFileName && <div>{attachedFileName}</div>} */}
                                                {/* <div className="attached-file-name">{attachedFileName}</div> */}
                                                <div>
                                                    <IconButton
                                                        size="medium"
                                                        className="bg-white "
                                                        onClick={handleFileRemove}
                                                    >
                                                        <HiOutlineX className="f16 text-danger" />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-12 col-md-3 ps-4 d-flex justify-content-between align-items-baseline"
                                style={{ marginTop: "-5px" }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="isactive"
                                            id="isactive"
                                            checked={formik.values?.isactive}
                                            onChange={(e) => {
                                                formik.setFieldValue("isactive",e?.target?.checked)
                                               
                                            }}
                                        />
                                    }
                                    label="Active "
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="required"
                                            id="required"
                                            checked={formik.values?.required}
                                            onChange={(e) => {
                                                formik.setFieldValue("required",e?.target?.checked)
                                            }}
                                        />
                                    }
                                    label="Required "
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 text-end pe-2">
                        {!loading ? (
                            <>
                                <Button
                                    color="primary"
                                    // variant="outlined"
                                    size="small"
                                    onClick={ResetDocument}
                                >
                                    Reset
                                </Button>

                                <span style={{ margin: "0 5px" }}></span>
                                <Button
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    type="submit">
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
        </>
    );
};
export default AddDocumentCell;