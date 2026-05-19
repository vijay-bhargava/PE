import React, { useState, useEffect } from "react";
import {
	Button,
	TextField,
	Box,
	Autocomplete,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	IconButton,
	InputAdornment,
	Typography,
	Checkbox,
	ListItemText,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import * as yup from "yup";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
	HiOutlinePencilAlt,
	HiOutlineTrash,
	HiOutlineX,
	HiPencilAlt,
} from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFormik } from "formik";
import { actionTypes, useStateValue } from "../../../store";
import {
	AddLibraryEntity,
	LibraryFindAll,
	UpdateLibrary,
	
	getPurchaseGrp,
} from "../../../utils/questionlibrary";
import { Modal } from "react-bootstrap";
import {
	OrgGroupMasterList,
	getPurchaseOrgList,
} from "../../../utils/commerciallibrary";

import PurchaseOrgGrp from "../../../utils/common/PurchaseOrgGrp";
import { getMenuMaster } from "../../../utils/common/utility";
import PurchaseOrg from "../../../utils/common/PurchaseOrg";

const AddComLibrary = (props) => {
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
	const [purchaseOrgGrpModal, setPurchaseOrgGrpModal] = useState(false);
	const ClosePurcgaseOrgModal = () => setPurchaseOrgModal(false);
	const ClosePurcgaseOrgGrpModal = () => setPurchaseOrgGrpModal(false);
	const [purchaseOrgModal, setPurchaseOrgModal] = useState(false);
	const [LibraryList, setLibraryList] = useState([]);
	const [isactive, setIsactive] = useState(true);
	const [libraryentity, setlibraryentity] = useState("");
	const [libraryType, setlibraryType] = useState(props.libraryType);
	const [organisationname, setorganisationname] = useState("");
	const [orgGroups, setorggroups] = useState([]);
	const [usergrpId, setusergrpId] = useState([]);
	const [editRecordData, seteditRecordData] = useState(null);
	const [eventType, seteventType] = useState([]);
	const [pageCount, setPageCount] = useState(1);
	const [PurchOrgId, setPurchOrgId] = useState(0);
	const [totalRecords, setTotalRecords] = useState("");
	const [isEditMode, setIsEditMode] = useState(false);

	const [page, setPage] = useState(1);
	const handleChange = (event, value) => {
		setPage(value);
	};
	useEffect(() => {
		pullLibraryList();
		pullMenuMaster();
	}, [page]);

	useEffect(() => {
		PullPurchaseOrgAll();
	}, []);

	const showLib = () => {
		props.selectedLib();
	};
	const [MenuMasterList, setMenuMasterList] = useState([]);
	const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
		};

		getMenuMaster(data, atoken).then((res) => {
			setMenuMasterList(res);
		});
	};

	const onchangeEventType = (event) => {
		const selectedValues = Array.isArray(event.target.value)
			? event.target.value
			: [event.target.value];

		seteventType(selectedValues);
	};
	const pullLibraryList = () => {
		var data = {
		
			CustomerId: customerid,
			LibraryType: libraryType,
			SortingColumn: "Id",
		};

		LibraryFindAll(data, atoken).then((res) => {
			setGridloading(true);
			//console.log(res);
			if (res != "" && res != undefined) {
				setLibraryList(res);
				setTotalRecords(res[0]?.totalrecords);
				setPageCount(Math.ceil(res[0]?.totalrecords / 10));
			} else {
				setLibraryList([]);
				setTotalRecords(0);
				setPageCount(1);
			}
			
			setGridloading(false);
		});
	};
	const validationSchema = yup.object({
		libraryentity: yup.string().required("Please Enter Library Name"),
		eventType: yup.array().of(yup.string()).required("Event type is required"),
	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
			customerid: customerid,
			libraryentity: editRecordData?.libraryEntity
				? `${editRecordData?.libraryEntity}`
				: libraryentity,
			libraryType: editRecordData?.libraryType
				? `${editRecordData?.libraryType}`
				: libraryType,
		
			eventType: editRecordData?.eventType
				? editRecordData?.eventType.split(",")
				: [], // Convert string to array
			organisationname: organisationname,
			orgGroups: orgGroups,
			organisationid: PurchOrgId,
			// purchOrgId: 0,
			isactive: editRecordData?.isActive ? editRecordData?.isActive : true,
			createdby: 1,
			modifiedby: 1,
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {
			var data = {
				id: editRecordData?.id ? `${editRecordData?.id}` : 0,
				customerid: customerid,
				organisationid: PurchOrgId,
				eventType: eventType,
				libraryType: libraryType,
				libraryentity: libraryentity,
				organisationname: organisationname,
				orgGroups: orgGroups,
				isactive: isactive,
				createdby: 1,
			};
			setLoading(true);
			console.log("values", values);

			// api call to save data
			if (editRecordData?.id > 0) {
				UpdateLibrary(data, editRecordData?.id, atoken).then((res) => {
					setLoading(false);
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					// callbackstep("update");
					pullLibraryList();
					showLib();
					clearfilledDocument();
					toast.success("Library updated successfully!", {
						toastId: "libentity"
					});
					return true;
				});
			} else {
				AddLibraryEntity(data, atoken).then((res) => {
					
					setLoading(false);
					//pullLibraryList();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					pullLibraryList();
					showLib();
					clearfilledDocument();
					toast.success("Library added successfully!", {
						toastId: "LibraryaddedSuccess",
					});
					return true;
				});
			}
		},
	});

	const clearfilledDocument = () => {
		seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setPurchOrgId(0);
		seteventType([]);
		setorganisationname("");
		// setIsactive(0);
		setlibraryentity("");
		PullPurchaseGroupAll("");
		setorggroups([]);
		setusergrpId(0);
	};

	const [purchaseAllList, setPurchaseAllList] = useState([]);
	const PullPurchaseOrgAll = () => {
		var data = {
			CustomerId: customerid,
			IsActive: 'true'
		};
		getPurchaseOrgList(data, atoken).then((resp) => {

			setPurchaseAllList(resp);
		});
	};
	const handlepurchaseorgList = (array) => {
		setPurchaseAllList(array);
	};
	const getOrganisationDefault = (orgId) => {
		if (orgId && orgId > 0) {
			const selectedOrganization = purchaseAllList.find(
				(data) => data.id === orgId
			);
			return selectedOrganization || null;
		}
		return null;
	};

	const getGroupDefault = (arraylist) => {
		
		let arrayNew = [];
		if (arraylist?.length > 0) {
			purchaseGroupAllList?.map((data) => {
				arraylist?.map((array) => {
					if (data.id == array.orgGroupId) {
						arrayNew.push(data);
					}
				});
			});
		}
		return arrayNew;
	};

	const callbackedit = useCallback((data) => {
		// Set the state values
		setPurchOrgId(data.organisationId);
		setorganisationname(data.organisationName || "");
		setIsactive(data.isActive);
		seteditRecordData(data);
		setlibraryentity(data.libraryEntity);
		seteventType(data?.eventType ? data?.eventType.split(",") : []);
		PullPurchaseGroupAll(data.organisationId);
	
		const userOrgGroupValue = data?.orgGroups ? data?.orgGroups : [];
       setusergrpId(userOrgGroupValue);
	   setIsEditMode(true); 
		setState({ ...state, addnewfield: true });
	}, []);

	const onchangePurchOrg = (event, newvalue) => {
		if (newvalue) {
			setPurchOrgId(newvalue.id);
			setorganisationname(newvalue.orgName || "");
			PullPurchaseGroupAll(newvalue.id);
		} else {
			setPurchOrgId("");
			setorganisationname("");
			setorggroups([]);
			setPurchaseGroupAllList([]);
		}
	};

	const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
	const PullPurchaseGroupAll = (orgMstId) => {
		var data = {
			CustomerId: customerid,
			OrgMstId: orgMstId, 
			IsActive: 'true'
		};
		

		setLoading(true);
		OrgGroupMasterList(data, atoken).then((res) => {
			//;
			// console.log('orggroup ', res);
			if (res != "" && res != undefined) {
				//;
				setPurchaseGroupAllList(res);
				let records =
					res[0]?.totalrecords != undefined ? res[0]?.totalrecords : 10;
				setTotalRecords(records);
				setPageCount(Math.ceil(records / 10));
			}
			setLoading(false);
		});
	};

	const onchangePurchaseGrp = (event, array) => {
		let arrayNew = [];

		if (array?.length > 0) {
			array?.map((index) => {
				purchaseGroupAllList.map((data) => {
					if (data.id == index?.id) {
						if (data) arrayNew.push(data);
					}
				});
			});
		}
		return arrayNew;
	};

	const [state, setState] = useState({
		right: false,
		viewTicketSidebar: false,
		rightLog: false,
	});

	const [gridloading, setGridloading] = useState(true);
	const columns = [
		{
			field: "libraryEntity",
			headerName: "Library ",
			width: 150,
		},
		{
			field: "eventType",
			headerName: "Event",
			width: 50,
		},
		{
			field: "organisationName",
			headerName: "Organization",
			width: 100,
		},

		{
			field: "isActive",
			headerName: "Status",
			width: 90,
			renderCell: (params) => (params.formattedValue ? "Active" : "InActive"),
		},
		{
			field: "action",
			headerName: "Action",
			width: 60,
			renderCell: (params) => (
				<IconButton
					size="small"
					className="bg-white"
					onClick={() => callbackedit(params?.row)}
				>
					<HiPencilAlt className="f17 text-primary" />
				</IconButton>
			),
		},
	];
	const getRowId = (row) => {
		return row.id;
	};
	const handleOpenPurchaseOrgModal = () => {
		setPurchaseOrgModal(true);
	};

	const handleClosePurchaseOrgModal = () => {
		setPurchaseOrgModal(false);
	};

	const handleChangegroup = (event, newValues) => {
		if (newValues) {
			const updatedGroups = newValues?.map((newValue) => ({
				id: 0,
				orgLibraryId: editRecordData?.id ? editRecordData?.id : 0,
				orgGroupId: newValue?.id,
				orgGroupName: newValue?.groupName,
			}));

			setorggroups(updatedGroups);
			setusergrpId(updatedGroups);
			// Check if "Add New" option is selected
			if (newValues.some((option) => option.id === "new")) {
				setPurchaseOrgGrpModal(true); // Open modal for adding new group
			}
		} else {
			console.error("New value is undefined or null.");
		}
	};
	return (
		<>
			<div className="d-flex flex-row">
				<form
					onSubmit={formik.handleSubmit}
					autoComplete="off"
					className="col-12 col-md-8 col-lg-4 p-0"
				>
					<div className="d-flex flex-column min-vh-50">
						<div className="col-12 col-md-12 mb-3 focus">
							<FormControl fullWidth>
								<TextField
									id="libraryentity"
									name="libraryentity"
									label="Library"
									placeholder=""
									variant="outlined"
									size="small"
									value={libraryentity}
									onChange={(e) => {
										setlibraryentity(e?.target?.value);
									}}
									inputProps={{ maxLength: 100 }}
									InputProps={{
										endAdornment: libraryentity && (
										  <InputAdornment position="end">
											<Typography variant="body2" color="textSecondary">
											  {libraryentity?.length}/100
											</Typography>
										  </InputAdornment>
										),
									  }}
								/>
								{formik?.errors?.libraryentity &&
									formik?.touched?.libraryentity && (
										<div
											className="error error-red"
											style={{ fontSize: "9px" }}
										>
											{formik?.errors?.libraryentity}
										</div>
									)}
							</FormControl>
						</div>
			
	<div className="col-12 col-md-12 mb-3">
  <FormControl fullWidth>
    <InputLabel id="eventType">Event Type*</InputLabel>
    <Select
      labelId="eventType"
      InputLabelProps={{
        shrink: true,
      }}
      variant="outlined"
      size="small"
      id="eventType"
      name="eventType"
     // multiple
	  multiple={!isEditMode}
      value={eventType}
      label="Select Event"
      onChange={(event, newvalue) => {
        onchangeEventType(event, newvalue);
      }}
      error={formik.touched.eventType && Boolean(formik.errors.eventType)}
      helperText={formik.touched.eventType && formik.errors.eventType}
      renderValue={(selected) => {
        // Only show the selected values without checkboxes
        return selected.length === 0 ? 'Select Event' : selected.join(', ');
      }}
    >
      {MenuMasterList?.map((option, i) => (
        <MenuItem key={i} value={option?.menuIdentity}>
          <Checkbox checked={eventType.indexOf(option?.menuIdentity) > -1} />
          <ListItemText primary={option?.menuName} />
        </MenuItem>
      ))}
      {/* New Option Menu Item */}
      <MenuItem
        value={"new"}
        className="bggray"
        style={{
          color: "blue",
          fontSize: "13px",
          fontStyle: "italic",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
       
      </MenuItem>
    </Select>
    {formik.errors.eventType && formik.touched.eventType && (
      <div className="error error-red" style={{ fontSize: "9px" }}>
        {formik.errors.eventType}
      </div>
    )}
  </FormControl>
</div>

						<div className="d-flex align-items-center w-100 mb-3">
							<div className="flex-grow-1">
								<div className="row">
									<div className="col-12 mt-0 mb-3">
										<Autocomplete
										    size="small"
											id="purchaseOrgId"
											name="purchaseOrgId"
											className=" f14"
											options={[
												...purchaseAllList,
												{ id: "new", orgName: "Add New" },
											]}
											value={getOrganisationDefault(PurchOrgId)}
											getOptionLabel={(option) => option.orgName}
											onChange={(event, newvalue) => {
												if (newvalue?.id === "new") {
													handleOpenPurchaseOrgModal();
												} else {
													onchangePurchOrg(event, newvalue);
												}
											}}
											renderOption={(props, option) => (
												<Box
													component="li"
													{...props}
													style={
														option.id === "new"
															? {
																	fontStyle: "italic",
																	color: "blue",
																	cursor: "pointer",
																	textDecoration: "underline",
															  }
															: {}
													}
												>
													{option?.orgName}
												</Box>
											)}
											renderInput={(params) => (
												<TextField
													variant="outlined"
													size="small"
													{...params}
													label="Organization"
												/>
											)}
										/>
									</div>
									<Autocomplete
										multiple
										id="purchaseGrpId"
										className=" f14"
										sx={{ width: "100%" }}
										options={[
											...purchaseGroupAllList,
											{ id: "new", groupName: "Add New" },
										]}
										getOptionLabel={(option) => option.groupName}
										value={getGroupDefault(usergrpId)}
										onChange={handleChangegroup}
										filterSelectedOptions
										renderOption={(props, option) => (
											<Box
												component="li"
												{...props}
												style={
													option.id === "new"
														? {
																fontStyle: "italic",
																color: "blue",
																cursor: "pointer",
																textDecoration: "underline",
														  }
														: {}
												}
											>
												{option.groupName}
											</Box>
										)}
										renderInput={(params, data) => (
											<TextField
												{...params}
												variant="outlined"
												size="small"
												placeholder=""
												label="Group Name"
											/>
										)}
									/>
								</div>
							</div>
						</div>
						<div className="col-12 mb-3">
							<FormControl className="form-control" fullWidth>
								<InputLabel id="Status">Status</InputLabel>
								<Select
									labelId="Status"
									InputLabelProps={{
										shrink: true,
									}}
									variant="outlined"
									size="small"
									id="isactive"
									name="isactive"
									value={isactive}
									defaultValue={isactive}
									label="Status"
									onChange={(e) => {
										setIsactive(e?.target?.value);
									}}
								>
									<MenuItem value={true}>Active</MenuItem>
									<MenuItem value={false}>InActive</MenuItem>
								</Select>
							</FormControl>
						</div>
						<div className="col-12 text-end">
							{!loading ? (
								<>
									<Button
										color="primary"
										variant="outlined"
										size="small"
										onClick={clearfilledDocument}
									>
										Reset
									</Button>

									<span style={{ margin: "0 5px" }}></span>
									<Button
										color="success"
										variant="outlined"
										size="small"
										type="submit"
										disabled={eventType?.length === 0}
									>
										Submit
									</Button>
								</>
							) : (
								<LoadingButton className="" loading variant="contained">
									Submit ...
								</LoadingButton>
							)}
							{/* {!loading ? (
                <Button
                  color="success"
                  variant="outlined"
                  size="small"
                  type="submit"
                >
                  Submit
                </Button>
                
              ) : (
                <LoadingButton className="" loading variant="contained">
                  Submit ...
                </LoadingButton>
              )} */}
						</div>
					</div>

					<Modal
						size="lg"
						show={purchaseOrgModal}
						backdrop="static"
						keyboard={false}
						value={"Add NEW CATEGORY"}
						className="zindex1280"
						backdropClassName="zindex1280"
						centered
						contentClassName="border-0"
						onHide={() => ClosePurcgaseOrgModal()}
					>
						<Modal.Header className="pt-2 pb-2 bgheaderCards">
							<Modal.Title id="modal-heading">
								<div className="d-flex align-items-center f14 text-white">
									ADD Purchase Organization
								</div>
							</Modal.Title>
							<IconButton
								onClick={() => ClosePurcgaseOrgModal()}
								size="small"
								edge="start"
							>
								<HiOutlineX className="f20 text-white" />
							</IconButton>
						</Modal.Header>
						<Modal.Body className="p-0">
							<div className="p-3">
								<PurchaseOrg isModal={true} handlepurchaseorgList={handlepurchaseorgList} />
							</div>
						</Modal.Body>
					</Modal>

					<Modal
						size="lg"
						show={purchaseOrgGrpModal}
						backdrop="static"
						keyboard={false}
						value={"Add NEW CATEGORY"}
						className="zindex1280"
						backdropClassName="zindex1280"
						centered
						contentClassName="border-0"
						onHide={() => ClosePurcgaseOrgGrpModal()}
					>
						<Modal.Header className="pt-2 pb-2 bgheaderCards">
							<Modal.Title id="modal-heading">
								<div className="d-flex align-items-center f14 text-white">
									ADD Purchase Group
								</div>
							</Modal.Title>
							<IconButton
								onClick={() => ClosePurcgaseOrgGrpModal()}
								size="small"
								edge="start"
							>
								<HiOutlineX className="f20 text-white" />
							</IconButton>
						</Modal.Header>
						<Modal.Body className="p-0">
							<div className="p-3">
								<PurchaseOrgGrp />
							</div>
						</Modal.Body>
					</Modal>
				</form>

				<div className="col-12 col-md-8 col-lg-8 p-0 ms-4 border-start">
					<div className="d-flex flex-column min-vh-50">
						<div className="flex-grow-1 p-2">
							<div className="container-fluid">
								<div className="row">
									<div className="col-12">
										<DataGrid
											getRowId={getRowId}
											rows={LibraryList}
											loading={gridloading}
											columns={columns}
											style={{height:"500px"}}
											rowHeight={40}
											columnHeaderHeight={40}
											className="f13 border-0 "
											disableRowSelectionOnClick
											slots={{ toolbar: GridToolbar }}
											slotProps={{
												toolbar: {
													showQuickFilter: true,
												},
											}}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AddComLibrary;
