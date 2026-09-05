import { IconButton } from '@mui/material';
import * as React from 'react';
import CommonTooltip from '../../../components/commonTooltip';
import { HiX } from "react-icons/hi";

const QurstionItemCell = ({ selectedQuesionArray, callbackDeleteQuesFromList, action }) => {

	return (
		<div className=''>
			<div className='row'>
				<div className='col-12 mb-3 '>
					<div className='align-items-center p-2 MuiDataGrid-columnHeaders d-none d-md-block mt-3' >

						<div className='row f14 '>
							<div className='col-lg-11 col-md-10'>
								Question Details
							</div>
							{action && <div className='col-lg-1 col-md-2'>
								Action
							</div>}
						</div>
					</div>

					<div className='zebracolor'>
						{selectedQuesionArray && selectedQuesionArray.length > 0 ? (
							selectedQuesionArray.map((item, index) => (
								<div className={`${index % 2 === 0 ? "even" : "odd"}`} key={index}>
									<div className='border-bottom p-2 pt-1 pb-1'>
										<div className='row f13'>
											<div className='col-lg-10 col-md-10'>
												<div className='d-flex'>
													<div style={{ width: '30px' }}>
														Q{index + 1}.
													</div>
													<div className='ms-2 flex-grow-1' style={{ minWidth: 0, overflow: 'hidden' }}>
														<CommonTooltip title={item?.questionDescription || ''} placement="bottom">
															<div className='f10pt' style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item?.questionDescription}</div>
														</CommonTooltip>
														<div className='row'>
															<div className='col-12 col-md-6' style={{ minWidth: 0 }}>
																<CommonTooltip title={item?.rfqQuestionRequirement || ''} placement="bottom">
																	<div className='f9pt text-muted' style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
																		Requirement: {item?.rfqQuestionRequirement ? item?.rfqQuestionRequirement : 'Not Mention'}
																	</div>
																</CommonTooltip>
															</div>
															<div className='col-12 col-md-6'>
																<div className='f9pt text-muted'>
																	Mandatory: {item?.mandatory ? 'Yes' : 'No'}
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
											{action &&
												<div className='col-lg-2 col-md-2 pt-1 text-end'>
													<IconButton size='small' className='bg-white ms-2' onClick={() => callbackDeleteQuesFromList(item, index)} color='error'>
														<HiX className='f17' />
													</IconButton>
												</div>
											}
										</div>
									</div>
								</div>
							))
						) : (
							<div className="text-center mt-3">No questions selected</div>
						)}
					</div>

				</div>
			</div>
		</div>
	)
}

export default QurstionItemCell
