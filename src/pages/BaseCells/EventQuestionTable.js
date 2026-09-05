import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, FormControlLabel, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import * as React from 'react';
import { HiDownload } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { downloadFilesOnAzure, getFileName } from '../../utils/common';
import { MdEdit } from 'react-icons/md';

const EventQuestionTable = ({ action, questions, callbackDeleteQuesFromList, callbackEditQuesFromList }) => {

	const onClickDownload = (question) => {
		if (question.attachedFileName) {
			const fileName = question.attachedFileName;
			downloadFilesOnAzure(fileName, fileName);
		} else {
			console.error("No attached file name found!");
		}
	};
	return (
		<div className=''>
			<div className='row'>
				<div className='col-12 mb-3 '>
					<div className='zebracolor'>

						{questions && questions.length > 0 ? (
							questions?.map((item, index) => {

								return (<div className={`${index % 2 === 0 ? "even" : "odd"}`} key={index}>
									<div className='border-bottom p-2 pt-1 pb-1'>
										<div className='row f13'>
											<div className='col-lg-11 col-md-11'>
												<div className='d-flex'>
													<div style={{ width: '30px' }}>
														Q{index + 1}.
													</div>
													<div className='ms-2 flex-grow-1'>
														<div className='f10pt'>{item?.questionDescription}</div>
														<div className='row mt-2'>
															{item?.questionRequirement && <div className='col-12 col-md-12 text-truncate'>
																<div className='f9pt text-muted text-truncate'>
																	<b>Requirement</b>: {item?.questionRequirement ? item?.questionRequirement : ''}
																</div>
															</div>}
															{/* <div className='col-12 col-md-4'>
                                                                <div className='f9pt text-muted'>
                                                                    <b>Weightage</b>: {item?.weightage}
                                                                </div>
                                                            </div>   */}
															{item?.weightage > 0 && (
																<div className='col-12 col-md-4'>
																	<div className='f9pt text-muted'>
																		<b>Weightage</b>: {item?.weightage}
																	</div>
																</div>
															)}

															<div className='col-12 col-md-4'>
																<div className='f9pt text-muted'>
																	<b> Attachment </b>: {item?.attachement ? 'Yes' : 'No'}
																</div>
															</div>
															<div className='col-12 col-md-4'>
																<div className='f9pt text-muted'>
																	<b>  Mandatory </b>: {item?.mandatory ? 'Yes' : 'No'}
																</div>
															</div>

														</div>
														{item?.attachedFileName && <div className='col-12 col-md-12'>
															<div className='f9pt text-muted'>
																<b>Attachment</b>: {' '}
																<span>
																	<Button
																		variant="text"
																		size="small"
																		className=""
																		onClick={() => onClickDownload(item)}
																	>
																		{getFileName(item?.attachedFileName)}
																	</Button>


																</span>


															</div>
														</div>}

														<TableContainer  >
															<Table sx={{ minWidth: 650 }} responsive>
																{item?.questionOption && item?.questionOption?.length > 0 && <TableHead>
																	<TableRow

																	> <TableCell className='fw600'>Options</TableCell>
																		<TableCell className='fw600' >Score</TableCell></TableRow>
																</TableHead>}
																<TableBody>
																	{item?.questionOption && item.questionOption.length > 0 ? (

																		item?.questionOption?.map((option, i) => (
																			<>

																				<TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
																					<TableCell>{i + 1}{". "}{option?.questionOption}</TableCell>
																					<TableCell  >{option?.weightage}</TableCell>

																				</TableRow>


																			</>

																		))
																	) : (

																		<></>
																	)}</TableBody></Table></TableContainer>
													</div>
												</div>
											</div>
											{action &&
												<div className='col-lg-1 col-md-1 pt-1 text-start'>
													<button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => callbackDeleteQuesFromList(item?.id)}>
														<RiDeleteBin6Line />
													</button>
													{/* { item?.id && !item?.questionId &&<IconButton size='small' className=' quesDelete' onClick={() => callbackEditQuesFromList(item)} color='error'>
                                                        <MdEdit className='f17' />
                                                    </IconButton>} */}
												</div>
											}
										</div>
									</div>
								</div>)

							}

							)
						) : (
							<div className="text-center mt-3">No questions selected</div>
						)}
					</div>


				</div>
			</div>

		</div>
	)
}

export default EventQuestionTable