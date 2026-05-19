import React, { useEffect, useState, useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import {
	Autocomplete,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Drawer,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	TextField,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { useFormik } from "formik";
import { useStateValue } from "../../../store";
import {
	HiOutlineLink,
	HiOutlineX,
	HiPencilAlt,
	HiPlusSm,
} from "react-icons/hi";
import { LocalFormatDate, formatDate } from "../../../utils/common/utility";
import AddDocumentCell from "./AddDocumentCell";
import {
	getDocumentList,
	updateDocumentLibrary,
} from "../../../utils/documentlibrary";
import { useRef } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getMenuMaster } from "../../../utils/commerciallibrary";
import { downloadFilesOnAzure } from "../../../utils/common";
import { BackButton } from "../../../utils/common/component";
import useResponsiveColumns from "../../../components/useResponsiveColumns";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";

const DocumentsLibraryList = () => {
	const [page, setPage] = useState(1);
	const handleChange = (event, value) => {
		setPage(value);
	};

	const [state, setState] = useState({
		opensidebar: false,
	});
	// const toggleDrawer = (anchor, open) => (event) => {
	// 	//;
	// 	if (open == false) {
	// 		seteditRecordData(null);
	// 	}
	// 	if (
	// 		event.type === "keydown" &&
	// 		(event.key === "Tab" || event.key === "Shift")
	// 	) {
	// 		return;
	// 	}
	// 	setState({ ...state, [anchor]: open });
	// };
	const toggleDrawer = (anchor, open) => (event) => {
	
		if (unsavedChanges) {
			setDocumentModalOpen(true); // Open confirmation dialog if there are unsaved changes
			return;
		}
		if (open === false) {
			seteditRecordData(null);
		}
		if (
			event.type === 'keydown' &&
			(event.key === 'Tab' || event.key === 'Shift')
		) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};
	const inputDate = new Date();
	let formattedDate = formatDate(inputDate);
	const [loading, setLoading] = useState(false);
	const [{ atoken, customerid }, dispatch] = useStateValue();
	const [editRecordData, seteditRecordData] = useState(null);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [recorddata, setRecorddata] = useState([]);
	const [unsavedChanges, setUnsavedChanges] = useState(false); 
	const [cancelReason, setCancelReason] = useState('');
	const [documentModalOpen, setDocumentModalOpen] = useState(false); 
	const handleDocumentModal = (confirm) => {
		if (confirm) {
			setState({ ...state, opensidebar: false });
			setUnsavedChanges(false); // Reset unsaved changes flag
		}
		setDocumentModalOpen(false); // Close the modal
	};


	const [eventtype, Seteventtype] = useState("");

	const [createdOn, setCreatedon] = useState(formattedDate);
	const callbackstep = useCallback(
		(data) => {
			setState({ ...state, right: false });
			seteditRecordData(null);
			pullDocumentLibList();
		},
		[page]
	);

	useEffect(() => {
		pullDocumentLibList();
		pullMenuMaster();
	}, [page]);

	const callback = useCallback((pass) => {
		console.log("callbackAddCus", pass);
	}, []);

	const callbackedit = useCallback((data) => {
		console.log("data to edit", data);
		seteditRecordData(data);
		setState({ ...state, opensidebar: true });
	}, []);

	const UpdateStageStatus = (data, id, atoken) => {
		if (id > 0) {
			updateDocumentLibrary(data, id, atoken).then((res) => {
				pullDocumentLibList();
			});
		}
	};

	const handleStatus = (values, isactive) => {
		console.log(values);

		if (isactive) {
			isactive = false;
		} else {
			isactive = true;
		} 
		
		var data = {
			id: values.id,
			customerid: values.customerId,
			eventtype: values.eventtype ? values.eventtype.split(",") : [],
			attachmentdesc: values?.attachmentdesc,
			attachment: values?.attachment,
			filepath: values?.filepath,
			required: values?.required,
			isactive: isactive,
		};

		UpdateStageStatus(data, values.id, atoken);
	};

	const pullDocumentLibList = () => {
		let data = {
			CustomerId: customerid,
			SortingColumn: "Id",
		};
		setLoading(true);
		
		getDocumentList(data, atoken).then((res) => {
			
			setGridloading(true);
			if (res != "" && res != undefined) {
				setRecorddata(res);
				setTotalRecords(res[0]?.totalrecords);
				setGridloading(false);
				setPageCount(Math.ceil(res[0]?.totalrecords / 15));
			}
			setLoading(false);
			setGridloading(false);
		});
	};

	const formik = useFormik({
		initialValues: {
			customerid: customerid,
			eventtype: "",
			attachmentdesc: "",
			required: true,
			isactive: true,
			createdOn: createdOn,
		},
		onSubmit: (values) => {
			getDocumentList(values, atoken).then((res) => {
				if (res != "") {
					setRecorddata(res);
				}
				setLoading(false);
			});
		},
	});

	const [gridloading, setGridloading] = useState(true);
	const columnWidth = useResponsiveColumns();
	const columns = [
		{
			field: "eventtype",
			headerName: "Event",
			renderCell: (params) => (
				<div>{getMenuItemName(params?.formattedValue)}</div>
			),
			width: columnWidth.libraryEntity,
			// width: 250,
		},
		{
			field: "attachmentdesc",
			headerName: "Attachment Description",
			renderCell: (params) => <div>{params?.formattedValue}</div>,
			width: columnWidth.libraryEntity,
			// width: 250,
		},
		{
			field: "filepath",
			headerName: "Attachment",
			width: columnWidth.isActive,
			// width: 250,
			renderCell: (params) => {
				console.log("Formatted Value:", params?.formattedValue);
				return params.formattedValue !== null &&
					params.formattedValue !== "" &&
					params.formattedValue !== "undefined" ? (
					<Chip
						icon={<HiOutlineLink />}
						size="small"
						color="primary"
						className="ps-1"
						// variant="outlined"
						label="Download"
					/>
				) : (
					""
				);
			},
		},
		{
			field: "required",
			headerName: "Required",
			width: columnWidth.valuetype,
			// width: 150,
			renderCell: (params) => (params?.formattedValue ? "Yes" : "No"),
		},
		{
			field: "isactive",
			headerName: "Status",
			width: columnWidth.stages ,
			renderCell: (params) => (
				<Switch
					checked={params.value}
					onChange={() => handleStatus(params?.row, params?.value)}
					inputProps={{ "aria-label": "controlled" }}
					classes={{
						thumb: "MuiSwitch-thumb",
						switchBase: "MuiSwitch-switchBase",
						checked: "Mui-checked",
					}}
				/>
			),
		},
		{
			field: "action",
			headerName: "Actions",
			width:0,
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
	const onClickDownload = (rows) => {
		if (rows.field === "filepath") {
			downloadFilesOnAzure(rows?.row?.filepath, rows?.row?.filepath);
		}
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
	const onchangeEventType = (event, newValue) => {
		Seteventtype(event.target.value);
	};
	const getMenuItemName = (MenuItemCode) => {
		
		const MenuItem = MenuMasterList.find(
			(data) => data?.menuIdentity === MenuItemCode
		);
		return MenuItem ? MenuItem.menuName : "";
	};

	const getCellClassName = (params) => {

		return params.colDef.field === "filepath" ? 'pointer-cursor' : '';
	};
	
	
	return (
		<>
			<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
				{/* Header with BackButton and Action Buttons */}
				<div className="d-flex justify-content-between align-items-center border-bottom mb-3">
					<div className="d-flex align-items-center">
						<BackButton title={<span className="page-heading">Documents Library</span>} />
					</div>
					
					{/* Action Buttons */}
					<div className="d-flex align-items-center gap-2">
						<Button
							variant="text"
							size="large"
							startIcon={<HiPlusSm />}
							className="text-capitalize blue-text font-normal"
							onClick={toggleDrawer("opensidebar", true)}
						>
							Add New
						</Button>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-grow-1 overflow-auto">
					<div className="p-3 pt-0">
						{gridloading ? (
							<GridSkeleton/>
						) : (
							<>
								<div style={{ height: '400px', width: '100%' }}>
									<DataGrid
										getRowId={getRowId}
										rows={recorddata}
										loading={gridloading}
										columns={columns}
										disableDensitySelector
										disableColumnMenu
										disableColumnSelector
										autoWidth={true}
										rowHeight={40}
										columnHeaderHeight={40}
										className="f13 bg-white data-grid-scrollable"
										disableRowSelectionOnClick
										getRowClassName={(params) =>
											params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
										}
										slots={{ toolbar: GridToolbar }}
										slotProps={{
											toolbar: {
												showQuickFilter: true,
											},
										}}
										onCellClick={onClickDownload}
										getCellClassName={getCellClassName}
									/>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			<React.Fragment key="top">
				<Drawer
					anchor="right"
					open={state["opensidebar"]}
					onClose={toggleDrawer("opensidebar", false)}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Add Document</div>
									<div>
										<IconButton
											onClick={toggleDrawer("opensidebar", false)}
											size="small"
											edge="start"
											sx={{ mr: 1 }}>
											<HiOutlineX className="f20 text-white" />
										</IconButton>
									</div>
								</div>
							</Box>
							<div className="h50px"></div>
							<Box sx={{ flexGrow: 1, p: 2 }}>
								<AddDocumentCell
									callbackstep={callbackstep}
									editRecordData={editRecordData}
									seteditRecordData={seteditRecordData}
									setUnsavedChanges={setUnsavedChanges}
								/>
							</Box>
						</div>
					</Box>
				</Drawer>
				<Dialog open={documentModalOpen} onClose={() => handleDocumentModal(false)}>
				<DialogTitle>{"Are you sure?"}</DialogTitle>
				<DialogContent style={{ minWidth: "300px" }}>
					<DialogContentText>
						Do you want to close this document? Unsaved changes will be lost.
					</DialogContentText>
					
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleDocumentModal(false)}>No</Button>
					<Button onClick={() => handleDocumentModal(true)} autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
			</React.Fragment>
		</>
	);
};

export default DocumentsLibraryList;
