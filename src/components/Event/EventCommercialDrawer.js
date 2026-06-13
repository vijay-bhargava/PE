﻿import React, { useState, useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  InputAdornment,
  Typography,
  TextareaAutosize,
} from "@mui/material";
import { HiOutlineX } from "react-icons/hi";
import { Modal } from "react-bootstrap";
import * as yup from "yup";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/design-system.css";
import { useFormik } from "formik";
import { Delete } from "@mui/icons-material";
import TextFieldCell from "../../pages/BaseCells/TextFieldCell.js";
import { fetchCurrency } from "../../utils/common/index.js";
import AddUpdateUom from "../../utils/common/AddUpdateUom.js";
import { getMenuMaster, GetTablesColumns, UOMMasterList } from "../../utils/commerciallibrary/index.js";
import { LibraryFindAll } from "../../utils/questionlibrary/index.js";
import { useStateValue } from "../../store/StateProvider.jsx";

const EventCommercialDrawer = ({ callbackstep, editRecordData, LibraryTermsList }) => {
  const [libraryEntity, setlibraryEntity] = useState("");
  const [loading, setLoading] = useState(false);
  const [OpenUomModal, setOpenUomModal] = useState(false);
  const CloseModalUom = () => {
    setOpenUomModal(false)
    console.log("UOMMaster", UOMMaster)
  };
  const [records, setRecords] = useState([]);
  const [libraryType, setlibraryType] = useState("CommercialLibrary");

  const [{ atoken, customerid }, dispatch] = useStateValue();
  const [modal, setModal] = useState(false);
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
  const [formulavalue, setformulavalue] = useState("");
  const [tooltipMessage, setTooltipMessage] = useState("");

  const [LibraryModal, setLibraryModal] = useState(false);




  const [fieldName, setFieldName] = useState("");
  const [FormulaFieldName, setFormulaFieldName] = useState("");
  const [simpleOperator, setsimpleOperator] = useState("");
  useEffect(() => {

    if (editRecordData) {
      formik.setFieldValue("id", editRecordData?.id);
      prefilledCommercial();

    }
  }, []);


  useEffect(() => {
    // pullMenuMaster();
    // pullCurrencyMaster();
    // pullUOMMasterList();
    PullLibraryAll();
    // pullTablesColumns();
  }, []);
  const [eventtype, seteventtype] = useState("");
  const [resultColumnsData, setResultColumnsData] = useState([]);
  // const pullTablesColumns = () => {
  //   var data = {
  //     customerid:customerid ,
  //     eventtype: eventtype,
  //   };
  //   setLoading(true);
  //   GetTablesColumns(data, atoken).then((res) => {
  //     setLoading(false);
  //     if (res?.length) {
  //       setResultColumnsData(res);
  //       return true;
  //     }
  //   });
  // };

  const [isFormulaFieldDisabled, setIsFormulaFieldDisabled] = useState(false);
  const [resultCommLib, setResultCommLib] = useState([]);



  const validationSchema = yup.object({

    name: yup
      .string("Please Enter a Title")
      .required("Title is required"),

  });


  const [isFixedValueEnabled, setIsFixedValueEnabled] = useState(true);
  const [isFormulaFieldEnabled, setIsFormulaFieldEnabled] = useState(true);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: editRecordData?.id ? `${editRecordData?.id}` : 0,
      customerid: customerid,
      libraryEntity: editRecordData?.libraryEntity ? editRecordData?.libraryEntity : libraryEntity,
      libraryName: editRecordData?.libraryName
        ? editRecordData?.libraryName
        : libraryName,
      libraryId: editRecordData?.libraryId
        ? editRecordData?.libraryId
        : libraryId,
      name: editRecordData?.name ? `${editRecordData?.name}` : name,
      fieldName: editRecordData?.fieldName ? `${editRecordData?.fieldName}` : fieldName,
      eventtype: editRecordData?.eventtype ?? eventtype,

      level: editRecordData?.level ? editRecordData?.level : level,
      commValue: commValue,
      valuetype: editRecordData?.valuetype
        ? editRecordData?.valuetype
        : valuetype,
      isdefault: editRecordData?.isdefault ? editRecordData?.isdefault : true,
      formulavalue: formulavalue,
      orderseq: 0,
      currencyType: editRecordData?.currencyType
        ? editRecordData?.currencyType
        : currencyType,
      isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
      isGrandTotal: editRecordData?.isGrandTotal ? editRecordData?.isGrandTotal : false,
      createdby: 1,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log(values)

      setLoading(true);
      var data = {
        id: editRecordData?.id ? editRecordData?.id : 0,
        currencyType: currencyType,
        name: name,
        fieldName: fieldName,
        commValue: commValue,
        valuetype: valuetype,
        formulavalue: formulavalue,
        orderseq: orderseq,
      };
      setLoading(false);
      callbackstep(data)
    },
  });

  const prefilledCommercial = () => {

    formik.setFieldValue("id", editRecordData.id);
    setlibraryName(editRecordData?.libraryName);
    setlibraryEntity(editRecordData?.libraryEntity);
    setlibraryId(editRecordData?.libraryId);

    setname(editRecordData?.name);
    setcurrencyType(editRecordData?.currencyType);
    seteventtype(editRecordData?.eventtype);
    setisActive(editRecordData?.isActive);
    setisGrandTotal(editRecordData?.isGrandTotal);
    setisdefault(editRecordData?.isdefault);
    setvaluetype(editRecordData?.valuetype);
    setformulavalue(editRecordData?.formulavalue);
    setFieldName(editRecordData?.fieldName || "");
    setorderseq(editRecordData?.orderseq);
    setlevel(editRecordData?.level);
    setCommValue(editRecordData?.commValue);
    //to set

    const fieldNameGroup = editRecordData?.fieldNameGroup ? editRecordData?.fieldNameGroup.split(",") : [];
    setFormulaFieldName(fieldNameGroup)

  };
  const clearfilledCommercial = () => {
    formik.setFieldValue("id", 0);
    setname("");
    setvaluetype("");
    setisdefault(false);
    setFieldName("")
    setformulavalue("");
    setorderseq(0);
    setlevel("");
    setCommValue(0)
    setisGrandTotal(false);
  };

  //LIBRARY LIST
  const [AllLibraryList, setLibraryList] = useState([]);
  const PullLibraryAll = () => {
    var data = {
      CustomerId: customerid,
      LibraryType: 'CommercialLibrary',
      IsActive: true

    };
    LibraryFindAll(data, atoken).then((res) => {
      setLibraryList(res);
    });
  };





  const [UOMMaster, setUOMMaster] = useState([]);
  const pullUOMMasterList = () => {
    var data = {
      CustomerId: customerid,
      IsActive: true
    };
    UOMMasterList(data, atoken).then((res) => {
      console.log('uom ', res);
      setUOMMaster(res);
    });
  };
  const handleUomList = (array) => {
    setUOMMaster(array);
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

  const [CurrencyList, setCurrencyList] = useState([]);
  const pullCurrencyMaster = () => {


    fetchCurrency(atoken).then((res) => {

      setCurrencyList(res);
    });
  };


  const [lastOperator, setLastOperator] = useState(""); // Track the last operator

  const [selectedField, setSelectedField] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');

  const handleFieldSelect = (field) => {

    const selectedField = field || '';

    if (!selectedField) {
      // Reset if no field is selected
      setformulavalue('');
      setFormulaFieldName([]);
      return;
    }

    if (formulavalue) {

      setFormulaFieldName((prevFieldNames) => [...prevFieldNames, selectedField]);
    }
    else {
      setFormulaFieldName(() => [selectedField]);
    }

    setformulavalue((prevFormulaValue) => {



      const trimmedFormula = prevFormulaValue.trim();
      const lastChar = trimmedFormula.slice(-1);

      // Allow adding fields after operators or opening brackets
      const canAddField = ["+", "-", "*", "/", '%', "(", "{", "", " "].includes(lastChar);

      return canAddField
        ? `${prevFormulaValue}${selectedField}`
        : `${prevFormulaValue} ${selectedField}`;
    });



    setIsFixedValueEnabled(false);
  };

  const handleOperatorSelect = (operator) => {
    if (operator === "None") {

      setsimpleOperator(null);
      setSelectedOperator(null);
      setformulavalue((prevFormulaValue) => prevFormulaValue.trim()); // Formula ko trim kar dein, operator ko remove karna hai
    } else {
      setsimpleOperator(operator);
      setformulavalue((prevFormulaValue) => {
        const trimmedFormula = prevFormulaValue.trim();
        const lastChar = trimmedFormula.slice(-1);

        // Allowed characters after which an operator can be added
        const allowedAfter = [')', '}', '+', '-', '*', '/', '%', '='];

        return allowedAfter.includes(lastChar)
          ? `${trimmedFormula} ${operator}` // Just append if the last char is allowed
          : `${prevFormulaValue} ${operator}`; // Otherwise, append normally
      });
      setSelectedOperator(operator);
    }
  };


  const handleTextareaChange = (e) => {
    setformulavalue(e.target.value);
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

  const handleClear = () => {
    setFormulaFieldName([]);
    setformulavalue('');
    setIsFixedValueEnabled(true);
    setSelectedOperator(''); // Clear the selected operator
    setsimpleOperator(''); // Clear the simple operator if applicable
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
      <form id="manage-terms-form" onSubmit={formik.handleSubmit} autoComplete="off">
        <div className="row mt-2">

          <div className="col-6 mb-3">
            <label className="pe-field-label" style={{ color: "#374151" }}>Title *</label>
            <TextFieldCell
              id="name"
              name="name"
              label=""
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
              <div className="error error-red" style={{ fontSize: '9px' }}>
                {formik.errors.name}
              </div>
            )}
          </div>
          <div className="col-6 mb-3">
            <label className="pe-field-label" style={{ color: "#374151" }}>Field Name</label>
            <TextField
              id="fieldName"
              size="small"
              name="fieldName"
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
          <div className="col-6 mb-3">
            <label className="pe-field-label" style={{ color: "#374151" }}>UOM</label>
            <FormControl fullWidth>
              <Select
                labelId="event"
                label=""
                variant="outlined"
                size="small"
                id="valuetype"
                name="valuetype"

                value={valuetype}
                onOpen={() => {
                  // Call API when dropdown opens
                  if (UOMMaster.length === 0) {
                    pullUOMMasterList();
                  }
                }}
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
          <div className="col-6 mb-3">
            <label className="pe-field-label" style={{ color: "#374151" }}>Fixed Value</label>
            <TextFieldCell
              id="commValue"
              name="commValue"
              label=""
              placeholder=""
              value={commValue}

              onChange={handleCommValueChange}
              disabled={!isFixedValueEnabled}

            />

          </div>
          <div className="row me-0 pe-0 mt-2">
            <div className="col-6 mb-3">
              <label className="pe-field-label" style={{ color: "#374151" }}>Select Formula Field</label>
              <FormControl fullWidth size="small">
                <Select
                  value={FormulaFieldName.length > 0 ? FormulaFieldName[FormulaFieldName.length - 1] : ""}
                  onChange={(e) => isFormulaFieldEnabled && handleFieldSelect(e.target.value)}
                  disabled={!isFormulaFieldEnabled}
                  displayEmpty
                  variant="outlined"
                >
                  <MenuItem value="" disabled><em>Select a field</em></MenuItem>
                  {LibraryTermsList?.filter(option => option?.fieldName !== fieldName).filter(option => ["Currency", "Percentage"].includes(option.valuetype))
                    .map((option, i) => (
                      <MenuItem key={i} value={option.fieldName}>{option.fieldName}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
            <div className="col-6 mb-3">
              <label className="pe-field-label" style={{ color: "#374151" }}>Select Operator</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fafafa' }}>
                {['None', '+', '-', '*', '/', '%', '=', '{', '}', '<', '>', '<=', '>=', '(', ')'].map((operator, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleOperatorSelect(operator)}
                    style={{
                      padding: '2px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      border: selectedOperator === operator ? '1px solid #2a68d3' : '1px solid #d1d5db',
                      background: selectedOperator === operator ? '#eff6ff' : '#ffffff',
                      color: selectedOperator === operator ? '#2a68d3' : '#374151'
                    }}
                  >
                    {operator}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-12 mb-3">
              <label className="pe-field-label" style={{ color: "#374151" }}>Formula Editor</label>
              <div className="position-relative">
                <TextareaAutosize
                  minRows={3}
                  id="formulavalue"
                  name="formulavalue"
                  placeholder="Build formula by selecting fields and operators above..."
                  value={formulavalue}
                  onChange={handleTextareaChange}
                  style={{ width: '100%', resize: 'vertical', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', color: '#1f2937', background: '#fff', outline: 'none', fontFamily: 'monospace' }}
                />
                {formulavalue && (
                  <IconButton
                    className="position-absolute top-0 end-0"
                    onClick={handleClear}
                    aria-label="Clear"
                    size="small"
                  >
                    <Delete className="f15 text-danger" />
                  </IconButton>
                )}
              </div>
            </div>
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


    </>
  );
};

export default EventCommercialDrawer;
