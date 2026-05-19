import { Accordion, AccordionDetails, AccordionSummary, Button, IconButton, Typography, Card, Divider, Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, FormGroup, FormControlLabel, Menu, MenuItem, Button as MuiButton, Tooltip, TextField } from '@mui/material';
import { HiDownload, HiX } from "react-icons/hi";
import { ExpandMore } from '@mui/icons-material';
import React, { useCallback, useEffect, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender
} from '@tanstack/react-table';
import { downloadFilesOnAzure, getFileName, PercentageRegex } from '../../utils/common';
import { DataGrid } from '@mui/x-data-grid';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { CardBody, Card as CardS } from 'reactstrap';
import WhiteTooltip from '../whitetooltip';
import TextFieldCell from '../../pages/BaseCells/TextFieldCell';
import { useStateValue } from '../../store';


const EventRFIQuestionList = ({ questions, callbackDeleteQuesFromList, callbackEditQuesFromList, questionresponses, action }) => {
    const [{ atoken, rtoken, customerid, usertimezone,customersuffix, userdialingcode, roleClaims, userDetail }, dispatch] = useStateValue();
    const [viewMode, setViewMode] = useState(null); // 'cross-supplier-benchmarking', 'category-wise', 'question-wise'
    const [showAdditionalFields, setShowAdditionalFields] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    
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

    const getSupplierAnswer = (questionId) => {
        if (!questionresponses || questionresponses.length === 0) {
            return "No response provided";
        }
        const response = questionresponses?.find(res => res.vendorQuestionAns?.some(ans => ans.questionId === questionId));
        if (response) {
            const answer = response.vendorQuestionAns.find(ans => ans.questionId === questionId);
            return answer && answer.answer ? answer.answer : "No response provided";
        }
        return "No response provided";
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

   

    useEffect(() => {

        if (questions && questions.length > 0 && !scoreUpdate) {

            // Merging questions with responses per supplier
            const merged = questions.map(question => {

                const responsesForQuestion = questionresponses.reduce((acc, response) => {
                    const answer = response.vendorQuestionAns?.find(ans => ans.questionId === question.id);
                    acc[response.tradeName] = answer;

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
            });

            // Set merged data in state
            setMergedData(merged);

            // Define columns dynamically based on suppliers' trade names
            const questionColumns = [
                {
                    accessorKey: 'questionDescription', header: 'Question', enableColumnOrdering: false,
                    minWidth: 30,
                    muiTableBodyCellProps: {
                        align: 'left',
                    },
                    muiTableBodyRowProps: {

                        verticalAlign: 'top'

                    },


                    Cell: ({ cell, table }) => {

                        const item = cell.row.original;
                        const index = cell.row.index + 1;
                        return (
                            <>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Q{index}: {item.questionDescription}</Typography>
                                    {action && <IconButton onClick={() => callbackDeleteQuesFromList(item?.questionCategory, item?.questionSubCategory, item.questionDescription)} color="error">
                                        <HiX />
                                    </IconButton>}

                                </Box>

                                {/* <div className="f10"> <strong>Requirement:</strong> {item.questionRequirement}</div>
                            <div className="f10">  <strong>Attachment:</strong> {item.attachement ? 'Yes' : 'No'}</div>
                            <div className="f10">  <strong>Mandatory:</strong> {item.mandatory ? 'Yes' : 'No'}</div>
                            {item.questionCategory && <div className="f10">
                                      <strong>Category:</strong> {item.questionCategory}
                                  </div>}
                           {item.questionSubCategory  && <div className="f10">
                                      <strong>Sub-Category:</strong> {item.questionSubCategory}
                                  </div>}       */}



                                {item.attachedFileName && (
                                    <Box sx={{ marginBottom: 1 }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            onClick={() => onClickDownload(item)}
                                            startIcon={<HiDownload />}
                                        >
                                            {getFileName(item.attachedFileName)}
                                        </Button>
                                    </Box>
                                )}
                            </>






                        )

                    }
                },
            ];

            const supplierNames = Array.from(new Set(questionresponses.flatMap(response => response.tradeName)));
            const responseColumns = supplierNames.map(tradeName => ({
                accessorKey: `responses.${tradeName}`,
                header: tradeName,
                minWidth: 30,
                enableColumnOrdering: true,
                enableSorting: false,
                Header: ({ column }) => {

                    const obj = questionresponses?.find(x => x.tradeName == column?.columnDef?.header);
                    const qTotalScore = obj?.qTotalScore ?? 0;

                    return (
                        <>
                            <div><b style={{ color: '#2A68D3', textDecoration: "underline" }}>{column.columnDef.header}</b></div>
                            {qTotalScore != 0 && <div>  <b>Total Score : {qTotalScore}</b> </div>}

                        </>









                    )
                },

                muiTableBodyCellProps: {
                    align: 'left',


                },
                muiTableBodyRowProps: {

                    verticalAlign: 'top'

                },
                Cell: ({ cell, table }) => {
                     
                    const response = cell.row._valuesCache[`responses.${tradeName}`];
                    const answer = response?.answer;
                    const score = response?.score;
                    const ansAttachements = response?.ansAttachements;
                    const questionOption = response?.vendorQuestOptions?.filter(x=>x.SelectYN=="Y");

                    return answer?.length > 500 ? (
                        <>
                            <div className=" pointer" variant="body1">
                                <WhiteTooltip title={`${answer}`} arrow>
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                            <TableCell variant="body1"> {answer.slice(0, 501) + '...'}{' '}</TableCell>


                                                        </TableRow>
                                   
                                </WhiteTooltip>
                            </div>
                            {questionOption && questionOption?.length > 0 && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <TableContainer  >
                                    <Table size="small" >
                                   
                                        <TableBody>
                                            {questionOption && questionOption.length > 0 ? (

                                                questionOption?.map((option, i) => (
                                                    <>

                                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                            <TableCell variant="body1">{option?.questionoption}</TableCell>


                                                        </TableRow>


                                                    </>

                                                ))
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
                                                                        onClick={() => downloadFilesOnAzure(ansAttachements,getFileName(ansAttachements),atoken)}
                                                                        startIcon={<HiDownload />}
                                                                    >
                                                                        {getFileName(ansAttachements)}
                                                                    </Button>
                                                                </Box>
                                                            )}
                        </>
                    ) : (
                        <>
                           {answer && <div className=" pointer" variant="body1">
                                <WhiteTooltip title={`${answer}`} arrow>
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                            <TableCell variant="body1"> {answer}</TableCell>


                                                        </TableRow>
                                </WhiteTooltip>
                            </div>}
                            {questionOption && questionOption?.length > 0 && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <TableContainer  >
                                    <Table  >
                                        
                                        <TableBody>
                                            {questionOption && questionOption.length > 0 ? (

                                                questionOption?.map((option, i) => (
                                                    <>

                                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                            <TableCell variant="body1">{option?.questionoption}</TableCell>


                                                        </TableRow>


                                                    </>

                                                ))
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
                                                                        onClick={() => downloadFilesOnAzure(ansAttachements,getFileName(ansAttachements),atoken)}
                                                                        startIcon={<HiDownload />}
                                                                    >
                                                                        {getFileName(ansAttachements)}
                                                                    </Button>
                                                                </Box>
                                                            )}

                        </>
                    );
                }
            }));

            setColumns([...questionColumns, ...responseColumns]);
        }
    }, [questions, questionresponses, scoreUpdate]);

    useEffect(() => {
        if (questionresponses) {
            const updatevalue = questionresponses.map(x => x.tradeName)
            setSupplierList(updatevalue)
        }
    }, [questionresponses])

    useEffect(() => {
        
        if (questionresponses && questionresponses.length > 0) {
            setViewMode('cross-supplier-benchmarking')
        }
        else{
            setViewMode('question-wise')
        }
    }, [questionresponses])






    const table = useMaterialReactTable({
        columns,
        data: mergedData,
        enableColumnOrdering: true,
        enableColumnPinning: true,
        enablePagination: true,
        enableSorting: true,
        enableColumnResizing: true,
        enableStickyHeader: true,
        enableTopToolbar: false,
        initialState: {
            pagination: { pageSize: 50 },
            columnPinning: { left: ['questionDescription'] },
        },
        
        layoutMode: "semantic"

    });

    const handleScoreChange = (questionId, tradeName, newScore) => {
        setScoreUpdate(true)
        setMergedData((prevMergedData) =>
            prevMergedData.map((question) => {
                if (question.id === questionId) {
                    return {
                        ...question,
                        responses: {
                            ...question.responses,
                            [tradeName]: {
                                ...question.responses[tradeName],
                                score: newScore,
                            },
                        },
                    };
                }
                return question;
            })
        );

    };


    const handleScoreUpdate = useCallback(async () => {

        const supplier = supplierlist[0]
        const updatedvalue = mergedData.map(x => x.responses[supplier])
        await callbackEditQuesFromList(updatedvalue)
        setScoreUpdate(false)
    }, [mergedData])



    return (
        <Box sx={{ paddingBottom: 2, paddingLeft: 2, paddingRight: 2 }}>
            {questions && questions?.length > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '100dvw' }}>
                {/* <Typography variant="body1">View Mode</Typography> */}
                <MuiButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                >
                    {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
                </MuiButton>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    {questionresponses && questionresponses.length > 0 && <MenuItem className='text-capitalize' onClick={() => handleViewModeChange('cross-supplier-benchmarking')}>Cross-Supplier Benchmarking</MenuItem>}
                    <MenuItem className='text-capitalize' onClick={() => handleViewModeChange('category-wise')}>Category Wise </MenuItem>
                    <MenuItem className='text-capitalize' onClick={() => handleViewModeChange('question-wise')}>Question Wise</MenuItem>
                </Menu>
                <div>
                    {scoreUpdate && <Button className='f10' variant='text' color="btn" size='small' onClick={() => {
                        setScoreUpdate(false)
                    }}>
                        Reset Score
                    </Button>}
                    {scoreUpdate && <Button className='f10' variant='outlined' size='small' type='submit' onClick={handleScoreUpdate}
                        disabled={!scoreUpdate}
                    >
                        Update Score
                    </Button>}
                </div>

            </Box>}

            {viewMode === 'category-wise' ? (
                <Box>
                    {questions && Object.keys(groupedQuestions).length > 0 ? (
                        Object.keys(groupedQuestions).map((category, index) => (
                            <Accordion key={index} sx={{ marginBottom: 1 }} defaultExpanded>
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    aria-controls={`panel-${category}-content`}
                                    id={`panel-${category}-header`}
                                    sx={{ backgroundColor: '#fff', minHeight: '2rem', height: '2rem' }}
                                >
                                    <Typography className='f14 mb-1' color="primary">{category || "Others"}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        {Object.keys(groupedQuestions[category]).map((subcategory, subIndex) => (
                                            <Accordion key={subIndex} sx={{ marginBottom: 1 }} defaultExpanded>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMore />}
                                                    aria-controls={`panel-${subcategory}-content`}
                                                    id={`panel-${subcategory}-header`}
                                                    sx={{ backgroundColor: '#fff', minHeight: '2rem', height: '2rem' }}
                                                >
                                                    <Typography className='f12' color="textSecondary">{subcategory || "Others"}</Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    {groupedQuestions[category][subcategory].map((item, i) => (
                                                        <Card key={i} sx={{ marginBottom: 0.5, padding: 1 }}>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Q{i + 1}: {item.questionDescription}</Typography>
                                                                {action && <IconButton onClick={() => callbackDeleteQuesFromList(category, subcategory, item.questionDescription)} color="error">
                                                                    <HiX />
                                                                </IconButton>}
                                                            </Box>
                                                            <Divider sx={{ marginY: 0.5 }} />
                                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    <strong>Requirement:</strong> {item.questionRequirement}
                                                                </Typography>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    <strong>Attachment:</strong> {item.attachement ? 'Yes' : 'No'}
                                                                </Typography>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    <strong>Mandatory:</strong> {item.mandatory ? 'Yes' : 'No'}
                                                                </Typography>
                                                                {item.weightage != "0" && <Typography variant="body2" color="textSecondary">
                                                                    <strong>Weightage:</strong> {item.weightage}
                                                                </Typography>}
                                                            </Box>
                                                            {item.attachedFileName && (
                                                                <Box sx={{ marginBottom: 1 }}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        size="small"
                                                                        onClick={() => onClickDownload(item)}
                                                                        startIcon={<HiDownload />}
                                                                    >
                                                                        {getFileName(item.attachedFileName)}
                                                                    </Button>
                                                                </Box>
                                                            )}
                                                  {item?.questionOption && item?.questionOption.length > 0 && (
  <Box sx={{ marginTop: 1 }}>
    <TableContainer component={Paper}>
      <Table size="small" sx={{ minWidth: 650, tableLayout: 'fixed' }}> 
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


{questionresponses && questionresponses.length > 0 && (
  <Box sx={{ marginTop: 1 }}>
   
    <TableContainer component={Paper}>
      <Table size="small" sx={{ minWidth: 650, tableLayout: 'fixed', backgroundColor: '#f9f9f9' }}> {/* Light grey background for the table */}
        <TableHead>
          <TableRow>
            <TableCell align="left" sx={{ width: '30%', backgroundColor: '#f1f1f1' }}><strong>Supplier Name</strong></TableCell>
            <TableCell align="left" sx={{ width: '70%', backgroundColor: '#f1f1f1' }}><strong>Answer</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questionresponses.map((response, index) => {
            const answer = response.vendorQuestionAns?.find(ans => ans.questionId === item.id);
            const questionOption = answer?.vendorQuestOptions?.filter(x=>x.SelectYN=="Y");
           const  ansAttachements=answer?.ansAttachements;
            return (
              <TableRow key={index} sx={{ backgroundColor: '#f9f9f9'  }}> {/* Alternate row background color */}
                <TableCell align="left" sx={{ width: '30%' }}>{response.tradeName}</TableCell>
                <TableCell align="left" sx={{ width: '70%' }}>
                  {answer ? answer.answer : "No response provided"}
                  {questionOption && questionOption?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <TableContainer>
                        <Table size="small" sx={{ minWidth: 650, tableLayout: 'fixed', backgroundColor: '#f9f9f9' }}>
                          <TableBody>
                            {questionOption.length > 0 && questionOption.map((option, i) => (
                              <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, backgroundColor: '#f9f9f9' }}>
                                <TableCell variant="body1" sx={{ width: '100%' }}>
                                  {option?.questionoption}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                   
                   {ansAttachements && (
                                                                <Box sx={{ marginBottom: 1 }}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        size="small"
                                                                        onClick={() => downloadFilesOnAzure(ansAttachements,getFileName(ansAttachements),atoken)}
                                                                        startIcon={<HiDownload />}
                                                                    >
                                                                        {getFileName(ansAttachements)}
                                                                    </Button>
                                                                </Box>
                                                            )}
                  
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
                                                    ))}
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Typography variant="h6" color="textSecondary" align="center">No questions selected</Typography>
                    )}
                </Box>
            ) : viewMode === 'question-wise' ? (
                <Box >
                    {questions && questions.length > 0 ? (
                        questions.map((item, index) => (
                            <Card key={index} sx={{ marginBottom: 1, padding: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Q{index + 1}: {item.questionDescription}</Typography>
                                    {action && <IconButton onClick={() => callbackDeleteQuesFromList(item?.questionCategory, item?.questionSubCategory, item.questionDescription)} color="error">
                                        <HiX />
                                    </IconButton>}

                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {item.questionRequirement && <Typography variant="body2" color="textSecondary">
                                        <strong>Requirement:</strong> {item.questionRequirement}
                                    </Typography>}
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Attachment:</strong> {item.attachement ? 'Yes' : 'No'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Mandatory:</strong> {item.mandatory ? 'Yes' : 'No'}
                                    </Typography>
                                    {item.weightage != "0" && <Typography variant="body2" color="textSecondary">
                                        <strong>Weightage:</strong> {item.weightage}
                                    </Typography>}
                                    {item.questionCategory && <Typography variant="body2" color="textSecondary">
                                        <strong>Category:</strong> {item.questionCategory}
                                    </Typography>}
                                    {item.questionSubCategory && <Typography variant="body2" color="textSecondary">
                                        <strong>Sub-Category:</strong> {item.questionSubCategory}
                                    </Typography>}
                                </Box>
                                {item.attachedFileName && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        onClick={() => onClickDownload(item)}
                                        startIcon={<HiDownload />}
                                    >
                                        {getFileName(item.attachedFileName)}
                                    </Button>
                                )}

{item?.questionOption && item?.questionOption.length > 0 && (
  <Box sx={{ marginTop: 1 }}>
    <TableContainer component={Paper}>
      <Table size="small" sx={{ minWidth: 650, tableLayout: 'fixed' }}> 
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
                              
                              {questionresponses && questionresponses.length > 0 && (
  <Box sx={{ marginTop: 1 }}>
    
    <TableContainer component={Paper}>
      <Table size="small" sx={{ minWidth: 650, tableLayout: 'fixed', backgroundColor: '#f9f9f9' }}> {/* Light grey background for the table */}
        <TableHead>
          <TableRow>
            <TableCell align="left" sx={{ width: '30%', backgroundColor: '#f1f1f1' }}><strong>Supplier Name</strong></TableCell>
            <TableCell align="left" sx={{ width: '70%', backgroundColor: '#f1f1f1' }}><strong>Answer</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questionresponses.map((response, index) => {
            const answer = response.vendorQuestionAns?.find(ans => ans.questionId === item.id);
            const questionOption = answer?.vendorQuestOptions?.filter(x=>x.SelectYN=="Y");
           const  ansAttachements= answer?.ansAttachements;
            return (
              <TableRow key={index} sx={{ backgroundColor:  '#f9f9f9'  }}> {/* Alternate row background color */}
                <TableCell align="left" sx={{ width: '30%' }}>{response.tradeName}</TableCell>
                <TableCell align="left" sx={{ width: '70%' }}>
                  {answer ? answer.answer : "No response provided"}
                  {questionOption && questionOption?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <TableContainer>
                        <Table size="small" sx={{ minWidth: 650, tableLayout: 'fixed', backgroundColor: '#f9f9f9' }}>
                          <TableBody>
                            {questionOption.length > 0 && questionOption.map((option, i) => (
                              <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, backgroundColor: '#f9f9f9' }}>
                                <TableCell variant="body1" sx={{ width: '100%' }}>
                                  {option?.questionoption}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                  {ansAttachements && (
                                                                <Box sx={{ marginBottom: 1 }}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        size="small"
                                                                        onClick={() => downloadFilesOnAzure(ansAttachements,getFileName(ansAttachements),atoken)}
                                                                        startIcon={<HiDownload />}
                                                                    >
                                                                        {getFileName(ansAttachements)}
                                                                    </Button>
                                                                </Box>
                                                            )}
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
            ) : (

                questions && questionresponses && questions.length > 0 ?
                    (


                        // <Box sx={{  maxWidth: '100dvw', maxHeight: '100dvh'}}>
                        <div className="d-flex ms-2 scrollable-container">
                        <MaterialReactTable
                            table={table}
                        />
                        </div>
                        // </Box>





                    ) : (
                        <Typography variant="h6" color="textSecondary" align="center">No questions selected</Typography>
                    )

            )}
        </Box>
    );
};

export default EventRFIQuestionList;