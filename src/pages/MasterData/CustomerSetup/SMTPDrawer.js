import React from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { actionTypes, useStateValue } from '../../../store';
import { SMTPDetail, UpdateSMTP } from '../../../utils/customerSetup';
import { toast } from 'react-toastify';
import TextFieldCell from '../../BaseCells/TextFieldCell';
import CommonBottomDrawer from '../../../components/CommonBottomDrawer';
import validator from 'validator';

const SMTPDrawer = ({ open, onClose, editRecordData, callbackstep }) => {
	const [{ atoken }, dispatch] = useStateValue();

	const [host, setHost] = React.useState('');
	const [port, setPort] = React.useState('');
	const [fromEmail, setFromEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [displayName, setDisplayName] = React.useState('');
	const [isValidUrl, setIsValidUrl] = React.useState(true);
	const [togleeye, setTogleeye] = React.useState(true);
	const [loading, setLoading] = React.useState(false);
	const [selectedSMTPId, setSelectedSMTPId] = React.useState(0);

	// Pre-fill when editRecordData changes
	React.useEffect(() => {
		if (editRecordData?.smtpDetail?.id) {
			setHost(editRecordData.smtpDetail.host ?? '');
			setPort(editRecordData.smtpDetail.port ?? '');
			setFromEmail(editRecordData.smtpDetail.fromEmail ?? '');
			setPassword(editRecordData.smtpDetail.password ?? '');
			setDisplayName(editRecordData.smtpDetail.displayName ?? '');
		} else if (editRecordData?.id) {
			setSelectedSMTPId(editRecordData.id);
		}
	}, [editRecordData]);

	const handleHostName = (e) => {
		const value = e.target.value;
		setHost(value);
		setIsValidUrl(validator.isURL(value));
	};

	const handlePort = (e) => {
		let value = e.target.value.replace(/[^\d.]/g, '');
		if ((value.match(/\./g) || []).length > 1) value = value.slice(0, value.lastIndexOf('.'));
		if (/^0\d/.test(value)) value = value.slice(1);
		setPort(value);
	};

	const clearForm = () => {
		setHost(''); setPort(''); setFromEmail(''); setPassword(''); setDisplayName('');
		setIsValidUrl(true);
	};

	const handleClose = () => {
		clearForm();
		onClose();
	};

	const validationSchema = yup.object({
		host: yup.string().required('Please Enter HostName'),
		port: yup.string().required('Please Enter Port No.'),
		fromEmail: yup.string().email().required('Please Enter Email'),
		password: yup.string().required('Please Enter Password'),
		displayName: yup.string().required('Please Enter DisplayName'),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: { host, port, fromEmail, password, displayName },
		validationSchema,
		onSubmit: () => {
			setLoading(true);
			const data = { host, port, fromEmail, password, displayName };
			const isEdit = editRecordData?.smtpDetail?.id > 0;
			const apiCall = isEdit
				? UpdateSMTP(data, editRecordData.smtpDetail.id, atoken)
				: SMTPDetail(data, selectedSMTPId, atoken);

			apiCall.then((res) => {
				setLoading(false);
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: 'success' });
				dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });
				toast.success(isEdit ? 'SMTP Updated Successfully!' : 'SMTP Done Successfully!', {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 1000,
					onClose: () => { handleClose(); callbackstep(isEdit ? 'update' : 'add'); },
				});
				clearForm();
			});
		},
	});

	return (
		<CommonBottomDrawer
			open={open}
			onClose={handleClose}
			title="SMTP Details"
			actions={
				<>
					<button
						className="rfq-v2-event-btn rfq-v2-event-btn-ghost"
						onClick={handleClose}
					>
						Cancel
					</button>
					<button
						type="button"
						className="pe-btn pe-btn--secondary"
						onClick={clearForm}
					>
						Reset
					</button>
					<button
						type="submit"
						form="smtp-form"
						className="pe-btn pe-btn--primary"
						disabled={loading}
					>
						{loading ? 'Saving...' : (editRecordData?.smtpDetail?.id ? 'Update' : 'Add')}
					</button>
				</>
			}
			sectionStyle={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
			bodyStyle={{ overflowY: 'auto', flex: 1 }}
		>
			<form id="smtp-form" onSubmit={formik.handleSubmit} autoComplete="off">
				<div className="row">

					{/* Row 1: Host (wider) + Port (narrower) */}
					<div className="col-12 col-md-6 mb-3">
						<label className="pe-field-label" htmlFor="host">Host Name <span className="rfq-required-star">*</span></label>
						<TextFieldCell
							id="host" name="host"
							placeholder="" value={host} maxLength={100}
							onChange={handleHostName}
						/>
						{!isValidUrl && (
							<div className="error error-red" style={{ fontSize: '12px' }}>Please enter a valid URL.</div>
						)}
						{formik.errors.host && formik.touched.host && (
							<div className="error error-red" style={{ fontSize: '12px' }}>{formik.errors.host}</div>
						)}
					</div>
					<div className="col-12 col-md-6 mb-3">
						<label className="pe-field-label" htmlFor="port">Port No. <span className="rfq-required-star">*</span></label>
						<TextFieldCell
							id="port" name="port"
							placeholder="" value={port} maxLength={10}
							onChange={handlePort}
						/>
						{formik.errors.port && formik.touched.port && (
							<div className="error error-red" style={{ fontSize: '12px' }}>{formik.errors.port}</div>
						)}
					</div>

					{/* Row 2: From Email + Display Name */}
					<div className="col-12 col-md-6 mb-3">
						<label className="pe-field-label" htmlFor="fromEmail">From Email <span className="rfq-required-star">*</span></label>
						<TextFieldCell
							id="fromEmail" name="fromEmail"
							placeholder="" value={fromEmail} maxLength={100}
							onChange={(e) => setFromEmail(e?.target?.value)}
						/>
						{formik.errors.fromEmail && formik.touched.fromEmail && (
							<div className="error error-red" style={{ fontSize: '12px' }}>{formik.errors.fromEmail}</div>
						)}
					</div>
					<div className="col-12 col-md-6 mb-3">
						<label className="pe-field-label" htmlFor="displayName">Display Name <span className="rfq-required-star">*</span></label>
						<TextFieldCell
							id="displayName" name="displayName"
							placeholder="" value={displayName} maxLength={100}
							onChange={(e) => setDisplayName(e?.target?.value)}
						/>
						{formik.errors.displayName && formik.touched.displayName && (
							<div className="error error-red" style={{ fontSize: '12px' }}>{formik.errors.displayName}</div>
						)}
					</div>

					{/* Row 3: Password (full width) */}
					<div className="col-12 col-md-6 mb-3">
						<label className="pe-field-label" htmlFor="password">Password <span className="rfq-required-star">*</span></label>
						<TextFieldCell
							id="password" name="password"
							type={password && togleeye ? 'password' : 'text'}
							value={password}
							onChange={(e) => setPassword(e?.target?.value)}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton size="small" onClick={() => setTogleeye(!togleeye)}>
											{togleeye ? <HiOutlineEye /> : <HiOutlineEyeOff />}
										</IconButton>
									</InputAdornment>
								),
							}}
							variant="outlined"
						/>
						{formik.errors.password && formik.touched.password && (
							<div className="error error-red" style={{ fontSize: '12px' }}>{formik.errors.password}</div>
						)}
					</div>

				</div>
			</form>
		</CommonBottomDrawer>
	);
};

export default SMTPDrawer;
