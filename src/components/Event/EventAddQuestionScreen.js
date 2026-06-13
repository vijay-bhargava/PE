import { Autocomplete, Button, Checkbox, FormControlLabel, FormGroup, IconButton, InputAdornment, Radio, RadioGroup, TextField, Tooltip, Typography } from '@mui/material'
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react'
import TextFieldCell from '../../pages/BaseCells/TextFieldCell';
import { getFileName, onlyNumbers, PercentageRegex, uploadFilesOnAzure2, validateFileSize } from '../../utils/common';
import { UploadOutlined } from '@mui/icons-material';
import { HiOutlinePlay, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';
import { useStateValue } from '../../store';
import { LoadingButton } from '@mui/lab';
import { api, ApiClient } from '../../Apiclient';
import { buildQueryParams } from '../../utils/common/utility';
import * as yup from "yup";
import { toast } from 'react-toastify';
const EventAddQuestionScreen = ({ callback, eventtype, eventid, questionlist }) => {
	const [{ atoken, rtoken, customerid, usertimezone, customersuffix, userdialingcode, roleClaims, userDetail }, dispatch] = useStateValue();
	const [categorylist, setCategorylist] = useState([])
	const [subcategorylist, setSubCategorylist] = useState([])
	const apiclient = new ApiClient(customersuffix);

	// useEffect(() => {
	// 	getCategoryList()
	// }, [])

	const getCategoryList = async () => {
		const params = {
			CustomerId: customerid,
			IsActive: "true",
		};

		const queryParams = buildQueryParams(params);
		const res = await apiclient.getres(`api/QCategory/Find?${queryParams}`, atoken)
		if (res) {

			const result = res?.data?.result;
			setCategorylist(result)

		}
	}


	const getSubCategoryList = async (id) => {
		const params = {
			CustomerId: customerid,
			questioncategoryid: id,
			IsActive: "true",
		};

		const queryParams = buildQueryParams(params);
		const res = await apiclient.getres(`api/QSubCategory/Find?${queryParams}`, atoken)
		if (res) {

			const result = res?.data?.result;
			setSubCategorylist(result)

		}
	}

	const handleItemAttachmentChange = (event) => {
		if (!validateFileSize(event)) {
			return;
		}
		const file = event.target.files[0];
		UploadItemAttachment(file);
	};

	const UploadItemAttachment = async (file) => {

		if (!file) {
			return;
		}
		// Define the data object for upload
		const data = {
			RequestedBy: "customer",
			EventType: "RFQ",
			EventId: eventid,
			CustomerId: customerid,
			Description: "Question",
		};

		// Upload the file to Azure and get the return path
		try {

			const url = await uploadFilesOnAzure2(data, file, atoken);
			formik.setFieldValue("attachedFileName", url.blobName)
		} catch (error) {

			formik.setFieldValue("attachedFileName", "")
		}

	}


	//option functions 
	const handleInputChange = (e, index) => {
		const { value } = e.target;
		const updatedOptions = [...formik.values.questionOption];
		updatedOptions[index].questionOption = value;
		formik.setFieldValue('questionOption', updatedOptions);
	};

	const handleInputWeightageChange = (e, index) => {
		const { value } = e.target;
		const updatedOptions = [...formik.values.questionOption];
		updatedOptions[index].weightage = value;
		formik.setFieldValue('questionOption', updatedOptions);
	};

	const onlyNumbers = (e) => {
		e.target.value = e.target.value.replace(/[^0-9]/g, '');
	};

	const handleRemoveClick = (index) => {
		if (index == 0) {
			formik.setFieldValue("questionOption", [{
				questionOption: "",
				weightage: 0,
				questionid: 0
			}])
			return
		}
		const updatedOptions = [...formik.values.questionOption];
		updatedOptions.splice(index, 1);
		formik.setFieldValue('questionOption', updatedOptions);
	};

	const handleAddClick = () => {
		const updatedOptions = [...formik.values.questionOption];
		updatedOptions.push({ questionOption: '', weightage: '', questionid: 0 });
		formik.setFieldValue('questionOption', updatedOptions);
	};


	const validationSchema = yup.object({
		questiondescription: yup
			.string("Enter your Description")
			.required("Please Enter Question Description"),
	});

	const formik = useFormik({
		enableReinitialize: false,
		initialValues: {
			questiondescription: "",
			questionRequirement: "",
			questionCategory: null,
			questionSubCategory: null,
			weightage: "",
			mandatory: false,
			attachement: false,
			attachedFileName: "",
			questiontype: "O",
			questionOption: [{
				questionOption: "",
				weightage: 0,
				questionid: 0
			}]

		},
		validationSchema: validationSchema,
		onSubmit: (values) => {

			const isCheck = questionlist?.some((x) =>
				x.questionDescription?.trim() === values?.questiondescription
			);
			if (isCheck) {
				formik?.setFieldError("questiondescription", "Question is already added")
				return false
			}
			if (values?.questionOption.length < 2 && values?.questiontype != "O") {
				toast.error("Atleast two Option is required", {
					tokenid: 'add question error',
				})
				return;

			}

			callback(values)
			formik?.resetForm();
		}
	});

	const handleReset = () => {
		formik.resetForm({
			values: {
				questiondescription: "",
				questionRequirement: "",
				questionCategory: null,
				questionSubCategory: null,
				weightage: "",
				mandatory: false,
				attachement: false,
				attachedFileName: "",
				questiontype: "O",
				questionOption: [
					{
						questionOption: "",
						weightage: 0,
						questionid: 0,
					},
				],
			},
		});
	};

	//##### return ///
	return (

		<form id="add-question-form" onSubmit={formik.handleSubmit} autoComplete="off">
			<input
				id="itemattachmentfile"
				className="d-none"
				type="file"
				onChange={handleItemAttachmentChange}
			/>
			<div className="row">
				<div className="col-12 mb-2 pb-0 ">
					<label className="pe-field-label" style={{ color: "#374151" }}>Question *</label>
					<TextFieldCell
						className="pb-0 mb-0 w-100"
						variant="outlined"
						id="questiondescription"
						name="questiondescription"
						label=""

						multiline
						maxRows={4}
						value={formik?.values?.questiondescription}
						onChange={(e) => {
							const value = e?.target?.value;
							formik.setFieldValue("questiondescription", value)
						}}
						inputProps={{ maxLength: 2000 }}
						InputProps={{
							endAdornment: formik?.values?.questiondescription && (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
										{formik?.values?.questiondescription?.length}/2000
									</Typography>
								</InputAdornment>
							),
						}}

						error={
							formik.touched.questiondescription && Boolean(formik.errors.questiondescription)
						}
						helperText={formik.touched.questiondescription && formik.errors.questiondescription}

					/>

				</div>
				<div className="col-12 col-md-4 col-lg-4 pe-0 mt-3">
					<label className="pe-field-label" style={{ color: "#374151" }}>Category</label>
					<Autocomplete
						disablePortal
						id="combo-box-demo"
						size="small"
						options={categorylist ?? []}
						className="w-100"
						fullWidth
						renderInput={(params) => (
							<TextField
								{...params}
								InputLabelProps={{ shrink: false }}
								label=""
							/>
						)}
						onOpen={() => {
							// Call API when dropdown opens
							if (categorylist.length === 0) {
								getCategoryList();
							}
						}}
						value={formik?.values.questionCategory}
						getOptionLabel={(option) => option.questioncategory ?? ""}
						onChange={
							(e, v) => {
								formik.setFieldValue("questionCategory", v)
								if (v) {
									getSubCategoryList(v?.id)
								}
								else {
									setSubCategorylist([])
									formik.setFieldValue("questionSubCategory", null)
								}

							}
						}

					/>
				</div>
				<div className="col-12 col-md-4 col-lg-4 pe-0 mt-3">
					<label className="pe-field-label" style={{ color: "#374151" }}>Sub Category</label>
					<Autocomplete
						disablePortal
						id="combo-box-demo"
						size="small"
						options={subcategorylist ?? []}
						className="w-100"
						fullWidth
						renderInput={(params) => (
							<TextField
								{...params}
								InputLabelProps={{ shrink: false }}
								label=""
							/>
						)}
						value={formik?.values.questionSubCategory}
						getOptionLabel={(option) => option.questionsubcategory ?? ""}
						onChange={
							(e, v) => {
								formik.setFieldValue("questionSubCategory", v)
							}
						}

					/>
				</div>

				<div className="col-12 col-md-4 col-lg-4 pe-0 mt-3">
					<label className="pe-field-label" style={{ color: "#374151" }}>Question Weightage (%)</label>
					<TextFieldCell
						id="weightage"
						name="weightage"
						label=""
						maxLength={3}


						value={formik?.values?.weightage}

						onChange={(e) => {
							const value = e.target.value;
							if (!value) {
								formik.setFieldValue("weightage", "")
							}
							if (PercentageRegex.test(value)) {
								formik.setFieldValue("weightage", value)
							}

						}}
						error={
							formik.touched.weightage && Boolean(formik.errors.weightage)
						}
						helperText={formik.touched.weightage && formik.errors.weightage}
					/>
				</div>

				<div className="col-12 mb-2 pb-0 mt-4">
					<label className="pe-field-label" style={{ color: "#374151" }}>Requirement</label>
					<TextFieldCell
						className="pb-0 mb-0 w-100"
						variant="outlined"
						name="questionRequirement"
						label=""
						id="questionRequirement"
						multiline
						rows={2}
						maxRows={4}
						value={formik?.values?.questionRequirement}
						onChange={(e) => {
							const value = e.target.value;
							formik.setFieldValue("questionRequirement", value)
						}}
						inputProps={{ maxLength: 2000 }}
						InputProps={{
							endAdornment: formik?.values?.questionRequirement && (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
										{formik?.values?.questionRequirement?.length}/2000
									</Typography>
								</InputAdornment>
							),
						}}

					/>

				</div>
				<div className='col-12 col-md-4 col-lg-4 mt-3'>
					<label className="pe-field-label" style={{ color: "#374151" }}>Attachment File</label>
					<TextField
						fullWidth
						variant="outlined"
						InputLabelProps={{ shrink: false }}
						size="small"
						className='f14'
						id="attachedFileName"
						name="attachedFileName"
						label=""
						inputProps={{
							maxLength: 50,
							pattern: '[a-zA-Z0-9-/]*', // This will allow alphabets, numbers, "-" and "/"
						}}
						value={getFileName(formik.values.attachedFileName)}


						disabled={true}
						InputProps={{
							endAdornment: (
								<>
									{!formik?.values?.attachedFileName ? <Tooltip title="Upload Attachment" className='pointer'>
										<InputAdornment position="end"  >
											<IconButton onClick={() => document.getElementById('itemattachmentfile').click()
											}>
												<UploadOutlined />
											</IconButton>

										</InputAdornment>
									</Tooltip> : <Tooltip title="Remove Attachment" className='pointer'>
										<InputAdornment position="end" >
											<IconButton onClick={() => formik.setFieldValue("attachedFileName", "")}>
												<HiOutlineX />
											</IconButton>

										</InputAdornment>
									</Tooltip>}
								</>
							),
						}}
					/>
				</div>
				<div className="col-12 col-md-3 col-lg-3 mt-4 ">
					<FormGroup className="">
						<FormControlLabel
							control={
								<Checkbox
									name="mandatory"
									id="mandatory"
									checked={formik?.values?.mandatory} //{formik.values.mandatory}

									onChange={(e) => {
										const checked = e?.target?.checked;
										formik?.setFieldValue("mandatory", checked)
									}}

								/>
							}
							label="Mandatory"
						/>
					</FormGroup>
				</div>

				<div className="col-12 col-md-2 col-lg-2 mt-4">
					<FormGroup className="">
						<FormControlLabel
							control={
								<Checkbox
									name="attachement"
									id="attachement"
									checked={formik?.values?.attachement} //{formik.values.mandatory}

									onChange={(e) => {
										const checked = e?.target?.checked;
										formik?.setFieldValue("attachement", checked)
									}}
								/>
							}
							label="Attachment"
						/>
					</FormGroup>
				</div>
				{/* <div className="col-12 col-md-3 col-lg-3 mt-4">
					<FormGroup className="">
						<FormControlLabel
							control={
								<Checkbox
									name="autocalculated"
									id="autocalculated"
									checked={formik?.values?.autocalculated} 

									onChange={(e) => {
										const checked = e?.target?.checked;
										formik?.setFieldValue("autocalculated", checked)
									}}

								/>
							}
							label="AutoCalculated"
						/>
					</FormGroup>
				</div> */}
				<div className="col-12 col-md-12 col-lg-12 mt-4">
					<RadioGroup
						row
						aria-labelledby="questiontype"
						name="Question Type"
						value={formik.values.questiontype}
						onChange={(e) => {

							formik.setFieldValue(
								"questiontype",
								e.target.value
							);
							if (e.target.value == "O") {
								formik.setFieldValue("questionOption", [{
									questionOption: "",
									weightage: 0,
									questionid: 0

								}])

							}

						}}
					>
						<FormControlLabel
							value={'O'}
							control={<Radio />}
							label="Open Ended Question"
						/>
						<FormControlLabel
							value={'M'}
							control={<Radio />}
							label="Multi-Select Question"
						/>
						<FormControlLabel
							value={'S'}
							control={<Radio />}
							label="Single-Select Question"
						/>
					</RadioGroup>

				</div>
				{formik.values.questiontype != 'O' && formik?.values?.questionOption?.map((x, i) => {
					return (
						<div className="option" key={i}>
							<div className="row justify-content-between align-items-center w-100 mb-2 ms-0 p-2">

								<div className="col-md-6">
									<TextField
										variant="outlined"
										className="w-100"
										required
										id={`option-${i}`}
										label=""
										value={x.questionOption}
										size="small"
										name="questionOption"
										placeholder="Option Value"
										onChange={(e) => handleInputChange(e, i)}
										inputProps={{
											style: { padding: "4.5px 14px" }
										}}
										InputLabelProps={{ shrink: false }}
									/>
								</div>

								<div className="col-md-6">
									<>
										<TextField
											variant="outlined"
											className="w-50"
											required
											id={`weightage-${i}`}
											name="weightage"
											label=""
											value={x.weightage}
											size="small"
											placeholder="Option Weightage"
											onChange={(e) => handleInputWeightageChange(e, i)}
											onInput={(e) => onlyNumbers(e)}
											inputProps={{
												style: { padding: "4.5px 14px" },
												maxLength: 3
											}}
											InputLabelProps={{ shrink: false }}
										/>
										<span>
											<Button
												color="error"
												size="small"
												className="ms-2"
												onClick={() => handleRemoveClick(i)}
											>
												<HiOutlineX className="f16 text-danger" />
											</Button>
										</span>

										{formik?.values?.questionOption?.length && formik?.values?.questionOption.length - 1 === i && (
											<span className="col-md-1">
												<Button
													color="primary"
													size="small"
													className="ms-2"
													onClick={handleAddClick}
												>
													<HiOutlinePlus className="f16 text-primary" />
												</Button>
											</span>
										)}
									</>
								</div>
							</div>
						</div>
					);
				})}

			</div>

		</form>

	)
}

export default EventAddQuestionScreen
