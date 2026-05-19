import { Avatar, Chip, IconButton,Button as Buttonmui ,Badge as Badgemui, Tooltip, Box, Stepper, Step, StepLabel, stepConnectorClasses, StepConnector, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineUpload } from "react-icons/hi";
import { FaBackward, FaRegFileExcel } from "react-icons/fa";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { initialState } from "../../store/reducer";
import { LuCircleDot } from "react-icons/lu";
import { getObjIndexfromArr } from "./utility";
import { FaCircle, FaCircleDot } from "react-icons/fa6";
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate, useParams, } from "react-router-dom";
import { IoMdArrowBack, IoMdArrowRoundBack } from "react-icons/io";
import { Button } from "react-bootstrap";




// Function to handle file upload
function UploadButton({ label = 'Choose file', onUpload ,sampledownload}) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    onUpload(file);
  };

  // Function to download sample file
  const downloadSampleFile = () => {
    // Perform download logic here
    sampledownload()
  };

  return (
    <> 
      <input
        className="d-none"
        type="file"
        onChange={handleFileChange}
      />
      
      {/* Tooltip for Upload Button */}
      <Tooltip title="Upload .xlsx file">
        <Chip icon={<HiOutlineUpload className="f16 text-primary ms-2" />} variant="outlined" className="no-border" label="Excel Upload" onClick={() => document.querySelector('input[type="file"]').click()} />
      
      </Tooltip>
     
      {/* Tooltip for Sample File Download Button */}
      <Tooltip title="Download sample .xlsx file">
        <Chip className="ms-2" icon={<FaRegFileExcel className="f16 text-primary ms-2 no-border" />} variant="outlined"  label="Download sample"  onClick={downloadSampleFile} />
       
      </Tooltip>
    </>
  );
}

// Memoized version 
const MemoizedUploadButton = React.memo(UploadButton);
export default MemoizedUploadButton;

//
// export const useAxios = (atoken) => {  
//   const api = axios.create({
//     baseURL: 'https://peturboapi.azurewebsites.net',
//   });
//   api.interceptors.request.use(
//     (config) => {
//       if (atoken) {
//         config.headers.Authorization = `Bearer ${atoken}`;
//         config.headers.accept = "application/json";
//       }
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
//   );

//   return api;
// };

//shivi code

function EventStageFlow({ stagelist,currentStage }) {
  
 
  const [currentindex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (stagelist && currentStage) {
      
      const  i = getObjIndexfromArr(stagelist, currentStage);
      setCurrentIndex(i);
    }
  }, [stagelist, currentStage]);
 
  return (
    <div className='d-flex fw_fd'>
      {stagelist && stagelist.map((x, index) => (
        <div key={index} className='mt-2 mb-2 me-2'>
          <div className='d-flex align-items-center'>
            <div className='me-1'>
              <div className='f10'>{`stage ${index+1}`}</div>
              <div className='d-flex align-items-center'>
                <div className='flex-grow-1' style={{ background: '#2A88D8', height: '4px' }}></div>
                <div className='arrow-right'></div>
              </div>
              <div className='f10'>&nbsp;</div>
            </div>
            <div>
              {index <currentindex ?
               
                  <div className='p-2 pt-1 pb-1 rounded f12 text-black d-flex align-items-center' style={{ background: '#b0c4d9' }}>
                    <Badgemui color="success" variant="dot" className='me-2'></Badgemui>
                    <div>{x?.stageName}</div>
                </div> : index == currentindex ?
                   <Tooltip title='current stage'>
                  <div className='p-2 pt-1 pb-1 rounded f12 text-black d-flex align-items-center' style={{ background: '#b0c4d9' }}>
                    <Badgemui color="warning" variant="dot" className='me-2'></Badgemui>
                    <div>{x?.stageName}</div>
                  </div> </Tooltip>:<div className='p-2 pt-1 pb-1 rounded f12 text-black d-flex align-items-center' style={{ background: '#b0c4d9' }}>
                    <Badgemui color="secondary" variant="dot" className='me-2'></Badgemui>
                    <div>{x?.stageName}</div>
                  </div>}
                 
            </div>
          </div>
          <div style={{ marginTop: '-16px' }}>
            <div className='f10 d-flex justify-content-top'>
              {/* <div className='me-1'>
                <Avatar className='mt-1' sx={{ bgcolor: '#2A68D3', width: 16, height: 16, fontSize: '9px' }}>
                  {`N`}
                </Avatar>
              </div> */}
              <div className='flow-grow-1'>
                <div className='f12 text-muted'>{``}</div>
                <div className='f10 text-muted'>{``}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    
    </div>
  );
 
}




// const ApplicationProgressBar = ({ stagelist, currentStage }) => {
//   const [currentindex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (stagelist && currentStage) {
      
//       const  i = getObjIndexfromArr(stagelist, currentStage);
//       setCurrentIndex(i);
//     }
//   }, [stagelist, currentStage]);
//   return (
//     <div className="application-progress-bar">
//       {stagelist && stagelist.map((x, index) => (
//         <div
//           key={index}
//           className={`application-progress-bar__step ${
//             index < currentindex ? 'completed' : 'not-completed'
//           }`}
//         >
//           {index < currentindex && <i className="fas fa-check application-progress-bar__icon" />}
//           {/* {step.icon && <i className={step.icon} />} */}
//           <span>{index == currentindex &&<IconButton size='small' className=' me-3' >
//                             <LuCircleDot className='f17 text-danger' />
//           </IconButton>}</span>
//            <span>{index > currentindex &&<IconButton size='small' className=' me-3' >
//                             <LuCircleDot className='f17' />
//                         </IconButton>}</span>
//           <span>{x?.stageName}</span>
//         </div>
//       ))}
//     </div>
//   );
// };
const ApplicationProgressBar = ({ stagelist, currentStage }) => {
  const [currentindex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (stagelist && currentStage) {
      const i = getObjIndexfromArr(stagelist, currentStage);
      setCurrentIndex(i);
    }
  }, [stagelist, currentStage]);

  return (
    <div className="application-progress-bar d-flex align-items-center">
      {stagelist && stagelist.map((x, index) => {
        const isCompleted = index < currentindex;
        const isCurrent = index === currentindex;

        return (
          <Tooltip key={index} title={x?.stageName} arrow>
            <div
              className={`application-progress-bar__step d-flex align-items-center justify-content-center me-3 px-3 py-2 rounded`}
              style={{
                cursor: 'pointer',
                width: '40px',  // fixed width for circle-like step
                height: '40px',
                backgroundColor: isCompleted
                  ? '#198754'  // green for completed
                  : isCurrent
                  ? '#ffc107'  // yellow for current
                  : '#e0e0e0', // grey for upcoming
                color: isCompleted || isCurrent ? 'white' : 'black',
                fontWeight: 'bold',
                fontSize: '16px',
                userSelect: 'none',
              }}
            >
              {isCompleted ? (
                <i className="fas fa-check" />
              ) : (
                index + 1
              )}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

ApplicationProgressBar.defaultProps = {
  steps: [
    { label: 'id' },
    { label: 'Review in progress' },
    { label: 'Attend interview', icon: 'fas fa-briefcase' },
    { label: 'Not selected' },
  ],
  currentStep: 0,
};
const AppProgressBar = ({ stagelist, currentStage }) => {
  const [currentindex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (stagelist && currentStage) {
      const i = getObjIndexfromArr(stagelist, currentStage);
      setCurrentIndex(i >= 0 ? i : 0);
    }
  }, [stagelist, currentStage]);

  return (
    <Box sx={{ width: '100%' }}>
      
    <Stepper
      activeStep={currentindex}
      alternativeLabel
      connector={<Linestyle />}
      sx={{
        '.MuiStep-root': {
          flex: 1,
        },
      }}
    >
  {/* {stagelist?.map((x, index) => (
    <Step key={x?.currentStage || index}>
      <StepLabel
        className="labelName"
        sx={{
          '&:hover': {
            cursor: 'pointer',
            color: 'primary.main',
          },
          whiteSpace: 'nowrap',
          fontSize: '0.875rem',
          textAlign: 'center',
          px: 1,
        }}
      >
        {x?.stageName || ''}
      </StepLabel>
    </Step>
  ))} */}

  {stagelist?.map((x, index) => {
          const isLastStep = index === stagelist.length - 1;

          return (
            <Step
              key={x?.currentStage || index}
              completed={index < currentindex || (isLastStep && currentindex === index)}
            >
              <StepLabel
                className="labelName"
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'primary.main',
                  },
                  whiteSpace: 'nowrap',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  px: 1,
                }}
              >
                {x?.stageName || ''}
              </StepLabel>
            </Step>
          );
        })}
</Stepper>


      {/* <Stepper activeStep={currentindex} alternativeLabel connector={<Linestyle />}>
        {stagelist?.map((x, index) => (
          <Step key={x?.currentStage || index}>
              <Tooltip title={x?.stageName || ''} arrow>
              <StepLabel className="labelName"  sx={{ '&:hover': { cursor: 'pointer' } }}>{`Step ${index + 1}`}</StepLabel>
            </Tooltip>
          
          </Step>
        ))}
      </Stepper> */}
    </Box>
  );
};


// const AppProgressBar = ({ stagelist, currentStage }) => {
//   const [currentindex, setCurrentIndex] = useState(1);
 
//   useEffect(() => { 
     
//     if (stagelist && currentStage) {
       
//       const i = getObjIndexfromArr(stagelist, currentStage);
      
//       setCurrentIndex(i);
//     }
//   }, [stagelist, currentStage]);
  
//   return (
//     <Box sx={{ width: '100%' }}>
//      <Stepper  activeStep={stagelist?.length == currentindex +1 ?  currentindex+ 1 :currentindex} alternativeLabel connector={<Linestyle />}>
//       {stagelist && stagelist.map((x, index) => (
           
//           <Step key={x?.currentStage}>
//             <StepLabel className="labelName">{x?.currentStage}</StepLabel>
//           </Step>
           
//         ))}
//      </Stepper>
//     </Box>
//   );
// };

const Linestyle = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#0d6efd',

    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#198754',

    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));






// Memoized version 
export const MemoizedEventStageFlow = React.memo(AppProgressBar);



export const BackButton = ({ title, modal,subtitle='' }) => {
  const navigate = useNavigate();
  const location = useLocation();
    const { eventid: eventIdFromPath } = useParams();

  // State to control the confirmation dialog visibility
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCloseDelete = (value) => {
    if (value) {
      setConfirmDelete(false);
      goBack();
    } else {
      setConfirmDelete(false);
    }
  };
  
  // const goBack = () => {
  //   const currentUrl = new URL(window.location.href);
  //   const pathname = currentUrl.pathname;

  //   const tab = currentUrl.searchParams.get('tab');
  //   const queryEventId = currentUrl.searchParams.get('eventid');
  //   const actionType = currentUrl.searchParams.get('ActionType');
  //   const activityId = currentUrl.searchParams.get('ActivityId');

  //   // 👇 only for manage-rfq (RFQ module)
  //   const isRFQ = pathname.includes('/manage-rfq');

  //   const eventid = isRFQ ? (queryEventId || eventIdFromPath) : queryEventId;

  //   const queryString = [
  //     tab && `tab=${tab}`,
  //     actionType && `ActionType=${actionType}`,
  //     activityId && `ActivityId=${activityId}`
  //   ].filter(Boolean).join('&');

  //   if (pathname.includes(`/supplier-individual-report/`) && isRFQ) {
  //     const targetUrl = `/configuration/manage-rfq/${eventid}${activityId ? `/${activityId}` : ''}${queryString ? `?${queryString}` : ''}`;
  //     navigate(targetUrl);
  //   } else {
  //     navigate(-1); // for all other cases like manage-participants etc.
  //   }
  // };
  // const goBack = () => {
  //   const currentUrl = new URL(window.location.href);
  //   const pathname = currentUrl.pathname;
  //   const tab = currentUrl.searchParams.get('tab');
  //   const queryEventId = currentUrl.searchParams.get('eventid');
  //   const actionType = currentUrl.searchParams.get('ActionType');
  //   const activityId = currentUrl.searchParams.get('ActivityId');

  //   const eventid = queryEventId || eventIdFromPath; // ✅ fallback to path param

  //   const queryString = [
  //     tab && `tab=${tab}`,
  //     actionType && `ActionType=${actionType}`,
  //     activityId && `ActivityId=${activityId}`
  //   ].filter(Boolean).join('&');

  //   if (pathname.includes(`/supplier-individual-report/`)) {
  //     const targetUrl = `/configuration/manage-rfq/${eventid}${activityId ? `/${activityId}` : ''}${queryString ? '?' + queryString : ''}`;
  //     navigate(targetUrl);
  //   } else {
  //     navigate(-1);
  //   }
  // };
// const goBack = () => {
//   const currentUrl = new URL(window.location.href);
//   const pathname = currentUrl.pathname;
//   const tab = currentUrl.searchParams.get('tab');
//   const eventid = currentUrl.searchParams.get('eventid');
//   const actionType = currentUrl.searchParams.get('ActionType');
//   const activityId = currentUrl.searchParams.get('ActivityId');

//   const queryString = [
//     tab && `tab=${tab}`,
//     actionType && `ActionType=${actionType}`,
//     activityId && `ActivityId=${activityId}`
//   ].filter(Boolean).join('&');

//   if (pathname.includes(`/supplier-individual-report/`)) {
//     const targetUrl = `/configuration/manage-rfq/${eventid}${activityId ? `/${activityId}` : ''}${queryString ? '?' + queryString : ''}`;
//     navigate(targetUrl);
//   } else {
//     navigate(-1);
//   }
// };


  const goBack = () => {
    
    // Get the current URL's query parameters
    const currentUrl = new URL(window.location.href);
    const pathname = currentUrl.pathname;
    const tab = currentUrl.searchParams.get('tab');
    const eventid = currentUrl.searchParams.get('eventid');
  
    if (tab) {
      
      if (pathname.includes(`/supplier-individual-report/`)) {
        const targetUrl = `/configuration/manage-rfq/${eventid}?tab=${tab}`;
        navigate(targetUrl);
      } 
      else if (pathname.includes(`/manage-rfq/`)) {
        const targetUrl = `/configuration/manage-rfq/`;
        navigate(targetUrl);
      }
      else {
        navigate(-1);
      }
    } else {
      // If there is no 'tab' parameter, use the default navigate(-1)
      navigate(-1);
    }
  };

  const handleBackButtonClick = () => {
    if (modal) {
      setConfirmDelete(true);
    } else {
      goBack();
    }
  };

  return (
    <>
      <div className="page-heading f13">
        <IconButton onClick={handleBackButtonClick} class="icon-link">
          <IoMdArrowRoundBack />
        </IconButton>
        <span className="f18 fw500 text-default">{title}</span>
      </div>
      <div className="f12">
        <span className="f12">{subtitle}</span>
      </div>

      {/* Render the Dialog only if confirmDelete is true and modal is provided */}
      {modal && confirmDelete && (
        <Dialog open={confirmDelete} onClose={() => handleCloseDelete(false)}>
          <DialogTitle>{"Are you sure?"}</DialogTitle>
          <DialogContent style={{ minWidth: "300px" }}>
            <DialogContentText>
              Are you sure you want to leave the page? Unsaved changes (if any) will be lost.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Buttonmui onClick={() => handleCloseDelete(false)}>No</Buttonmui>
            <Buttonmui variant="contained" onClick={() => handleCloseDelete(true)} autoFocus>
              Yes
            </Buttonmui>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};





