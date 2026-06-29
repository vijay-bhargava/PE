import React, { useEffect, useState, useRef } from 'react'
import { HiUserGroup, HiOutlineX, HiX, } from "react-icons/hi";
import { Box, Checkbox, Drawer, IconButton, Input, Radio, Tab, Tabs, Tooltip } from '@mui/material'
import { FaRegFloppyDisk, FaPaperclip } from "react-icons/fa6";
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Button, Form } from 'react-bootstrap';
import { LoadingButton } from '@mui/lab';
import { getDocumentList } from '../../utils/documentlibrary';
import { useStateValue } from '../../store';
import { toast } from 'react-toastify';
import { AddMultiplePRAttachments, uploadFilesOnAzurePR } from '../../utils/purchaseRequest';
import { downloadFilesOnAzure, getExtension, validateFileSize } from '../../utils/common';

const SelectQuestionCell = ({ stagelist, currentStage, EventDetail, EventId, listOfAttachment }) => {

	const [{ atoken, rtoken, customerid, userDetail }, dispatch] = useStateValue();

	const [attachment, setAttachement] = useState(null);
	const [attachmentDesc, setattachmentDesc] = useState("");
	const [filepath, setfilepath] = useState([]);
	const [listForAttach, setlistForAttach] = useState([]);
	const fileInputRef = useRef(null);
	const [AttachList, setAttachList] = useState([]);
	const [AttachFiles, setAttach] = useState(false);
	const [error, setError] = useState('');


	useEffect(() => {

		fetchAttachForPR(EventDetail, EventId, listOfAttachment);

	}, [EventId, listOfAttachment]);


	// useEffect(() => {
	//     fetchAttachForPR(EventDetail, EventId);
	// }, [AttachList]);


	const fetchAttachForPR = (EventDetail, EventId, listOfAttachment) => {

		if (listOfAttachment?.length > 0) {
			setAttachList(listOfAttachment)
			setAttach(listOfAttachment)
		}
		else {
			getDocumentList(EventDetail, atoken).then((res) => {

				if (res?.length) {

					//  setPrAttach(res);

					const getDocList = res.map(item => ({
						//...AttachList,
						id: 0,
						customerId: item?.customerId,
						attachmentDescription: item?.attachmentdesc,
						attachment: item?.attachment,
						fileNamepath: item?.filepath,
						filetype: "",
						isSelected: false, // for my internal use
						prId: EventId,
						// termsId: item?.id
					}));
					setAttachList(getDocList)
					setAttach(getDocList)
				}

			});
		}
	};


	const addAttachment = () => {

		var filepathreturn = "";
		if (validateFields()) {
			if (listForAttach) {

				var Data = {
					RequestedBy: "customer",
					EventType: "PR",
					EventId: EventId,
					CustomerId: customerid,
					Description: attachmentDesc,
				};

				uploadFilesOnAzurePR(Data, listForAttach, atoken).then((resdata) => {

					filepathreturn = resdata;
					const newRow = {
						id: 0,
						customerId: 1,
						attachmentDescription: attachmentDesc,
						attachment: attachment,
						fileNamepath: filepathreturn,
						filetype: "",
						isSelected: false, // for my internal use
						prId: EventId
					};
					setAttach([...AttachList, newRow]);
					console.log("setAttachList::", setAttachList);
				})
				setattachmentDesc('');
				setAttachement(null);
				fileInputRef.current.value = null;
			}
		}

	}

	const AddPRAttachments = () => {

		if (AttachFiles && AttachFiles?.length) {

			console.log('call savePRAttachmentAdd api request', AttachFiles)
			AddMultiplePRAttachments(AttachFiles, EventId, atoken).then((res) => {

				console.log("return PRattach sresponse ", res);
				if (res > 0) {
					toast.success("PR Attachments Added Successfully!", {
						toastId: "PRAttachmentsPass",
						onClose: () => {
							CloseDrawerForAttachment();
						}
					});
				}
			});
		}
	}


	const handleAttachmentdescChange = (e) => {
		const input = e?.target?.value;
		// Remove single quote character from input
		const sanitizedInput = input.replace(/'/g, "");
		// Set the sanitized input
		setattachmentDesc(sanitizedInput);
	};


	function handleFileChange(event) {
		if (event) {
			if (!validateFileSize(event)) {
				setAttachement(null);

				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
				return; // Stop further processing if file size is invalid
			}



			const fileName = event.target.files[0].name;
			if (fileName.length > 50) {
				toast.error("Attachment name must be 50 characters or fewer.", {
					toastId: "PRAttachmentcharacters",
				});
				event.target.value = null;
				return;
			}
			setAttachement(fileName);
			var foldername = "PR/" + EventId + attachmentDesc; // Example folder name
			setfilepath(foldername);
			setlistForAttach(event.target.files[0]);
		}
	}

	const validateFields = () => {

		if (!attachmentDesc || !attachment) {
			setError('Please provide a description and select a file to upload.');
			return false;
		}
		setError('');
		return true;
	};





	const [state, setState] = useState({
		technicalApprovalDrawer: false,
	});
	const toggleDrawer = (anchor, open) => (event) => {
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};

	// const [value, setValue] = React.useState(0);

	// const handleChange = (event, newValue) => {
	//     setValue(newValue);
	// };


	const CloseDrawerForAttachment = () => {
		setAttachement(null);
		setattachmentDesc("");
		setState({ ...state, ["technicalApprovalDrawer"]: false });
	};

	const handleDownload = (i) => {

		if (listOfAttachment?.[i]?.fileNamePath) {
			downloadFilesOnAzure(listOfAttachment?.[i]?.fileNamePath, listOfAttachment?.[i]?.attachment, atoken);
		}
	};

	const handleRemoveAttachment = (index) => {

		const updatedAttachments = [...AttachFiles];
		updatedAttachments.splice(index, 1); // Remove attachment at index
		setAttach(updatedAttachments);
	};

	return (
		<>
			<Tooltip title="Attachments">
				<IconButton size='medium' className='border-primary me-2 bg-white'
					onClick={toggleDrawer('technicalApprovalDrawer', true)}
				>
					<FaPaperclip className='f17' />
				</IconButton>
			</Tooltip>
			<React.Fragment key='top'  >
				<Drawer
					anchor='right'
					open={state['technicalApprovalDrawer']}
					onClose={toggleDrawer('technicalApprovalDrawer', false)}>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 }, }} >
						<div className='flex flex-col'>
							<Box className='bgheaderCards'>
								<div className='d-flex align-items-center justify-content-between pt-2 pb-2'>
									<div className='ms-3 text-white'>
										Attachments
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
							<Box sx={{ flexGrow: 1, p: 2 }} >
								<div className='border-bottom mb-2 pt-1 pb-1'>
									<div className='row'>
										<div className='col-md-5'>
											<Input placeholder="Attachment Description" id='attachmentDesc' name='attachmentDesc' fullWidth variant="outlined" className='' onChange={handleAttachmentdescChange}
											/>
										</div>
										<div className='col-md-5'>
											<Form.Group controlId="formFile" className="">
												<Form.Control
													// onChange={userAttachment}
													onChange={handleFileChange}
													ref={fileInputRef} type="file" size="sm" accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
												// isInvalid={err}
												/>
												{/* <Form.Text id="filiploadtext" muted className="f12">
                                                    (\.docx|\.doc|\.jpg|\.jpeg|\.gif|\.png|\.pdf|\.xlsx), Max Size: 8 mb
                                                </Form.Text> */}
												<div className='col-12 col-md-8 mb-2' style={{ color: "blue", fontStyle: "italic" }}>

													{/* {item?.attachment} */}
												</div>
											</Form.Group>
										</div>

										<div className='col-md-2 d-flex align-items-center text-end'>
											<LoadingButton variant='text' size='small' className='me-2 rounded-pill' onClick={addAttachment}>
												<span className='text-capitalize'>Add</span>
											</LoadingButton>
											{/* <IconButton size='medium' className='bg-white'>
                                                <HiX className='f17 text-danger' />
                                            </IconButton> */}
										</div>
										{error && <div style={{ color: 'red', fontSize: '12px' }}>{error}</div>}

									</div>

								</div>

								{AttachFiles && AttachFiles?.map((item, index) =>
									<div className='border-bottom mb-2 pt-1 pb-1' key={index}>
										<div className='row'>
											<div className='col-md-5'>
												<Input placeholder="Attachment Description" fullWidth variant="outlined" className='' value={item?.attachmentDescription}
													onChange={(e) => {
														const updatedAttachments = [...AttachFiles];
														updatedAttachments[index].attachmentDescription = e.target.value;
														setAttach(updatedAttachments);
													}} />
											</div>
											<div className='col-md-5'>
												<Form.Group controlId="formFile" className="">
													{/* <Form.Control
                                                        // onChange={userAttachment}
                                                        // onChange={(e) => setFileName(e.target.files[0])}
                                                        type="file" size="sm" accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                                    // isInvalid={err}
                                                    /> */}
													{/* <Form.Text id="filiploadtext" muted className="f12">
                                                    (\.docx|\.doc|\.jpg|\.jpeg|\.gif|\.png|\.pdf|\.xlsx), Max Size: 8 mb
                                                </Form.Text> */}
													<div className='col-12 col-md-8 mb-2' style={{ color: "blue", fontStyle: "italic", cursor: "pointer" }} onClick={() => handleDownload(index)}>

														{item?.attachment}
													</div>
												</Form.Group>
											</div>

											<div className='col-md-2 d-flex align-items-center text-end'>
												{/* <LoadingButton variant='text' size='small' className='me-2 rounded-pill'>
                                                    <span className='text-capitalize'>Add</span>
                                                </LoadingButton> */}
												<button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => handleRemoveAttachment(index)}>
													<HiX className='f17' />
												</button>
											</div>
										</div>

									</div>
								)}

							</Box>
							{EventId > 0 ? <div className="col-12 text-end">

								<LoadingButton type="submit"
									variant='text' size='small' className='me-2 rounded-pill' onClick={AddPRAttachments}>
									<span className='text-capitalize'>Submit</span>
								</LoadingButton>
							</div> : <></>}
						</div>
					</Box>
				</Drawer>
			</React.Fragment>
		</>
	)
}

export default SelectQuestionCell