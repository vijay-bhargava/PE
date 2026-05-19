import React, { useState, useCallback, useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import {
	Autocomplete,
	Box,
	Button,
	Drawer,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	TextField,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import TextFieldCell from "../../BaseCells/TextFieldCell";

import { useFormik } from "formik";
import { actionTypes, useStateValue } from "../../../store";

import Pagination from "@mui/material/Pagination";
import NoRecordCell from "../../../components/NoRecordCell";
import {
	getCommercialList,
	getMenuMaster,
} from "../../../utils/commerciallibrary";
import { useRef } from "react";
import { LocalFormatDate, formatDate } from "../../../utils/common/utility";
import { LibraryFindAll } from "../../../utils/questionlibrary";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddUpdateGrade from "./AddUpdateGrade";
import { toast } from "react-toastify";
import { MdDomainVerification } from "react-icons/md";
import { ApiClient, api } from "../../../Apiclient";
import CryptoJS from "crypto-js";
import { useCookies } from "react-cookie";
import { isTokenExpired } from "../../../utils/common";
import { Modal } from "react-bootstrap";
import { BackButton } from "../../../utils/common/component";
import useResponsiveColumns from "../../../components/useResponsiveColumns";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";

const GradeList = (props) => {
	const [{ atoken, rtoken, customerid, customersuffix }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);

	const updateToken = async () => {
		const res = await isTokenExpired(atoken, rtoken, customerid);
		if (res) {
			if (res?.accessToken != "") {
				dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken });
				var userAccessToken = CryptoJS.AES.encrypt(
					`${res.accessToken}`,
					process.env.REACT_APP_TOKEN_INCRYPT_KEY
				).toString();
				setCookie("patkn", userAccessToken, { path: "/", maxAge: 86400 });
			}
			if (res?.refreshToken != "") {
				dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken });
				var userRefreshToken = CryptoJS.AES.encrypt(
					`${res.refreshToken}`,
					process.env.REACT_APP_TOKEN_INCRYPT_KEY
				).toString();
				setCookie("prtkn", userRefreshToken, { path: "/", maxAge: 86400 });
			}
			return true;
		} else {
			return false;
		}
	};

	//#api call
	const pullGradeList = async () => {
		const isTokenExpired = await updateToken();
		const res = await apiClient.get(
			`/api/GradeMaster/Find?CustomerId=${customerid}`,
			atoken
		);
		
 
		if (res) {
			setFetchGradeList(res);
		}
		setGridloading(false);
	};

	const [page, setPage] = useState(1);
	const handleChange = (event, value) => {
		setPage(value);
	};
	const [modal, setModal] = useState(false);
	const [state, setState] = useState({
		opensidebar: false,
	});

	const CloseModal = () => {
		setModal(false);
		seteditRecordData(null);
	};

	const OpenModal = (event) => {
		if (!state.opensidebar) {
			seteditRecordData(null);
		}

		if (
			event &&
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}

		setState({ ...state, opensidebar: true });
		setModal(true);
	};
	
	const [editRecordData, seteditRecordData] = useState(null);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [recorddata, setRecorddata] = useState([]);
	const [show, setShow] = useState(false);

	const [id, setId] = useState(1);
	const [gradeName, setGradeName] = useState("");
	const [fromScore, setFromScore] = useState(0);
	const [toScore, setToScore] = useState(0);
	const [loading, setLoading] = useState(false);
	const [isActive, setIsActive] = useState(true);

	const callbackstep = useCallback(
		(data) => {
			setModal(false);
			setState({ ...state, right: false });
			seteditRecordData(null);
			pullGradeList();
		},
		[page]
	);

	useEffect(() => {
		pullGradeList();
	}, [page]);

	const callback = useCallback((pass) => {
		console.log("callbackAddGrade", pass);
	}, []);

	const callbackedit = useCallback((data) => {
		console.log("data to edit", data);
		seteditRecordData(data);
		setModal(true);
	}, []);

	const [FetchGradeList, setFetchGradeList] = useState([]);
	const [gridloading, setGridloading] = useState(true);
	const columnWidth = useResponsiveColumns();
	
	const columns = [
		{
			field: "grade",
			headerName: "Grade Name",
			width: 250,
		},
		{
			field: "fromScore",
			headerName: "From Score",
			width: 150,
		},
		{
			field: "toScore",
			headerName: "To Score",
			width: 150,
		},
		{
			field: "action",
			headerName: "Action",
			width: 150,
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

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<div className="col-12 col-md-8 col-lg-12 p-0 ">
						<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
							{/* Header with BackButton and Action Buttons */}
							<div className="d-flex justify-content-between align-items-center border-bottom mb-3">
								<div className="d-flex align-items-center">
									{!props.isModal && (
										<BackButton title={<span className="page-heading">Manage Grade</span>} />
									)}
								</div>
								
								{/* Action Buttons */}
								<div className="d-flex align-items-center gap-2">
									<div className="actionpin-wrap">
										<Button
											variant="text"
											size="large"
											startIcon={<HiPlusSm />}
											className="text-capitalize blue-text font-normal"
											onClick={OpenModal}
										>
											Add New
										</Button>
									</div>
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
													rows={FetchGradeList}
													loading={gridloading}
													columns={columns}
													disableDensitySelector
													disableColumnMenu
													disableColumnSelector
													columnFooterHeight={35}
													getRowClassName={(params) =>
														params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
													}
													rowHeight={35}
													columnHeaderHeight={35}
													className="f13 bg-white data-grid-scrollable" 
													disableRowSelectionOnClick
													slots={{ toolbar: GridToolbar }}
													slotProps={{
														toolbar: {
															showQuickFilter: true,
														},
													}}
												/>
											</div>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Modal size="md"
				show={modal}
				backdrop="static"
				keyboard={false}
				className="zindex10002"
				backdropClassName="zindex10002"
				centered
				contentClassName="border-0 rounded custom-modal-content"
				onHide={() => CloseModal()}
				>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title>
						<div className="d-flex align-items-center f14 text-white">
							Grade 
						</div>
					</Modal.Title>
					<IconButton
						onClick={() => CloseModal()} 
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body>
					<AddUpdateGrade callbackstep={callbackstep} editRecordData={editRecordData} seteditRecordData={seteditRecordData}/>
				</Modal.Body>
			</Modal>
		</>
	);
};

export default GradeList;