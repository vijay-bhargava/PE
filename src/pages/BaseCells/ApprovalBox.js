import React, { useState, useEffect } from 'react'
import IconButton from '@mui/material/IconButton';
import { HiOutlineUserAdd, HiOutlineX, HiX } from "react-icons/hi";
import { FaRegFloppyDisk } from "react-icons/fa6";
import PEModal from '../../components/PEModal';
import TextFieldCell from './TextFieldCell';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import { useCookies } from 'react-cookie';
import { AddEventApprovers, DeleteEventApprover, getEventApprovers, getuserlist } from "../../utils/common/utility";
import { useStateValue } from "../../store";

const ApprovalBox = (requestApprover) => {

	const [cookies] = useCookies(["patkn", "prtkn"]);
	const [{ atoken, rtoken }, dispatch] = useStateValue();

	const [isAddVisible, setIsAssVisible] = useState(false);
	const toggleAdd = () => {
		setIsAssVisible(previousState => !previousState);
	}

	const [open, setOpen] = React.useState(false);
	const [removeOpen, setRemoveOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setRemoveOpen(false)
	};

	useEffect(() => {
		if (requestApprover?.requestApprover?.EventId > 0) {
			fetchEventApprovers(requestApprover);
			fetchUserList(1, requestApprover);
		}
		else {
			setApproverList([]);
		}
	}, [requestApprover]);

	const [approverList, setApproverList] = useState([]);

	const fetchEventApprovers = (requestApprover) => {

		getEventApprovers(requestApprover, atoken).then((res) => {

			//console.log("res50", res);
			if (res?.length) {
				setApproverList(res);
			}
			else {
				setApproverList([]);
			}

		});
	};

	const [userOptions, setUserOptions] = useState([]);

	const fetchUserList = (customerId, reqApprover) => {
		var data = {
			customerId: customerId,

		};
		getuserlist(data, atoken).then((res) => {
			//console.log("users ", res);
			let arrayNew = [];

			if (res && Array.isArray(res)) {
				var approveseq = approverList[approverList.length - 1]?.ApproverSeq;
				// Check if res is a valid array
				res?.map((datares) => {
					approveseq++;
					arrayNew.push({
						label: datares?.name, approverId: datares?.id, eventId: reqApprover?.requestApprover?.EventId, eventType: reqApprover?.requestApprover?.EventType,
						approverName: datares?.name, approverEmaiId: datares?.email, approverSeq: approveseq, approverType: "Pending", amendmentNo: 0
					});
					// approveseq =approveseq;
				});

				setUserOptions(arrayNew);
				//console.log("users ", userOptions);
			}
		});
	};

	const onChangeApprover = (event, newValue) => {

		//console.log("newValue:", newValue);
		if (newValue != null) {

			var approveseq = 0;
			if (approverList?.length > 0) {
				approveseq = approverList[approverList?.length - 1]?.approverSeq;

			}
			approveseq++;
			newValue.ApproverSeq = approveseq;
			pushEventApprovers(newValue, atoken);
		}
	};

	const pushEventApprovers = (data, atoken) => {
		AddEventApprovers(data, atoken).then((res) => {
			//console.log("approver added ", res);
			fetchEventApprovers(requestApprover);
		});
	};

	const [deletedId, setDeletedId] = useState(0);
	const handleClickRemove = (selectedItem) => {
		// console.log('selectedItem ', selectedItem);
		if (selectedItem?.approverType == 'Pending') {
			setRemoveOpen(true);
			setDeletedId(selectedItem.id);
		}
		else {
			setRemoveOpen(false);
			setDeletedId(0);
		}
	};

	const pushDeleteEventApprover = (data, atoken) => {
		DeleteEventApprover(data, atoken).then((res) => {
			// console.log("approver removed ", res);
			setRemoveOpen(false);
			setDeletedId(0);
			fetchEventApprovers(requestApprover)
		});
	};

	const handleClickToRemoved = (Id) => {
		var data = {
			Id: deletedId
		}
		pushDeleteEventApprover(data, atoken)
	};

	const defaultSApprovqn = (newValue) => {
		return newValue;
	};

	const onChangeApproveSeqn = (event, newValue) => {
		console.log(newValue);
	};

	return (
		<>
			<div className='bg-white rounded shadow-sm m-2'>
				<div className='d-flex align-items-center justify-content-between'>
					<div className='p-2'>
						<div>Approval</div>
						{/* <div className='text-muted f12'>(Technical Approval)</div> */}
					</div>
					<div className=''>
						<IconButton size='small' className='bg-white me-3' onClick={handleClickOpen}>
							<FaRegFloppyDisk className='f17 text-success' />
						</IconButton>
						<IconButton size='small' className='bg-white me-3' onClick={toggleAdd}>
							<HiOutlineUserAdd className='f17 text-primary' />
						</IconButton>
						<IconButton size='small' className=' bg-white me-2'>
							<HiOutlineX className='f17 text-danger' />
						</IconButton>
					</div>
				</div>
				<hr className='m-0' />
				<div className='row'>
					<div className='col-12'>
						{isAddVisible ? <>
							<div className='p-2 mt-2'>
								<Autocomplete
									disablePortal
									id="combo-box-demo"
									size='small'
									options={userOptions}
									fullWidth
									renderInput={(params) => <TextField {...params} InputLabelProps={{
										shrink: true,
									}} label="Search User" />}
									onChange={(event, newvalue) => {
										onChangeApprover(event, newvalue);
									}}
								/>
							</div>
						</> : <></>}
						{approverList?.map((selectedItem, index) => (
							<div className='d-flex border-bottom align-items-center m-1 p-1 pt-1 pb-1'>
								<div>
									{selectedItem?.approverType?.trim() == 'Approved' ?
										<>
											<Tooltip title='Approved'>
												<div className='rounded successbg text-white text-center ps-1 pe-1'>
													<TextField id="standard-basic"
														label=""
														size='small'
														style={{ width: 16 }}
														inputProps={{ maxLength: 2, style: { fontSize: 14, padding: '0px', textAlign: 'center' } }}
														margin='none'
														value={selectedItem?.approverSeq}
														defaultValue={defaultSApprovqn(selectedItem?.approverSeq)}
														variant="standard"
														onChange={(event, newvalue) => {
															onChangeApproveSeqn(event, selectedItem?.approverSeq);
														}}
													/>
												</div></Tooltip></>

										: <>
											{selectedItem?.approverType?.trim() == 'Pending' ? <Tooltip title='Pending'>
												<div className='rounded errorbg text-white text-center ps-1 pe-1'>
													<TextField id="standard-basic"
														label=""
														size='small'
														style={{ width: 16 }}
														inputProps={{ maxLength: 2, style: { fontSize: 14, padding: '0px', textAlign: 'center' } }}
														margin='none'
														value={selectedItem?.approverSeq}
														defaultValue={defaultSApprovqn(selectedItem?.approverSeq)}
														onChange={(event, newvalue) => {
															onChangeApproveSeqn(event, selectedItem?.approverSeq);
														}}
													/>

												</div>
											</Tooltip> : <>
												<div className='rounded pendingbg text-white text-center ps-1 pe-1'>
													<TextField id="standard-basic"
														label=""
														size='small'
														style={{ width: 16 }}
														inputProps={{ maxLength: 2, style: { fontSize: 14, padding: '0px', textAlign: 'center' } }}
														margin='none'
														value={selectedItem?.approverSeq}
														defaultValue={defaultSApprovqn(selectedItem?.approverSeq)}
														onChange={(event, newvalue) => {
															onChangeApproveSeqn(event, selectedItem?.approverSeq);
														}}
													/>
												</div>
											</>}
										</>}

								</div>
								<div className='flex-grow-1 ms-2 text-truncate'>
									<div className='text-truncate f12'>{selectedItem?.approverName} ({selectedItem?.approverEmaiId}) </div>
								</div>
								{selectedItem?.approverType != 'Approved' ? <IconButton size='medium' className='bg-white' onClick={() => handleClickRemove(selectedItem)}>
									<HiX className='f17 text-danger' />
								</IconButton> : <></>}
							</div>
						))}

					</div>
				</div>
			</div>
			<PEModal
				open={open}
				onClose={handleClose}
				size="sm"
				title="Save As"
				footer={<>
					<button className="pe-btn pe-btn--ghost" onClick={handleClose}>Cancel</button>
					<button className="pe-btn pe-btn--primary" onClick={handleClose}>Save</button>
				</>}
			>
				<TextFieldCell
					id="password"
					name="password"
					label="Workflow Title"
					placeholder=''
					maxLength={100}
				/>
			</PEModal>

			<PEModal
				open={removeOpen}
				onClose={handleClose}
				size="sm"
				title="User Removed/Delegate"
				footer={<>
					<button className="pe-btn pe-btn--ghost" onClick={handleClose}>Cancel</button>
					<button className="pe-btn pe-btn--primary" onClick={handleClickToRemoved}>Action</button>
				</>}
			>
				&nbsp;
			</PEModal>
		</>
	)
}

export default ApprovalBox