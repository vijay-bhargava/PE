import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, IconButton } from '@mui/material';
import  React , { useCallback, useEffect, useState } from 'react';
import { HiX } from "react-icons/hi";
import { buildQueryParams } from '../../../utils/common/utility';
import { actionTypes, useStateValue } from '../../../store';
import { ApiClient } from '../../../Apiclient';
import { useLocation } from 'react-router-dom';

const SupplierQuestionVQ = ({ questions, callbackDeleteQuesFromList, action }) => {
    const [
        {
            atoken,
            rtoken,
            customerid,
            customersuffix,
            usertimezone,
            userdialingcode,
            roleClaims,
            userDetail,
        },
        dispatch,
    ] = useStateValue();
    const apiClient = new ApiClient(customersuffix);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
        useEffect(() => {
    
            const data = queryParams.get("CommId")?.trim();
            if (data) {
                dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
            }
        }, [])
        //for updating notification list for global variable
        useEffect(() => {
           
            const pullMessageList =async () => {
                var data = {
                    CustomerId: customerid,
                    EventType: "VQ"
                };
                const queryParams=buildQueryParams(data)
                const res= await apiClient.getres(`api/Communication/Find?${queryParams}`,atoken)
               
                if(res){
                    const data =res?.data ?? []
                   
                    dispatch({ type: actionTypes.SET_Notificationlist, value: data });
                }
       
               
            }
            pullMessageList()
     
        }, []);
    return (
        <div className=''>
            <div className='row'>
                <div className='col-12 mb-3 '>
                    <div className='zebracolor'>

                        {questions && questions.length > 0 ? (
                            questions.map((item, index) => (

                                <div className={`${index % 2 === 0 ? "even" : "odd"}`} key={index}>
                                    <div className='border-bottom p-2 pt-1 pb-1'>
                                        <div className='row f13'>
                                            <div className='col-lg-10 col-md-10'>
                                                <div className='d-flex'>
                                                    <div style={{ width: '30px' }}>
                                                        Q{index + 1}.
                                                    </div>
                                                    <div className='ms-2 flex-grow-1'>
                                                        <div className='f10pt'>{item?.questionDescription}</div>
                                                        <div className='row'>
                                                            <div className='col-12 col-md-8 text-truncate'>
                                                                <div className='f9pt text-muted text-truncate'>
                                                                    Requirement: {item?.rfqQuestionRequirement ? item?.rfqQuestionRequirement : 'Not Mention'}
                                                                </div>
                                                            </div>
                                                            <div className='col-12 col-md-2'>
                                                                <div className='f9pt text-muted'>
                                                                    Attachment: {item?.attachement ? 'Yes' : 'No'}
                                                                </div>
                                                            </div>
                                                            <div className='col-12 col-md-2'>
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

export default SupplierQuestionVQ