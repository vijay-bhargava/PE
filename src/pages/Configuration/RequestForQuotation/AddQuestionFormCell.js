import React, { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
	Checkbox, FormControl, FormControlLabel, FormGroup,
	InputAdornment, MenuItem, Select, Typography,
} from '@mui/material';
import { useStateValue } from '../../../store';
import { HiOutlineUpload, HiOutlineX } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { CategoryFindAll, SubCategoryFindAll } from '../../../utils/questionlibrary';
import { downloadFilesOnAzure, getFileName, uploadFilesOnAzure, validateFileSize } from '../../../utils/common';
import TextFieldCell from '../../BaseCells/TextFieldCell';

const AddQuestionFormCell = ({ idFromURL, callbackQuesAddCustom, libraryId, questionforedit }) => {
	const [{ atoken, customerid }] = useStateValue();
	const [catAllList, setCatAllList] = useState([]);
	const [subCatList, setSubCatlist] = useState([]);
	const [weightage, setWeightage] = useState(0);
	const [catId, setCatId] = useState(0);
	const [subCatId, setSubCatId] = useState(0);
	const [questionCategory, setQuestionCategory] = useState('');
	const [questionSubCategory, setQuestionSubCategory] = useState('');
	const [attachedFileName, setAttachedFileName] = useState('');
	const fileInputRef = useRef(null);

	useEffect(() => {
		PullCategoryFindAll();
	}, [libraryId]);

	useEffect(() => {
		if (!questionforedit) return;
		formik.setFieldValue('rfqqUestion', questionforedit?.questionDescription ?? '');
		formik.setFieldValue('rfqQuestionRequirement', questionforedit?.rfqQuestionRequirement ?? '');
		formik.setFieldValue('mandatory', questionforedit?.mandatory ?? false);
		formik.setFieldValue('attachement', questionforedit?.attachement ?? false);
		setWeightage(questionforedit?.weightage ?? 0);
		setCatId(questionforedit?.questioncategoryId ?? 0);
		setQuestionCategory(questionforedit?.questionCategory ?? '');
		if (questionforedit?.questioncategoryId) {
			PullSubCategoryFindAll(questionforedit.questioncategoryId, true);
		}
	}, []);

	const PullCategoryFindAll = () => {
		CategoryFindAll({ CustomerId: customerid, IsActive: 'true', LibraryId: libraryId }, atoken).then(setCatAllList);
	};

	const PullSubCategoryFindAll = (valueId, edit = false) => {
		SubCategoryFindAll({ CustomerId: customerid, questioncategoryid: valueId, IsActive: 'true' }, atoken).then((res) => {
			setSubCatlist(res);
			if (edit) {
				setSubCatId(questionforedit?.questionSubcategoryId ?? 0);
				setQuestionSubCategory(questionforedit?.questionSubCategory ?? '');
			}
		});
	};

	const handleCategoryChange = (e) => {
		const val = e.target.value;
		setCatId(val);
		const found = catAllList.find((c) => c.id === val);
		setQuestionCategory(found?.questioncategory ?? '');
		PullSubCategoryFindAll(val);
	};

	const handleSubCatChange = (e) => {
		const val = e.target.value;
		setSubCatId(val);
		const found = subCatList.find((s) => s.id === val);
		setQuestionSubCategory(found?.questionsubcategory ?? '');
	};

	const handleWeightageChange = (e) => {
		let v = e.target.value.replace(/[^\d.]/g, '');
		const dots = (v.match(/\./g) || []).length;
		if (dots > 1) v = v.slice(0, v.lastIndexOf('.'));
		setWeightage(v);
	};

	const handleFileChange = (e) => {
		if (!e) return;
		if (!validateFileSize(e)) { setAttachedFileName(''); return; }
		const file = e.target.files[0];
		if (file.name.length > 50) {
			toast.error('Attachment name must be 50 characters or fewer.');
			e.target.value = null;
			return;
		}
		setAttachedFileName(file);
	};

	const handleRemoveFile = () => {
		setAttachedFileName('');
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const validationSchema = yup.object().shape({
		rfqqUestion: yup.string().required('Question is required'),
		weightage: yup.number().nullable().min(0).max(100).notRequired(),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			rfqqUestion: '',
			rfqQuestionRequirement: '',
			mandatory: false,
			attachement: false,
		},
		validationSchema,
		onSubmit: async (values, { resetForm }) => {
			let filePath;
			if (attachedFileName) {
				const res = await uploadFilesOnAzure(
					{ EventType: 'RFQQuestion', EventId: idFromURL, CustomerId: customerid },
					attachedFileName,
					atoken
				);
				filePath = res?.data?.result?.blobName;
			}

			const base = {
				rfqId: idFromURL,
				questionDescription: values.rfqqUestion,
				attachement: values.attachement,
				optionType: false,
				mandatory: values.mandatory,
				weightage: weightage,
				questionOption: '',
				questionRequirement: values.rfqQuestionRequirement,
				rfqQuestionRequirement: values.rfqQuestionRequirement,
				questioncategoryId: catId ?? 0,
				questionCategory: questionCategory ?? '',
				questionSubCategory: questionSubCategory ?? '',
				questionSubcategoryId: subCatId ?? 0,
			};

			const data = questionforedit
				? {
					...base,
					id: questionforedit.id,
					questionId: questionforedit.questionId ?? 0,
					attachedFileName: filePath ?? questionforedit.attachedFileName ?? '',
					libraryId: questionforedit.libraryId ?? 0,
				}
				: {
					...base,
					id: 0,
					questionId: 0,
					attachedFileName: filePath,
					libraryId: libraryId ?? 0,
				};

			callbackQuesAddCustom(data, questionforedit);
			resetForm();
		},
	});

	return (
		<form id="add-question-form" onSubmit={formik.handleSubmit} autoComplete="off">
			<div className="row g-3">

				{/* Category */}
				<div className="col-12 col-md-4">
					<label className="pe-field-label">Category</label>
					<FormControl fullWidth size="small">
						<Select
							id="questioncategoryid"
							name="questioncategoryid"
							variant="outlined"
							value={catId}
							size="small"
							displayEmpty
							onChange={handleCategoryChange}
						>
							<MenuItem value={0} disabled><em>Select Category</em></MenuItem>
							{catAllList?.map((opt) => (
								<MenuItem key={opt.id} value={opt.id}>{opt.questioncategory}</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>

				{/* Sub Category */}
				<div className="col-12 col-md-4">
					<label className="pe-field-label">Sub Category</label>
					<FormControl fullWidth size="small">
						<Select
							id="questionsubcategoryid"
							name="questionsubcategoryid"
							variant="outlined"
							value={subCatId}
							size="small"
							displayEmpty
							onChange={handleSubCatChange}
							disabled={!catId || catId === 0}
						>
							<MenuItem value={0} disabled><em>Select Sub Category</em></MenuItem>
							{subCatList?.map((opt) => (
								<MenuItem key={opt.id} value={opt.id}>{opt.questionsubcategory}</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>

				{/* Weightage */}
				<div className="col-12 col-md-4">
					<label className="pe-field-label">Weightage (%)</label>
					<TextFieldCell
						id="weightage"
						name="weightage"
						label=""
						inputProps={{ maxLength: 5 }}
						value={weightage}
						onChange={handleWeightageChange}
						error={formik.touched.weightage && Boolean(formik.errors.weightage)}
						helperText={formik.touched.weightage && formik.errors.weightage ? 'Value must be 0–100' : ''}
					/>
				</div>

				{/* Question */}
				<div className="col-12">
					<label className="pe-field-label">Enter Question <span className="rfq-required-star">*</span></label>
					<TextFieldCell
						id="rfqqUestion"
						name="rfqqUestion"
						label=""
						placeholder="Type your question here"
						value={formik.values.rfqqUestion}
						onChange={formik.handleChange}
						maxLength={200}
						InputProps={{
							endAdornment: formik.values.rfqqUestion && (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
										{formik.values.rfqqUestion.length}/200
									</Typography>
								</InputAdornment>
							),
						}}
						error={formik.touched.rfqqUestion && Boolean(formik.errors.rfqqUestion)}
						helperText={formik.touched.rfqqUestion && formik.errors.rfqqUestion}
					/>
				</div>

				{/* Your Requirement */}
				<div className="col-12">
					<label className="pe-field-label">Your Requirement</label>
					<TextFieldCell
						id="rfqQuestionRequirement"
						name="rfqQuestionRequirement"
						label=""
						placeholder="Describe your requirement"
						multiline
						rows={3}
						value={formik.values.rfqQuestionRequirement}
						onChange={formik.handleChange}
						maxLength={200}
						InputProps={{
							endAdornment: formik.values.rfqQuestionRequirement && (
								<InputAdornment position="end">
									<Typography variant="body2" color="textSecondary">
										{formik.values.rfqQuestionRequirement.length}/200
									</Typography>
								</InputAdornment>
							),
						}}
					/>
				</div>

				{/* File upload */}
				<div className="col-12">
					<label className="pe-field-label">Attachment</label>
					<div className="d-flex align-items-center gap-2 border rounded-3">
						<label className="pe-btn pe-btn--outline" style={{ cursor: 'pointer', flexShrink: 0 }}>
							<HiOutlineUpload />
							{' '}Choose File
							<input
								type="file"
								hidden
								ref={fileInputRef}
								accept=".docx,.doc,.jpeg,.jpg,.gif,.png,.pdf,.xlsx"
								onChange={handleFileChange}
							/>
						</label>
						<span style={{ fontSize: '13px', color: attachedFileName ? '#101828' : '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{attachedFileName
								? (typeof attachedFileName === 'string' ? getFileName(attachedFileName) : attachedFileName.name)
								: 'No file chosen'}
						</span>
						{attachedFileName && (
							<button type="button" className="rfq-dv2-file-chip-clear" style={{ flexShrink: 0 }} onClick={handleRemoveFile}>
								<HiOutlineX />
							</button>
						)}
					</div>
					<div className="pe-question-upload-hint">
						Supported formats: .docx, .doc, .jpg, .jpeg, .png, .pdf, .xlsx (Max: 10 MB)
					</div>
					{questionforedit?.attachedFileName && !attachedFileName && (
						<button
							type="button"
							className="pe-btn pe-btn--ghost mt-1"
							style={{ fontSize: 12 }}
							onClick={() => downloadFilesOnAzure(questionforedit.attachedFileName, getFileName(questionforedit.attachedFileName), atoken)}
						>
							{getFileName(questionforedit.attachedFileName)}
						</button>
					)}
				</div>

				{/* Checkboxes */}
				<div className="col-12">
					<div className="d-flex gap-4">
						<FormGroup>
							<FormControlLabel
								control={
									<Checkbox
										size="small"
										checked={formik.values.mandatory}
										onChange={formik.handleChange}
										name="mandatory"
										id="mandatory"
									/>
								}
								label={<span className="f14">Mandatory</span>}
							/>
						</FormGroup>
						<FormGroup>
							<FormControlLabel
								control={
									<Checkbox
										size="small"
										checked={formik.values.attachement}
										onChange={formik.handleChange}
										name="attachement"
										id="attachement"
									/>
								}
								label={<span className="f14">Attachment</span>}
							/>
						</FormGroup>
					</div>
				</div>

			</div>
		</form>
	);
};

export default AddQuestionFormCell;
