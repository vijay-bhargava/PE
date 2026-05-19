import React, { useState, useCallback, useRef } from "react";
import ExcelJS from "exceljs";
import { LoadingButton } from "@mui/lab";
import * as Yup from "yup";
import {
	Autocomplete,
	Box,
	Button,
	Checkbox,
	Chip,
	Divider,
	Drawer,
	FormControl,
	FormControlLabel,
	FormGroup,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	Tab,
	Tabs,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
	HiChevronLeft,
	HiChevronRight,
	HiFolderRemove,
	HiMinus,
	HiOutlineArrowRight,
	HiOutlineCheck,
	HiOutlineDotsHorizontal,
	HiOutlineDotsVertical,
	HiOutlineExternalLink,
	HiOutlineTrash,
	HiOutlineUserGroup,
	HiOutlineUserRemove,
	HiOutlineX,
	HiPlusSm,
	HiUserAdd,
	HiUserGroup,
	HiViewGridAdd,
	HiOutlineUpload
} from "react-icons/hi";
import { FaBackward, FaRegFileExcel } from "react-icons/fa";
import FilterListIcon from '@mui/icons-material/FilterList';
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ResultListCell from "./ResultListCell";
import Pagination from "@mui/material/Pagination";
import { Modal } from "react-bootstrap";
import { Form } from "react-bootstrap";

import { useFormik } from "formik";
import NoRecordCell from "../../../components/NoRecordCell";
import { useEffect } from "react";
import { useCookies } from "react-cookie";

import {
	FindParticipantAll,
	VendorInvite,
	bulkregister,
	getInvitedvendor,
} from "../../../utils/manageParticipants/index";
import { Link } from "react-router-dom";

import {
	DataGrid,
	GridToolbar,
	GridToolbarColumnsButton,
	GridToolbarContainer,
	GridToolbarDensitySelector,
	GridToolbarFilterButton,
	GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Dropdown } from "react-bootstrap";
import { MenuButton } from "@mui/base/MenuButton";
import { Menu } from "@mui/base/Menu";
import zIndex from "@mui/material/styles/zIndex";
import ParticipantsCompanyDetails from "./ParticipantsCompanyDetails";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
	checkArray,
	findObjByValueFromArray,
	findObjListByValueFromArray,
	getPayloadWithStage,
	getRefreshToken,
	handleFileUpload,
	isTokenExpired,
	pullMessageCount,
	toastoption,
	validateEmails,
} from "../../../utils/common";
import { actionTypes, useStateValue } from "../../../store";
import { StageFindAll } from "../../../utils/stagemaster";
import MemoizedUploadButton, {
	BackButton,
} from "../../../utils/common/component";
import {
	buildQueryParams,
	downloadSample,
	formatDateViaLocale,
	formatDateViaTimeZone,
	formatoption,
} from "../../../utils/common/utility";
import ApprovalBox from "../../BaseCells/ApprovalBox";
import Filtersuppliersidebar from "../../../utils/manageParticipants/filtersuppliersidebar";
import CryptoJS from "crypto-js";
import { ApiClient, api } from "../../../Apiclient";
import NotFoundPage from "../../../components/NotAllowed";
import { Delete, Fullscreen, PushPinOutlined, SearchOutlined } from "@mui/icons-material";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import sq from "date-fns/esm/locale/sq/index.js";
import SQInvitationAll from "../../../components/SQInvitationAll";

// import ResultListCell from './ResultListCell';
const ManageParticipants = ({ claimType }) => {
	//#apiinterceptor to handle token expiry
	const [{ atoken, rtoken, customerid,customersuffix, roleClaims,userDetail ,eventType,eventId}, dispatch] =
		useStateValue();
	const apiClient = new ApiClient(customersuffix);
	const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
	const [cookies] = useCookies(["patkn", "prtkn"]);
	const [isreadListaccessLevel, SetIsListReadAccessLevel] = useState(true);
	const [iscreateListaccessLevel, SetIsCreateReadAccessLevel] = useState(true);
	const fileInputRef = useRef(null);
	useEffect(() => {
    
		  if (userDetail  && atoken)
		    if(userDetail?.roleId){
		      getRoles()
		    }
        }, [userDetail, atoken])

		const getRoles = async () => {
			  const dataR = {
			    roleId: parseInt(userDetail?.roleId),
				featureName: "Supplier Qualification",
				claimType: "List",
			  }
			  
			  const queryParams = buildQueryParams(dataR)
			  const res = await apiClient.getres(`/api/auth/UserRoleClaim?${queryParams}`, atoken)
			  if (res) {
			    const data = res?.data
			    dispatch({ type: actionTypes.SET_RoleClaims, value: data });
			  }
			  const accessLevels = res?.data.map(item => {
				
				if((item.claimType==='List') && (item.claimValue === 'Read') && (item.accessLevel === 'None')) 
					{
                    SetIsListReadAccessLevel(false);
				}
				if((item.claimType==='List') && (item.claimValue === 'Create') && (item.accessLevel === 'None')) 
					{
                    SetIsCreateReadAccessLevel(false);
				}

				
			  }).filter(item => item !== null); // Filter out null values
			}





	const [accessLevel, setAccessLevel] = useState("");
	useEffect(() => {
		 
		if (roleClaims && roleClaims.length > 0) {
			const obj = findObjListByValueFromArray(
			roleClaims,
			claimType,
			`claimType`,
			`QR`
		);
		obj ? setAccessLevel(obj) : setAccessLevel("");
		}
		
	}, [roleClaims]);
	const [idFromURL, setIdFromURL] = useState(null);
	const { pageSlug } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();
	useEffect(() => {
		const params = new URLSearchParams(searchParams);
	
		const newIdFromURL = pageSlug;
		//#eventid and eventtype
		dispatch({ type: actionTypes.SET_EVENTID, value: newIdFromURL ?? 0 });
		dispatch({ type: actionTypes.SET_EVENTTYPE, value: "QR" });

		setIdFromURL(newIdFromURL);
	
	}, [searchParams]);
	
	// Note: pullMessageCount now handled automatically by MessageCell component on location change
	// useEffect(() => {
	// 	if (userDetail?.id && eventType && eventId) {
	// 		pullMessageCount({
	// 			UserId: userDetail.id,
	// 			EventType: eventType,
	// 			EventId: eventId,
	// 			IsVenderYN :"N",
	// 			atoken,
	// 			dispatch
	// 		});
	// 	}
	// }, [userDetail, eventType]);
	
	useEffect(()=>{
		
		 const data = queryParams.get("CommId")?.trim();
		 if(data){
		   dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
		 }
	   },[])
	useEffect(() => {
		// const pullMessageList = async () => {
		
		// 			var data = {
		// 			CustomerId: customerid,
		// 			SortingColumn: "Id",
		// 			CommDetails_CommParticipantUser_UserId: userDetail?.id,
		// 				// SortingColumn: "Id",
		// 				// CustomerId: customerid,
		// 				EventType: "QR",
		// 				// EventId: pageSlug,
		// 				// UserId:userDetail?.id
		// 			};
		// 			const queryParams = buildQueryParams(data)
		// 			const res = await apiClient.getres(`api/Communication/FindByCommId?${queryParams}`, atoken)
		
		// 			if (res) {
		// 				const data = res?.data?.result ?? []
		
		// 				dispatch({ type: actionTypes.SET_Notificationlist, value: data });
		// 			}
		
		
		// 		}
		// pullMessageList() // Removed automatic call - now triggered only on bell icon click
	 
	}, []);
	// 	const pullMessageList =async () => {
	// 		var data = {
	// 			CustomerId: customerid,
	// 			EventType: "QR"
	// 		};
	// 		const queryParams=buildQueryParams(data)
	// 		const res= await apiClient.getres(`api/Communication/Find?${queryParams}`,atoken)
			
	// 		if(res){
	// 			const data =res?.data ?? []
				
	// 			dispatch({ type: actionTypes.SET_Notificationlist, value: data });
	// 		}
	
			
	// 	}
	// 	pullMessageList()

	// }, []);
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const updateToken = async () => {
		const res = await isTokenExpired(atoken, rtoken, customerid);
		if (res) {
			if (res?.accessToken != "") {
				dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken });
				var userAccessToken = CryptoJS.AES.encrypt(
					`${res.accessToken}`,
					process.env.REACT_APP_TOKEN_INCRYPT_KEY
				)?.toString();
				setCookie("patkn", userAccessToken, { path: "/", maxAge: 86400 });
			}
			if (res?.refreshToken != "") {
				dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken });
				var userRefreshToken = CryptoJS.AES.encrypt(
					`${res.refreshToken}`,
					process.env.REACT_APP_TOKEN_INCRYPT_KEY
				)?.toString();
				setCookie("prtkn", userRefreshToken, { path: "/", maxAge: 86400 });
			}
			return true;
		} else {
			return false;
		}
	};
		//#useeffecthooks
	// Pagination state for Registered tab (existing)
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
    const [tabvalue, setTabValue] = useState(1);
	const [searchModeRegistered, setSearchModeRegistered] = useState(false); // Search mode for Registered tab
	const [quickFilterRegistered, setQuickFilterRegistered] = useState(''); // Search query for Registered tab
	const [debouncedQuickFilterRegistered, setDebouncedQuickFilterRegistered] = useState('');
	const [registeredSearchDataLoaded, setRegisteredSearchDataLoaded] = useState(false);
	
	// Pagination state for Invited tab
	const [invitedPage, setInvitedPage] = useState(1);
	const [searchModeInvited, setSearchModeInvited] = useState(false); // Search mode for Invited tab
	const [quickFilterInvited, setQuickFilterInvited] = useState(''); // Search query for Invited tab
	const [debouncedQuickFilterInvited, setDebouncedQuickFilterInvited] = useState('');
	const [invitedSearchDataLoaded, setInvitedSearchDataLoaded] = useState(false);
	
	
	// Pagination state for Failed tab  
	const [failedPage, setFailedPage] = useState(1);
	const [failedPageSize, setFailedPageSize] = useState(10);
	const [invitedPageSize, setInvitedPageSize] = useState(10);
	const [searchModeFailed, setSearchModeFailed] = useState(false); // Search mode for Failed tab
	const [quickFilterFailed, setQuickFilterFailed] = useState(''); // Search query for Failed tab
	const [debouncedQuickFilterFailed, setDebouncedQuickFilterFailed] = useState('');
	const [failedSearchDataLoaded, setFailedSearchDataLoaded] = useState(false);


useEffect(() => {
	if (tabvalue === 1 && !searchModeRegistered) {
    PullParticipantList(page, pageSize); // 🔁 Call API for new page
  }
}, [page, pageSize, tabvalue, searchModeRegistered]);

// Fetch data when page changes for Invited tab
useEffect(() => {
	if (tabvalue === 2 && !searchModeInvited) {
    FetchInvitedSupplier(invitedPage, invitedPageSize);
  }
}, [invitedPage, invitedPageSize, tabvalue, searchModeInvited]);

// Fetch data when page changes for Failed tab
useEffect(() => {
	if (tabvalue === 3 && !searchModeFailed) {
    FetchfailedInvites(failedPage, failedPageSize);
  }
}, [failedPage, failedPageSize, tabvalue, searchModeFailed]);

	//#apicalls on this page
	const [participantTotalCount, setParticipantTotalCount] = useState(0);
	const [invitedTotalCount, setInvitedTotalCount] = useState(0);
	const [failedTotalCount, setFailedTotalCount] = useState(0);


const PullParticipantList = async (pageNumber = 1, pageSize = 10, isSearch = false) => {
	setGridloading(!isSearch);
	if (!isSearch) {
		setRegisteredSearchDataLoaded(false);
	}

	try {
		await updateToken();

		// If in search mode, fetch all records with a large page size
		const effectivePageSize = isSearch ? 10000 : pageSize;
		const effectivePageNumber = isSearch ? 1 : pageNumber;

		const queryParams = buildQueryParams({
			CustomerId: customerid,
			Advance: "Advance",
			SortingColumn: "Id",
			IsAscending: "True",
			PageNumber: effectivePageNumber,
			PageSize: effectivePageSize
		});

		const res = await apiClient.get(`api/managevendors/GetVendors?${queryParams}`, atoken);

		const totalRecords = res?.pageMetadata?.totalCount || 0;
		setParticipantTotalCount(totalRecords);

		if (res?.result && res?.result.length > 0) {
			setParticipantList(res.result);
		} else {
			setParticipantList([]);
			setParticipantTotalCount(0);
		}
		if (isSearch) {
			setRegisteredSearchDataLoaded(true);
		}
	} catch (error) {
		console.error("🔴 Error pulling participant list:", error);
		setParticipantList([]);
		setParticipantTotalCount(0);
	} finally {
		if (!isSearch) {
			setGridloading(false);
		}
	}
};





	

	
	// // Debug page changes
	// useEffect(() => {
	// 	console.log("🔵 Page changed to:", page, "Calling API with page:", page, "pageSize:", pageSize);
	// 	PullParticipantList(page, pageSize);
	// }, [page, accessLevel]);

	// #1 contains initial logics and states related to components
	const navigate = useNavigate();
	const [state, setState] = useState({
		opensidebar: false,
		openinvitebar: false,
		openinvitebarApprove: false,
		opensqinvitation:false
	});
	const [stagelist, setStageList] = useState(null);
	const [stageVIlist, setStageVIList] = useState(null);
	useEffect(() => {
		StageFindAll(
			{ EventType: "QR", CustomerId: customerid, EventId: 0 },
			atoken
		).then((res) => {
			setStageList(res);
		});
		StageFindAll(
			{ EventType: "VI", CustomerId: customerid, EventId: 0 },
			atoken
		).then((res) => {
			setStageVIList(res);
		});
	}, []);




	const handleChangeTab = (event, newValue) => {
	setTabValue(newValue);

	// if (newValue === 2) {
	// 	FetchInvitedSupplier();
	// }
};


	const toggleDrawer = (anchor, open) => {
		return (event) => {
			
			// Only process the event if it's not null
			if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
				return;
			}
	 
			if (anchor === "opensqinvitation" && open) {
				if (sqinvitedSuppliers.length < 1) {
					toast.info("Please select suppliers for SQ Invitation", {
						toastId: "opensqinvitation",
					});
					return;
				}
			}

			
	 
			setState((prevState) => ({ ...prevState, [anchor]: open }));
		};
	 };
	 
	
	 
	 
	const [modal, setModal] = useState(false);
	const [invitedModal, setInvitedModal] = useState(false);

	const CloseModal = () => setModal(false);
	const OpenModal = () => setModal(true);
	const [loading, setLoading] = useState(false);
	const [value, setValue] = React.useState(1);
	const handleChange = (event) => {
		setValue(event.target.value);
	};

	const callback = useCallback((pass) => {
		// setcusupdata(pass);
		// setModalUploadShow(true)
	}, []);
	
	const [pageCount, setPageCount] = useState(0);
	const [ParticipantList, setParticipantList] = useState([]);

	const handleParticipantList = (value) => {

		setParticipantList(value);
	};

	const handleParticipantsReset = () => {
		setPage(1); // Reset to page 1
		PullParticipantList(1, pageSize);
	}

	const formik = useFormik({
		initialValues: {
			CustomerId: "",
			SearchName: "",
			SearchEmail: "",
			SearchTax: "",
			PageNumber: "",
			PageSize: "",
			//OrderBy: '',
			//Fields: '',
		},
		onSubmit: async (values) => {
			const queryParams = buildQueryParams(values);
			const res = await apiClient.get(
				`api/managevendors${queryParams}`,
				atoken
			);
			if (res != "" && res != undefined) {
				setParticipantList(res.result);
				setPageCount(Math.ceil(res[0]?.totalrecords / 10));
			}
			setLoading(false);
		},
	});

	const manageCon = async () => {
		if (value == 1) {
			navigate("/manage/manage-participants/register-participants");
		} else if (value == 2) {
			if (!bulkattachment) {
				toast?.error("Please upload file", {
					position: toast.POSITION.TOP_CENTER,
					className: "toastzindex",
				});
			} else {
				const headers = [
					{ header: "contactPerson", key: "contactPerson" },
					{ header: "email", key: "email" },
					{ header: "dialingCode", key: "dialingCode" },
					{ header: "phoneNumber", key: "phoneNumber" },
					{ header: "companyName", key: "companyName" },
					{ header: "taxId", key: "taxId" },
				];
				let Data = await handleFileUpload(bulkattachment, headers);

				let isValid = checkArray(Data);

				if (isValid == true) {
					setLoading(false);
					return;
				}
				let sanitizedData = Data?.map((obj) => {
					return {
						...obj,
						dialingCode: obj.dialingCode?.toString(),
						phoneNumber: obj.phoneNumber?.toString(),
					};
				});

				let data = sanitizedData?.map((obj) => {
					return getPayloadWithStage(
						"currentStage",
						"New",
						stagelist,
						obj,
						"currentStage"
					);
				});

				setBulkAttachmentList(data);
				CloseModal();
				setState({ ...state, ["opensidebar"]: true });
			}
		} else if (value == 3) {
			setTabValue(2);
			CloseModal();
		}
	};

	// #2   Bulkattachment logic
	const [bulkattachment, setBulkAttachment] = useState(null);
	const [bulkattachmentlist, setBulkAttachmentList] = useState([]);
	const handlebulkattachment = (e) => {
		setBulkAttachment(e?.target?.files[0]);
	};

	//handlebulkdelete
	const handlebulkdelete = (email) => {
		setBulkAttachmentList((prev) => {
			return prev.filter((obj) => obj?.email !== email);
		});
	};

	//to handle download of sample bulk registration template
	const downloadBulkExcel = () => {
		const headers = [
			{ header: "contactPerson", key: "contactPerson" },
			{ header: "email", key: "email" },
			{ header: "dialingCode", key: "dialingCode" },
			{ header: "phoneNumber", key: "phoneNumber" },
			{ header: "companyName", key: "companyName" },
			{ header: "taxId", key: "taxId" },
		];
		const data = [
			// Example data - in practice, this could come from your app's state or props
			//{ contactPerson: 'John Doe', email: 'john@example.com', dialingCode: '+1', phoneNumber: '1234567890', companyName: 'Example Inc.', taxId: 'AB123456' },
			// Add more objects with the same structure as needed
		];

		const filename = "Bulk_Registration_SampleFile.xlsx";
		downloadSample(headers, data, filename);
	};
	//to handle download of sample bulk invite template
	const downloadInviteExcel = () => {
		const headers = [{ header: "email", key: "email" }];
		const data = [
			// Example data - in practice, this could come from your app's state or props
			//{ email: 'john@example.com'}
			// Add more objects with the same structure as needed
		];

		const filename = "Bulk_Invite_SampleFile.xlsx";
		downloadSample(headers, data, filename);
	};
	const handleCompanyNavigation = (params) => {
		
		if (params.row.customerId == customerid) {
			navigate(`/manage/manage-participants/register-participants/${params.row.id}`)
			
		}
		else {
			navigate(`/manage/manage-participants/register-participants/${params.row.id}`)
			// navigate(`/manage/manage-participants/register-participants/${params.row.id}?&isExtend=Y`)
		}
	
		
	}
	// #3 Grid specific logic
	const columns = [
		{
			field: "vendorCode",
			headerName: "Supplier Code",
			width:150,
			renderCell: (params) => (
				<div onClick={()=>handleCompanyNavigation(params)} className="content-text cursor-pointer">
					{params.row.vendorCode}
				</div>
			
			),
		},
		{
			field: "companyName",
			headerName: "Company Name",
			width:250,
			renderCell: (params) => (
				<Tooltip title={params?.formattedValue} arrow>
					<div onClick={()=>handleCompanyNavigation(params)} className="content-text cursor-pointer" style={{ color: '#1a6efd' }}>
						{params?.formattedValue}
					</div>
				</Tooltip>
			),
		},
		{
			field: "taxId",
			headerName: "Tax ID",
			width:150,
			renderCell: (params) => (
				<div onClick={()=>handleCompanyNavigation(params)} className="content-text cursor-pointer">
					{params?.row?.taxId}
				</div>
			),
		},
		{
			field: "phoneNumber",
			headerName: "Phone Number",
			width:150,
			renderCell: (params) => {
				const dialingCode = params?.row?.dialingCode || '';
				const phoneNumber = params?.row?.phoneNumber || '';
				const displayText = dialingCode && phoneNumber 
					? `${dialingCode} ${phoneNumber}` 
					: dialingCode || phoneNumber || '';
				
				return (
					<div onClick={()=>handleCompanyNavigation(params)} className="content-text cursor-pointer">
						{displayText}
					</div>
				);
			},
		},
		{
			field: 'stage',
			headerName: 'Status',
			width:150,
			renderCell: (params) => {
				const statusClass = params.row.stage === 'Approval Pending' ? 'text-danger' : 'text-primary'; 
				return (
					<div
						className={`content-text ${statusClass} cursor-pointer`}
						onClick={()=>handleCompanyNavigation(params)}
					>
						{params?.formattedValue}
					</div>
				);
			},
		},
		{
			field: "createdByName",
			headerName: "Created by",
			width:150,
			renderCell: (params) => (
				<div className="content-text">
					{(params?.row?.customerId == customerid)
						? params?.formattedValue
						: "Outside Company"}
				</div>
			),
		},
	];
		// {
		// 	field: "actions",
		// 	headerName: "Actions",
		// 	cellClassName: "overflow-visible justify-content-centre",
		// 	flex: 2,
		// 	renderCell: (params) => (
		// 		<Dropdown align="end" className="d-inline-block">
		// 			<Dropdown.Toggle as="div" id="gt" className="round-edit remove-tringle me-2" role="button">
		// 				<IconButton size="medium" className="shadow-sm">
		// 					<HiOutlineDotsHorizontal className="f17" />
		// 				</IconButton>
		// 			</Dropdown.Toggle>
		// 			<Dropdown.Menu className="ddl-menu">
		// 				{params.row.customerId == customerid ? (
		// 					<Link to={`/manage/manage-participants/register-participants/${params.row.id}`}>
		// 						<MenuItem className="f14">Review Profile</MenuItem>
		// 					</Link>
		// 				) : (
		// 					<Link to={`/manage/manage-participants/register-participants/${params.row.id}?&isExtend=Y`}>
		// 						<MenuItem className="f14">
		// 							{params.row.isMapped  ? "Review Extend Profile" : "Extend Profile"}
		// 						</MenuItem>
		// 					</Link>
		// 				)}
		// 			</Dropdown.Menu>
		// 		</Dropdown>
		// 	),
		// },
	
	


	const handleSQEStatus = (value) => {
		
		const sqeid = value?.sqeHeader[0]?.id  ?? 0
	
			navigate(`/manage/manage-participants/register-participants/${value?.id}?sqId=${sqeid}`);
		
		
	}


	const [rowCell, setRowCell] = useState(null);
	const [gridloading, setGridloading] = useState(false);
	const getRowId = (row) => {
		return row?.id;
	};
	const handleRowClick = (params) => {

		setRowCell(params?.row);
	};

	const handleCellClick = (params) => {
		if (params?.field == "optiontype") {
			// openOptionPopup(params?.row, true)
		}
	};

	const [actmodal, setActModal] = useState(false);
	const openActModal = () => {
		setActModal(true);
	};
	const closeActModal = () => {
		setActModal(false);
	};

	// #4 Bulk Registration Grid specific logic
	const bulkregistrationcolumn = [
		{ field: "contactPerson", headerName: "Contact Person", width:150},
		{ field: "email", headerName: "Email Id", width:150 },
		{ field: "dialingCode", headerName: "Dialing Code", width:150},
		{ field: "phoneNumber", headerName: "Phone Number", width:150},
		{ field: "companyName", headerName: "Company Name", width:150 },
		{ field: "taxId", headerName: "Tax Id", width:150},
		{
			field: "action",
			headerName: "Action",
			width:150,
			renderCell: (params) => (
				<>
					<Button
						variant="text"
						size="small"
						startIcon={<HiOutlineX />}
						className="text-capitalize font-normal content-text"
						onClick={() => handlebulkdelete(params?.row?.email)}
					>
					</Button>
				</>
			),
		},
	];

	const getBRRowId = (row) => {
		return row?.email;
	};
	const handleBulkRegister = async () => {
		if (bulkattachmentlist.length > 50) {
			toast.error("Max limit for bulk register is 50", {
			 toastId: "limitMax"
			});
			setLoading(false);
			return;
		}
		setLoading(true);
		const data = bulkattachmentlist.map((item) => {
			return {
				...item,
				taxId: item.taxId?.toString(), 
			};
		});
		let res = await apiClient.post(
			"api/managevendors/bulkregister",
			data,
			atoken
		);

		if (res) {
			toast.success("Registered successfull!", {
				 toastId: "Registered"
			});
			navigate("/manage/manage-participants");
			PullParticipantList(1, pageSize); // Reset to page 1 after bulk registration
			FetchfailedInvites();
			setState({ ...state, ["opensidebar"]: false });
			setLoading(false);
		} else {
			setLoading(false);
		}
	};

	const [invitedVendorList, setInvitedVendorList] = useState([]);
	const [failedinvitedList, setFailedInviteList] = useState([]);
	const [vendorsforextend, setVendorsForExtend] = useState([]);
	const [sqinvitedSuppliers, setSQinvitedSuppliers] = useState([]);

const FetchInvitedSupplier = async (pageNumber = 1, pageSize = 10, isSearch = false) => {
	try {
		setGridloading(!isSearch);
		if (!isSearch) {
			setInvitedSearchDataLoaded(false);
		}

		// If in search mode, fetch all records with a large page size
		const effectivePageSize = isSearch ? 10000 : pageSize;
		const effectivePageNumber = isSearch ? 1 : pageNumber;

		// Build query
		const queryObj = {
			CustomerId: customerid,
			pageNumber: effectivePageNumber,
			pageSize: effectivePageSize
		};
		const queryParams = buildQueryParams(queryObj); 

		// Perform GET request using your API client (assuming apiClient.get handles auth headers internally)
		const res = await apiClient.get(`api/managevendors/vendorinvites?${queryParams}`, atoken);

		if (!isSearch) {
			setGridloading(false);
		}
      
		if (res?.result && Array.isArray(res?.result)) {
			// Filter only unregistered vendors
			const filteredVendors = res.result.filter(vendor => vendor.currentStage !== "Registered");
           
			setInvitedVendorList(filteredVendors);

			const totalRecords = res.pageMetadata?.totalCount ?? filteredVendors.length;
			setInvitedTotalCount(totalRecords);
			if (isSearch) {
				setInvitedSearchDataLoaded(true);
			}
		} else {
			// Handle empty or invalid response
			setInvitedVendorList([]);
			setInvitedTotalCount(0);
		}
	} catch (error) {
		console.error("Error fetching invited suppliers:", error);
		setInvitedVendorList([]);
		setInvitedTotalCount(0);
		if (!isSearch) {
			setGridloading(false);
		}
	}
};


// const FetchInvitedSupplier = async (pageNumber = 1, pageSize = 10) => {
// 	try {
// 		const obj = {
// 			CustomerId: customerid,
		
// 		};

// 		const queryParams = buildQueryParams(obj);
// 		const res = await getInvitedvendor(pageNumber, pageSize, atoken); // This returns paginated result

// 		if (res?.result && Array.isArray(res.result)) {
// 			// ✅ Filter unregistered vendors only
// 			const filteredVendors = res.result.filter(vendor => vendor.hasRegistered === false);
// 			;
// 			setInvitedVendorList(filteredVendors);
// 			const totalRecords = res.pageMetadata?.totalCount ?? filteredVendors.length;

// 			// ✅ Optional: if you want pagination to reflect only unregistered vendors
// 			setInvitedTotalCount(totalRecords);
// 		} else {
// 			setInvitedVendorList([]);
// 			setInvitedTotalCount(0);
// 		}
// 	} catch (error) {
// 		console.error("Error fetching invited suppliers:", error);
// 		setInvitedVendorList([]);
// 		setInvitedTotalCount(0);
// 	}
// };



	const handleBulkVendorExtend = async () => {
		if (vendorsforextend.length > 0) {
			const res = await apiClient.post(
				`/api/managevendors/${customerid}/mapsuppliers`,
				vendorsforextend,
				atoken
			);

			if (res) {
				toast?.info("Vendors Extended Successfully", {
					toastId: "ExtendedRegistered"
				});
				PullParticipantList(1, pageSize); // Reset to page 1 after bulk extend
				FetchfailedInvites();
			}
		} else {
			toast?.info("please select vendor for extend", {
				toastId: "vendorRegistered"
			});
		}
	};
	const FetchfailedInvites = async (pageNumber = 1, pageSize = 10, isSearch = false) => {
		try {
			setGridloading(!isSearch);
			if (!isSearch) {
				setFailedSearchDataLoaded(false);
			}
			// If in search mode, fetch all records with a large page size
			const effectivePageSize = isSearch ? 10000 : pageSize;
			const effectivePageNumber = isSearch ? 1 : pageNumber;

			const obj = {
				CustomerId: customerid,
				// AccessLevel: accessLevel?.list?.readed,
				pageNumber: effectivePageNumber,
				pageSize: effectivePageSize
			};
			const queryParams = buildQueryParams(obj);
			
			let res = await apiClient.get(
				`api/managevendors/failedinvites?${queryParams}`,
				atoken
			);
			
			
			
			if (res?.result) {
				// Handle paginated response
				if (res?.result && Array.isArray(res?.result)) {
					// If API returns paginated response
					
					setFailedInviteList(res?.result);
					const totalRecords = res?.pageMetadata?.totalCount || res.result.length;
					setFailedTotalCount(totalRecords);
					if (isSearch) {
						setFailedSearchDataLoaded(true);
					}
				} else if (Array.isArray(res)) {
					// If API returns array directly, apply pagination logic
					setFailedInviteList(res?.result);
					
					// Smart fallback logic for pagination
					if (res.result.length === pageSize) {
						const estimatedTotal = (pageNumber + 1) * pageSize;
						setFailedTotalCount(estimatedTotal);
					} else {
						const actualTotal = (pageNumber - 1) * pageSize + res.result.length;
						setFailedTotalCount(actualTotal);
					}
				}
			}
		} catch (error) {
			console.error("Error fetching failed invites:", error);
			setFailedInviteList([]);
			setFailedTotalCount(0);
		} finally {
			if (!isSearch) {
				setGridloading(false);
			}
		}
	};
	// useEffect(() => {
		
	// 		FetchInvitedSupplier();
	// 		FetchfailedInvites();
		
	// }, []);
	const getRowIdInvite = (row) => {
		return row?.id;
	};

	const getRowIdFailed = (row) => {
		return row?.id;
	};
	
// Reinvite supplier function
const handleReinviteSupplier = async (row) => {
  try {
    // Use the row's id as eventId
    const eventId = row.id;

    const res = await apiClient.putres(
      `/api/managevendors/${eventId}/ReInvite`,
      {},
      atoken
    );

    if (res) {
      toast.success("Supplier reinvited successfully!", {
        position: toast.POSITION.TOP_CENTER,
      });

      // Optionally refresh supplier list to update status
      FetchInvitedSupplier(); 
    }
  } catch (error) {
    toast.error("Failed to reinvite supplier. Please try again.", {
      position: toast.POSITION.TOP_CENTER,
    });
  }
};

// Invited Grid Columns (add Reinvite button for rejected)
const invitedGridColumns = [
   {
    field: "email",
    headerName: "Supplier Email",
    width: 300,
   renderCell: (params) => {
  const { vendorId, vendorSpecificData, invitationStatus } = params.row;

//   const isLinkable = invitationStatus !== "Rejected";
  const isLinkable =
  (invitationStatus !== "Invited" || (invitationStatus === "Invited" && invitationStatus === "Rejected")) &&
  invitationStatus !== "Awaiting Supplier Action";

//  const isLinkable =
//         invitationStatus !== "Invited" ||
//         (invitationStatus === "Invited" && invitationStatus === "Rejected");
  return isLinkable ? (
    <Link
      to={`/manage/manage-participants/register-participants/${vendorId}`}
      state={vendorSpecificData}
      className="content-text text-primary"
    >
      {params?.formattedValue}
    </Link>
  ) : (
    <span className="content-text">{params?.formattedValue}</span>
  );
},

  },
  {
    field: "createdOn",
    headerName: "Invitation Date",
    width: 180,
    renderCell: (params) =>
      params?.formattedValue ? (
        params?.row?.currentStage !== "Invited" ? (
          <div
            onClick={() =>
              navigate(
                `/manage/manage-participants/register-participants/${params?.row?.vendorId}`,
                { state: params?.row?.vendorSpecificData }
              )
            }
            className="content-text cursor-pointer"
          >
            {formatDateViaLocale(params.formattedValue, userDetail)}
          </div>
        ) : (
          <div className="content-text">
            {formatDateViaLocale(params.formattedValue, userDetail)}
          </div>
        )
      ) : (
        ""
      ),
  },
  {
    field: "createdByName",
    headerName: "Invited By",
    width: 180,
    renderCell: (params) =>
      params?.formattedValue ? (
        params?.row?.currentStage !== "Invited" ? (
          <div
            onClick={() =>
              navigate(
                `/manage/manage-participants/register-participants/${params?.row?.vendorId}`,
                { state: params?.row?.vendorSpecificData }
              )
            }
            className="content-text cursor-pointer"
          >
            {params.formattedValue}
          </div>
        ) : (
          <div className="content-text">{params.formattedValue}</div>
        )
      ) : (
        ""
      ),
  },
  {
    field: "invitationStatus",
    headerName: "Invitation Status",
    width: 260,
    renderCell: (params) => {
      const isRejected =
        params?.row?.currentStage === "Invited" &&
        params?.row?.invitationStatus === "Rejected";

      return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: isRejected ? "red" : "#555" }}>
            {params.value}
          </span>

          {isRejected && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleReinviteSupplier(params.row)}
              disabled={loading}
            >
              Re-invite
            </Button>
          )}
        </div>
      );
    },
  },
];

             

 



	const columnFailedinvitedVendor = [
		{
			field: "email",
			headerName: "Supplier Email",
			width:180,
			renderCell: (params) => (
				<div className="content-text">
					{params.row.hasRegistered == true ? (
						<>
							<Link
								to={`/manage/manage-participants/invited-participants/${params?.row?.email}`}
								state={params?.row?.vendorSpecificData}
								className="text-primary"
							>
								{params?.formattedValue}
							</Link>
						</>
					) : (
						<>{params?.formattedValue}</>
					)}
				</div>
			),
		},
		{
			field: "createdOn",
			headerName: "Invitation Date",
			width:180,
			renderCell: (params) => (
				<div className="content-text">
					{params?.formattedValue
						? formatDateViaTimeZone(params?.formattedValue, "en-GB", formatoption)
						: ""}
				</div>
			),
		},
		{ 
			field: "createdByName", 
			headerName: "Invited By", 
			width:150,
			renderCell: (params) => (
				<div className="content-text">{params?.formattedValue}</div>
			),
		},
		{
			field: "reasonPhrase",
			headerName: "Reason",
			width:180,
			renderCell: (params) => (
				<div className="content-text">
					{params?.formattedValue == "External" ? (
						<Link
							to={`/manage/manage-participants/register-participants/extend-participants?email=${params?.row?.email}&isExtend=Y`}
							className="text-primary"
						>
							<Tooltip Title="Extend Supplier">
								<MenuItem className="f14">{params?.formattedValue}</MenuItem>
							</Tooltip>
						</Link>
					) : (
						params?.formattedValue
					)}
				</div>
			),
		},
	];

	//invite vendor associated code
	const [emailList, setEmailList] = useState([]);
const handleAddMoreClick = (value) => {
  if (!value) return;

  if (emailList.includes(value)) {
    toast.error("Already added", { toastId: "alreadyadd" });
    return;
  }

  setEmailList((prevEmails) => [...prevEmails, value]);

  
};

	// const handleAddMoreClick = (value) => {
		
	// 	if (emailList.includes(value)) {
	// 		toast.error('already added',{toastid:"alreadyadd"} )
	// 		return
	// 	}
	// 	setEmailList((prevEmails) => [...prevEmails, value]);
	// };
	const handleVendorInvite = async () => {
  try {
    setProgress(true);

    const sanitizedData = emailList?.map(email => ({ email }));
debugger
    const data = sanitizedData?.map(obj =>
      getPayloadWithStage(
        "currentStage",
        "New",
        stageVIlist,
        obj,
        "currentStage"
      )
    );
debugger
    const res = await apiClient.postres(
      `/api/managevendors/invitevendor`,
      data,
      atoken
    );
debugger;
    if (res) {
      // ✅ SUCCESS TOAST
      toast.success("Successfully invited", {
        toastId: "inviteSuccess",
      });

      // ✅ Access correct paths in response
      const invited = res?.data?.invitedVendors?.result ?? [];
      const notInvited = res?.data?.notInvitedVendors?.result ?? [];

      // ❌ No modal
      setInvitedVendor(invited);
      setNotInvitedVendor(notInvited);

      clearEmailList();
      formik_email.resetForm();

      // ✅ Refresh lists
      FetchInvitedSupplier();
      PullParticipantList();
      FetchfailedInvites();
    }
  } catch (error) {
    console.error("Vendor invite failed:", error);
    toast.error("Failed to invite vendor");
  } finally {
    setProgress(false);
  }
};




	const handleInviteClose = () => {
		clearEmailList();
		setInvitedModal(false);
		formik_email.resetForm();
	};


	const validationSchema = Yup.object().shape({
  emailInput: Yup.string()
    .required("Email is required")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Enter a valid email"
    ),
});
	const formik_email = useFormik({
		enableReinitialize: true,
		initialValues: {
			emailInput: "",
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {
			setProgress(true)
			const { emailInput } = values;
			if (emailInput) {
				handleAddMoreClick(emailInput);
			} else {
				console.error("Email input is undefined or empty");
				setLoading(false);
			}

			setProgress(false)
		},
	});

	const handleRemoveClick = (indexToRemove) => {
		removeEmail(indexToRemove);
	};

	const clearEmailList = () => {
		setEmailList([]);
	};

	const removeEmail = (indexToRemove) => {
		const updatedEmailList = emailList.filter(
			(_, index) => index !== indexToRemove
		);
		setEmailList(updatedEmailList);
	};

	//#1 vendor drawer data grid logics and functionality
	const [invitedVendor, setInvitedVendor] = useState([]);
	const columninvitedvendor = [
		{
			field: "vendorEmail",
			headerName: "Invited Supplier",
			width: 200,
			renderCell: (params) => params?.row,
		},
	];
	const [notinvitedVendor, setNotInvitedVendor] = useState([]);
	const columnnotinvitedvendor = [
		{
			field: "email",
			headerName: "Not Invited Supplier",
			width: 150,
			renderCell: (params) => params.formattedValue,
		},
		{
			field: "reason",
			headerName: "Reason",
			width: 180,
			renderCell: (params) => params.formattedValue,
		},
	];

	const getInvitedRowId = (row) => {
		return row;
	};
	const getNotInvitedRowId = (row, index) => {
		return row?.email;
	};
	// const handleInviteVendorUpload = async (file) => {
	// 	// Handle file upload logic here
	// 	const headers = [{ header: "email", key: "email" }];

	// 	let data = await handleFileUpload(file, headers);
	// 	let isValid = checkArray(data);

	// 	if (isValid == true) {
	// 		return;
	// 	}
	// 	const arrayOfEmails = data?.map((obj) => obj.email);
	// 	const isfileValid = validateEmails(arrayOfEmails);

	// 	if (isfileValid === false) {
	// 		toast?.error("please upload file with valid email address", {
	// 			toastId: "uploadRegistered"
	// 		});
	// 		setLoading(false);
	// 		return;
	// 	}
	// 	setEmailList((prevEmailList) => [...prevEmailList, ...arrayOfEmails]);
	// 	// setEmailList(arrayOfEmails);
	// };

	const handleInviteVendorUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setLoading(true);

		const headers = [{ header: "email", key: "email" }];

		try {
			const data = await handleFileUpload(file, headers);
			const isValid = checkArray(data);

			if (isValid === true) {
			setLoading(false);
			return;
			}

			const arrayOfEmails = data.map(obj => obj.email);
			const isFileValid = validateEmails(arrayOfEmails);

			if (!isFileValid) {
			toast.error("Please upload file with valid email address", {
				toastId: "uploadRegistered"
			});
			setLoading(false);
			return;
			}

			setEmailList(prev => [...prev, ...arrayOfEmails]);
		} catch (err) {
			toast.error("Error while uploading file");
		} finally {
			setLoading(false);
			e.target.value = ""; // reset input so same file can be uploaded again
		}
		};

	const downloadSampleExcel = async () => {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Vendors");

		/* ---------------- Column ---------------- */
		worksheet.columns = [
			{ header: "email", key: "email", width: 40 }
		];

		/* ---------------- Freeze Header ---------------- */
		worksheet.views = [{ state: "frozen", ySplit: 1 }];

		/* ---------------- Lock everything ---------------- */
		worksheet.eachRow({ includeEmpty: true }, (row) => {
			row.eachCell({ includeEmpty: true }, (cell) => {
			cell.protection = { locked: true };
			});
		});

		/* ---------------- Unlock ONLY email column (rows 2+) ---------------- */
		for (let row = 2; row <= 1000; row++) {
			worksheet.getCell(`A${row}`).protection = { locked: false };
		}

		/* ---------------- Email validation + duplicate prevention ---------------- */
		worksheet.dataValidations.add("A2:A1000", {
			type: "custom",
			formulae: [
			// ✔ valid email
			'=AND(' +
				'ISNUMBER(SEARCH("@",A2)),' +
				'ISNUMBER(SEARCH(".",A2)),' +
				// ✔ prevent duplicates
				'COUNTIF($A$2:$A$1000,A2)=1' +
			')'
			],
			allowBlank: true,
			showErrorMessage: true,
			errorTitle: "Invalid or Duplicate Email",
			error:
			"Please enter a valid email address and ensure it is not duplicated."
		});

		/* ---------------- Protect sheet (blocks paste into locked cells) ---------------- */
		await worksheet.protect("secure123", {
			selectLockedCells: false,
			selectUnlockedCells: true,
			insertRows: false,
			deleteRows: false,
			formatCells: false
		});

		/* ---------------- Download ---------------- */
		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		});

		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "Vendor_Email_Sample.xlsx";
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const requestApprover = {
		EventId: 26,
		EventType: "QR",
	};
	const [divVisible, setDivVisible] = useState(false);

	const toggleDivVisibility = () => {
		setDivVisible(!divVisible);
	};

	const closeDivVisibility = () => {
		setDivVisible(false);
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuickFilterRegistered(quickFilterRegistered);
		}, 400);
		return () => clearTimeout(timer);
	}, [quickFilterRegistered]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuickFilterInvited(quickFilterInvited);
		}, 400);
		return () => clearTimeout(timer);
	}, [quickFilterInvited]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuickFilterFailed(quickFilterFailed);
		}, 400);
		return () => clearTimeout(timer);
	}, [quickFilterFailed]);

	useEffect(() => {
		const hasSearchText = debouncedQuickFilterRegistered.trim() !== '';
		if (hasSearchText) {
			if (!searchModeRegistered) {
				setSearchModeRegistered(true);
				setPage(1);
			}
			if (!registeredSearchDataLoaded) {
				PullParticipantList(1, pageSize, true);
			}
			return;
		}

		if (searchModeRegistered) {
			setSearchModeRegistered(false);
			setPage(1);
			PullParticipantList(1, pageSize, false);
		}
	}, [debouncedQuickFilterRegistered, searchModeRegistered, registeredSearchDataLoaded, pageSize]);

	useEffect(() => {
		const hasSearchText = debouncedQuickFilterInvited.trim() !== '';
		if (hasSearchText) {
			if (!searchModeInvited) {
				setSearchModeInvited(true);
				setInvitedPage(1);
			}
			if (!invitedSearchDataLoaded) {
				FetchInvitedSupplier(1, invitedPageSize, true);
			}
			return;
		}

		if (searchModeInvited) {
			setSearchModeInvited(false);
			setInvitedPage(1);
			FetchInvitedSupplier(1, invitedPageSize, false);
		}
	}, [debouncedQuickFilterInvited, searchModeInvited, invitedSearchDataLoaded, invitedPageSize]);

	useEffect(() => {
		const hasSearchText = debouncedQuickFilterFailed.trim() !== '';
		if (hasSearchText) {
			if (!searchModeFailed) {
				setSearchModeFailed(true);
				setFailedPage(1);
			}
			if (!failedSearchDataLoaded) {
				FetchfailedInvites(1, failedPageSize, true);
			}
			return;
		}

		if (searchModeFailed) {
			setSearchModeFailed(false);
			setFailedPage(1);
			FetchfailedInvites(1, failedPageSize, false);
		}
	}, [debouncedQuickFilterFailed, searchModeFailed, failedSearchDataLoaded, failedPageSize]);

	const openSqInvitationDrawer = useCallback(() => {
		setState((prevState) => ({ ...prevState, opensqinvitation: true }));
	}, []);

	const CustomToolbar = useCallback(({ onFilterClick, tabValue, sqInvitationCount, onSqInvitationClick }) => {
		return (
			<GridToolbarContainer className="row">
				<div className="d-flex justify-content-between">
					<div>
						<GridToolbarColumnsButton />
						<GridToolbarFilterButton />
						<GridToolbarDensitySelector />
						{tabValue == 1 && 
						<Tooltip title={
							"Send supplier qualification to multiple suppliers"
						}>						<Button
									startIcon={<HiUserGroup  className="f17"/>}
									onClick={onSqInvitationClick}
								// disabled={selectedRowIds && !selectedRowIds?.length}
								// onClick={toggleDrawer('rightBulkAssign', true)}
								>
									 <span className="f12">SQ Invitation {sqInvitationCount > 0 && sqInvitationCount}</span>
								</Button></Tooltip>
							}
						{tabValue == 3 ? (
							<>
								<Button
									startIcon={<HiOutlineCheck />}
									onClick={toggleDrawer("openinvitebarApprove", true)}
								// disabled={selectedRowIds && !selectedRowIds?.length}
								// onClick={toggleDrawer('rightBulkAssign', true)}
								>
									Bulk Approval
								</Button>
								<Button
									startIcon={<HiViewGridAdd />}
									// disabled={selectedRowIds && !selectedRowIds?.length}
									onClick={handleBulkVendorExtend}
								>
									Bulk Extend
								</Button>
							</>
						) : (
							<></>
						)}
					</div>
					{/* <div>
						<GridToolbarQuickFilter />
					</div> */}
					 <div className="d-flex align-items-center gap-2">
						<GridToolbarQuickFilter />
						{tabValue == 1 && (
							<div
								className="filterIconCircle shadow-sm"
								onClick={onFilterClick}
								title="Open Filters"
							>
								<FilterListIcon />
							</div>
						)}
					</div>
				</div>
			</GridToolbarContainer>
		);
	}, []);

	const [selectedRows, setSelectedRows] = React.useState([]);
	const [selectedInvoiceRows, setSelectedInvoiceRows] = React.useState([]);

	const formik_InvoiceAccepted = useFormik({
		initialValues: {
			emailInput: "",
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {

			const { emailInput } = values;
			if (emailInput) {
				//  handleAddMoreClick(emailInput);
			} else {
				console.error("Email input is undefined or empty");
			}
		},
	});

	const [progress,setProgress]=useState(false)
	return (
		<>
			<div className="mainContainer d-flex">
				{/* LEFT CONTENT */}
				<div className={`leftContent ${divVisible ? "col-9" : "col-12"} d-flex flex-column`}>
					<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
						<div className="d-flex justify-content-between border-bottom align-items-center mb-3">
							<div className="page-heading text-dark-blue heading">
								<BackButton title="Manage Suppliers" />
							</div>

							<div className="d-flex align-items-center gap-2">
								{accessLevel?.list?.created?.toLowerCase().trim() != "none" && (
									<Button
										disabled={(!iscreateListaccessLevel) || (!isreadListaccessLevel)}
										variant="text"
										size="large"
										startIcon={<HiPlusSm />}
										className="text-capitalize blue-text font-normal me-3 content-text"
										onClick={() => OpenModal()}
									>
										Add Supplier
									</Button>
								)}
							</div>
						</div>

						<div className="row gx-0">
							<div className="col-12 mb-3">
								<Box sx={{ width: "100%" }}>
									<Tabs
										value={tabvalue}
										onChange={handleChangeTab}
										textColor="primary"
										className="tabstheme"
										indicatorColor="primary" 
										variant="scrollable"
										allowScrollButtonsMobile
									>
										<Tab value={1} label="Registered" />
										<Tab value={2} label="Invited" />
										<Tab value={3} label="Enrollment failure" />
									</Tabs>
								</Box>
								
								{tabvalue == 1 ? (
									<div className='flex-grow-1 bg-white rounded'>
										<div className="row">
											<div className="col-12 mb-3 ">
												{gridloading && !searchModeRegistered ? (
													<GridSkeleton/>
												) : (
													<>
														{accessLevel?.list?.readed != "None" ? (
															ParticipantList.length === 0 ? (
																<div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
																	<h5 className="text-muted">No supplier found</h5>
																</div>
															) : (
																<div className="data-grid-wrapper">
	

																	<DataGrid
	getRowId={getRowId}
	rows={ParticipantList}
	loading={gridloading && !searchModeRegistered}
	columns={columns}
	pagination                                 // ✅ Enable pagination
	paginationMode={searchModeRegistered ? "client" : "server"}                   // ✅ Server-side mode or client mode when searching
	pageSizeOptions={[10, 25, 50]}            // ✅ Optional: Allow selectable page size
	rowCount={searchModeRegistered ? ParticipantList.length : participantTotalCount}          // ✅ Total rows from API
	paginationModel={{
		page: page - 1,                        // ✅ DataGrid uses 0-based page
		pageSize: pageSize
	}}
	onPaginationModelChange={(model) => {
		if (model.page !== (page - 1)) {
			setPage(model.page + 1);         // ✅ Convert to 1-based page
			if (!searchModeRegistered) {
				PullParticipantList(model.page + 1, model.pageSize, false);
			}
		}
		if (model.pageSize !== pageSize) {
			setPageSize(model.pageSize);
			setPage(1);
			if (!searchModeRegistered) {
				PullParticipantList(1, model.pageSize, false);
			}
		}
	}}
	onFilterModelChange={(filterModel) => {
		const nextQuickFilterValue = filterModel?.quickFilterValues?.[0] || '';
		setQuickFilterRegistered((prevQuickFilterValue) =>
			prevQuickFilterValue === nextQuickFilterValue ? prevQuickFilterValue : nextQuickFilterValue
		);
	}}
	getRowClassName={(params) =>
		params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
	}
	rowHeight={45}
	columnHeaderHeight={40}
	className="f13 border-0 consistent-datagrid"
	style={{ width: '100%', height: '100%', border: 'none' }}
	disableDensitySelector
	disableRowSelectionOnClick
	disableColumnResize
	disableColumnReorder
	sx={{
		'& .MuiDataGrid-main': {
			overflow: 'hidden'
		},
		'& .MuiDataGrid-virtualScroller': {
			overflowX: 'hidden !important'
		}
	}}
	slots={{
		toolbar: CustomToolbar,
	}}
	slotProps={{
		toolbar: {
			onFilterClick: toggleDivVisibility,
			tabValue: tabvalue,
			sqInvitationCount: sqinvitedSuppliers.length,
			onSqInvitationClick: openSqInvitationDrawer,
			showQuickFilter: true,
			quickFilterProps: {
				debounceMs: 400,
			},
		},
	}}
	checkboxSelection
	disableColumnMenu
	isRowSelectable={(params) => params.row.stage === "Registered"}
	onRowSelectionModelChange={(ids) => {
		const selectedIDs = new Set(ids);
		const selectedRows = ParticipantList?.filter((row) =>
			selectedIDs.has(row.id)
		);
		setSQinvitedSuppliers(selectedRows);
	}}
	onRowClick={handleRowClick}
	onCellClick={handleCellClick}
/>

														</div>
													)
												) : (
													<NotFoundPage
														heading={`You Are Not Authorized To View List`}
														body1={`contact your Administrator for view rights`}
													/>
												)}
											</>
										)}
									</div>
								</div>
							</div>
						) : tabvalue == 2 ? (
									<div className="flex-grow-1 bg-white rounded">
										<div className="row">
											<div className="col-12">
												{accessLevel?.list?.created != "None" ? (
													<form
														onSubmit={formik_email.handleSubmit}
														autoComplete="off"
													>
														<div className="row align-items-center">
															<div className="col-12 col-md-8">
																<div className="row">
																	<div className="col-12 col-md-12 col-lg-12">
																		<div className="row align-items-center mt-2">
																			<div className="col-12 col-md-9 col-lg-9">
																				<TextField
																					id="emailInput"
																					name="emailInput"
																					size="small"
																					className="w-100"
																					label="Email Id"
																					value={formik_email?.values?.emailInput}
																					type="text"
																					onChange={(e) => {
																						formik_email.setFieldValue("emailInput",e.target.value)
																					}}
																					InputProps={{
																						endAdornment: (
																							<InputAdornment position="end">
																								<Typography variant="body2" color="textSecondary">
																									{formik_email?.values?.emailInput?.length}/50
																								</Typography>
																							</InputAdornment>
																						),
																					}}
																				/>
																				{formik_email?.touched?.emailInput && formik_email?.errors?.emailInput ? (
																					<div style={{ color: "red",  fontSize:"10px"}}>
																						{formik_email.errors.emailInput}
																					</div>
																				) : null}
																			</div>
																			<div className="col-12 col-md-3 col-lg-3 text-end text-md-start">
																				<LoadingButton
																					loading={progress}
																					variant="text"
																					size="large"
																					color="primary"
																					className="text-capitalize blue-text font-normal"
																					// className="text-capitalize mt-2 mt-md-0"
																					type="submit"
																				>
																					+ Add More
																				</LoadingButton>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
															<div className="col-12 col-md-4 text-end mt-1">
																<div className="d-flex justify-content-end gap-2">
																	<>
																		<input
																			ref={fileInputRef}
																			className="d-none"
																			type="file"
																			accept=".xlsx"
																			onChange={handleInviteVendorUpload}
																		/>

																		{/* Upload Button */}
																		<Tooltip title="Upload .xlsx file">
																			<Chip
																			icon={<HiOutlineUpload className="f16 text-primary ms-2" />}
																			variant="outlined"
																			className="no-border"
																			label="Excel Upload"
																			onClick={() => fileInputRef.current.click()}
																			/>
																		</Tooltip>

																		{/* Sample Download Button */}
																		<Tooltip title="Download sample .xlsx file">
																			<Chip
																			className="ms-2"
																			icon={<FaRegFileExcel className="f16 text-primary ms-2 no-border" />}
																			variant="outlined"
																			label="Download sample"
																			onClick={downloadSampleExcel} // 👈 implement this
																			/>
																		</Tooltip>
																		</>

																	{/* <MemoizedUploadButton
																		onFileUpload={handleInviteVendorUpload}
																		acceptedFileTypes=".xlsx,.xls"
																		buttonText="Excel Upload"
																		buttonSize="small"
																		buttonVariant="outlined"
																		buttonClassName="text-capitalize content-text"
																	/> */}
																	{/* <Button
																		variant="text"
																		size="small"
																		className="text-capitalize content-text"
																		onClick={downloadInviteExcel}
																	>
																		Sample Download
																	</Button> */}
																</div>
															</div>
														</div>
														<div className="row">
															<div className="col-12">
																<hr className="" />
																<div className="row">
																	<div className="col-12 mb-3 d-none d-lg-block">
																		{emailList && emailList?.length ? (
																			<>
																				<div className="row align-items-center p-2 rounded ms-0 me-0 mt-2 bggray">
																					<div className="col-12 col-md-11 f14">
																						<div className="">
																							<div className="row text-left">
																								<div className="col-3 col-md-2">
																									<div className="text-muted lingh14 content-text">S No.</div>
																								</div>
																								<div className="col-9 col-md-10">
																									<div className="text-muted lingh14 content-text">Email ID</div>
																								</div>
																							</div>
																						</div>
																					</div>
																					<div className="d-flex col-12 col-md-1 align-items-center text-end">
																						<div className="f14">
																							<div className="text-muted f14 lingh14"></div>
																						</div>
																					</div>
																				</div>
																			</>
																		) : null}
																		<div>
																			{emailList?.map((email, index) => (
																				<div key={index} className="row align-items-center p-0 pb-1 f14 border-bottom ms-0 me-0 mt-2 bg-white">
																					<div className="col-10 col-md-11">
																						<div className="">
																							<div className="row text-left">
																								<div className="col-3 col-md-2">
																									<div className="text-muted lingh14 content-text">{index + 1}</div>
																								</div>
																								<div className="col-9 col-md-10">
																									<div className="text-muted lingh14 content-text">{email}</div>
																								</div>
																							</div>
																						</div>
																					</div>
																					<div className="d-flex col-2 col-md-1 align-items-center justify-content-end text-end">
																						<IconButton
																							size="medium"
																							className="bg-white"
																							onClick={() => handleRemoveClick(index)}
																						>
																							<HiOutlineX className="f16 text-danger" />
																						</IconButton>
																					</div>
																				</div>
																			))}
																		</div>
																		{emailList && emailList?.length ? (
																			<div className="row">
																				<div className="col-12 text-end mt-2">
																					<LoadingButton
																						loading={progress}
																						color="primary"
																						variant="contained"
																						size="small"
																						className="text-capitalize"
																						onClick={() => {
																							handleVendorInvite();
																						}}
																					>
																						Send Invite
																					</LoadingButton>
																				</div>
																			</div>
																		) : null}
																	</div>
																</div>
															</div>
														</div>
													</form>
												) : null}
											</div>
										</div>
										<div className="row">
											<div className="col-12 mb-3">
												{accessLevel?.list?.readed != "None" ? (
													<div className="data-grid-wrapper">
														<DataGrid
	getRowId={getRowIdInvite}
	rows={invitedVendorList}
	columns={invitedGridColumns}
	loading={gridloading}
	pagination
	paginationMode={searchModeInvited ? "client" : "server"}
	pageSizeOptions={[10, 25, 50]}
	rowCount={searchModeInvited ? invitedVendorList.length : invitedTotalCount}
	paginationModel={{
		page: invitedPage - 1,
		pageSize: invitedPageSize
	}}
	onPaginationModelChange={(model) => {
		if (model.page !== (invitedPage - 1)) {
			setInvitedPage(model.page + 1);
			if (!searchModeInvited) {
				FetchInvitedSupplier(model.page + 1, model.pageSize, false);
			}
		}
		if (model.pageSize !== invitedPageSize) {
			setInvitedPageSize(model.pageSize);
			setInvitedPage(1);
			if (!searchModeInvited) {
				FetchInvitedSupplier(1, model.pageSize, false);
			}
		}
	}}
	onFilterModelChange={(filterModel) => {
		const nextQuickFilterValue = filterModel?.quickFilterValues?.[0] || '';
		setQuickFilterInvited((prevQuickFilterValue) =>
			prevQuickFilterValue === nextQuickFilterValue ? prevQuickFilterValue : nextQuickFilterValue
		);
	}}
	getRowClassName={(params) =>
		params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
	}
	rowHeight={45}
	columnHeaderHeight={40}
	className="f13 border-0 consistent-datagrid"
	style={{ width: '100%', height: '100%', border: 'none' }}
	disableDensitySelector
	disableRowSelectionOnClick
	disableColumnResize
	disableColumnReorder
	  sx={{
    '& .MuiDataGrid-main': {
      overflow: 'hidden'
    },
    '& .MuiDataGrid-virtualScroller': {
      overflowX: 'hidden !important'
    },
    '& .MuiDataGrid-footerContainer': {
      display: 'flex !important',
      minHeight: '160px !important',
      backgroundColor: '#fff'
    },
    '& .MuiTablePagination-toolbar': {
      minHeight: '160px !important',
      backgroundColor: '#fff'
    }
  }}
	// sx={{
	// 	'& .MuiDataGrid-main': {
	// 		overflow: 'hidden'
	// 	},
	// 	'& .MuiDataGrid-virtualScroller': {
	// 		overflowX: 'hidden !important'
	// 	}
	// }}
	slots={{
		toolbar: CustomToolbar,
	}}
	slotProps={{
		toolbar: {
			onFilterClick: toggleDivVisibility,
			tabValue: tabvalue,
			sqInvitationCount: sqinvitedSuppliers.length,
			onSqInvitationClick: openSqInvitationDrawer,
			showQuickFilter: true,
			quickFilterProps: {
				debounceMs: 400,
			},
		},
	}}
	// checkboxSelection
	isRowSelectable={(params) => params.row.status === "Invited"}
/>
													</div>
												) : (
													<NotFoundPage
														heading={`You Are Not Authorized To View List`}
														body1={`contact your Administrator for view rights`}
													/>
												)}
											</div>
										</div>
									</div>
								) : tabvalue == 3 ? (
									<div className="p-0">
										<div className="row">
											<div className="col-12 mb-3">
												{accessLevel?.list?.readed != "None" ? (
													<div className="data-grid-wrapper">
														<DataGrid
															key={"dg3"}
															getRowId={getRowIdFailed}
															rows={failedinvitedList}
															columns={columnFailedinvitedVendor}
															getRowClassName={(params) =>
																params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
															}
															// checkboxSelection
															onRowSelectionModelChange={(ids) => {
																const selectedIDs = new Set(ids);
																const selectedRows = failedinvitedList?.filter((row) =>
																	selectedIDs.has(row.id)
																);
																const selectedEmails = selectedRows?.map((obj) => obj.email);
																setVendorsForExtend(selectedEmails);
															}}
															isRowSelectable={(params) => params.row.reasonPhrase === "External"}
															disableRowSelectionOnClick
															rowHeight={45}
															columnHeaderHeight={40}
															loading={gridloading}
															pagination
															paginationMode={searchModeFailed ? "client" : "server"}
															pageSizeOptions={[10, 25, 50]}
															rowCount={searchModeFailed ? failedinvitedList.length : failedTotalCount}
															paginationModel={{
																page: failedPage - 1,
																pageSize: failedPageSize
															}}
															onPaginationModelChange={(model) => {
																if (model.page !== (failedPage - 1)) {
																	setFailedPage(model.page + 1);
																	if (!searchModeFailed) {
																		FetchfailedInvites(model.page + 1, model.pageSize, false);
																	}
																}
																if (model.pageSize !== failedPageSize) {
																	setFailedPageSize(model.pageSize);
																	setFailedPage(1);
																	if (!searchModeFailed) {
																		FetchfailedInvites(1, model.pageSize, false);
																	}
																}
															}}
															onFilterModelChange={(filterModel) => {
																const nextQuickFilterValue = filterModel?.quickFilterValues?.[0] || '';
																setQuickFilterFailed((prevQuickFilterValue) =>
																	prevQuickFilterValue === nextQuickFilterValue ? prevQuickFilterValue : nextQuickFilterValue
																);
															}}
															className="f13 border-0 consistent-datagrid"
															slots={{
																toolbar: CustomToolbar,
															}}
															slotProps={{
																toolbar: {
																	onFilterClick: toggleDivVisibility,
																	tabValue: tabvalue,
																	sqInvitationCount: sqinvitedSuppliers.length,
																	onSqInvitationClick: openSqInvitationDrawer,
																	showQuickFilter: true,
																	quickFilterProps: {
																		debounceMs: 400,
																	},
																},
															}}
														/>
													</div>
												) : (
													<NotFoundPage
														heading={`You Are Not Authorized To View List`}
														body1={`contact your Administrator for view rights`}
													/>
												)}
											</div>
										</div>
									</div>
								) : null}
							</div>
						</div>
					</div>
				</div>

				{/* RIGHT CONTENT (Filter Panel) */}
				{divVisible && (
					<div className={`rightContent ${divVisible ? " col-3" : "d-none"}`}>
						<div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column ms-3 right-panel-container">
							<div className="d-flex flex-column flex-grow-1">
								<div className="d-flex justify-content-between border-bottom align-items-center py-1">
									<div className="page-heading text-dark-blue ms-2">
										Discover Supplier
									</div>
									<IconButton onClick={closeDivVisibility} size="small" edge="start">
										<HiOutlineX className="f16" />
									</IconButton>
								</div>
								<div className="flex-grow-1">
									{accessLevel?.list?.created !== "None" && (
										<Filtersuppliersidebar
											handleParticipantList={handleParticipantList}
											handleParticipantsReset={handleParticipantsReset}
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Drawers and Modals */}
			<React.Fragment key="KEY1">
				<Drawer
					anchor="right"
					open={state["openinvitebar"]}
					onClose={toggleDrawer("openinvitebar", false)}
				>
					Test
				</Drawer>
			</React.Fragment>

			<React.Fragment key="KEY2">
				<Drawer
					anchor="right"
					open={state["opensidebar"]}
					onClose={toggleDrawer("opensidebar", false)}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 960 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Bulk Registration</div>
									<div>
										<IconButton
											onClick={toggleDrawer("opensidebar", false)}
											size="small"
											edge="start"
											sx={{ mr: 1 }}
										>
											<HiOutlineX className="f20 text-white" />
										</IconButton>
									</div>
								</div>
							</Box>
							<div className="h50px"></div>
							<Box sx={{ flexGrow: 1 }}>
								<div className="p-3">
									<div className="">
										<div className="row">
											<div className="col-12 mb-3 d-none d-lg-block">
												<div className="row">
													<div className="col-12 text-end">
														<Button
															color="primary"
															variant="contained"
															size="small"
															className="text-capitalize"
															onClick={handleBulkRegister}
														>
															{!loading ? (
																<span>Submit</span>
															) : (
																<span>Submitting...</span>
															)}
														</Button>
													</div>
												</div>
											</div>
										</div>
										<DataGrid
											getRowId={getBRRowId}
											rows={bulkattachmentlist}
											columns={bulkregistrationcolumn}
											autoHeight
											slots={{ toolbar: GridToolbar }}
											slotProps={{
												toolbar: {
													showQuickFilter: true,
												},
											}}
											rowHeight={40}
											columnHeaderHeight={40}
											className="f13 border-0 min-vh-100"
											disableRowSelectionOnClick
										/>
									</div>
								</div>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>

			<React.Fragment key="opensqinvitation">
				<Drawer
					anchor="right"
					open={state["opensqinvitation"]}
					onClose={toggleDrawer("opensqinvitation", false)}
				>
					<Box sx={{ width: { xs: 280, sm: 380, md: 420, lg: 560 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">SQ Invitation</div>
									<div>
										<IconButton
											onClick={toggleDrawer("opensqinvitation", false)}
											size="small"
											edge="start"
											sx={{ mr: 1 }}
										>
											<HiOutlineX className="f20 text-white" />
										</IconButton>
									</div>
								</div>
							</Box>
							<div className="h50px"></div>
							<Box sx={{ flexGrow: 1, p: 2 }}>
								<div className="row">
									<div className="col-12 col-md-12 col-lg-12">
										<SQInvitationAll sqinvitedSuppliers={sqinvitedSuppliers} toggleDrawer={toggleDrawer} />
									</div>
								</div>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>

			{/* Modals */}
			<Modal
				size="lg"
				show={modal}
				backdrop="static"
				keyboard={false}
				className="zindex10002"
				backdropClassName="zindex10002"
				centered
				contentClassName="border-0 rounded"
				onHide={() => CloseModal()}
			>
				<Modal.Header className="pt-2 pb-2">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14">
							What would you like to do?
						</div>
					</Modal.Title>
					<IconButton onClick={() => CloseModal()} size="small" edge="start">
						<HiOutlineX className="" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<div className="row">
							<div className="col-12">
								<FormControl fullWidth>
									<RadioGroup
										aria-labelledby=""
										defaultValue="new"
										name="new-rfq"
										value={value}
										onChange={handleChange}
									>
										<FormControlLabel
											value={1}
											control={<Radio />}
											label="Quick Register"
										/>
										<FormControlLabel
											value={2}
											control={<Radio />}
											label="Bulk Upload"
										/>
										{value == "2" ? (
											<>
												<div className="col-12 mt-2">
													<Form.Group controlId="formFile" className="">
														<Form.Control
															onChange={handlebulkattachment}
															type="file"
															size="sm"
															accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
														/>
													</Form.Group>
													<div className="text-end mt-2 f12 text-primary">
														<Button
															variant="text"
															size="small"
															className="text-capitalize font-normal"
															onClick={downloadBulkExcel}
														>
															Sample Download
														</Button>
													</div>
												</div>
											</>
										) : null}
										<FormControlLabel
											value={3}
											control={<Radio />}
											label="Invite by Email"
										/>
									</RadioGroup>
								</FormControl>
							</div>

							<div className="col-12 mt-4 text-end">
								<LoadingButton
									variant="outlined"
									onClick={manageCon}
									color="primary"
									className="text-capitalize"
									size="small"
								>
									Continue
								</LoadingButton>
							</div>
						</div>
					</div>
				</Modal.Body>
			</Modal>

			{/* Additional modals for invite, bulk registration, etc. */}
			<React.Fragment key="KEY2">
				<Drawer
					anchor="right"
					open={state["opensidebar"]}
					onClose={toggleDrawer("opensidebar", false)}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 960 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Bulk Registration</div>
									<div>
										<IconButton
											onClick={toggleDrawer("opensidebar", false)}
											size="small"
											edge="start"
											sx={{ mr: 1 }}
										>
											<HiOutlineX className="f20 text-white" />
										</IconButton>
									</div>
								</div>
							</Box>
							<div className="h50px"></div>
							<Box sx={{ flexGrow: 1 }}>
								<div className="p-3">
									<div className="">
										<div className="row">
											<div className="col-12 mb-3 d-none d-lg-block">
												<div className="row">
													<div className="col-12 text-end">
														<Button
															color="primary"
															variant="contained"
															size="small"
															className="text-capitalize"
															onClick={handleBulkRegister}
														>
															{!loading ? (
																<span>Submit</span>
															) : (
																<span>Submitting...</span>
															)}
														</Button>
													</div>
												</div>
											</div>
										</div>
										<DataGrid
											getRowId={getBRRowId}
											rows={bulkattachmentlist}
											columns={bulkregistrationcolumn}
											autoHeight
											slots={{ toolbar: GridToolbar }}
											slotProps={{
												toolbar: {
													showQuickFilter: true,
												},
											}}
											rowHeight={40}
											columnHeaderHeight={40}
											className="f13 border-0 min-vh-100"
											disableRowSelectionOnClick
										/>
									</div>
								</div>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>

			<React.Fragment key="opensqinvitation">
				<Drawer
					anchor="right"
					open={state["opensqinvitation"]}
					onClose={toggleDrawer("opensqinvitation", false)}
				>
					<Box sx={{ width: { xs: 280, sm: 380, md: 420, lg: 560 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">SQ Invitation</div>
									<div>
										<IconButton
											onClick={toggleDrawer("opensqinvitation", false)}
											size="small"
											edge="start"
											sx={{ mr: 1 }}
										>
											<HiOutlineX className="f20 text-white" />
										</IconButton>
									</div>
								</div>
							</Box>
							<div className="h50px"></div>
							<Box sx={{ flexGrow: 1, p: 2 }}>
								<div className="row">
									<div className="col-12 col-md-12 col-lg-12">
  <SQInvitationAll
    sqinvitedSuppliers={sqinvitedSuppliers}
    toggleDrawer={toggleDrawer}
  />
</div>

																</div>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>

			{/* Additional modals */}
			<Modal
				size="lg"
				show={actmodal}
				backdrop="static"
				keyboard={false}
				value={"Add New"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0 rounded"
				onHide={() => closeActModal()}
			>
				<Modal.Header className="pt-2 pb-2">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14">View Profile</div>
					</Modal.Title>
					<IconButton onClick={() => closeActModal()} size="small" edge="start">
						<HiOutlineX className="" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">{/* <ParticipantsCompanyDetails /> */}</div>
				</Modal.Body>
			</Modal>

			<Modal
				size="lg"
				show={invitedModal}
				backdrop="static"
				keyboard={false}
				value={"Add New"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0 rounded"
				onHide={() => setInvitedModal(false)}
			>
				<Modal.Header className="pt-2 pb-2">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14">
							Invited Response
						</div>
					</Modal.Title>
					<IconButton
						onClick={() => handleInviteClose()}
						size="small"
						edge="start"
					>
						<HiOutlineX className="" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						{invitedVendor && invitedVendor.length > 0 ? (
							<>
								<div className="row">
									<div className="col-12">
										<div className="f14">Invited Supplier</div>
										{invitedVendor &&
											invitedVendor?.length > 0 &&
											invitedVendor?.map((item, i) => (
												<>
													<Chip
														label={item}
														key={`invite${item}${i}`}
														className="m-1"
														variant="outlined"
														size="small"
														color="success"
													/>
												</>
											))}
									</div>
								</div>
							</>
						) : (
							<></>
						)}
						{notinvitedVendor && notinvitedVendor.length > 0 ? (
							<>
								<div className="row">
									<div className="col-12">
										<hr />
										<div className="f14">Not Invited Supplier</div>
										{notinvitedVendor &&
											notinvitedVendor?.length > 0 &&
											notinvitedVendor?.map((item, i) => (
												<>
													<Tooltip title={item?.reason}>
														<Chip
															label={item?.email}
															key={`notinvite${item?.email}${i}`}
															className="m-1"
															variant="outlined"
															size="small"
															color="error"
														/>
													</Tooltip>
												</>
											))}
									</div>
								</div>
							</>
						) : (
							<></>
						)}
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
};

export default ManageParticipants;
