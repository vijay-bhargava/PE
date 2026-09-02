import React, { useEffect, useRef, useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import TextFieldCell from '../../BaseCells/TextFieldCell'
import { useStateValue } from '../../../store';
import { Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, MenuItem, Select } from '@mui/material';
import { Form } from 'react-bootstrap';
import { HiOutlineX } from 'react-icons/hi';
import { CategoryFindAll, SubCategoryFindAll } from '../../../utils/questionlibrary';
import { toast } from 'react-toastify';
import { downloadFilesOnAzure, getFileName, uploadFilesOnAzure, validateFileSize } from '../../../utils/common';
import { Button } from '@mui/material';

const AddNFAQuestionFormCell = ({ idFromURL, callbackQuesAddCustom, libraryId, questionforedit }) => {
    const [{ atoken, customerid }] = useStateValue();
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [catAllList, setCatAllList] = useState([]);
    const [subCatList, setSubCatlist] = useState([]);
    const [weightage, setweightage] = useState(0);
    const [subCatId, setSubCatId] = useState(0);
    const [catId, setCatId] = useState(0);
    const [displayAttachedName, setdisplayAttachedName] = useState("");
    const [attachedFileName, setattachedFileName] = useState("");
    const fileInputRef = useRef(null);
    const [questionCategory, SetquestionCategory] = useState("");
    const [questionSubCategory, SetquestionSubCategory] = useState("");

    useEffect(() => {
        if (questionforedit) {
            formik.setFieldValue("nfaQestion", questionforedit?.questionDescription)
            formik.setFieldValue("nfaQuestionRequirement", questionforedit?.nfaQuestionRequirement)
            formik.setFieldValue("mandatory", questionforedit?.mandatory)
            formik.setFieldValue("attachement", questionforedit?.attachement)
            setweightage(questionforedit?.weightage)
            setCatId(questionforedit?.questioncategoryId)
            SetquestionCategory(questionforedit?.questionCategory)

            if (questionforedit?.questioncategoryId) {
                PullSubCategoryFindAll(questionforedit?.questioncategoryId, true)
            }
        }
    }, [])

    useEffect(() => {
        PullCategoryFindAll();
    }, [libraryId]);

    const PullCategoryFindAll = () => {
        var data = { CustomerId: customerid, IsActive: "true", LibraryId: libraryId };
        CategoryFindAll(data, atoken).then((res) => { setCatAllList(res); });
    };

    const PullSubCategoryFindAll = (valueId, edit) => {
        var data = { CustomerId: customerid, questioncategoryid: valueId, IsActive: "true" };
        SubCategoryFindAll(data, atoken).then((res) => {
            setSubCatlist(res);
            if (edit) {
                setSubCatId(questionforedit?.questionSubcategoryId)
                SetquestionSubCategory(questionforedit?.questionSubCategory)
            }
        });
    };

    const validationSchema = yup.object().shape({
        nfaQestion: yup.string('Enter Question').required('Question Title is required'),
        weightage: yup.number().nullable().min(0, 'Weightage must be at least 1').max(100, 'Weightage must be at most 100').notRequired(),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            nfaQestion: '',
            nfaQuestionRequirement: '',
            mandatory: false,
            attachement: false,
            weightage: weightage || null,
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            let filePath;
            if (attachedFileName) {
                let Data = { EventType: `RFQQuestion`, EventId: idFromURL, CustomerId: customerid };
                const res = await uploadFilesOnAzure(Data, attachedFileName, atoken)
                filePath = res?.data?.result?.blobName
            }

            let data;
            if (questionforedit) {
                data = {
                    id: questionforedit.id, nfaId: idFromURL,
                    questionId: questionforedit?.questionId ?? 0,
                    questionDescription: values?.nfaQestion,
                    attachement: values?.attachement,
                    attachedFileName: filePath ?? (questionforedit ? questionforedit?.attachedFileName : ''),
                    optionType: false, mandatory: values?.mandatory, weightage,
                    questionOption: values?.questionOption ?? "", questionRequirement: values?.nfaQuestionRequirement,
                    libraryId: questionforedit ? questionforedit.libraryId : 0,
                    questioncategoryId: catId ?? 0, questionCategory: questionCategory ?? "",
                    questionSubCategory: questionSubCategory ?? "", questionSubcategoryId: subCatId ?? 0
                };
            } else {
                data = {
                    id: 0, nfaId: idFromURL, questionId: 0,
                    questionDescription: values?.nfaQestion,
                    attachement: values?.attachement,
                    attachedFileName: filePath, optionType: false, mandatory: values?.mandatory, weightage,
                    questionOption: values?.questionOption ?? "", questionRequirement: values?.nfaQuestionRequirement,
                    nfaQuestionRequirement: values?.nfaQuestionRequirement,
                    libraryId: libraryId ?? 0, questioncategoryId: catId ?? 0,
                    questionCategory: questionCategory ?? "", questionSubCategory: questionSubCategory ?? "",
                    questionSubcategoryId: subCatId ?? 0
                };
            }

            callbackQuesAddCustom(data, questionforedit)
        }
    });

    const onlyNumberwithdecimal = (e) => {
        let inputvalue = e.target.value;
        inputvalue = inputvalue.replace(/[^\d.]/g, "");
        const decimalCount = (inputvalue.match(/\./g) || []).length;
        if (decimalCount > 1) inputvalue = inputvalue.slice(0, inputvalue.lastIndexOf("."));
        if (isNaN(inputvalue)) { toast("Quantity can be numeric only", { hideProgressBar: true, autoClose: 500, type: "error" }); return; }
        return inputvalue;
    };

    const handleWeightageChange = (e) => {
        const newValue = onlyNumberwithdecimal(e);
        if (newValue === '') { setweightage(''); return; }
        const numericValue = parseFloat(newValue);
        if (isNaN(numericValue) || numericValue < 1 || numericValue > 100) setweightage(newValue);
        else setweightage(numericValue);
    };

    function handleFileChange(event) {
        if (event) {
            if (validateFileSize(event)) {
                const fileName = event.target.files[0].name;
                if (fileName.length > 50) {
                    toast.error("Attachment name must be 50 characters or fewer.");
                    event.target.value = null;
                    return;
                }
                setattachedFileName(event.target.files[0]);
            } else {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    }

    const handleRemoveattachmentClick = () => {
        setattachedFileName("");
        setdisplayAttachedName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === "new") { /* add category modal not implemented */ }
        else {
            setCatId(selectedValue);
            const selectedCategory = catAllList.find((cat) => cat.id === selectedValue);
            SetquestionCategory(selectedCategory?.questioncategory);
            PullSubCategoryFindAll(selectedValue);
        }
    };

    const handleSubCatChange = (e) => {
        const selectedValue = e?.target?.value;
        if (selectedValue === "new") { /* add sub-category modal not implemented */ }
        else {
            const selectedSubCategory = subCatList.find(option => option.id === selectedValue)?.questionsubcategory;
            setSubCatId(selectedValue);
            SetquestionSubCategory(selectedSubCategory);
        }
    };

    return (
        <div>
            <form id="add-question-form" onSubmit={formik.handleSubmit} autoComplete="off">
                <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                        <label className="pe-field-label">Category</label>
                        <FormControl fullWidth size="small">
                            <Select
                                displayEmpty
                                value={catId || 0}
                                onChange={handleCategoryChange}
                            >
                                <MenuItem value={0}>Select Category</MenuItem>
                                {catAllList?.map((option, i) => (
                                    <MenuItem key={i} value={option?.id}>{option?.questioncategory}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="col-12 col-md-4">
                        <label className="pe-field-label">Sub Category</label>
                        <FormControl fullWidth size="small">
                            <Select
                                displayEmpty
                                value={subCatId || 0}
                                onChange={handleSubCatChange}
                            >
                                <MenuItem value={0}>Select Sub Category</MenuItem>
                                {subCatList?.map((option, i) => (
                                    <MenuItem key={i} value={option?.id}>{option?.questionsubcategory}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="col-12 col-md-4">
                        <label className="pe-field-label">Question Weightage (%)</label>
                        <TextFieldCell
                            id="weightage"
                            name="weightage"
                            maxLength={3}
                            inputProps={{ maxLength: 5 }}
                            value={weightage}
                            onChange={handleWeightageChange}
                            error={formik.touched.weightage && Boolean(formik.errors.weightage)}
                            helperText={formik.touched.weightage && formik.errors.weightage ? "Value must be between 1 and 100" : ""}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="pe-field-label">Enter Question  <span className="rfq-required-star">*</span></label>
                    <TextFieldCell
                        id="nfaQestion"
                        name="nfaQestion"
                        placeholder=""
                        value={formik.values.nfaQestion}
                        onChange={formik.handleChange}
                        maxLength={200}
                        error={formik.touched.nfaQestion && Boolean(formik.errors.nfaQestion)}
                        helperText={formik.touched.nfaQestion && formik.errors.nfaQestion}
                    />
                </div>

                <div className="mb-3">
                    <label className="pe-field-label">Your Requirement</label>
                    <TextFieldCell
                        id="nfaQuestionRequirement"
                        name="nfaQuestionRequirement"
                        multiline
                        rows={2}
                        placeholder=""
                        value={formik.values.nfaQuestionRequirement}
                        onChange={formik.handleChange}
                        maxLength={200}
                        error={formik.touched.nfaQuestionRequirement && Boolean(formik.errors.nfaQuestionRequirement)}
                        helperText={formik.touched.nfaQuestionRequirement && formik.errors.nfaQuestionRequirement}
                    />
                </div>

                <div className="mb-3">
                    <Form.Group controlId="formFile">
                        <Form.Control
                            type="file"
                            size="sm"
                            accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </Form.Group>
                    {questionforedit?.attachedFileName && (
                        <div className="d-flex align-items-center justify-content-between mt-2">
                            <Button
                                variant="text"
                                size="small"
                                className="attached-file-name"
                                onClick={() => downloadFilesOnAzure(questionforedit?.attachedFileName, getFileName(questionforedit?.attachedFileName), atoken)}
                            >
                                {getFileName(questionforedit?.attachedFileName)}
                            </Button>
                            <IconButton size="medium" className="bg-white ml-2" onClick={handleRemoveattachmentClick}>
                                <HiOutlineX className="f16 text-danger" />
                            </IconButton>
                        </div>
                    )}
                </div>

                <div className="row">
                    <div className="col-auto">
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={formik.values.mandatory} />}
                                label={<span className="f14 muted">Mandatory</span>}
                                name="mandatory"
                                value={formik.values.mandatory}
                                onChange={formik.handleChange}
                            />
                        </FormGroup>
                    </div>
                    <div className="col-auto">
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={formik.values.attachement} />}
                                label={<span className="f14 muted">Attachement</span>}
                                name="attachement"
                                value={formik.values.attachement}
                                onChange={formik.handleChange}
                            />
                        </FormGroup>
                    </div>
                </div>
            </form>

        </div>
    )
}

export default AddNFAQuestionFormCell
