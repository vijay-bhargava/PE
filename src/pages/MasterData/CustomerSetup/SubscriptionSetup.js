import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Autocomplete, Box, TextField, Tooltip } from '@mui/material';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { HiPencilAlt } from 'react-icons/hi';
import { useStateValue, actionTypes } from '../../../store';
import { Subscription, UpdateSubscription, getSingleCustomer } from '../../../utils/customerSetup';
import { getMenuMaster } from '../../../utils/common/utility';
import { formatDateViaTimeZone, formatoption } from '../../../utils/common/utility';
import { toast } from 'react-toastify';
import TextFieldCell from '../../BaseCells/TextFieldCell';
import { PETable } from '../../../components/RFQ/PETable';
import { PETableToolbar } from '../../../components/RFQ/PETableToolbar';

const SubscriptionSetup = ({
	editRecordData,
	selectedCustomerId,
	callbackstep,
	resetRef,
	onLoadingChange,
}) => {
	const [{ atoken }, dispatch] = useStateValue();

	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [noOFUsers, setnoOFUsers] = useState('');
	const [noOFEvents, setnoOFEvents] = useState('');
	const [value, setValue] = useState('');
	const [noOfApprovers, setnoOfApprovers] = useState('');
	const [subModule, setSubModule] = useState([]);
	const [subscriptionModule, setSubscriptionModule] = useState([]);
	const [subslist, setsubsList] = useState([]);
	const [subsdata, setsubsdata] = useState([]);
	const [editSubscriptionId, setEditSubscriptionId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState('');
	const resetSD = useRef(null);

	const clearSubscriptionList = useCallback(() => {
		setStartDate(null);
		setEndDate(null);
		setnoOFUsers('');
		setnoOfApprovers('');
		setValue('');
		setnoOFEvents('');
		setSubModule([]);
		setSubscriptionModule([]);
		setEditSubscriptionId(null);
	}, []);

	useEffect(() => {
		if (resetRef) resetRef.current = clearSubscriptionList;
	}, [resetRef, clearSubscriptionList]);

	useEffect(() => {
		const data = { MenuType: 'Event' };
		getMenuMaster(data, atoken).then((res) => { if (res) setsubsList(res); });
	}, [atoken]);

	useEffect(() => {
		if (editRecordData?.id) {
			setsubsdata(editRecordData?.subscriptions || []);
			clearSubscriptionList();
		}
	}, [editRecordData]);

	const handleChangeSubscription = (event, newValues) => {
		if (newValues) {
			const updated = newValues.map(v => ({
				customerId: selectedCustomerId,
				moduleId: v.id,
				moduleName: v.menuName,
			}));
			setSubModule(updated);
			setSubscriptionModule(updated);
		}
	};

	const getSubsModule = (arraylist) => {
		const arrayNew = [];
		if (arraylist?.length > 0) {
			subslist?.forEach(data => {
				arraylist?.forEach(array => {
					if (data.id === array.moduleId) arrayNew.push(data);
				});
			});
		}
		return arrayNew;
	};

	const handleValueForSubs = (e) => {
		let v = e.target.value.replace(/[^\d.]/g, '');
		if ((v.match(/\./g) || []).length > 1) v = v.slice(0, v.lastIndexOf('.'));
		if (/^0\d/.test(v)) v = v.slice(1);
		setValue(v);
	};

	const handleApproverForSubs = (e) => {
		let v = e.target.value.replace(/[^\d.]/g, '');
		if ((v.match(/\./g) || []).length > 1) v = v.slice(0, v.lastIndexOf('.'));
		if (/^0\d/.test(v)) v = v.slice(1);
		setnoOfApprovers(v);
	};

	const handleUserNumber = (e) => {
		let v = e.target.value.replace(/[^\d.]/g, '');
		if ((v.match(/\./g) || []).length > 1) v = v.slice(0, v.lastIndexOf('.'));
		if (/^0\d/.test(v)) v = v.slice(1);
		setnoOFUsers(v);
	};

	const handleEventNumber = (e) => {
		let v = e.target.value.replace(/[^\d.]/g, '');
		if ((v.match(/\./g) || []).length > 1) v = v.slice(0, v.lastIndexOf('.'));
		if (/^0\d/.test(v)) v = v.slice(1);
		setnoOFEvents(v);
	};

	const validationSchema = yup.object({
		startDate: yup.string().nullable().required('Please Enter Start Date'),
		endDate: yup.string().nullable().required('Please Enter End Date'),
		noOFUsers: yup.string().required('Please Enter No of Users'),
		subscriptionModule: yup.array().min(1, 'Please Select at least one module'),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id || 0,
			startDate,
			endDate,
			noOFUsers,
			noOFEvents,
			noOfApprovers,
			value,
			subscriptionModule,
			isSubscriptionActive: true,
		},
		validationSchema,
		onSubmit: (values) => {
			setLoading(true);
			if (onLoadingChange) onLoadingChange(true);
			const data = {
				id: values.id,
				startDate: values.startDate,
				endDate: values.endDate,
				noOFUsers: values.noOFUsers,
				noOFEvents: values.noOFEvents || 0,
				noOfApprovers: values.noOfApprovers || 0,
				value: values.value || 0,
				subscriptionModule: values.subscriptionModule,
				isSubscriptionActive: values.isSubscriptionActive,
			};
			const isEdit = !!editSubscriptionId;
			const apiCall = isEdit
				? UpdateSubscription(data, selectedCustomerId, editSubscriptionId, atoken)
				: Subscription(data, selectedCustomerId, atoken);

			apiCall.then((res) => {
				setLoading(false);
				if (onLoadingChange) onLoadingChange(false);
				if (res) {
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: 'success' });
					dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					toast.success(isEdit ? 'Subscription updated successfully!' : 'Subscription added successfully!', { toastId: 'subscription_toast' });
					clearSubscriptionList();
					getSingleCustomer(selectedCustomerId, atoken).then(d => { if (d) setsubsdata(d?.subscriptions); });
					callbackstep(isEdit ? 'update' : 'add');
				} else {
					toast.error('Some Error Occurred. Please Contact Administrator', { toastId: 'subs_error' });
				}
			});
		},
	});

	const callbackSubscription = (row) => {
		setEditSubscriptionId(row.id || null);
		setnoOFUsers(row.noOFUsers || '');
		setnoOFEvents(row.noOFEvents || '');
		setnoOfApprovers(row.noOfApprovers || '');
		setValue(row.value || '');
		setStartDate(row.startDate ? new Date(row.startDate) : null);
		setEndDate(row.endDate ? new Date(row.endDate) : null);
		const modules = (row.subscriptionModule || []).map(m => ({
			customerId: selectedCustomerId,
			moduleId: m.moduleId,
			moduleName: m.moduleName,
		}));
		setSubModule(modules);
		setSubscriptionModule(modules);
	};

	const columnsSubscription = [
		{
			field: 'startDate', headerName: 'Start Date', flex: 1,
			renderCell: (params) => (
				<span>
					{params?.formattedValue ? formatDateViaTimeZone(params?.formattedValue, 'en-GB', formatoption) : 'NA'}
				</span>
			),
		},
		{
			field: 'endDate', headerName: 'End Date', flex: 1,
			renderCell: (params) => (
				<span>
					{params?.formattedValue ? formatDateViaTimeZone(params?.formattedValue, 'en-GB', formatoption) : 'NA'}
				</span>
			),
		},
		{ field: 'noOFUsers', headerName: 'License Users', flex: 1 },
		{
			field: 'subscriptionModule', headerName: 'Subscribed Module', flex: 4,
			renderCell: (params) => (
				<span>
					{params.value?.map((module, index) => (
						<Tooltip key={index} title={module.moduleName}>
							<span>{index > 0 ? ', ' : ''}{module.moduleName}</span>
						</Tooltip>
					))}
				</span>
			),
		},
		{
			field: 'action', headerName: 'Action', flex: 1,
			renderCell: (params) => (
				<Tooltip title="Edit">
					<button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => callbackSubscription(params.row)}>
						<HiPencilAlt style={{ fontSize: 11 }} />
					</button>
				</Tooltip>
			),
		},
	];

	return (
		<form id="subscription-form" onSubmit={formik.handleSubmit} autoComplete="off">
			<div className="row">

				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label">Subscription Start Date <span className="rfq-required-star">*</span></label>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<MobileDatePicker
							ref={resetSD}
							value={startDate}
							onChange={(e) => setStartDate(e)}
							slotProps={{
								textField: { variant: 'outlined', fullWidth: true, size: 'small' },
								actionBar: { actions: ['clear', 'cancel', 'accept'] },
							}}
							format="dd/MM/yyyy"
							minDate={new Date()}
						/>
					</LocalizationProvider>
					{formik.errors.startDate && formik.touched.startDate && (
						<div className="error error-red" style={{ fontSize: '12px' }}>{formik.errors.startDate}</div>
					)}
				</div>

				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label">Subscription End Date <span className="rfq-required-star">*</span></label>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<MobileDatePicker
							ref={resetSD}
							value={endDate}
							onChange={(e) => setEndDate(e)}
							slotProps={{
								textField: { variant: 'outlined', fullWidth: true, size: 'small' },
								actionBar: { actions: ['clear', 'cancel', 'accept'] },
							}}
							format="dd/MM/yyyy"
							minDate={new Date()}
						/>
					</LocalizationProvider>
					{formik.errors.endDate && formik.touched.endDate && (
						<div className="error error-red" style={{ fontSize: '12px' }}>{formik.errors.endDate}</div>
					)}
				</div>

				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="noOFUsers">License Users <span className="rfq-required-star">*</span></label>
					<TextFieldCell
						id="noOFUsers" name="noOFUsers"
						placeholder="" maxLength={10}
						value={noOFUsers} onChange={handleUserNumber}
					/>
					{formik.errors.noOFUsers && formik.touched.noOFUsers && (
						<div className="error error-red" style={{ fontSize: '12px' }}>{formik.errors.noOFUsers}</div>
					)}
				</div>

				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="noOfApprovers">License Approvers</label>
					<TextFieldCell
						id="noOfApprovers" name="noOfApprovers"
						placeholder="" maxLength={10}
						value={noOfApprovers} onChange={handleApproverForSubs}
					/>
				</div>

				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="noOFEvents">No. of Events</label>
					<TextFieldCell
						id="noOFEvents" name="noOFEvents"
						placeholder="" maxLength={10}
						value={noOFEvents} onChange={handleEventNumber}
					/>
				</div>

				<div className="col-12 col-md-4 mb-3">
					<label className="pe-field-label" htmlFor="subs-value">Value</label>
					<TextFieldCell
						id="subs-value" name="value"
						placeholder="" maxLength={20}
						value={value} onChange={handleValueForSubs}
					/>
				</div>

				<div className="col-12 mb-3">
					<label className="pe-field-label" htmlFor="subscriptionModule">Subscription Module <span className="rfq-required-star">*</span></label>
					<Autocomplete
						multiple
						id="subscriptionModule"
						options={subslist ?? []}
						getOptionLabel={(option) => option.menuName}
						value={getSubsModule(subModule)}
						onChange={handleChangeSubscription}
						filterSelectedOptions
						renderOption={(props, option) => (
							<Box component="li" {...props}>{option.menuName}</Box>
						)}
						renderInput={(params) => (
							<TextField {...params} variant="outlined" size="small" placeholder="" />
						)}
					/>
					{formik.errors.subscriptionModule && formik.touched.subscriptionModule && (
						<div className="error error-red" style={{ fontSize: '12px' }}>{formik.errors.subscriptionModule}</div>
					)}
				</div>

			</div>

			{subsdata?.length > 0 && (
				<>
					<hr style={{ margin: '0 0 12px 0' }} />
					<div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
						<PETable
							getRowId={(row) => row?.id}
							rows={subsdata.filter(row => {
								if (!searchText) return true;
								const q = searchText.toLowerCase();
								return (
									(row.noOFUsers?.toString() || '').includes(q) ||
									(row.subscriptionModule || []).some(m => m.moduleName?.toLowerCase().includes(q))
								);
							})}
							columns={columnsSubscription}
							rowHeight={40}
							autoHeight
							toolbar={
								<PETableToolbar
									searchText={searchText}
									onSearchChange={setSearchText}
									searchPlaceholder="Search subscriptions..."
									showFilter
									showColumns
									showDensity
									showExport
									filterColumns={[
										{ field: 'noOFUsers', label: 'License Users' },
										{ field: 'subscriptionModule', label: 'Subscribed Module' },
									]}
									columns={columnsSubscription}
									hiddenAlways={['action']}
								/>
							}
						/>
					</div>
				</>
			)}
		</form>
	);
};

export default SubscriptionSetup;
