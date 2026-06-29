import { Accordion, AccordionDetails, InputAdornment, AccordionSummary, Alert, Button, IconButton, Typography, Card, Divider, Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, FormGroup, FormControlLabel, Menu, MenuItem, Button as MuiButton, Tooltip, TextField, Stack } from '@mui/material';
import { HiDownload, HiX, HiOutlineX, HiDotsVertical } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ExpandMore, Launch } from '@mui/icons-material';
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useFormik } from "formik";
import Dropdown from 'react-bootstrap/Dropdown';

import LoadingButton from "@mui/lab/LoadingButton";
import * as yup from "yup";
import Drawer from "@mui/material/Drawer";
import { downloadFilesOnAzure, getFileName, PercentageRegex, menuactionlist, getStageInfo, getPayloadWithStage } from '../../utils/common';
import { DataGrid } from '@mui/x-data-grid';
import { MaterialReactTable, MRT_ToggleDensePaddingButton, MRT_ToggleFullScreenButton, useMaterialReactTable } from 'material-react-table';
import { CardBody, Card as CardS } from 'reactstrap';
import WhiteTooltip from '../whitetooltip';
import { useStateValue } from '../../store';
import { toast } from "react-toastify";
import { ApiClient, api } from "../../Apiclient";
import { MdCloseFullscreen, MdFullscreen } from 'react-icons/md';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EventQuestionVQModal, formatDateViaLocale } from '../../utils/common/utility';
import EventQuoteSealed from './EventQuoteSealed';
import { CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';
import SupplierIndividualReport from "../../pages/Configuration/RequestForQuotation/SupplierIndividualReport";

// QuestionWiseTable component using Material React Table
const QuestionWiseTable = ({
	questions,
	onClickDownload,
	callbackDeleteQuesFromList,
	getFileName,
	action,
	permissionManager,
	CLAIM_TYPES,
	ACTIONS
}) => {
	// Debug logging to verify data flow
	useEffect(() => {
		// Removed console.log statements
	}, [questions]);

	// Prepare data for Material React Table
	const tableData = useMemo(() => {
		if (!questions || questions.length === 0) {
			return [];
		}
		return questions.map((question, index) => ({
			id: question?.id || `question-${index}`,
			questionNumber: `Q${index + 1}`,
			questionDescription: question?.questionDescription || "",
			questionRequirement: question?.questionRequirement || "N/A",
			attachement: question?.attachement ? 'Yes' : 'No',
			mandatory: question?.mandatory ? 'Yes' : 'No',
			weightage: question?.weightage || "0",
			questionCategory: question?.questionCategory || "",
			questionSubCategory: question?.questionSubCategory || "",
			attachedFileName: question?.attachedFileName,
			questionOption: question?.questionOption || [],
			question: question
		}));
	}, [questions]);

	const columns = useMemo(() => [
		{
			accessorKey: 'questionNumber',
			header: '#',
			size: 80,
			Cell: ({ cell }) => (
				<Typography variant="body1" sx={{ fontWeight: 'bold' }}>
					{cell.getValue()}
				</Typography>
			)
		},
		{
			accessorKey: 'questionDescription',
			header: 'Question',
			size: 400,
			Cell: ({ cell, row }) => {
				const rowData = row.original;
				return (
					<Box>
						<Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
							{cell.getValue()}
						</Typography>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 1 }}>
							<Typography variant="caption" color="textSecondary">
								<strong>Requirement:</strong> {rowData.questionRequirement}
							</Typography>
							<Typography variant="caption" color="textSecondary">
								<strong>Attachment:</strong> {rowData.attachement}
							</Typography>
							<Typography variant="caption" color="textSecondary">
								<strong>Mandatory:</strong> {rowData.mandatory}
							</Typography>
							{rowData.weightage !== "0" && (
								<Typography variant="caption" color="textSecondary">
									<strong>Weightage:</strong> {rowData.weightage}
								</Typography>
							)}
						</Box>
						{rowData.questionCategory && (
							<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 0.5 }}>
								<Typography variant="caption" color="textSecondary">
									<strong>Category:</strong> {rowData.questionCategory}
								</Typography>
								{rowData.questionSubCategory && (
									<Typography variant="caption" color="textSecondary">
										<strong>Sub-Category:</strong> {rowData.questionSubCategory}
									</Typography>
								)}
							</Box>
						)}
					</Box>
				);
			}
		},
		{
			accessorKey: 'actions',
			header: 'Actions',
			size: 150,
			enableSorting: false,
			Cell: ({ row }) => {
				const rowData = row.original;
				return (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						{rowData.attachedFileName && (
							<Tooltip title={getFileName(rowData.attachedFileName)} arrow>
								<IconButton
									size="small"
									color="primary"
									onClick={() => onClickDownload(rowData.question)}
								>
									<HiDownload />
								</IconButton>
							</Tooltip>
						)}
						{action && permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.REMOVE) && (
							<IconButton
								onClick={() => callbackDeleteQuesFromList(rowData.questionCategory, rowData.questionSubCategory, rowData.questionDescription)}
								color="error"
								size="small"
							>
								<HiX />
							</IconButton>
						)}
					</Box>
				);
			}
		}
	], [onClickDownload, getFileName, callbackDeleteQuesFromList, action, permissionManager, CLAIM_TYPES, ACTIONS]);

	// Removed the hook usage to avoid conflicts

	// Add explicit checks for debugging QuestionWiseTable
	if (!questions) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography variant="h6" color="error">❌ Questions prop is null/undefined</Typography>
			</Box>
		);
	}

	if (questions.length === 0) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography variant="h6" color="textSecondary">📝 No questions found</Typography>
			</Box>
		);
	}

	// Early return if no data - moved after all hooks
	if (!tableData || tableData.length === 0) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography variant="h6" color="textSecondary">⚠️ No table data generated</Typography>
			</Box>
		);
	}

	// Try using the component directly instead of the hook
	return (
		<MaterialReactTable
			columns={columns}
			data={tableData}
			enableExpanding={true}
			enableSorting={true}
			enableColumnResizing={true}
			enableColumnOrdering={false}
			enableColumnActions={false}
			enableColumnFilters={false}
			enablePagination={true}
			enableBottomToolbar={true}
			enableTopToolbar={false}
			enableDensityToggle={false}
			enableFullScreenToggle={false}
			enableGlobalFilter={false}
			initialState={{
				density: 'compact',
				pagination: { pageSize: 10 }
			}}
			renderDetailPanel={({ row }) => {
				const rowData = row.original;
				if (rowData.questionOption && rowData.questionOption.length > 0) {
					return (
						<Box sx={{ p: 2 }}>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>Question Options:</Typography>
							<TableContainer component={Paper} sx={{ maxWidth: 600 }}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell><strong>Option</strong></TableCell>
											<TableCell><strong>Score</strong></TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{rowData.questionOption.map((option, index) => (
											<TableRow key={index}>
												<TableCell>{option.optionDescription}</TableCell>
												<TableCell>{option.optionScore}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</Box>
					);
				}
				return null;
			}}
		/>
	);
};

// CrossSupplierBenchmarkTable component using Material React Table
const CrossSupplierBenchmarkTable = ({
	questions,
	questionresponses,
	suppliercompanyName,
	onClickDownload,
	callbackDeleteQuesFromList,
	getFileName,
	action,
	permissionManager,
	CLAIM_TYPES,
	ACTIONS,
	eventtype,
	handleScoreChange,
	hasEditPermission,
	currentStage,
	atoken,
	downloadFilesOnAzure,
	PercentageRegex
}) => {
	// Debug logging to verify data flow
	useEffect(() => {
		// Removed console.log statements
	}, [questions, questionresponses]);

	// Prepare data for Material React Table
	const tableData = useMemo(() => {
		if (!questions || questions.length === 0) {
			return [];
		}
		return questions.map((question, index) => {
			const questionData = {
				id: question?.id || `question-${index}`,
				questionNumber: `Q${index + 1}`,
				questionDescription: question?.questionDescription || "",
				questionRequirement: question?.questionRequirement || "N/A",
				attachement: question?.attachement ? 'Yes' : 'No',
				mandatory: question?.mandatory ? 'Yes' : 'No',
				weightage: question?.weightage || "0",
				questionCategory: question?.questionCategory || "",
				questionSubCategory: question?.questionSubCategory || "",
				attachedFileName: question?.attachedFileName,
				questionOption: question?.questionOption || [],
				question: question
			};

			// Add supplier responses as columns
			if (questionresponses && questionresponses.length > 0) {
				questionresponses.forEach(supplier => {
					if (supplier && supplier.id) {
						let answer;
						if (eventtype === "VQ") {
							// 🔧 Fix: Use String() to normalize ID types for reliable matching
							answer = supplier.sqeHeaderDetails?.find(ans => String(ans.questionId) === String(question.questionId));
						} else {
							answer = supplier.vendorQuestionAns?.find(ans => ans.questionId == question.id);
						}
						questionData[`supplier_${supplier.id}`] = {
							supplier: supplier,
							answer: answer,
							question: question
						};
					}
				});
			}

			return questionData;
		});
	}, [questions, questionresponses, eventtype]);

	const supplierColumns = useMemo(() => {
		return questionresponses.map(supplier => ({
			accessorKey: `supplier_${supplier.id}`,
			header: supplier.tradeName || suppliercompanyName,
			size: 300,
			Header: ({ column }) => {
				const qTotalScore = supplier?.qTotalScore ?? 0;
				return (
					<Box>
						<Typography variant="subtitle2">
							{supplier.tradeName || suppliercompanyName}
						</Typography>
						{qTotalScore !== 0 && (
							<Typography variant="caption" sx={{ fontWeight: 'bold' }}>
								Total Score: {qTotalScore}
							</Typography>
						)}
					</Box>
				);
			},
			Cell: ({ cell, row }) => {
				const responseData = cell.getValue();
				if (!responseData) return null;

				const { supplier, answer, question } = responseData;
				const uniquesupplierrfqid = supplier.id;
				let questionOption;
				if (eventtype === "VQ") {
					questionOption = answer?.questionOption?.filter(x => x.selectYN === "Y");
				} else {
					questionOption = answer?.vendorQuestOptions?.filter(x => x.SelectYN === "Y");
				}

				const ansAttachements = answer?.ansAttachements;
				const uniqueid = answer?.id;
				const questionId = answer?.questionId;
				const score = answer?.score || 0;

				return (
					<Box sx={{ py: 1 }}>
						{/* Answer */}
						<Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word' }}>
							{answer ? (answer.answer || "No text answer") : "No response provided"}
						</Typography>

						{/* Selected Options */}
						{questionOption && questionOption.length > 0 && (
							<Box sx={{ mb: 1 }}>
								<Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
									Selected Options:
								</Typography>
								{questionOption.map((option, i) => (
									<Typography key={i} variant="caption" sx={{ display: 'block', ml: 1 }}>
										• {option?.questionOption || option?.questionoption}
									</Typography>
								))}
							</Box>
						)}

						{/* Show attachment status if no options */}
						{(!questionOption || questionOption.length === 0) && answer?.ansAttachements && (
							<Typography variant="caption" sx={{ display: 'block', color: 'primary.main' }}>
								📎 Attachment provided
							</Typography>
						)}

						{/* Score Display/Input */}
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
							<Typography variant="caption" sx={{ minWidth: 40 }}>Score:</Typography>
							{score > 0 ? (
								// Display score if greater than 0
								<Typography variant="body2" sx={{ fontWeight: 'medium', minWidth: '80px' }}>
									{score}
								</Typography>
							) : (
								// Show input field if score is 0
								<TextField
									size="small"
									value={score}
									onChange={(e) => {
										const newScore = e.target.value;
										if (newScore !== "" && !isNaN(newScore)) {
											const scoreValue = parseInt(newScore);
											const weightage = question?.weightage || 100; // Get weightage from question
											if (scoreValue <= weightage && scoreValue >= 0) {
												handleScoreChange(uniquesupplierrfqid, uniqueid, questionId, scoreValue);
											}
										}
									}}
									type="number"
									inputProps={{
										min: 0,
										max: question?.weightage || 100,
										step: 1
									}}
									variant="outlined"
									disabled={currentStage === "Awarded" || !hasEditPermission}
									sx={{ width: '80px' }}
									placeholder="0"
									helperText={`Max: ${question?.weightage || 100}`}
								/>
							)}
						</Box>

						{/* Attachment Download */}
						{ansAttachements && (
							<Box>
								<Tooltip title={getFileName(ansAttachements)} arrow>
									<IconButton
										color="primary"
										size="small"
										onClick={() => downloadFilesOnAzure(ansAttachements, getFileName(ansAttachements), atoken)}
									>
										<HiDownload />
									</IconButton>
								</Tooltip>
							</Box>
						)}
					</Box>
				);
			}
		}));
	}, [questionresponses, suppliercompanyName, eventtype, handleScoreChange, hasEditPermission, currentStage, atoken, downloadFilesOnAzure, PercentageRegex, getFileName]);

	const baseColumns = useMemo(() => [
		{
			accessorKey: 'questionNumber',
			header: '#',
			size: 80,
			Cell: ({ cell }) => (
				<Typography variant="body1" sx={{ fontWeight: 'bold' }}>
					{cell.getValue()}
				</Typography>
			)
		},
		{
			accessorKey: 'questionDescription',
			header: 'Question',
			size: 400,
			Cell: ({ cell, row }) => {
				const rowData = row.original;
				return (
					<Box>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
							<Typography variant="body1" sx={{ fontWeight: 'bold', flex: 1 }}>
								{cell.getValue()}
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
								{rowData.attachedFileName && (
									<Tooltip title={getFileName(rowData.attachedFileName)} arrow>
										<IconButton
											size="small"
											color="primary"
											onClick={() => onClickDownload(rowData.question)}
										>
											<HiDownload />
										</IconButton>
									</Tooltip>
								)}
								{action && permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.REMOVE) && (
									<IconButton
										onClick={() => callbackDeleteQuesFromList(rowData.questionCategory, rowData.questionSubCategory, rowData.questionDescription)}
										color="error"
										size="small"
									>
										<HiX />
									</IconButton>
								)}
							</Box>
						</Box>
						<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 1 }}>
							<Typography variant="caption" color="textSecondary">
								<strong>Requirement:</strong> {rowData.questionRequirement}
							</Typography>
							<Typography variant="caption" color="textSecondary">
								<strong>Mandatory:</strong> {rowData.mandatory}
							</Typography>
							{rowData.weightage !== "0" && (
								<Typography variant="caption" color="textSecondary">
									<strong>Weightage:</strong> {rowData.weightage}
								</Typography>
							)}
						</Box>
					</Box>
				);
			}
		}
	], [onClickDownload, getFileName, callbackDeleteQuesFromList, action, permissionManager, CLAIM_TYPES, ACTIONS]);

	const columns = useMemo(() => [...baseColumns, ...supplierColumns], [baseColumns, supplierColumns]);

	// Removed the hook usage to avoid conflicts

	// Add explicit checks for debugging CrossSupplierBenchmarkTable
	if (!questions) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography variant="h6" color="error">❌ Questions prop is null/undefined</Typography>
			</Box>
		);
	}

	if (questions.length === 0) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography variant="h6" color="textSecondary">📝 No questions found</Typography>
			</Box>
		);
	}

	if (!questionresponses) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography variant="h6" color="error">❌ Question responses prop is null/undefined</Typography>
			</Box>
		);
	}

	// Early return if no data - moved after all hooks
	if (!tableData || tableData.length === 0) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography variant="h6" color="textSecondary">⚠️ No table data generated for cross-supplier benchmarking</Typography>
			</Box>
		);
	}

	return (
		<MaterialReactTable
			columns={columns}
			data={tableData}
			enableExpanding={true}
			enableSorting={true}
			enableColumnResizing={true}
			enableColumnOrdering={false}
			enableColumnActions={false}
			enableColumnFilters={false}
			enablePagination={true}
			enableBottomToolbar={true}
			enableTopToolbar={false}
			enableDensityToggle={false}
			enableFullScreenToggle={false}
			enableGlobalFilter={false}
			enableStickyHeader={true}
			enableColumnPinning={true}
			initialState={{
				density: 'compact',
				pagination: { pageSize: 10 },
				columnPinning: { left: ['questionNumber', 'questionDescription'] }
			}}
			renderDetailPanel={({ row }) => {
				const rowData = row.original;
				if (rowData.questionOption && rowData.questionOption.length > 0) {
					return (
						<Box sx={{ p: 2 }}>
							<Typography variant="subtitle2" sx={{ mb: 1 }}>Question Options:</Typography>
							<TableContainer component={Paper} sx={{ maxWidth: 600 }}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell><strong>Option</strong></TableCell>
											<TableCell><strong>Score</strong></TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{rowData.questionOption.map((option, i) => (
											<TableRow key={i}>
												<TableCell>{i + 1}. {option.questionOption}</TableCell>
												<TableCell>{option.weightage !== 0 ? option.weightage : ""}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</Box>
					);
				}
				return null;
			}}
		/>
	);
};

// ScoreInputField component to handle score input with proper hooks usage
const ScoreInputField = ({
	currentScore,
	weightage,
	actualVendorId,
	question,
	handleScoreChange,
	setScoreUpdate,
	hasEditPermission
}) => {
	const [localScore, setLocalScore] = React.useState(currentScore || "");

	// Update local score when currentScore changes
	React.useEffect(() => {
		setLocalScore(currentScore || "");
	}, [currentScore]);

	const handleInputChange = (e) => {
		const newValue = e.target.value;
		setLocalScore(newValue);

		// Allow empty string for clearing the field
		if (newValue === "") {
			if (handleScoreChange) {
				handleScoreChange(actualVendorId, question.id, question.questionId || question.id, 0);
				setScoreUpdate(true);
			}
			return;
		}

		const scoreValue = parseInt(newValue) || 0;

		// Validate against weightage limit
		if (scoreValue <= weightage && scoreValue >= 0) {
			if (handleScoreChange) {
				handleScoreChange(actualVendorId, question.id, question.questionId || question.id, scoreValue);
				setScoreUpdate(true);
			}
		} else {
			console.warn("⚠️ Score exceeds weightage:", scoreValue, "max:", weightage);
		}
	};

	const handleInputBlur = (e) => {
		const value = e.target.value;
		if (value === "") {
			return; // Allow empty values
		}

		const numValue = parseInt(value) || 0;
		if (numValue > weightage) {
			// Reset to weightage if value exceeds limit
			setLocalScore(weightage);
			if (handleScoreChange) {
				handleScoreChange(actualVendorId, question.id, question.questionId || question.id, weightage);
				setScoreUpdate(true);
			}
		}
	};

	return (
		<TextField
			size="small"
			value={localScore}
			onChange={handleInputChange}
			onBlur={handleInputBlur}
			type="number"
			inputProps={{
				min: 0,
				max: weightage,
				step: 1
			}}
			variant="outlined"
			disabled={!hasEditPermission}
			sx={{ width: '80px' }}
			placeholder="Enter score"
			helperText={`Max: ${weightage}`}
			error={localScore && parseInt(localScore) > weightage}
		/>
	);
};

// Enhanced ScoreInputField with Update/Reset buttons for Qualified stage
const QualifiedScoreEditor = ({
	currentScore,
	weightage,
	actualVendorId,
	question,
	handleScoreChange,
	handleScoreUpdate,
	hasEditPermission,
	onScoreModified, // New prop to notify when score is modified
	userInputScores, // NEW: Map of user input scores
	setUserInputScores // NEW: Function to update user input scores
}) => {
	const [localScore, setLocalScore] = React.useState(currentScore || 0);
	const [originalScore] = React.useState(currentScore || 0);

	// Update local score when currentScore changes
	React.useEffect(() => {
		setLocalScore(currentScore || 0);
	}, [currentScore]);

	const handleInputChange = (e) => {
		const inputValue = e.target.value;

		// Allow empty string for clearing
		if (inputValue === "") {
			setLocalScore("");
			// Also clear from userInputScores
			const questionKey = `${question.id}_${actualVendorId}`;
			if (userInputScores && setUserInputScores) {
				setUserInputScores(prev => {
					const newMap = new Map(prev);
					newMap.delete(questionKey);
					return newMap;
				});
			}
			return;
		}

		const newValue = parseInt(inputValue);

		// Validate against weightage limit and ensure it's a valid number
		if (!isNaN(newValue) && newValue >= 0 && newValue <= weightage) {
			setLocalScore(newValue);

			// 🎯 CRITICAL: Store in userInputScores state for payload
			const questionKey = `${question.id}_${actualVendorId}`;
			if (userInputScores && setUserInputScores) {
				setUserInputScores(prev => {
					const newMap = new Map(prev);
					newMap.set(questionKey, newValue);
					return newMap;
				});
			}

			// Auto-update score on change
			if (handleScoreChange) {
				handleScoreChange(actualVendorId, question.id, question.questionId || question.id, newValue);
			} else {
				console.error("❌ QualifiedScoreEditor - handleScoreChange function not available!");
			}
			// Notify that a score has been modified
			if (onScoreModified && newValue !== originalScore) {
				onScoreModified(true);
			}
		}
	};

	const handleInputFocus = (e) => {
		// Select all text when focused so typing replaces the value
		e.target.select();
	};

	const handleKeyPress = (e) => {
		// Only allow numbers
		if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
			e.preventDefault();
		}
	};

	return (
		<TextField
			size="small"
			value={localScore}
			onChange={handleInputChange}
			onFocus={handleInputFocus}
			onKeyPress={handleKeyPress}
			type="number"
			inputProps={{
				min: 0,
				max: weightage,
				step: 1
			}}
			variant="outlined"
			disabled={!hasEditPermission}
			sx={{ width: '80px' }}
			placeholder="0"
			error={localScore > weightage}
			helperText={localScore > weightage ? `Max: ${weightage}` : undefined}
		/>
	);
};

// CategoryWiseTable component using Material React Table
const CategoryWiseTable = ({
	questions,
	groupedQuestions,
	onClickDownload,
	callbackDeleteQuesFromList,
	getFileName,
	action,
	permissionManager,
	CLAIM_TYPES,
	ACTIONS,
	eventtype,
	isApprovalMode = false,
	currentStage,
	handleScoreChange,
	hasEditPermission,
	vendorId,
	pageSlug,
	scoreUpdate,
	setScoreUpdate,
	handleScoreUpdate,
	SupplierQuestionResponses,
	setSupplierQuestionResponses,
	questionresponses,
	userInputScores, // NEW: Map of user input scores
	setUserInputScores, // NEW: Function to update user input scores
}) => {
	const [expanded, setExpanded] = useState({});
	const [hasModifiedScores, setHasModifiedScores] = useState(false); // Track if any scores have been modified
	const [isUpdating, setIsUpdating] = useState(false); // Track if update is in progress to prevent double calls

	// All hooks must be called before any conditional returns
	// Prepare data for Material React Table - works for both regular and approval modes
	const tableData = useMemo(() => {
		if (!groupedQuestions) return [];

		const categoryData = [];

		Object.keys(groupedQuestions || {}).forEach((category, categoryIndex) => {
			const totalQuestions = Object.keys(groupedQuestions[category]).reduce((sum, subcategory) => {
				return sum + groupedQuestions[category][subcategory].length;
			}, 0);

			// Add category row
			categoryData.push({
				id: `category-${categoryIndex}`,
				type: 'category',
				name: category || 'Others',
				description: `${totalQuestions} questions`,
				category: category,
				subcategory: null,
				question: null,
				canExpand: true,
				subRows: Object.keys(groupedQuestions[category]).map((subcategory, subIndex) => {
					const questionsInSubcategory = groupedQuestions[category][subcategory];
					return {
						id: `subcategory-${categoryIndex}-${subIndex}`,
						type: 'subcategory',
						name: subcategory || 'Others',
						description: `${questionsInSubcategory.length} questions`,
						category: category,
						subcategory: subcategory,
						question: null,
						canExpand: true,
						subRows: questionsInSubcategory.map((question, qIndex) => ({
							id: `question-${categoryIndex}-${subIndex}-${qIndex}`,
							type: 'question',
							name: `Q${qIndex + 1}: ${question.questionDescription}`,
							description: `Weightage: ${question.weightage || 0}, Mandatory: ${question.mandatory ? 'Yes' : 'No'}`,
							category: category,
							subcategory: subcategory,
							question: question,
							canExpand: false,
							subRows: []
						}))
					};
				})
			});
		});

		return categoryData;
	}, [groupedQuestions]);

	// Columns for regular mode
	const columns = useMemo(() => [
		{
			accessorKey: 'name',
			header: 'Question',
			size: 400,
			Cell: ({ cell, row }) => {
				const rowData = row.original;
				return (
					<Box sx={{
						paddingLeft: `${row.depth * 20}px`,
						display: 'flex',
						alignItems: 'center',
						gap: 1
					}}>
						<Typography
							variant={rowData.type === 'category' ? (eventtype === 'VQ' ? 'body1' : 'h6') : rowData.type === 'subcategory' ? 'body1' : 'body2'}
							sx={{
								fontWeight: rowData.type === 'category' ? 'bold' : rowData.type === 'subcategory' ? 'medium' : 'normal',
								color: 'text.primary',
								fontSize: rowData.type === 'category' && eventtype === 'VQ' ? '16px' : undefined,
								whiteSpace: 'normal',
								wordBreak: 'break-word',
							}}
						>
							{cell.getValue()}
						</Typography>
					</Box>
				);
			}
		},
		{
			accessorKey: 'answer',
			header: 'Answer',
			size: 200,
			Cell: ({ row }) => {
				const rowData = row.original;
				const question = rowData.question;

				// Only show answer for actual questions, not categories/subcategories
				if (!question || rowData.type !== 'question') {
					return null;
				}

				return (
					<Typography variant="body2" sx={{ fontWeight: 'medium' }}>
						{question.answer || "-"}
					</Typography>
				);
			}
		},
		{
			accessorKey: 'selectedOption',
			header: 'Selected Option',
			size: 150,
			Cell: ({ row }) => {
				const rowData = row.original;
				const question = rowData.question;

				// Only show for actual questions, not categories/subcategories
				if (!question || rowData.type !== 'question') {
					return null;
				}

				return (
					<Typography variant="body2">
						{question.questionOption?.length > 0
							? question.questionOption.find(opt => opt.selectYN === "Y")?.questionOption || "-"
							: "-"
						}
					</Typography>
				);
			}
		},
		{
			accessorKey: 'attachment',
			header: 'Attachment',
			size: 100,
			Cell: ({ row }) => {
				const rowData = row.original;
				const question = rowData.question;

				// Only show for actual questions, not categories/subcategories
				if (!question || rowData.type !== 'question') {
					return null;
				}

				if (question.ansAttachements) {
					return (
						<Button
							size="small"
							color="primary"
							sx={{ textTransform: 'none', fontSize: '12px', minWidth: 'auto', p: 0.5 }}
							onClick={() => {
								// Use the same onClickDownload function for consistency
								const questionWithAttachment = {
									...question,
									attachedFileName: question.ansAttachements
								};
								onClickDownload(questionWithAttachment);
							}}
							startIcon={<HiDownload size={12} />}
						>
							Download
						</Button>
					);
				} else {
					return (
						<Typography variant="body2" color="textSecondary">
							{question.attachement ? 'Expected' : 'No'}
						</Typography>
					);
				}
			}
		},
		{
			accessorKey: 'weightage',
			header: 'Weightage',
			size: 100,
			Cell: ({ row }) => {
				const rowData = row.original;
				const question = rowData.question;

				// Only show for actual questions, not categories/subcategories
				if (!question || rowData.type !== 'question') {
					return null;
				}

				return (
					<Typography variant="body2">
						{question.weightage || 0}
					</Typography>
				);
			}
		},
		{
			accessorKey: 'mandatory',
			header: 'Mandatory',
			size: 100,
			Cell: ({ row }) => {
				const rowData = row.original;
				const question = rowData.question;

				// Only show for actual questions, not categories/subcategories
				if (!question || rowData.type !== 'question') {
					return null;
				}

				return (
					<Typography variant="body2">
						{question.mandatory ? 'Yes' : 'No'}
					</Typography>
				);
			}
		},
		{
			accessorKey: 'score',
			header: 'Score',
			size: 100, // Back to original size
			Header: ({ column }) => (
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
					<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
						Score
					</Typography>
				</Box>
			),
			Cell: ({ row }) => {
				const rowData = row.original;
				const question = rowData.question;

				// Only show for actual questions, not categories/subcategories
				if (!question || rowData.type !== 'question') {
					return null;
				}

				// Start with the original score as fallback
				let currentScore = question.score || 0;

				// 🎯 CRITICAL FIX: First check userInputScores for any manual input
				const questionKey = `${question.id}_${question.vendorId || vendorId || pageSlug || 0}`;
				if (userInputScores.has(questionKey)) {
					currentScore = userInputScores.get(questionKey);
				} else {
					// 🎯 FALLBACK: Look for updated score in SupplierQuestionResponses state
					if (eventtype === "VQ" && SupplierQuestionResponses?.length > 0) {

						let foundUpdatedScore = false;

						// Strategy 1: Direct match by ID
						const directMatch = SupplierQuestionResponses.find(q => String(q.id) === String(question.id));
						if (directMatch?.score !== undefined && directMatch?.score !== null) {
							currentScore = directMatch.score;
							foundUpdatedScore = true;
						}

						// Strategy 2: Match by questionId + vendorId
						if (!foundUpdatedScore) {
							const vendorMatch = SupplierQuestionResponses.find(q =>
								(String(q.questionId) === String(question.questionId) || String(q.questionId) === String(question.id)) &&
								String(q.vendorId) === String(question.vendorId)
							);
							if (vendorMatch?.score !== undefined && vendorMatch?.score !== null) {
								currentScore = vendorMatch.score;
								foundUpdatedScore = true;
							}
						}

						// Strategy 3: Nested vendor structure
						if (!foundUpdatedScore) {
							const vendor = SupplierQuestionResponses.find(v =>
								String(v.id) === String(question.vendorId || vendorId || pageSlug || 0) &&
								v.sqeHeaderDetails
							);
							if (vendor?.sqeHeaderDetails) {
								const questionDetail = vendor.sqeHeaderDetails.find(q =>
									String(q.id) === String(question.id) ||
									(String(q.questionId) === String(question.questionId) && String(q.vendorId) === String(question.vendorId))
								);
								if (questionDetail?.score !== undefined && questionDetail?.score !== null) {
									currentScore = questionDetail.score;
									foundUpdatedScore = true;
								}
							}
						}

						if (!foundUpdatedScore) {
							// No updated score found, using original score
						}
					}
				}

				const actualVendorId = question.vendorId || vendorId || pageSlug || 0;
				const weightage = question.weightage || 0;

				// Debug log to check currentStage value

				const isQualifiedStage = currentStage?.toLowerCase()?.trim() === "qualified";

				// Only show editable score input when stage is "Qualified"
				const shouldShowQualifiedEditor = isQualifiedStage;

				if (shouldShowQualifiedEditor) {
					return (
						<QualifiedScoreEditor
							currentScore={currentScore}
							weightage={weightage}
							actualVendorId={actualVendorId}
							question={question}
							handleScoreChange={handleScoreChange}
							handleScoreUpdate={handleScoreUpdate}
							hasEditPermission={true}
							onScoreModified={setHasModifiedScores}
							userInputScores={userInputScores}
							setUserInputScores={setUserInputScores}
						/>
					);
				}

				return (
					<Typography variant="body2" sx={{ fontWeight: 'medium' }}>
						{currentScore || 0}
					</Typography>
				);
			}
		},

		{
			accessorKey: 'actions',
			header: '',
			size: 100,
			enableSorting: false,
			Cell: ({ row }) => {
				const rowData = row.original;
				if (!rowData.question) return null;
				return (
					<Box className="eq-question-actions">
						{rowData.question?.attachedFileName && (
							<Tooltip title={getFileName(rowData.question.attachedFileName)} arrow>
								<button type="button" className="pe-icon-btn pe-icon-btn--download" onClick={() => onClickDownload(rowData.question)} aria-label="Download attachment">
									<HiDownload size={14} />
								</button>
							</Tooltip>
						)}
						{action && (permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.REMOVE) ?? false) && (
							<button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => callbackDeleteQuesFromList(rowData.category, rowData.subcategory, rowData.question.questionDescription)} aria-label="Delete question">
								<RiDeleteBin6Line />
							</button>
						)}
					</Box>
				);
			}
		}
	], [onClickDownload, getFileName, callbackDeleteQuesFromList, action, permissionManager, CLAIM_TYPES, ACTIONS, eventtype, currentStage, handleScoreChange, hasEditPermission, SupplierQuestionResponses, setScoreUpdate, handleScoreUpdate, setSupplierQuestionResponses, questionresponses, hasModifiedScores, setHasModifiedScores, userInputScores, setUserInputScores]);

	// Table configuration - works for both regular and approval modes
	const table = useMaterialReactTable({
		columns,
		data: tableData,
		enableExpanding: true,
		enableSorting: true,
		enableColumnResizing: true,
		enableColumnOrdering: false,
		enableColumnActions: false,
		enableColumnFilters: false,
		enablePagination: false,
		enableBottomToolbar: false,
		enableTopToolbar: false,
		enableDensityToggle: false,
		enableFullScreenToggle: false,
		enableGlobalFilter: false,
		getSubRows: (row) => row.subRows,
		initialState: {
			density: 'compact',
		},
		displayColumnDefOptions: {
			'mrt-row-expand': {
				size: 44,
				muiTableHeadCellProps: {
					className: 'eq-category-expand-cell',
				},
				muiTableBodyCellProps: {
					className: 'eq-category-expand-cell',
				},
			},
		},
		muiTableBodyRowProps: ({ row }) => ({
			className: `eq-category-row eq-category-row--${row.original.type || 'question'}`,
			hover: false,
		}),
		muiTablePaperProps: {
			className: 'eq-category-table-paper',
			elevation: 0,
		},
		muiTableContainerProps: {
			className: 'eq-category-table-container',
		},
		muiTableHeadCellProps: {
			className: 'eq-category-head-cell',
		},
		muiTableBodyCellProps: {
			className: 'eq-category-body-cell',
		},
		renderDetailPanel: ({ row }) => {
			const rowData = row.original;

			// Show question options for other event types (not in approval mode)
			if (!isApprovalMode && rowData.question?.questionOption && rowData.question.questionOption.length > 0) {
				return (
					<Box className="eq-category-detail-panel">
						<Typography variant="subtitle2" className="eq-category-detail-title">Question Options:</Typography>
						<TableContainer component={Paper} className="eq-question-options-table-container eq-category-options-table-container">
							<Table size="small" className="eq-question-options-table eq-category-options-table">
								<TableHead>
									<TableRow>
										<TableCell><strong>Option</strong></TableCell>
										<TableCell><strong>Score</strong></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rowData.question.questionOption.map((option, i) => (
										<TableRow key={i}>
											<TableCell>{i + 1}. {option.questionOption}</TableCell>
											<TableCell>{option.weightage !== 0 ? option.weightage : ""}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				);
			}
			return null;
		},
	});

	if (!questions || questions.length === 0) {
		return (
			<Box sx={{ p: 4, textAlign: 'center' }}>
				<Typography variant="h6" color="textSecondary">No questions selected</Typography>
			</Box>
		);
	}

	return (
		<Box>
			{/* Update/Reset buttons - show only when scores have been modified */}
			{hasModifiedScores && (eventtype === "VQ") && (currentStage?.toLowerCase()?.trim() === "qualified") && (
				<Box sx={{
					display: 'flex',
					gap: 1,
					mb: 2,
					justifyContent: 'flex-end',
					position: 'relative',
					zIndex: 10
				}}>
					<Button
						variant="contained"
						color="primary"
						size="small"
						onClick={async () => {
							if (isUpdating) {
								return;
							}

							setIsUpdating(true);
							try {
								await handleScoreUpdate();
								setHasModifiedScores(false); // Hide buttons after successful update
							} catch (error) {
								console.error("❌ Update failed:", error);
							} finally {
								setIsUpdating(false);
							}
						}}
						disabled={!hasEditPermission || isUpdating}
						sx={{
							fontSize: '12px',
							minWidth: '70px',
							boxShadow: 2
						}}
					>
						{isUpdating ? 'Updating...' : 'Update'}
					</Button>
					<Button
						variant="outlined"
						color="secondary"
						size="small"
						onClick={() => {
							// 1. Clear user input scores (this will make UI show original scores)
							setUserInputScores(new Map());

							// 2. Reset SupplierQuestionResponses to original values (revert any changes)
							if (eventtype === "VQ") {
								setSupplierQuestionResponses(prevResponses => {
									// Check if it's a flat array structure or nested vendor structure
									if (Array.isArray(prevResponses) && prevResponses[0] && prevResponses[0].questionId) {
										// For flat array structure - revert to original scores from questions data
										const revertedResponses = prevResponses.map(question => {
											// Find original question data to get the original score
											const originalQuestion = questions?.find(q =>
												String(q.id) === String(question.id) ||
												String(q.questionId) === String(question.questionId)
											);
											const originalScore = originalQuestion?.score || 0;

											return {
												...question,
												score: originalScore
											};
										});
										return revertedResponses;
									} else {
										// For nested vendor structure - revert scores in sqeHeaderDetails
										const revertedResponses = prevResponses.map(vendor => ({
											...vendor,
											sqeHeaderDetails: vendor.sqeHeaderDetails?.map(question => {
												// Find original question data to get the original score
												const originalQuestion = questions?.find(q =>
													String(q.id) === String(question.id) ||
													String(q.questionId) === String(question.questionId)
												);
												const originalScore = originalQuestion?.score || 0;

												return {
													...question,
													score: originalScore
												};
											}) || []
										}));
										return revertedResponses;
									}
								});
							} else {
								// Non-VQ events
								setSupplierQuestionResponses(prevResponses => {
									const revertedResponses = prevResponses.map(vendor => ({
										...vendor,
										vendorQuestionAns: vendor.vendorQuestionAns?.map(question => {
											// Find original question data to get the original score
											const originalQuestion = questions?.find(q => String(q.id) === String(question.id));
											const originalScore = originalQuestion?.score || 0;

											return {
												...question,
												score: originalScore
											};
										}) || []
									}));
									return revertedResponses;
								});
							}

							// 3. Hide the Update/Reset buttons
							setHasModifiedScores(false);

							// 4. Clear the score update flag
							setScoreUpdate(false);
						}}
						disabled={!hasEditPermission}
						sx={{
							fontSize: '12px',
							minWidth: '60px',
							boxShadow: 1
						}}
					>
						Reset
					</Button>
				</Box>
			)}
			<MaterialReactTable table={table} />
		</Box>
	);
};

const EventQuestionScreenList = ({ questions, callbackDeleteQuesFromList, callbackEditQuesFromList, questionresponses, action, eventtype, suppliercompanyName, eventSealed = "Y", currentStage, stagelist, EventHeaderDetails, eventSubject, permissionManager, vendorId }) => {

	// Debug component props - removed console.log statements

	const [{ atoken, rtoken, customerid, usertimezone, customersuffix, userdialingcode, roleClaims, userDetail }, dispatch] = useStateValue();
	const { pageSlug, supplierid } = useParams();
	const apiClient = new ApiClient(customersuffix);
	const navigate = useNavigate();
	const [viewMode, setViewMode] = useState(null); // 'cross-supplier-benchmarking', 'category-wise', 'question-wise'
	const [showAdditionalFields, setShowAdditionalFields] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	const [anchorEls, setAnchorEls] = React.useState({});

	// 💾 View-specific caches to prevent data loss during view switches
	const [cachedCategoryQuestions, setCachedCategoryQuestions] = useState([]);
	const [cachedQuestionWiseQuestions, setCachedQuestionWiseQuestions] = useState([]);
	const [cachedBenchmarkQuestions, setCachedBenchmarkQuestions] = useState([]);
	const [cachedBenchmarkResponses, setCachedBenchmarkResponses] = useState([]);

	const [SupplierQuestionResponses, setSupplierQuestionResponses] = useState([])
	// 🎯 NEW STATE: Track user input scores separately from the original data
	const [userInputScores, setUserInputScores] = useState(new Map()); // Map<questionId, score>
	const [state, setState] = useState({
		openInvoiceApproved: false,
	});
	const [loading, setLoading] = useState(false);
	// State for category expansion
	const [expandedCategories, setExpandedCategories] = useState({});
	// State for subcategory expansion
	const [expandedSubCategories, setExpandedSubCategories] = useState({});
	// const [selectedVendorId, setSelectedVendorId] = React.useState(null);
	const [menuVendorId, setMenuVendorId] = React.useState(null);
	const [selectedVendorId, setSelectedVendorId] = useState(null);
	const [supplierModalOpen, setSupplierModalOpen] = useState(false);

	const [searchParams, setSearchParams] = useSearchParams();

	// Toggle category expansion
	const toggleCategory = (categoryName) => {
		setExpandedCategories(prev => ({
			...prev,
			[categoryName]: !prev[categoryName]
		}));
	};

	// Toggle subcategory expansion
	const toggleSubCategory = (categoryName, subcategoryName) => {
		const key = `${categoryName}-${subcategoryName}`;
		setExpandedSubCategories(prev => ({
			...prev,
			[key]: !prev[key]
		}));
	};
	// const [itemEditTempData, setItemEditTempData] = useState([]);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleViewModeChange = (mode) => {

		setViewMode(mode);
		handleClose();
	};

	const onClickDownload = (question) => {
		if (question.attachedFileName) {
			const fileName = question.attachedFileName;
			downloadFilesOnAzure(fileName, fileName);
		} else {
			console.error("No attached file name found!");
		}
	};

	const groupedQuestions = questions?.reduce((acc, question) => {
		const { questionCategory, questionSubCategory } = question;

		if (!acc[questionCategory]) {
			acc[questionCategory] = {};
		}

		if (!acc[questionCategory][questionSubCategory]) {
			acc[questionCategory][questionSubCategory] = [];
		}

		acc[questionCategory][questionSubCategory].push(question);

		return acc;
	}, {});

	const [mergedData, setMergedData] = useState([]);
	const [columns, setColumns] = useState([]);
	const [scoreUpdate, setScoreUpdate] = useState(false);
	const [supplierlist, setSupplierList] = useState([]);
	const [activityId, setActvityId] = useState(0);
	const [stageValue, setStageValue] = useState('');
	const [actionType, setActionType] = useState("");
	const [idFromURL, setIdFromURL] = useState(null);
	const [hasModifiedScores, setHasModifiedScores] = useState(false); // Track score modifications for Update/Reset buttons
	const [isUpdating, setIsUpdating] = useState(false); // Track if update is in progress to prevent double calls

	// Use ref to track latest SupplierQuestionResponses state reliably
	const supplierResponsesRef = useRef(SupplierQuestionResponses);

	// Keep ref in sync with state changes
	useEffect(() => {
		supplierResponsesRef.current = SupplierQuestionResponses;
	}, [SupplierQuestionResponses]);

	// Debug scoreUpdate state changes
	useEffect(() => {
		// Removed console.log statements
	}, [scoreUpdate]);

	// Debug SupplierQuestionResponses state changes
	useEffect(() => {
		// Removed console.log statements
	}, [SupplierQuestionResponses]);

	// Debug hasModifiedScores state changes
	useEffect(() => {
		// Removed console.log statements
	}, [hasModifiedScores]);

	// Debug userInputScores state changes
	useEffect(() => {
		// Removed console.log statements
	}, [userInputScores]);


	useEffect(() => {

		const params = new URLSearchParams(searchParams);
		const actionType = params.get("ActionType");
		const ActivityId = params.get("ActivityId");
		const StageValue = params.get("Stage");
		setActionType(actionType);

		// if (actionType == "approval" ) {
		// 	tabReport()
		// }
		setActvityId(ActivityId ?? 0);
		setStageValue(StageValue ?? '');
		const newIdFromURL = pageSlug;
		setIdFromURL(newIdFromURL);
	}, [searchParams]);
	const [menuSupplierId, setMenuSupplierId] = React.useState(null);
	const toggleDrawer = (anchor, open) => (event) => {
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}


		setState({ ...state, [anchor]: open });
		// setItemEditTempData([]);
	};

	const toggleDrawerCallback = useCallback((anchor, open) => {
		setState({ ...state, [anchor]: open });
	}, []);


	const handleMenuOpen = (e) => {
		e.stopPropagation();
		setAnchorEl(e.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};
	const [openMenuIndex, setOpenMenuIndex] = React.useState(null);


	const [open, setOpen] = React.useState(false);

	useEffect(() => {

		if (questions && questions.length > 0 && !scoreUpdate) {


			// Merging questions with responses per supplier
			const merged = questions.map(question => {

				if (eventtype == "VQ") {

					const responsesForQuestion = questionresponses.reduce((acc, response) => {
						// Add validation for response
						if (!response || !response.id) {
							return acc;
						}

						const answer = response.sqeHeaderDetails?.find(ans => ans && ans.id == question.id);

						// Only add to accumulator if we have a valid answer
						if (answer) {
							acc[response.id] = answer;
						}

						return acc;
					}, {});


					const returndata = {
						id: question.id,
						questionDescription: question.questionDescription,
						attachedFileName: question.attachedFileName,
						questionRequirement: question.questionRequirement || "N/A",
						attachement: question.attachement ? 'Yes' : 'No',
						mandatory: question.mandatory ? 'Yes' : 'No',
						weightage: question.weightage || "0",
						questionCategory: question.questionCategory || "",
						questionSubCategory: question.questionSubCategory || "",
						responses: EventQuestionVQModal(responsesForQuestion)

					};

					return returndata

				}
				else {

					const responsesForQuestion = questionresponses.reduce((acc, response) => {

						const answer = response
							? (response.vendorQuestionAns)?.find(ans => ans.questionId == question.id)
							: '';

						acc[response.id] = answer;

						return acc;
					}, {});

					return {
						id: question.id,
						questionDescription: question.questionDescription,
						attachedFileName: question.attachedFileName,
						questionRequirement: question.questionRequirement || "N/A",
						attachement: question.attachement ? 'Yes' : 'No',
						mandatory: question.mandatory ? 'Yes' : 'No',
						weightage: question.weightage || "0",
						questionCategory: question.questionCategory || "",
						questionSubCategory: question.questionSubCategory || "",
						responses: responsesForQuestion,

					};

				}






			});

			// Set merged data in state
			setMergedData(merged);

			// Define columns dynamically based on suppliers' trade names
			const questionColumns = [
				{
					accessorKey: 'id',
					header: '#',
					enableColumnOrdering: false,
					enableResizing: false,
					size: 20,
					// muiTableBodyCellProps: {
					//     align: 'left',
					// },
					// muiTableBodyRowProps: {
					//     verticalAlign: 'top'
					// },

					Cell: ({ cell }) => {

						const index = cell.row.index + 1;
						return (
							<Box display="flex" alignItems="center">


								<Typography variant="body2" >
									{index}
								</Typography>

							</Box>
						);
					}
				},
				{
					accessorKey: 'questionDescription', header: 'Question', enableColumnOrdering: false,
					minWidth: 30,
					// muiTableBodyCellProps: {
					//     align: 'left',
					// },
					// muiTableBodyRowProps: {

					//     verticalAlign: 'top'

					// },


					Cell: ({ cell, table }) => {

						const item = cell.row.original;
						const index = cell.row.index + 1;
						return (
							<>
								<Stack spacing={0.2}>
									<Box display="flex" justifyContent="space-between" alignItems="center">
										<Typography variant="body1" sx={{ fontWeight: 'bold' }}> {item.questionDescription}</Typography>
										{action && (permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.REMOVE) ?? false) && <IconButton onClick={() => callbackDeleteQuesFromList(item?.questionCategory, item?.questionSubCategory, item.questionDescription)} color="error">
											<HiX />
										</IconButton>}

									</Box>

									{item.attachedFileName && (
										<Box sx={{ marginBottom: 1 }}>
											<Button
												variant="outlined"
												color="primary"
												size="large"
												onClick={() => onClickDownload(item)}
												startIcon={<HiDownload />}
											>
												{getFileName(item.attachedFileName)}
											</Button>
										</Box>
									)}
								</Stack>
							</>






						)

					}
				},
			];

			const supplierNames = Array.from(new Set(questionresponses.flatMap(response => response.id)));
			const responseColumns = supplierNames.map(supplierid => ({
				accessorKey: `responses.${supplierid}`,
				header: supplierid,

				enableColumnOrdering: true,
				enableSorting: false,
				Header: ({ column }) => {

					const obj = questionresponses?.find(x => x.id == column?.columnDef?.header);
					const qTotalScore = obj?.qTotalScore ?? 0;

					return (
						<>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", whiteSpace: "nowrap" }}>
								<WhiteTooltip
									title={
										<div className="row">
											<div className="col-md-12">
												<div>{obj?.tradeName ?? suppliercompanyName}{obj?.contactPerson && " | "}{obj?.contactPerson} {obj?.email && "|"} {obj?.email}</div>

											</div>
											{obj?.mobile && <div className="col-md-12">
												<div>Mobile : {obj?.mobile}</div>

											</div>}
											{obj?.submissionDate && <div className="col-md-12">
												<div>Submission Time : {obj?.submissionDate
													? formatDateViaLocale(
														obj?.submissionDate,
														userDetail
													)
													: ""}</div>

											</div>}
										</div>

									}
								>
									<div
										style={{ cursor: "pointer" }}
										onClick={() => navigate(`/manage-rfq/${pageSlug}/supplier-individual-report/${obj?.id}?tab=report&eventid=${pageSlug}`)}
									><span style={{ fontSize: '14px', fontWeight: 'normal', textDecoration: "none" }}>{obj?.tradeName ?? suppliercompanyName}</span>

									</div>

								</WhiteTooltip>

								{/* {obj?.techStatus === 'Pending' && actionType == 'approval' && activityId ? (<div className="custom-action-menu">
                                    <Dropdown.Item as="div" className="custom-action-item">
                                        <LoadingButton
                                            size="small"
                                            variant="outlined"
                                            className="f10 capitalize custom-take-action-btn"
                                            onClick={(e) => {
                                                formik_ApproveReject.setFieldValue("vendorId", obj?.id);
                                                toggleDrawer("openInvoiceApproved", true)(e);
                                            }}
                                        >
                                            Take Action
                                        </LoadingButton>
                                    </Dropdown.Item>
                                </div>
                                ) : (
                                    <div style={{ color: obj.techStatus === 'Approved' ? 'green' : 'red', marginLeft: 8 }}>
                                        {currentStage == 'Open' && getStageInfo(currentStage, stagelist).nextStage != 'Technical Approval' ? '' : obj?.techStatus}

                                    </div>
                                )} */}

								{stagelist?.some(stage => stage.stageName?.toLowerCase() === 'technical approval')
									? (
										obj?.techStatus === 'Pending' &&
											actionType === 'approval' &&
											activityId ? (
											<div className="custom-action-menu">
												<Dropdown.Item as="div" className="custom-action-item">
													<LoadingButton
														size="small"
														variant="contained"
														className="f10 capitalize custom-take-action-btn"
														sx={{
															backgroundColor: '#1976d2 !important',
															color: 'white !important',
															borderColor: '#1976d2 !important',
															'&:hover': {
																backgroundColor: '#1565c0 !important'
															}
														}}
														onClick={(e) => {
															formik_ApproveReject.setFieldValue("vendorId", obj?.id);
															toggleDrawer("openInvoiceApproved", true)(e);
														}}
													>
														Take Action
													</LoadingButton>
												</Dropdown.Item>
											</div>
										) : (
											<div
												style={{
													color: obj.techStatus === 'Approved' ? 'green' : 'red',
													marginLeft: 8
												}}
											>
												{
													currentStage === 'Open' &&
														getStageInfo(currentStage, stagelist)?.nextStage !== 'Technical Approval'
														? ''
														: obj?.techStatus
												}
											</div>
										)
									)
									: <div />
								}





							</div>
							{qTotalScore != 0 && <div>  <b>Total Score : {qTotalScore}</b> </div>}

						</>

					)
				},

				// muiTableBodyCellProps: {
				//     align: 'left',


				// },
				// muiTableBodyRowProps: {

				//     verticalAlign: 'top'

				// },
				Cell: ({ cell, table }) => {

					const response = cell.row._valuesCache[`responses.${supplierid}`];
					const answer = response?.answer;
					const score = response?.score;
					const ansAttachements = response?.ansAttachements;
					let questionOption;

					if (eventtype == "VQ") {
						questionOption = response?.vendorQuestOptions?.filter(x => x.selectYN == "Y");
					}
					else {
						questionOption = response?.vendorQuestOptions?.filter(x => x.SelectYN == "Y");
					}
					// if (eventSealed != 'N') {
					return answer?.length > 500 ? (
						<>
							<div className=" pointer" variant="body1">
								<WhiteTooltip title={`${answer}`} arrow>
									<TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell variant="body1"> {answer.slice(0, 501) + '...'}{' '}</TableCell>
									</TableRow>

								</WhiteTooltip>
							</div>
							{questionOption && questionOption?.length > 0 && <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
								<TableContainer sx={{ overflow: 'hidden' }}>
									<Table size="small" >

										<TableBody>
											{questionOption && questionOption.length > 0 ? (

												questionOption?.map((option, i) => {

													return (
														<>

															<TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
																<TableCell variant="body1">{option?.questionoption || option?.questionOption}</TableCell>


															</TableRow>


														</>
													)
												}


												)
											) : (

												<></>
											)}</TableBody></Table></TableContainer>

							</Box>}

							{ansAttachements && (
								<Box sx={{ marginBottom: 1 }}>
									<Button
										variant="outlined"
										color="primary"
										size="small"
										onClick={() => downloadFilesOnAzure(ansAttachements, getFileName(ansAttachements), atoken)}
										startIcon={<HiDownload />}
									>
										{getFileName(ansAttachements)}
									</Button>
								</Box>
							)}


						</>
					) : (
						<>
							<Stack spacing={0.2}>
								{answer &&

									<WhiteTooltip title={`${answer}`} arrow>
										<div>
											{answer}
										</div>

									</WhiteTooltip>
								}
								{questionOption && questionOption?.length > 0 && <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
									<TableContainer sx={{ overflow: 'hidden' }}>
										<Table size="small" >

											<TableBody>
												{questionOption && questionOption.length > 0 ? (

													questionOption?.map((option, i) => {

														return (
															<>

																<TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
																	<TableCell variant="body1">{option?.questionoption || option?.questionOption}</TableCell>


																</TableRow>


															</>
														)
													}


													)
												) : (

													<></>
												)}</TableBody></Table></TableContainer>

								</Box>}
								{ansAttachements && (
									<div className='mt-2'>
										<Button
											variant="outlined"
											color="primary"
											size="small"
											onClick={() => downloadFilesOnAzure(ansAttachements, getFileName(ansAttachements), atoken)}
											startIcon={<HiDownload />}
										>
											{getFileName(ansAttachements)}
										</Button>
									</div>
								)}

							</Stack>
						</>
					);

					// }

					// else {
					//     return <EventQuoteSealed />
					// }




				}
			}));

			setColumns([...questionColumns, ...responseColumns]);
		}
	}, [questions, questionresponses, scoreUpdate]);

	useEffect(() => {
		if (questionresponses) {

			const updatevalue = questionresponses.map(x => x.id)
			setSupplierList(updatevalue)
			setSupplierQuestionResponses(questionresponses)
			// 🔧 Fix: Sync ref with state update
			supplierResponsesRef.current = questionresponses;
		} else if (eventtype === "VQ" && vendorId && questions?.length > 0) {
			// For VQ events without existing responses, initialize with vendor
			const initialResponse = {
				id: vendorId,
				supplierName: "Current Vendor",
				// Add any other required fields
			};
			setSupplierQuestionResponses([initialResponse]);
			// 🔧 Fix: Sync ref with state update
			supplierResponsesRef.current = [initialResponse];
		}
	}, [questionresponses, eventtype, vendorId, questions])

	useEffect(() => {
		// For VQ/SQE events, always use category-wise view for proper score editing
		if (eventtype === "VQ") {
			setViewMode('category-wise');
			return;
		}

		// Only set viewMode on initial mount for other event types, don't override manual changes
		if (viewMode === null) {
			if (questionresponses && questionresponses.length > 0) {
				setViewMode('cross-supplier-benchmarking')
			}
			else {
				setViewMode('question-wise')
			}
		}
	}, [questionresponses, viewMode, eventtype, questions])

	// 💾 Global caching - preserve last valid data regardless of current viewMode
	useEffect(() => {
		if (questions?.length > 0) {
			setCachedCategoryQuestions(questions);
			setCachedQuestionWiseQuestions(questions);
			setCachedBenchmarkQuestions(questions);
		}
	}, [questions]);

	useEffect(() => {
		if (questionresponses?.length > 0) {
			setCachedBenchmarkResponses(questionresponses);
		}
	}, [questionresponses]);

	const table = useMaterialReactTable({
		columns,
		data: mergedData,
		enableColumnOrdering: true,
		enableColumnPinning: true,
		enablePagination: true,
		enableSorting: true,
		enableColumnResizing: true,

		enableColumnActions: false,
		enableColumnFilters: false,
		enableDensityToggle: false,
		enableFullScreenToggle: false,
		enableGlobalFilter: false,
		enableStickyHeader: true,
		icons: {
			//change sort icon, connect internal props so that it gets styled correctly
			FullscreenExitIcon: () => <MdCloseFullscreen color='primary' />,
			FullscreenIcon: () => <MdFullscreen color='primary' />
		},

		enableTopToolbar: true,
		initialState: {
			pagination: { pageSize: 50 },
			density: 'compact',
			columnPinning: { left: ['id', 'questionDescription'] },
		},
		layoutMode: "grid",
		renderToolbarInternalActions: ({ table }) => (
			<Box>


				{/* along-side built-in buttons in whatever order you want them */}
				{/* <MRT_ToggleDensePaddingButton table={table} color='primary' /> */}
				{/* <MRT_ToggleFullScreenButton table={table} color='primary' /> */}
			</Box>
		),


	});

	const handleScoreChange = (uniquesupplierrfqid, uniqueid, questionId, newScore) => {
		// Validate inputs
		if (newScore === undefined || newScore === null) {
			console.warn("⚠️ Invalid newScore provided:", newScore);
			return;
		}

		setScoreUpdate(true)

		if (eventtype == "VQ") {

			setSupplierQuestionResponses(prevResponses => {


				// Check if prevResponses is a flat array (direct questions) or nested structure
				if (Array.isArray(prevResponses) && prevResponses[0] && prevResponses[0].questionId) {


					let questionFound = false;
					const updatedResponses = prevResponses.map((question, index) => {
						// ENHANCED DEBUGGING for question matching
						const isIdMatch = question.id === uniqueid;
						const isQuestionIdMatch = question.questionId === questionId;



						// Match by record ID (uniqueid) - normalize to string for reliable comparison
						// Try both strict and loose equality in case of type mismatches
						if (String(question.id) === String(uniqueid) ||
							String(question.questionId) === String(questionId)) {
							console.log("✅ MATCH FOUND! Updating question by record ID or questionId");
							console.log("🔍 Match details:", {
								questionId: question.id,

							});

							questionFound = true;
							// Better score parsing - avoid zeroing valid scores
							const parsedScore = Number.isNaN(parseInt(newScore, 10)) ? 0 : parseInt(newScore, 10);
							const updatedQuestion = { ...question, score: parsedScore };


							return updatedQuestion;
						}
						return question;
					});

					if (!questionFound) {
						console.error("❌ CRITICAL: Question not found!");
						console.error("🔍 Search target - uniqueid:", uniqueid, "type:", typeof uniqueid);
						console.error("🔍 Search target - questionId:", questionId, "type:", typeof questionId);
						console.error("🔍 Available questions:");
						prevResponses.forEach((q, idx) => {
							console.error(`   [${idx}] ID: ${q.id} (${typeof q.id}), questionId: ${q.questionId} (${typeof q.questionId}), score: ${q.score}`);
						});

						// FALLBACK: Try to update by any reasonable match as a last resort
						console.warn("🔧 ATTEMPTING FALLBACK - trying to match by normalized string criteria");
						const fallbackIndex = prevResponses.findIndex(q =>
							String(q.id) === String(uniqueid) ||
							String(q.questionId) === String(questionId) ||
							String(q.questionId) === String(uniqueid)
						);

						if (fallbackIndex !== -1) {
							console.warn("🔧 FALLBACK SUCCESS - found question at index:", fallbackIndex);
							const parsedScore = Number.isNaN(parseInt(newScore, 10)) ? 0 : parseInt(newScore, 10);
							updatedResponses[fallbackIndex] = {
								...updatedResponses[fallbackIndex],
								score: parsedScore
							};
							questionFound = true;
						} else {
							console.error("❌ FALLBACK FAILED - no question found by any criteria");
						}
					}



					// CRITICAL: Verify the specific question was updated
					const targetQuestion = updatedResponses.find(q => String(q.id) === String(uniqueid));

					if (targetQuestion && targetQuestion.score == newScore) {
					} else {

					}

					// ✅ CRITICAL FIX: Sync the ref so handleScoreUpdate reads the updated state
					supplierResponsesRef.current = updatedResponses;

					return updatedResponses;
				} else {


					let questionUpdated = false;
					const updatedResponses = prevResponses.map(vendor => {

						if (String(vendor.id) === String(uniquesupplierrfqid)) {

							const updatedSqeHeaderDetails = vendor.sqeHeaderDetails.map(question => {


								// Match by record ID primarily with normalized comparison
								if (String(question.id) === String(uniqueid)) {
									questionUpdated = true;

									// Better score parsing with validation
									const parsedScore = Number.isNaN(parseInt(newScore, 10)) ? 0 : parseInt(newScore, 10);
									const updatedQuestion = { ...question, score: parsedScore };


									return updatedQuestion;
								}
								return question;
							});

							const updatedVendor = {
								...vendor,
								sqeHeaderDetails: updatedSqeHeaderDetails
							};

							return updatedVendor;
						}
						return vendor;
					});

					if (!questionUpdated) {

						prevResponses.forEach((vendor, vIndex) => {
							console.error(`   Vendor [${vIndex}] ID: ${vendor.id}`);
							if (vendor.sqeHeaderDetails) {
								vendor.sqeHeaderDetails.forEach((q, qIndex) => {
									console.error(`     Question [${qIndex}] ID: ${q.id}, questionId: ${q.questionId}, score: ${q.score}`);
								});
							}
						});
					}


					// ✅ CRITICAL FIX: Sync the ref for nested structure too
					supplierResponsesRef.current = updatedResponses;

					return updatedResponses;
				}
			});
		}
		else {
			setSupplierQuestionResponses(prevResponses => {
				const updatedResponses = prevResponses.map(vendor =>
					vendor.id === uniquesupplierrfqid
						? {
							...vendor,
							vendorQuestionAns: vendor.vendorQuestionAns.map(question =>
								question.id === uniqueid
									? { ...question, score: Number.isNaN(parseInt(newScore, 10)) ? 0 : parseInt(newScore, 10) }
									: question
							)
						}
						: vendor
				);

				// ✅ CRITICAL FIX: Sync the ref for non-VQ events too
				supplierResponsesRef.current = updatedResponses;

				return updatedResponses;
			});
		}

		// Track that scores have been modified
		setHasModifiedScores(true);
		setScoreUpdate(true);


	};

	const handleScoreUpdate = useCallback(async () => {


		try {
			if (eventtype === "VQ") {
				// Use ref to access current state directly


				// ✅ DEEP DEBUG: Use console.table for better visibility
				if (supplierResponsesRef.current?.length > 0) {
					console.table(supplierResponsesRef.current.map(q => ({
						id: q.id,
						questionId: q.questionId,
						score: q.score,
						typeofScore: typeof q.score,
						scoreValue: q.score,
						vqHeaderId: q.vqHeaderId
					})));
				}

				// Check if we have any scores > 0 to validate the update worked
				const hasUpdatedScores = supplierResponsesRef.current?.some(q => q.score > 0);

				let dataToSend = [];

				// 🔧 SIMPLIFIED: Straightforward data flattening for all scenarios

				if (Array.isArray(supplierResponsesRef.current) && supplierResponsesRef.current.length > 0) {
					supplierResponsesRef.current.forEach((item, index) => {


						if (item.questionId) {
							// Direct question item - add it
							dataToSend.push(item);
						} else if (item.sqeHeaderDetails && Array.isArray(item.sqeHeaderDetails)) {
							// Vendor with questions - extract questions
							item.sqeHeaderDetails.forEach((question, qIndex) => {
								dataToSend.push(question);
							});
						} else {
							console.warn(`⚠️ Skipping unknown item structure at index ${index}:`, item);
						}
					});
				} else {
					console.warn("⚠️ supplierResponsesRef.current is not a valid array:", supplierResponsesRef.current);
				}

				// 🚨 CRITICAL FIX: Filter by vqHeaderId to only send questions from the current VQ
				// Determine the current VQ header ID from URL params or the first item's vqHeaderId
				let currentVqHeaderId = null;

				// Try to get vqHeaderId from URL params (sqeHeaderId state)
				const searchParams = new URLSearchParams(window.location.search);
				const sqIdFromUrl = searchParams.get('sqId');

				if (sqIdFromUrl) {
					currentVqHeaderId = parseInt(sqIdFromUrl);
				} else if (dataToSend.length > 0 && dataToSend[0].vqHeaderId) {
					// Fallback: use vqHeaderId from first question
					currentVqHeaderId = dataToSend[0].vqHeaderId;
				} else {
					console.error("❌ Cannot determine current vqHeaderId - no sqId in URL and no vqHeaderId in questions");
					toast.error("Cannot determine which VQ to update. Please try again.");
					return;
				}

				// Filter questions to only include those with matching vqHeaderId
				const filteredByVqHeaderId = dataToSend.filter(item => {
					const matches = item.vqHeaderId === currentVqHeaderId;
					if (!matches) {
						console.log(`🔍 Filtering out question ${item.id} (vqHeaderId: ${item.vqHeaderId}, expected: ${currentVqHeaderId})`);
					}
					return matches;
				});



				// if (filteredByVqHeaderId.length === 0) {
				//     toast.warning(`No questions found for the current VQ (ID: ${currentVqHeaderId})`);
				//     setScoreUpdate(false);
				//     return;
				// }

				// Update dataToSend to use filtered data
				dataToSend = filteredByVqHeaderId;

				console.log("📊 Raw scores before any additional filtering:", dataToSend.map(item => ({
					id: item.id,
					questionId: item.questionId,
					score: item.score,
					scoreType: typeof item.score,
					scoreValue: item.score,
					vqHeaderId: item.vqHeaderId
				})));

				// IMPORTANT: Verify that scores are actually captured from state
				const scoresInData = dataToSend.filter(item => item.score > 0);


				if (scoresInData.length === 0) {
					console.warn("⚠️ WARNING: No scores > 0 found in filtered data - this might indicate state capture failed, but continuing with all valid items");
				}

				// 🔧 SIMPLIFIED FILTERING: Only remove items that are truly invalid
				// Keep items with zero scores to allow score updates from 0
				const validData = dataToSend.filter(item => {
					const isValid = item &&
						item.id !== undefined &&
						item.questionId !== undefined &&
						item.vendorId !== undefined &&
						item.vqHeaderId === currentVqHeaderId; // Ensure vqHeaderId matches

					if (!isValid) {
						console.warn("⚠️ Filtering out invalid item:", {
							id: item?.id,
							questionId: item?.questionId,
							vendorId: item?.vendorId,
							vqHeaderId: item?.vqHeaderId,
							expectedVqHeaderId: currentVqHeaderId
						});
					}

					return isValid;
				});



				// If no valid data, don't send anything
				// if (validData.length === 0) {
				//     console.warn(`⚠️ No valid data to send for vqHeaderId: ${currentVqHeaderId}`);
				//     toast.warning(`No valid questions found to update for VQ ID: ${currentVqHeaderId}`);
				//     setScoreUpdate(false);
				//     return;
				// }




				// Transform data to match API expected format
				const transformedData = validData.map(item => {
					console.log("🔄 Transforming item:", { id: item.id, questionId: item.questionId, score: item.score, vqHeaderId: item.vqHeaderId });

					// 🎯 CRITICAL FIX: Check userInputScores first for the latest input
					const questionKey = `${item.id}_${item.vendorId}`;
					let finalScore = item.score; // Start with original score

					if (userInputScores.has(questionKey)) {
						finalScore = userInputScores.get(questionKey);
						console.log("🎯 Using user input score from state:", {
							questionKey,
							originalScore: item.score,
							userInputScore: finalScore,
							questionId: item.questionId,
							questionDesc: item.questionDescription || 'N/A'
						});
					} else {
						console.log("🔍 No user input found, using original score:", {
							questionKey,
							originalScore: item.score,
							questionId: item.questionId
						});
					}

					// 🔧 IMPROVED: Better score parsing that preserves user input
					let parsedScore = 0;
					if (finalScore !== undefined && finalScore !== null && finalScore !== "") {
						// Try to parse as number, handling both strings and numbers
						const numericScore = Number(finalScore);
						if (!isNaN(numericScore)) {
							parsedScore = Math.round(numericScore); // Round to integer
						} else {
							console.warn(`⚠️ Invalid score value for item ${item.id}: "${finalScore}" (${typeof finalScore})`);
							parsedScore = 0; // Only default to 0 if truly invalid
						}
					}


					const transformed = {
						id: item.id || 0,
						customerId: item.customerId || 1, // Ensure customerId is not 0
						questionId: item.questionId || 0,
						questionDescription: item.questionDescription || "",
						attachement: Boolean(item.attachement),
						attachedFileName: item.attachedFileName || "",
						optionType: Boolean(item.optionType),
						weightage: item.weightage || 0,
						mandatory: Boolean(item.mandatory),
						questionRequirement: item.questionRequirement || "",
						vendorId: item.vendorId || 0,
						vqHeaderId: item.vqHeaderId || 0,
						libraryId: item.libraryId || 0,
						categoryId: item.categoryId || 0,
						questionCategory: item.questionCategory || "",
						categorySubId: item.categorySubId || 0,
						questionSubCategory: item.questionSubCategory || "",
						answer: item.answer || "",
						score: parsedScore,
						ansAttachements: item.ansAttachements || "",
						autoCalculated: Boolean(item.autoCalculated),
						isMultiOption: Boolean(item.isMultiOption),
						isMultipleChoice: Boolean(item.isMultipleChoice),
						stages: {
							eventType: eventtype || "VQ",
							currentStage: currentStage || "Qualified",  // Use current stage from props, defaulting to "Qualified" for VQ
							nextStage: "", // Set to "Completed" for qualified VQ stage
							orgId: 0,
							orgGroupId: 0
						},
						questionOption: Array.isArray(item.questionOption) ? item.questionOption.map(option => ({
							id: option.id || 0,
							customerId: option.customerId || 1, // Ensure customerId is not 0
							questionOption: option.questionOption || "",
							weightage: option.weightage || 0,
							selectYN: option.selectYN || "",
							isAttachment: Boolean(option.isAttachment),
							headerDetailId: option.headerDetailId || 0,
							questionId: option.questionId || 0
						})) : []
					};


					return transformed;
				});



				// CRITICAL CHECK: Verify we have scores before sending
				const hasScoresInPayload = transformedData.some(item => item.score > 0);
				if (!hasScoresInPayload) {
					console.error("❌ CRITICAL: No scores in final payload! This means state capture or transformation failed");
					console.error("❌ Debug info - check earlier logs for state capture issues");
				}

				// Final verification: all items should have the same vqHeaderId
				const uniqueVqHeaderIds = [...new Set(transformedData.map(item => item.vqHeaderId))];
				if (uniqueVqHeaderIds.length > 1) {

					return;
				}

				// if (transformedData.length === 0) {
				//     toast.error("No valid data to update");
				//     return;
				// }


				// Call the specific API endpoint for VQ score updates using the correct method
				const response = await apiClient.postres("/api/SQE/UpdateSQEHeaderDetail", transformedData, atoken);

				if (response.status === 200 || response.status === 201) {


					// Call the existing callback for additional processing if needed
					if (callbackEditQuesFromList) {
						await callbackEditQuesFromList(transformedData);
					}
				} else {
					console.error("❌ Failed to update VQ score:", response);
					toast.error("Failed to update scores");
				}
			} else {
				// For other event types, use current state directly
				const latestStateForOthers = supplierResponsesRef.current;

				const data = latestStateForOthers.map(x => x.vendorQuestionAns);
				const updatedvalue = data.flatMap(x => x || []);

				console.log("📤 Sending RFQ data:", updatedvalue);

				if (callbackEditQuesFromList) {
					await callbackEditQuesFromList(updatedvalue);
				} else {
					console.warn("⚠️ callbackEditQuesFromList not available");
				}
			}

			setScoreUpdate(false);
			console.log("✅ Score update completed");
		} catch (error) {
			console.error("❌ Error updating score:", error);
			console.error("Error details:", {
				message: error.message,
				stack: error.stack,
				response: error.response?.data
			});
			toast.error("Error updating scores: " + (error.message || "Unknown error"));
		}
	}, [eventtype, apiClient, atoken, callbackEditQuesFromList, currentStage, userInputScores])
	const validationSchemaApprover = yup.object().shape({
		status: yup.string().required("status is required"),
		approveComment: yup.string().when('status', {
			is: 'Rejected',
			then: (schema) => schema.required("Reason is required for rejection"),
			otherwise: (schema) => schema.notRequired()
		})
	});
	const formik_ApproveReject = useFormik({
		enableReinitialize: true,
		initialValues: {
			rfqId: parseInt(idFromURL),
			status: actionType == "Forward" ? "Forward" : "Approved",
			approveComment: "",
			activityId: parseInt(activityId),
			startDate: null,
			endDate: null,
			vendorId: 0,
		},
		validationSchema: validationSchemaApprover,
		onSubmit: async (values) => {
			setLoading(true)
			//no need to send startdate and enddate in other case
			delete values?.startDate
			delete values?.endDate
			const currentDate = new Date();

			if (actionType == 'Forward') {
				const datapayload = getPayloadWithStage(
					"currentStage",
					currentStage,
					stagelist,
					values,
					"currentStage"
				);
				const res = await apiClient.postres(
					`/api/RFQManage/RFQForward`,
					datapayload,
					atoken
				);
				if (res) {
					toast.success(`RFQ Forwarded successfully`, {
						toastId: "supplierforword_suc"
					});
					navigate(`/app`);
				}


				setLoading(false)
				return
			}

			const stageInfo = getStageInfo(currentStage, stagelist);
			let IsApproved = false;
			if (values?.status == "Approved") {
				IsApproved = true
			}
			else {
				IsApproved = false
			}

			const actionData = {
				customerId: parseInt(customerid),
				eventId: parseInt(idFromURL),
				eventType: "RFQ",
				stageId: stageInfo?.currentStageId,
				IsApproved: IsApproved,
				activityId: parseInt(activityId),
				remarks: values?.approveComment,
				vendorId: supplierid ?? values?.vendorId ?? 0,
				eventSubject: eventSubject ?? "",
				RecordCreatorId: EventHeaderDetails?.createdById,

			}

			if (actionType == 'approval') {



				const res = await apiClient.postres(
					`/api/ApprovalAction/ApprovalAction`,
					actionData,
					atoken
				);
				if (res) {
					toast.success(`Action Taken Successfully`, {
						toastId: "supplieraction_error"
					});
					navigate(`/app`);
				}

			}


			else {



				const res = await apiClient.postres(
					`/api/ApprovalAction/ApprovalAction`,
					actionData,
					atoken
				);
				if (res) {
					toast.success(`Action taken successfully`, {
						toastId: "supplierevent_error"
					});
					navigate(`/app`);
				}

			}
			setLoading(false)
		},
	});

	return (
		<Box sx={{ paddingBottom: 2, }}>
			{(() => {
				const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ) ?? false;
				const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.EDIT) ?? false;

				console.log("🔐 Permission check:", {
					hasReadPermission,
					hasEditPermission,
					eventtype,
					currentStage,
					permissionManager: !!permissionManager,
					CLAIM_TYPES: !!CLAIM_TYPES,
					ACTIONS: !!ACTIONS
				});

				if (!hasReadPermission) {
					return (
						<Alert severity="error" sx={{ margin: 2 }}>
							You don't have permission to view questions data
						</Alert>
					);
				}

				return (
					<>
						{questions && questions?.length > 0 && eventtype !== "VQ" && eventtype !== "SQE" && (
							<Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
								<div className="eq-view-tabs">
									<button
										className={`eq-view-tab${viewMode === 'question-wise' ? ' eq-view-tab--active' : ''}`}
										onClick={() => handleViewModeChange('question-wise')}
									>
										Question Wise
									</button>
									<button
										className={`eq-view-tab${viewMode === 'category-wise' ? ' eq-view-tab--active' : ''}`}
										onClick={() => handleViewModeChange('category-wise')}
									>
										Category Wise
									</button>
									{questionresponses && questionresponses.length > 0 && (
										<button
											className={`eq-view-tab${viewMode === 'cross-supplier-benchmarking' ? ' eq-view-tab--active' : ''}`}
											onClick={() => handleViewModeChange('cross-supplier-benchmarking')}
										>
											Cross-Supplier
										</button>
									)}
								</div>
							</Box>
						)}

						{(() => {
							const useCategoryWise = viewMode === 'category-wise' || currentStage === 'Qualified' || eventtype === "VQ";
							console.log("🎯 View selection logic:", {
								viewMode,
								currentStage,
								eventtype,
								useCategoryWise,
								reason: eventtype === "VQ" ? "VQ event" : currentStage === 'Qualified' ? "Qualified stage" : viewMode === 'category-wise' ? "Category-wise mode" : "Other"
							});

							return useCategoryWise;
						})() ? (
							(() => {
								console.log("✅ RENDERING CategoryWiseTable with:", {
									questionsCount: cachedCategoryQuestions?.length,
									groupedQuestionsKeys: Object.keys(groupedQuestions || {}),
									eventtype,
									currentStage,
									viewMode,
									hasEditPermission,
									SupplierQuestionResponsesLength: SupplierQuestionResponses?.length
								});
								console.log("✅ CategoryWiseTable questions sample:", cachedCategoryQuestions?.slice(0, 2));
								return (
									<CategoryWiseTable
										questions={cachedCategoryQuestions}
										groupedQuestions={groupedQuestions}
										onClickDownload={onClickDownload}
										callbackDeleteQuesFromList={callbackDeleteQuesFromList}
										getFileName={getFileName}
										action={action}
										permissionManager={permissionManager}
										CLAIM_TYPES={CLAIM_TYPES}
										ACTIONS={ACTIONS}
										eventtype={eventtype}
										currentStage={currentStage}
										isApprovalMode={actionType === "approval"}
										handleScoreChange={handleScoreChange}
										hasEditPermission={hasEditPermission}
										vendorId={vendorId}
										pageSlug={pageSlug}
										scoreUpdate={scoreUpdate}
										setScoreUpdate={setScoreUpdate}
										handleScoreUpdate={handleScoreUpdate}
										SupplierQuestionResponses={SupplierQuestionResponses}
										setSupplierQuestionResponses={setSupplierQuestionResponses}
										questionresponses={questionresponses}
										hasModifiedScores={hasModifiedScores}
										setHasModifiedScores={setHasModifiedScores}
										userInputScores={userInputScores}
										setUserInputScores={setUserInputScores}
										isUpdating={isUpdating}
										setIsUpdating={setIsUpdating}
									/>
								);
							})()
						)
							: viewMode === 'question-wise' ? (
								<div className="mt-2 item-Table eq-question-list">
									<Box >
										{questions && questions.length > 0 ? (
											questions.map((item, index) => (
												<Card key={index} className="eq-question-card">
													<Box className="eq-question-card-body">
														<Box className="eq-question-card-content">
															<Typography variant="body1" className="eq-question-title">
																Q{index + 1}: {item.questionDescription}
															</Typography>
															<Box className="eq-question-meta">
																{item.questionRequirement && <>
																	<Typography variant="body2">
																		<strong>Requirement:</strong> {item.questionRequirement}
																	</Typography>
																	<span className="eq-meta-divider">|</span>
																</>}
																<Typography variant="body2">
																	<strong>Attachment:</strong> {item.attachement ? 'Yes' : 'No'}
																</Typography>
																<span className="eq-meta-divider">|</span>
																<Typography variant="body2">
																	<strong>Mandatory:</strong> {item.mandatory ? 'Yes' : 'No'}
																</Typography>
																{item.weightage != "0" && <>
																	<span className="eq-meta-divider">|</span>
																	<Typography variant="body2">
																		<strong>Weightage:</strong> {item.weightage}
																	</Typography>
																</>}
																{item.questionCategory && <>
																	<span className="eq-meta-divider">|</span>
																	<Typography variant="body2">
																		<strong>Category:</strong> {item.questionCategory}
																	</Typography>
																</>}
																{item.questionSubCategory && <>
																	<span className="eq-meta-divider">|</span>
																	<Typography variant="body2">
																		<strong>Sub-Category:</strong> {item.questionSubCategory}
																	</Typography>
																</>}
															</Box>
														</Box>
														<Box className="eq-question-actions">
															{item.attachedFileName && (
																<Tooltip title={getFileName(item.attachedFileName)} arrow>
																	<button type="button" className="pe-icon-btn pe-icon-btn--download" onClick={() => onClickDownload(item)} aria-label="Download attachment">
																		<HiDownload size={14} />
																	</button>
																</Tooltip>
															)}
															{action && (permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.REMOVE) ?? false) && (
																<button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => callbackDeleteQuesFromList(item?.questionCategory, item?.questionSubCategory, item.questionDescription)} aria-label="Delete question">
																	<RiDeleteBin6Line />
																</button>
															)}
														</Box>
													</Box>


													{item?.questionOption && item?.questionOption.length > 0 && (
														<Box className="eq-question-options-wrap">
															<TableContainer component={Paper} className="eq-question-options-table-container">
																<Table size="small" className="eq-question-options-table">
																	<TableHead>
																		<TableRow>
																			<TableCell align="left" sx={{ width: '30%' }}><strong>Options</strong></TableCell>
																			<TableCell align="left" sx={{ width: '70%' }}><strong>Score</strong></TableCell>
																		</TableRow>
																	</TableHead>
																	<TableBody>
																		{item?.questionOption.map((option, i) => (
																			<TableRow key={i}>
																				<TableCell align="left" sx={{ width: '30%' }}>
																					{i + 1}{". "}{option?.questionOption}
																				</TableCell>
																				<TableCell align="left" sx={{ width: '70%' }}>
																					{option?.weightage !== 0 ? option?.weightage : ""}
																				</TableCell>
																			</TableRow>
																		))}
																	</TableBody>
																</Table>
															</TableContainer>
														</Box>
													)}

													{SupplierQuestionResponses && SupplierQuestionResponses.length > 0 && (
														<Box sx={{ marginTop: 1 }}>

															<TableContainer component={Paper} sx={{ overflowY: 'hidden' }}>
																<Table size="small" sx={{ minWidth: 650, tableLayout: 'fixed', backgroundColor: '#f9f9f9' }}>
																	<TableHead>
																		<TableRow>
																			<TableCell align="left" sx={{ width: '30%', backgroundColor: '#f1f1f1' }}><strong>Supplier Name</strong></TableCell>
																			<TableCell align="left" sx={{ width: '10%', backgroundColor: '#f1f1f1' }}><strong>Score</strong></TableCell>
																			<TableCell align="left" sx={{ width: '60%', backgroundColor: '#f1f1f1' }}><strong>Answer</strong></TableCell>
																		</TableRow>
																	</TableHead>
																	<TableBody>
																		{SupplierQuestionResponses.map((response, index) => {

																			let answer;
																			if (eventtype === "VQ") {
																				// 🔧 CRITICAL FIX: Match by questionId instead of id for VQ
																				console.log("🔍 Looking for answer:", {
																					searchingForQuestionId: item.questionId || item.id,
																					responseStructure: response.sqeHeaderDetails?.length ? 'has sqeHeaderDetails' : 'no sqeHeaderDetails',
																					availableQuestions: response.sqeHeaderDetails?.map(q => ({
																						id: q.id,
																						questionId: q.questionId,
																						score: q.score
																					}))
																				});

																				// Try multiple matching strategies for VQ
																				answer = response.sqeHeaderDetails?.find(ans =>
																					String(ans.questionId) === String(item.questionId) ||
																					String(ans.questionId) === String(item.id) ||
																					String(ans.id) === String(item.id)
																				);

																				console.log("🎯 Found answer:", answer ? {
																					id: answer.id,
																					questionId: answer.questionId,
																					score: answer.score
																				} : 'Not found');
																			} else {
																				answer = response.vendorQuestionAns?.find(ans => ans.questionId == item.id);
																			}

																			const uniquesupplierrfqid = response.id;
																			let questionOption;
																			if (eventtype === "VQ") {
																				questionOption = answer?.questionOption?.filter(x => x.selectYN === "Y");
																			} else {
																				questionOption = answer?.vendorQuestOptions?.filter(x => x.SelectYN === "Y");
																			}

																			const ansAttachements = answer?.ansAttachements;
																			const uniqueid = answer?.id;
																			const questionId = answer?.questionId;

																			// 🔧 CRITICAL FIX: Get score from current state instead of original answer
																			let currentScore = answer?.score || 0;

																			// For VQ events, find the updated score from SupplierQuestionResponses state
																			if (eventtype === "VQ" && answer) {
																				// Look for updated score in the current state
																				const updatedResponse = SupplierQuestionResponses.find(r => r.id === response.id);
																				if (updatedResponse?.sqeHeaderDetails) {
																					const updatedAnswer = updatedResponse.sqeHeaderDetails.find(ans =>
																						String(ans.id) === String(answer.id) ||
																						(String(ans.questionId) === String(answer.questionId) && String(ans.vendorId) === String(answer.vendorId))
																					);
																					if (updatedAnswer) {
																						currentScore = updatedAnswer.score !== undefined ? updatedAnswer.score : currentScore;
																						console.log("🔄 Using updated score from state:", {
																							originalScore: answer?.score,
																							updatedScore: currentScore,
																							answerId: answer.id,
																							questionId: answer.questionId
																						});
																					}
																				}
																			}

																			return (
																				<TableRow key={index}>
																					{/* Supplier Name */}
																					<TableCell align="left" sx={{ width: '30%' }}>
																						{response.tradeName ?? suppliercompanyName}
																					</TableCell>

																					{/* Score */}
																					<TableCell align="left" sx={{ width: '10%' }}>
																						{/* {eventSealed !== 'N' ? ( */}
																						<TextField
																							className="w-20 f10"
																							size="small"
																							value={currentScore}
																							onChange={(e) => {
																								const newScore = e.target.value;

																								// 🔧 CRITICAL FIX: Use actual answer data for proper state update
																								console.log("🎯 Score input changed:", {
																									newScore,
																									item: { id: item.id, questionId: item.questionId, description: item.questionDescription },
																									answer: answer ? { id: answer.id, questionId: answer.questionId, score: answer.score } : 'No answer found',
																									vendor: { id: response.id, name: response.tradeName }
																								});

																								// Only proceed if we found a valid answer
																								if (!answer) {
																									console.error("❌ No answer found for this question - cannot update score");
																									return;
																								}

																								// 🔧 FIX: Use actual answer IDs from the found answer
																								const actualRecordId = answer.id;  // The actual record ID from sqeHeaderDetails
																								const actualQuestionId = answer.questionId;  // The actual questionId from sqeHeaderDetails
																								const vendorId = response.id;  // The vendor/supplier ID

																								console.log("🔧 Calling handleScoreChange with correct IDs:", {
																									vendorId,
																									actualRecordId,
																									actualQuestionId,
																									newScore
																								});

																								// 🔧 FIX: Allow empty input and valid numbers, don't default to 0
																								if (newScore === "") {
																									// Allow empty input (user is clearing the field)
																									console.log("✅ Setting empty score");
																									handleScoreChange(vendorId, actualRecordId, actualQuestionId, "");
																								} else {
																									// Parse as number and validate
																									const numericScore = Number(newScore);
																									if (!isNaN(numericScore) && numericScore >= 0) {
																										console.log("✅ Valid score, calling handleScoreChange with:", numericScore);
																										handleScoreChange(vendorId, actualRecordId, actualQuestionId, numericScore);
																									} else {
																										console.log("⚠️ Invalid score input, ignoring:", newScore);
																										// Don't call handleScoreChange for invalid input
																									}
																								}
																							}}
																							InputLabelProps={{ shrink: true }}
																							variant="standard"
																							disabled={currentStage == "Awarded" || (hasEditPermission ? (questionOption && questionOption.length > 0) : true)
																							}
																						/>
																						{/* ) : (
                                                                            <EventQuoteSealed />
                                                                        )} */}
																					</TableCell>

																					{/* Answer */}
																					<TableCell align="left" sx={{ width: '60%' }}>
																						{/* {eventSealed !== "N" ? ( */}
																						<>
																							{answer ? answer.answer : "No response provided"}

																							{questionOption && questionOption.length > 0 && (
																								<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
																									{questionOption.map((option, i) => (
																										<Typography key={i} variant="body2" sx={{ p: 0.5, borderRadius: 1 }}>
																											{option?.questionoption || option?.questionOption}
																										</Typography>
																									))}
																								</Box>
																							)}

																							{ansAttachements && (
																								<Box sx={{ marginTop: 1 }}>
																									<Tooltip
																										title={getFileName(ansAttachements)}
																										arrow
																										componentsProps={{
																											tooltip: {
																												sx: {
																													fontSize: '14px',
																													maxWidth: 'none'
																												}
																											}
																										}}
																									>
																										<IconButton
																											color="primary"
																											size="medium"
																											onClick={() => downloadFilesOnAzure(ansAttachements, getFileName(ansAttachements), atoken)}
																											sx={{ fontSize: '20px' }}
																										>
																											<HiDownload />
																										</IconButton>
																									</Tooltip>
																								</Box>
																							)}
																						</>
																						{/* ) : (
                                                                            <EventQuoteSealed />
                                                                        )} */}
																					</TableCell>
																				</TableRow>
																			);
																		})}
																	</TableBody>
																</Table>
															</TableContainer>

														</Box>
													)}


												</Card>
											))
										) : (
											<Typography variant="h6" color="textSecondary" align="center">No questions selected</Typography>
										)}
									</Box>
								</div>

							) :
								(
									questions && questions.length > 0 ?
										// Always show CategoryWiseTable for all cases including Qualified stage
										<CategoryWiseTable
											questions={questions}
											groupedQuestions={groupedQuestions}
											onClickDownload={onClickDownload}
											callbackDeleteQuesFromList={callbackDeleteQuesFromList}
											getFileName={getFileName}
											action={action}
											permissionManager={permissionManager}
											CLAIM_TYPES={CLAIM_TYPES}
											ACTIONS={ACTIONS}
											eventtype={eventtype}
											currentStage={currentStage}
											isApprovalMode={actionType === "approval"}
											handleScoreChange={handleScoreChange}
											hasEditPermission={hasEditPermission}
											vendorId={vendorId}
											pageSlug={pageSlug}
											scoreUpdate={scoreUpdate}
											setScoreUpdate={setScoreUpdate}
											handleScoreUpdate={handleScoreUpdate}
											SupplierQuestionResponses={SupplierQuestionResponses}
											setSupplierQuestionResponses={setSupplierQuestionResponses}
											questionresponses={questionresponses}
											hasModifiedScores={hasModifiedScores}
											setHasModifiedScores={setHasModifiedScores}
											userInputScores={userInputScores}
											setUserInputScores={setUserInputScores}
											isUpdating={isUpdating}
											setIsUpdating={setIsUpdating}
										/>
										: (
											<Typography variant="h6" color="textSecondary" align="center">No Questions Selected</Typography>
										)
								)}
						<React.Fragment key="key4">
							<Drawer anchor="right" open={state["openInvoiceApproved"]}>
								<form onSubmit={formik_ApproveReject.handleSubmit} autoComplete="off">
									<Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
										<div className="flex flex-col">
											<Box className="bgheaderCards">
												<div className="d-flex align-items-center justify-content-between pt-2 pb-2 mt-0">
													<div className="ms-3 text-white">Approval Action</div>
													<div>
														<IconButton
															onClick={toggleDrawer("openInvoiceApproved", false, [])}
															size="small"
															edge="start"
															sx={{ mr: 1 }}
														>
															<HiOutlineX className="f20 text-white" />
														</IconButton>
													</div>
												</div>
											</Box>
											<div className="h50px"></div>
											<div className="p-3">
												<div className="row ">
													<div className="col-12 col-md-12 col-lg-12">
														<div className="mb-4 textblue f14"></div>
														<div className="row">
															<div className="col-12 col-md-4 col-lg-12 mb-4">
																<TextField
																	id="isApproved"
																	InputLabelProps={{
																		shrink: true,
																	}}
																	name="isApproved"
																	select
																	className="mb-2"
																	fullWidth
																	size="small"
																	label="Status"
																	variant="outlined"
																	value={formik_ApproveReject.values?.status}
																	onChange={(e) => {

																		formik_ApproveReject.setFieldValue(
																			"status",
																			e.target.value
																		)
																	}

																	}

																	error={
																		formik_ApproveReject.touched.status &&
																		Boolean(formik_ApproveReject.errors.status)
																	}
																	helperText={
																		formik_ApproveReject.touched.status &&
																		formik_ApproveReject.errors.status
																	}
																>
																	{actionType != "Forward" && menuactionlist.filter(x => x.value != "Forward").map((x) => {

																		return (<MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)

																	})

																	}
																	{actionType == "Forward" && menuactionlist.filter(x => x.value == "Forward").map((x) => {

																		return (<MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)

																	})

																	}

																</TextField>
															</div>
															{/* <div>
                                                        <h5>Supplier :</h5>
                                                        {matchedSuppliers.map((supplier) => (
                                                            <div key={supplier.id}>
                                                            <label>
                                                                <input
                                                                type="checkbox"
                                                                checked={matchedSuppliers.includes(supplier.id)}
                                                                onChange={() => handleCheckboxChange(supplier.id)}
                                                                />
                                                                {supplier.tradeName}
                                                            </label>
                                                            </div>
                                                        ))}
                                                    </div> */}
															<div className="col-12 col-md-4 col-lg-12 mb-4">
																<TextField
																	id="approveComment"
																	InputLabelProps={{
																		shrink: true,
																	}}
																	multiline
																	rows={3}
																	name="approveComment"
																	className="w-100 f14"
																	size="small"
																	label="Comment "
																	variant="outlined"
																	inputProps={{ maxLength: 200 }}
																	value={formik_ApproveReject?.values?.approveComment}
																	onChange={(e) =>
																		formik_ApproveReject.setFieldValue(
																			"approveComment",
																			e.target.value
																		)
																	}
																	InputProps={{
																		endAdornment: formik_ApproveReject?.values?.approveComment && (
																			<InputAdornment position="end">
																				<Typography variant="body2" color="textSecondary">
																					{formik_ApproveReject?.values?.approveComment?.length}/200
																				</Typography>
																			</InputAdornment>
																		),
																	}}
																/>

															</div>

														</div>

													</div>
												</div>
												<div className="row">
													<div className="col-12 text-end">
														<LoadingButton
															loading={loading}
															color="primary"
															size="medium"
															className="text-white text-capitalize mb-3 mr-3"
															variant="contained"
															type="submit"
														>
															<span>Submit</span>
														</LoadingButton>

													</div>
												</div>
											</div>
										</div>
									</Box>
								</form>
							</Drawer>
						</React.Fragment>
						<SupplierIndividualReport
							open={supplierModalOpen}
							onClose={() => setSupplierModalOpen(false)}
							vendorId={selectedVendorId}
							permissionManager={permissionManager}
						/>
					</>

				);
			})()}
		</Box>
	);
};

export default EventQuestionScreenList;
