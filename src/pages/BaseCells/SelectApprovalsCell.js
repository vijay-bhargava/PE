import React, { useState, useEffect } from 'react'
import { HiUserGroup, HiOutlineX } from "react-icons/hi";
import { Box, Checkbox, Drawer, IconButton, Tab, Tabs, Tooltip } from '@mui/material'
import { getWorkFlowList, ActionWFAddApprover, getEventApprovers, getuserlist } from "../../utils/common/utility";
import { actionTypes, useStateValue } from "../../store";
import { confirmAlert } from 'react-confirm-alert';
import { toast } from 'react-toastify';

const SelectApprovalsCell = (requestApprover) => {

    console.log("requestApprover", requestApprover)
    const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();

    const [state, setState] = useState({
        technicalApprovalDrawer: false,
    });
    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };

    const [value, setValue] = React.useState(0);



    const getCheckedDefault = (checkedValue) => {

        return checkedValue;
    };

    const handleChange = (event, newValue) => {

        const isChecked = event?.target?.checked
        if (isChecked) {
            setValue(newValue);
            const wfobj = [...wfInputDataList, {
                id: 0,
                wfId: newValue,
                eventId: requestApprover?.requestApprover.EventId,
                eventType: requestApprover?.requestApprover.EventType
            }]
            setwfInputDataList((prevState) => [...prevState, {
                id: 0,
                wfId: newValue,
                eventId: requestApprover?.requestApprover.EventId,
                eventType: requestApprover?.requestApprover.EventType
            }]);

            WFinputDataList(wfobj);

        }


    };


    useEffect(() => {

        if (requestApprover) fetchEventApprovers(requestApprover)
    }, [requestApprover]);


    const [approverList, setApproverList] = useState([]);

    const fetchEventApprovers = (requestApprover) => {
        
        getEventApprovers(requestApprover, atoken).then((res) => {
            
            console.log("setApproverList ", res);
            if (res?.length) {
                setApproverList(res);
            }

        });
    };


    useEffect(() => {
        fetchWorkFlowList(requestApprover);
    }, []);


    const [WorkFlowList, setWorkFlowListApproverList] = useState([]);
    const fetchWorkFlowList = (requestApprover) => {

        const dataRequest = {
            isactive : true,
            CustomerId: customerid,
            eventtype: requestApprover?.requestApprover?.EventType
        };

        getWorkFlowList(dataRequest, atoken).then((res) => {

            console.log("fetchWorkFlowListdataRequest ", res);

            if (res?.length) {

                setWorkFlowListApproverList(res);
            }

        });
    };

    const CloseDrawerForWF = () => {
        
        //setattachmentDesc("");
        setState({ ...state, ["technicalApprovalDrawer"]: false });
        fetchEventApprovers(requestApprover);
        //setApproverList([]);
    };


    const [wfInputDataList, setwfInputDataList] = useState([]);
    const WFinputDataList = (wfInputDataList) => {

        if (wfInputDataList?.length > 0) {

            ActionWFAddApprover(wfInputDataList, atoken).then((res) => {

                // if (res?.length > 0) {
                if (res?.id > 0) {
                    toast.success("Approver Added..!", {
                        position: toast.POSITION.TOP_CENTER,
                        autoClose: 1000,
                        onClose: () => {
                            CloseDrawerForWF();
                        }
                    });
                    console.log("wfInputDataList ", res);

                }

            });
        };

    }


    const checkWfalreadyAdded = (wfId) => {
        const findValue = approverList.find((data) => data?.wfId === wfId)
        if (findValue != null && findValue?.wfId > 0)
            return true;
        else
            return false;

    };

    return (
        <>
            <Tooltip title="Workflows">
                <IconButton size='medium' className=' border-primary me-0 pe-0 bg-white'
                    onClick={toggleDrawer('technicalApprovalDrawer', true)}
                >
                    <HiUserGroup className='f17' />
                </IconButton>
            </Tooltip>
            <React.Fragment key='top'>
                <Drawer
                    anchor='right'
                    open={state['technicalApprovalDrawer']}
                    onClose={toggleDrawer('technicalApprovalDrawer', false)}>
                    <Box sx={{ width: { xs: 280, sm: 480, md: 720 }, }} >
                        <div className='flex flex-col'>
                            <Box className='bgheaderCards'>
                                <div className='d-flex align-items-center justify-content-between pt-2 pb-2'>
                                    <div className='ms-3 text-white'>
                                        Workflow
                                    </div>
                                    <div>
                                        <IconButton
                                            onClick={toggleDrawer('technicalApprovalDrawer', false)}
                                            size="small"
                                            edge="start"
                                            sx={{ mr: 1 }}
                                        >
                                            <HiOutlineX className='f20 text-white' />
                                        </IconButton>
                                    </div>
                                </div>
                            </Box>
                            <div className='h50px'></div>
                            {WorkFlowList?.map((selectedItem, index) => (
                                <>
                                    {selectedItem?.wfapproverusers && selectedItem?.wfapproverusers?.length > 1}
                                    <Box sx={{ flexGrow: 1, p: 2 }} >
                                        <div className='bg-white rounded p-2 shadow-sm border mb-3'>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <div className='p-1'>
                                                    <div> <span className='text-muted f12'> ({selectedItem?.wfname})</span></div>
                                                </div>
                                                <div className=''>
                                                    <Checkbox size='small' onChange={(event) => {
                                                        handleChange(event, selectedItem?.id)
                                                    }}
                                                        defaultChecked={checkWfalreadyAdded(selectedItem?.id)}

                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Box sx={{}}>

                                                    <Tabs
                                                        value={value}
                                                        onChange={handleChange}
                                                        variant="scrollable"
                                                        scrollButtons="auto"
                                                        indicatorColor=""
                                                        aria-label="scrollable auto tabs example"
                                                    >
                                                        {selectedItem?.wfapproverusers?.map((selectedApprover, index) => (

                                                            <div className='col-12 col-md-4 m-1'>
                                                                <div className='border align-items-center rounded p-1 text-truncate'>
                                                                    <div className='d-flex'>
                                                                        <div className='rounded bgLblue text-white text-center ps-2 pe-2'>
                                                                            {selectedApprover.seqno}
                                                                        </div>
                                                                        <div className='flex-grow-1 ms-2'>
                                                                            <div className='text-truncate f12'>
                                                                                {selectedApprover?.username}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className='mt-1 f12 text-muted'>
                                                                        {selectedApprover?.useremailid ? selectedApprover?.useremailid : ""}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </Tabs>

                                                </Box>
                                            </div>
                                        </div>

                                    </Box>
                                </>
                            ))}

                        </div>
                    </Box>
                </Drawer>
            </React.Fragment>
        </>
    )
}

export default SelectApprovalsCell