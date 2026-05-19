import React, { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import {
	Dialog,
	DialogTitle,
	DialogActions,
} from '@mui/material';
import {
	Autocomplete,
	Box,
	Button,
	Chip,
	Drawer,
	FormControl,
	FormControlLabel,
	IconButton,
	InputAdornment,
	InputLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	HiOutlineX,
	HiPlusSm,
	HiTrash,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Badge, Dropdown, Modal } from "react-bootstrap";
import '../../../assets/css/configuremodule.css';
import { actionTypes, useStateValue } from "../../../store";
import {
	FindItemCategory,
	FindPlantStorage,
	getPRAdvanceFind,
	getPRManageFind,
} from "../../../utils/purchaseRequest";
import FilterListIcon from '@mui/icons-material/FilterList';

import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from "@mui/x-data-grid";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { useFormik } from "formik";
import {
	bidlist,
	buildQueryParams,
	formatDateViaLocale,
	getEventStage,
} from "../../../utils/common/utility";
import {
	AuctionModalFromPR,
	RFQModalFromPR,
	getPayloadWithStage,
	handlesaveAttachment,
	fetchAttachmentsFromPRItems,
} from "../../../utils/common";
import { ApiClient } from "../../../Apiclient";
import { toast } from "react-toastify";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { BackButton } from "../../../utils/common/component";
import { getPurchaseOrgList, OrgGroupMasterList } from "../../../utils/commerciallibrary";
import CryptoJS from "crypto-js";
import { useCookies } from "react-cookie";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { getDateFormatPatteronLocale, userampm } from '../../../utils/common/utility';
const ManagePR = ({ claimType }) => {
	const navigate = useNavigate();
	const [
		{ atoken, customerid, userDetail, customersuffix },
		dispatch,
	] = useStateValue();

	const [cookies, setCookie] = useCookies(["patkn", "prtkn"]);
	const apiClient = new ApiClient(customersuffix);

	// PR Status State
	const [prStatusLoaded, setPrStatusLoaded] = useState(false);
	const [prStatusList, setPrStatusList] = useState([]);

	useEffect(() => {
		dispatch({ type: actionTypes.SET_Bidtype, value: null });
		setCookie("pcbt", "", { path: "/", maxAge: 0 });

		// Load PR status list on component mount
		if (!prStatusLoaded) {
			pullGetEventStage("PR", setPrStatusList, setPrStatusLoaded);
		}
	}, [userDetail, atoken, prStatusLoaded]);

	const [state, setState] = useState({
		opensidebar: false,
	});

	const toggleDrawer = (anchor, open) => (event) => {
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};
	const [modal, setModal] = useState(false);
	const CloseModal = () => setModal(false);
	const OpenModal = () => setModal(true);
	const [showDetails, setShowDetails] = useState({});
	const [itemmodal, setItemModal] = useState(false);

	const ItemCloseModal = () => setItemModal(false);
	const ItemOpenModal = () => setItemModal(true);

	const [rfqprcartmodal, setRFQPRcartmodal] = useState(false);

	const rfqPrCartOpenModal = () => {
		setAction(true); // Set action state to true when opening the modal
		setRFQPRcartmodal(true);
	};

	const rfqPrCartCloseModal = () => {
		setAction(false); // Set action state to false when closing the modal
		setRFQPRcartmodal(false);
	};



	const [value, setValue] = React.useState("new");
	const handleChange = (event) => {
		setValue(event.target.value);
	};

	const [recorddata, setRecorddata] = useState([]);
	const getRowId = (row) => {
		return row?.id;
	};

	const columns = [
		{
			field: "prSubject",
			headerName: "PR Subject",
			flex: 2,
			valueGetter: (params) => `${params?.row?.prSubject || ""} ${params?.row?.id || ""} ${params?.row?.prNumber || ""}`,
			renderCell: (params) => (
				<Tooltip title="click to view/edit PR">
					<div
						onClick={() => { navigate(`/configuration/manage-pr/${params?.row.id}`); }}
						style={{ cursor: 'pointer' }}
					>
						<div className="content-text">
							{params?.row?.prSubject}
						</div>
						<div className="content-text mt-1">
							<span>PR Id: </span>
							{params?.row.id}
						</div>
					</div>
				</Tooltip>
			),
		},
		{
			field: "prNumber",
			headerName: "PR Number",
			flex: 1,
			minWidth: 135,
			renderCell: (params) => (
				<div
					className="content-text"
					onClick={() => { navigate(`/configuration/manage-pr/${params?.row.id}`); }}
					style={{ cursor: 'pointer' }}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "createdOn",
			headerName: "Created Date",
			flex: 1,
			minWidth: 80,
			renderCell: (params) => (
				<div
					className="content-text"
					onClick={() => { navigate(`/configuration/manage-pr/${params?.row.id}`); }}
					style={{ cursor: 'pointer' }}
				>
					{params?.formattedValue
						? formatDateViaLocale(params?.formattedValue, userDetail)
						: ""}
				</div>
			),
		},
		{
			field: "createdByName",
			headerName: "Created By",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => (
				<div
					className="content-text"
					onClick={() => { navigate(`/configuration/manage-pr/${params?.row.id}`); }}
					style={{ cursor: 'pointer' }}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "stage",
			headerName: "Status",
			flex: 1,
			minWidth: 80,
			renderCell: (params) => {
				const statusClass =
					params?.row?.stage === "Draft" || params?.row?.stage === "Cancel"
						? "text-danger"
						: "text-primary";

				return (
					<div
						className={`content-text ${statusClass}`}
						onClick={() => { navigate(`/configuration/manage-pr/${params?.row.id}`); }}
						style={{ cursor: 'pointer' }}
					>
						{params?.formattedValue}
					</div>
				);
			},
		},
		{
			field: "Action",
			headerName: "Action",
			flex: 1,
			minWidth: 80,
			renderCell: (params) => {
				// const allItemsUsed =
				// 	params?.row?.prItems?.length > 0 &&
				// 	params?.row?.prItems.every((item) => item?.eventId);
				const isClose = params?.row?.stage === "Close";
				const isSelectable = (params?.row?.stage === "Draft" || params?.row?.stage === "Cancel" || params?.row?.stage === "Under Approval");
				const isBOQEnabled = params?.row?.boqReq === true;
				return (
					<Chip
						size="small"
						color="primary"
						tabIndex={-1}
						className="ps-1 me-3 align-center"
						variant="outlined"
						label={isClose ? "View Items" : "Select Items"}
						disabled={isSelectable || isBOQEnabled}
						onClick={() => {
							ItemOpenModal();
							handleADDtoRFQ(params?.row.id);
						}}
					/>
				);
			},
		},
	];


	const getBRRowId = (row) => {
		return row?.id;
	};

	const [action, setAction] = useState(false);
	const prrfqcolumn = [
		{
			field: "prNo",
			headerName: "Pr No",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "lineItemNo",
			headerName: "Item",
			flex: 1,
			minWidth: 80,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "itemCode",
			headerName: "Item/Activity Code",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		// {
		// 	field: "materialDesc",
		// 	headerName: "Material/Activity Desc",
		// 	flex: 2,
		// 	minWidth: 200,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		// {
		// 	field: "materialGrpDesc",
		// 	headerName: "Material/Activity Grp & Desc",
		// 	flex: 2,
		// 	minWidth: 200,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		{
			field: "itemDesc",
			headerName: "Description",
			flex: 2,
			minWidth: 180,
			renderCell: (params) => (
				<Tooltip title={params?.formattedValue || ""}>
					<div className="content-text">{params?.formattedValue}</div>
				</Tooltip>
			),
		},
		{
			field: "quantity",
			headerName: "QTY/UOM",
			flex: 1,
			minWidth: 110,
			renderCell: (params) => (
				<div className="content-text">
					{params?.row?.quantity}{params?.row?.uom ? `(${params?.row?.uom})` : ""}
				</div>
			),
		},
		{
			field: "targetPrice",
			headerName: "Target Price",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "deliveryDate",
			headerName: "Delivery Date",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue ? formatDateViaLocale(params?.formattedValue, userDetail) : ""}</div>,
		},
		{
			field: "glAccount",
			headerName: "GL Account",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		// {
		// 	field: "prOrder",
		// 	headerName: "PR Order",
		// 	flex: 1,
		// 	minWidth: 100,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		{
			field: "remarks",
			headerName: "Remarks",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => (
				<Tooltip title={params?.formattedValue || ""}>
					<div className="content-text">{params?.formattedValue}</div>
				</Tooltip>
			),
		},
		{
			field: "wbsElement",
			headerName: "WBS Element",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "delIndicator",
			headerName: "Del Indicator",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "eventType",
			headerName: "Event Type",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "eventId",
			headerName: "Event ID",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "closeDate",
			headerName: "Close Date",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue ? formatDateViaLocale(params?.formattedValue, userDetail) : ""}</div>,
		},
		{
			field: "reason",
			headerName: "Reason",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => (
				<Tooltip title={params?.formattedValue || ""}>
					<div className="content-text">{params?.formattedValue}</div>
				</Tooltip>
			),
		},
		// {
		// 	field: "poText",
		// 	headerName: "PO Text",
		// 	flex: 1,
		// 	minWidth: 120,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		{
			field: "poVendorName",
			headerName: "POVendorName",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "poNumber",
			headerName: "PONo",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "poValue",
			headerName: "POValue",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "poUnitRate",
			headerName: "PORate",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "poDate",
			headerName: "PODate",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue ? formatDateViaLocale(params?.formattedValue, userDetail) : ""}</div>,
		},
		// {
		// 	field: "trackingNumber",
		// 	headerName: "Tracking Number",
		// 	flex: 1,
		// 	minWidth: 150,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		// {
		// 	field: "purchGroup",
		// 	headerName: "Purchase Group",
		// 	flex: 1,
		// 	minWidth: 150,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		action && {
			field: "Action",
			headerName: "Action",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => (
				<Tooltip title={"Remove Item"}>

					<HiTrash
						className="text-danger text-center ms-2"
						onClick={() => handleDeleteItemSet(params.id)}
					/>

				</Tooltip>
			),
		},
	];

	const prauctioncolumn = [
		{
			field: "prNo",
			headerName: "Pr No",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "lineItemNo",
			headerName: "Item",
			flex: 1,
			minWidth: 80,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "itemCode",
			headerName: "Item/Activity Code",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		// {
		// 	field: "materialDesc",
		// 	headerName: "Material/Activity Desc",
		// 	flex: 2,
		// 	minWidth: 200,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		// {
		// 	field: "materialGrpDesc",
		// 	headerName: "Material/Activity Grp & Desc",
		// 	flex: 2,
		// 	minWidth: 200,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		{
			field: "itemDesc",
			headerName: "Description",
			flex: 2,
			minWidth: 180,
			renderCell: (params) => (
				<Tooltip title={params?.formattedValue || ""}>
					<div className="content-text">{params?.formattedValue}</div>
				</Tooltip>
			),
		},
		{
			field: "quantity",
			headerName: "QTY/UOM",
			flex: 1,
			minWidth: 110,
			renderCell: (params) => (
				<div className="content-text">
					{params?.row?.quantity}{params?.row?.uom ? `(${params?.row?.uom})` : ""}
				</div>
			),
		},
		{
			field: "targetPrice",
			headerName: "Target Price",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "deliveryDate",
			headerName: "Delivery Date",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue ? formatDateViaLocale(params?.formattedValue, userDetail) : ""}</div>,
		},
		{
			field: "glAccount",
			headerName: "GL Account",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		// {
		// 	field: "prOrder",
		// 	headerName: "PR Order",
		// 	flex: 1,
		// 	minWidth: 100,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		{
			field: "remarks",
			headerName: "Remarks",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => (
				<Tooltip title={params?.formattedValue || ""}>
					<div className="content-text">{params?.formattedValue}</div>
				</Tooltip>
			),
		},
		{
			field: "wbsElement",
			headerName: "WBS Element",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "delIndicator",
			headerName: "Del Indicator",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "eventType",
			headerName: "Event Type",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "eventId",
			headerName: "Event ID",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "closeDate",
			headerName: "Close Date",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue ? formatDateViaLocale(params?.formattedValue, userDetail) : ""}</div>,
		},
		{
			field: "reason",
			headerName: "Reason",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => (
				<Tooltip title={params?.formattedValue || ""}>
					<div className="content-text">{params?.formattedValue}</div>
				</Tooltip>
			),
		},
		// {
		// 	field: "poText",
		// 	headerName: "PO Text",
		// 	flex: 1,
		// 	minWidth: 120,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		{
			field: "poVendorName",
			headerName: "POVendorName",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "poNumber",
			headerName: "PONo",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "poValue",
			headerName: "POValue",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "poUnitRate",
			headerName: "PORate",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		},
		{
			field: "poDate",
			headerName: "PODate",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => <div className="content-text">{params?.formattedValue ? formatDateViaLocale(params?.formattedValue, userDetail) : ""}</div>,
		},
		// {
		// 	field: "trackingNumber",
		// 	headerName: "Tracking Number",
		// 	flex: 1,
		// 	minWidth: 150,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		// {
		// 	field: "purchGroup",
		// 	headerName: "Purchase Group",
		// 	flex: 1,
		// 	minWidth: 150,
		// 	renderCell: (params) => <div className="content-text">{params?.formattedValue}</div>,
		// },
		action && {
			field: "Action",
			headerName: "Action",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => (
				<Tooltip title={"Remove Item"}>

					<HiTrash
						className="text-danger text-center ms-2"
						onClick={() => handleDeleteItemSet(params.id)}
					/>

				</Tooltip>
			),
		},
	];

	const handleApiCall = (id, field, value) => {
		if (!value || isNaN(value)) {
			alert("Please enter a valid number");
			return;
		}

		// Example API call
		fetch(`/api/updateItem`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				itemId: id,
				fieldName: field,
				fieldValue: parseFloat(value), // Convert to number
			}),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to update value");
				}
				return response.json();
			})
			.then((data) => {
				console.log("Update successful:", data);
				alert("Value updated successfully");
			})
			.catch((error) => {
				console.error("Error updating value:", error);
				alert("Error updating value");
			});
	};

	const [itemCatAllList, setItemCatAllList] = useState([]);
	const [plantAllList, setPlantAllList] = useState([]);

	const PullItemCateogory = () => {

		var data = {
			CustomerId: customerid,
		};
		FindItemCategory(data, atoken).then((resp) => {

			setItemCatAllList(resp);
		});
	};

	const PullPlantStorage = () => {

		var data = {
			CustomerId: customerid,
		};
		FindPlantStorage(data, atoken).then((resp) => {

			setPlantAllList(resp);
		});
	};
	const [purchaseAllList, setPurchaseAllList] = useState([]);
	const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
	const PullPurchaseOrgAll = () => {

		var data = {
			CustomerId: customerid,
			IsActive: 'true'
		};
		getPurchaseOrgList(data, atoken).then((resp) => {

			if (resp) {
				setPurchaseAllList(resp);

			}
		});
	};

	const PullPurchaseGroupAll = (orgMstId) => {

		var data = {
			CustomerId: customerid,
			OrgMstId: orgMstId,
			IsActive: 'true'
		};
		OrgGroupMasterList(data, atoken).then((res) => {

			if (res != "" && res != undefined) {
				setPurchaseGroupAllList(res);
			}
		});
	};

	// Fetch event stage for PR
	const pullGetEventStage = async (EventTypeId, setList, setLoaded) => {
		// const data = { CustomerId: customerid, IsActive: true, EventType: EventTypeId };
		const data = { CustomerId: customerid, EventType: EventTypeId };

		try {
			const res = await getEventStage(data, atoken);
			setList(res || []);
		} catch (err) {
			console.error("Error fetching event stage:", err);
			setList([]);
		} finally {
			setLoaded(true);
		}
	};

	useEffect(() => {
		pullPRManageFind();
	}, [atoken, customerid]);


	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [gridloading, setGridloading] = useState(false);
	const [searchMode, setSearchMode] = useState(false); // Track if we're in search mode
	const [quickFilterValue, setQuickFilterValue] = useState(''); // Track search query
	const [debouncedQuickFilterValue, setDebouncedQuickFilterValue] = useState('');
	const [searchDataLoaded, setSearchDataLoaded] = useState(false);

	const [QuotesMessage, setQuotesMessage] = useState("You Are Not Authorized To View This");

	const pullPRManageFind = (pageNumber = 1, pageSizeVal = 10, isSearch = false) => {

		var data = {
			CustomerId: customerid,
			//AccessLevel: listaccessLevel,
			SortingColumn: "Id",
		};
		setGridloading(!isSearch);
		if (!isSearch) {
			setSearchDataLoaded(false);
		}

		// If in search mode, fetch all records with a large page size
		const effectivePageSize = isSearch ? 10000 : pageSizeVal;
		const effectivePageNumber = isSearch ? 1 : pageNumber;

		getPRManageFind(data, atoken, effectivePageNumber, effectivePageSize).then((res) => {
			if (!isSearch) {
				setGridloading(false);
			}
			setTotalCount(res?.pageMetadata?.totalCount || 0);
			if (isSearch) {
				setSearchDataLoaded(true);
			}
			if (res?.result && res?.result?.length > 0) {
				// Filter out 'Cancel' stage by default
				setRecorddata(res.result.filter((item) => item.stage !== 'Cancel'));
			} else {
				setRecorddata([]);
				setTotalCount(0);
			}
		});

	};

	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			setDebouncedQuickFilterValue(quickFilterValue);
		}, 400);

		return () => clearTimeout(debounceTimer);
	}, [quickFilterValue]);

	useEffect(() => {
		const hasSearchText = debouncedQuickFilterValue.trim() !== '';

		if (hasSearchText) {
			if (!searchMode) {
				setSearchMode(true);
				setPage(0);
			}
			if (!searchDataLoaded) {
				pullPRManageFind(1, pageSize, true);
			}
			return;
		}

		if (searchMode) {
			setSearchMode(false);
			setPage(0);
			pullPRManageFind(1, pageSize, false);
		}
	}, [debouncedQuickFilterValue, searchMode, searchDataLoaded, pageSize]);

	const [selectedItems, setSelectedItems] = useState([]); // State to store selected items

	const handleItemCheckboxChange = (itemId) => {
		// Toggle the selection state of the item
		setSelectedItems((prevSelectedItems) => {
			if (prevSelectedItems.includes(itemId)) {
				return prevSelectedItems.filter((id) => id !== itemId); // Deselect item
			} else {
				return [...prevSelectedItems, itemId]; // Select item
			}
		});
	};

	const handleSelectSinglePRRFQ = (itemid, boolean) => {
		const updatedList = selectedItems.map((x) => {
			if (x.id === itemid) {
				return {
					...x,
					isSelected: boolean,
				};
			}
			return x;
		});
		setSelectedItems(updatedList);
	};

	const handleSelectAllPRRFQ = (boolean) => {
		const updatedList = selectedItems.map((x) => ({
			...x,
			isSelected: boolean,
		}));
		setSelectedItems(updatedList);
	};

	const handleToggleDetails = (itemId) => {
		// Toggle showDetails state for the specific item ID
		setShowDetails((prevShowDetails) => ({
			...prevShowDetails,
			[itemId]: !prevShowDetails[itemId],
		}));
	};
	const handleAddNewClick = () => {
		navigate("/configuration/manage-pr/add");
	};
	const isItemDetailsVisible = (itemId) => showDetails[itemId];
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const [currentItems, setCurrentItems] = useState([]);

	useEffect(() => {
		const indexOfLastItem = currentPage * itemsPerPage;
		const indexOfFirstItem = indexOfLastItem - itemsPerPage;
		setCurrentItems(selectedItems.slice(indexOfFirstItem, indexOfLastItem));
	}, [currentPage, selectedItems]);

	const formik = useFormik({
		initialValues: {
			Id: "",
			PRSubject: "",
			PRNumber: "",
			PRItems_ItemName: "",
			stage: "",
			PRItems_Plant: "",
			PRItems_ItemCategory: "",
			purchOrgId: null,
			purchGrpId: ""
		},
		onSubmit: (values) => {
			setPrLoading(true);
			const { purchOrgId, purchGrpId, ...restValues } = values;
			const PurchOrgId = values.purchOrgId?.id || 0;
			const PurchGrpId = values.purchGrpId?.id || 0;
			const searchParams = {
				CustomerId: customerid,
				PurchOrgId,
				PurchGrpId,
				...restValues,
				//AccessLevel: listaccessLevel,
			};

			getPRAdvanceFind(searchParams, atoken).then((responseData) => {
				setPrLoading(false);
				// Only show Cancel stage if user explicitly searched for it
				const shouldShowCancel = values?.stage === 'Cancel';
				if (!shouldShowCancel) {
					setRecorddata((responseData || []).filter((item) => item.stage !== 'Cancel'));
				} else {
					setRecorddata(responseData || []);
				}
			});
		},
	});

	const handleReset = () => {
		formik.resetForm();
		pullPRManageFind();
	};
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);


	const [firstpr, setFirstPR] = useState(null);

	const handleChangeRFQPR = (ids) => {

		const selectedItems = recorddata
			.filter((x) => ids.includes(x.id))
			.flatMap((x) => x?.prItems || []);

		setSelectedItems(selectedItems);
	};

	//to add items from pr to rfq
	const [selectedPRITemModal, setSelectedPRItemModal] = useState([]);
	const [rfqItemSet, setRFQItemSet] = useState(new Set());
	console.log("setRFQItemSet:", rfqItemSet)
	const [selectedItemsActive, setSelectedItemsActive] = useState([])
	const [selectedEventType, setSelectedEventType] = useState(null);
	const [closePRModal, setClosePRModal] = useState(false);
	const [closePRFormData, setClosePRFormData] = useState({
		poNumber: '',
		vendorName: '',
		poValue: '',
		unitRate: '',
		poDate: null,
		closeDate: null,
		reason: '',
	});
	const [closePRLoading, setClosePRLoading] = useState(false);
	const [selectedBidType, setSelectedBidType] = useState(null); // For auction types
	const [showAuctionDropdown, setShowAuctionDropdown] = useState(false);


	const handleCreateRFQ = (eventtype) => {

		// Open the RFQ modal directly
		setSelectedEventType(eventtype)
		rfqPrCartOpenModal();
		setShowAuctionDropdown(false)
	};

	const handleCreateAuction = (eventtype) => {

		setSelectedEventType(eventtype)
		setShowAuctionDropdown(true);
	};

	const handleAuctionTypeSelection = (auctionType) => {
		setSelectedBidType(auctionType);
		rfqPrCartOpenModal();
	};

	const handleRFQItemSet = (selectedItems, unselectedItems) => {
		setRFQItemSet((prevSet) => {
			const newSet = new Set(prevSet);

			// Add selected items to the set
			selectedItems.forEach((newItem) => {
				// Check if the set already has an item with the same ID
				const existingItem = Array.from(newSet).find(item => item.id === newItem.id);
				if (!existingItem) {
					newSet.add(newItem);
				}
			});

			// Remove unselected items from the set
			unselectedItems.forEach((itemToRemove) => {
				newSet.forEach((item) => {
					if (item.id === itemToRemove.id) {
						newSet.delete(item);
					}
				});
			});
			return newSet;
		});
	};

	const handleDeleteItemSet = (itemId) => {
		setRFQItemSet((prevSet) => {
			const newSet = new Set(prevSet);
			for (let item of newSet) {
				if (item.id === itemId) {
					newSet.delete(item);
					break;
				}
			}
			return newSet;
		});
	};

	const findSelectedItemsActive = () => {
		const commonObjects = [...rfqItemSet].filter(item => selectedPRITemModal.some(modalItem => item.state === modalItem.state));
		const commonObjectsId = commonObjects.map(x => x.id)
		setSelectedItemsActive(commonObjectsId);
	};
	const selectItemsById = (ids) => {

		const selecteditems = selectedPRITemModal.filter((object) =>
			ids.includes(object.id)
		);
		const unselectedItems = selectedPRITemModal.filter((object) =>
			!ids.includes(object.id)
		);
		setSelectedItemsActive(ids)
		handleRFQItemSet(selecteditems, unselectedItems);
	};

	const openClosePRModal = () => setClosePRModal(true);

	const closeClosePRModal = () => {
		setClosePRModal(false);
		setSelectedItemsActive([]);
		setClosePRFormData({
			poNumber: '',
			vendorName: '',
			poValue: '',
			unitRate: '',
			poDate: null,
			closeDate: null,
			reason: '',
		});
	};

	// const formatClosePRDate = (dateStr) => {
	// 	if (!dateStr) return '';
	// 	const [y, m, d] = dateStr.split('-');
	// 	if (!y || !m || !d) return '';
	// 	return `${m}/${d}/${y}`;
	// };

	const handleClosePRSubmit = async () => {
		if (!closePRFormData.closeDate || !closePRFormData.reason.trim()) {
			toast.error('Please fill all required fields.');
			return;
		}
		setClosePRLoading(true);
		try {
			const selectedItems = selectedPRITemModal.filter((item) =>
				selectedItemsActive.includes(item.id)
			);

			const payload = {
				PrId: firstpr?.id ?? '',
				CustomerId: parseInt(customerid),
				PRLineItems: selectedItems.map((item) => ({
					Id: item.id,
					// LineItemNo: item.lineItemNo ?? item.itemCode ?? '',
					ItemCode: item.itemCode ?? '',
				})),
				CloseDate: closePRFormData.closeDate,
				Reason: closePRFormData.reason,
				PONumber: closePRFormData.poNumber,
				VendorName: closePRFormData.vendorName,
				POValue: closePRFormData.poValue !== '' ? Number(closePRFormData.poValue) : 0,
				UnitRate: closePRFormData.unitRate !== '' ? Number(closePRFormData.unitRate) : 0,
				PODate: closePRFormData.poDate,
			};
			//console.log("Close PR Payload:", payload);
			const res = await apiClient.postres(`/api/PRItemService/closePRItems`, payload, atoken);

			if (res && (res.status === 200 || res.status === 201)) {
				toast.success('PR items closed successfully.');
				setClosePRFormData({
					poNumber: '',
					vendorName: '',
					poValue: '',
					unitRate: '',
					poDate: null,
					closeDate: null,
					reason: '',
				});
				closeClosePRModal();
				setItemModal(false);
				setRFQItemSet(new Set());
				pullPRManageFind();
			} else {
				toast.error('Failed to close PR items.');
			}
		} catch (err) {
			toast.error('Failed to close PR items.');
		} finally {
			setClosePRLoading(false);
		}
	};


	const handleADDtoRFQ = (id) => {

		const selectedFirstPR = recorddata?.find((x) => x.id === id) ?? null;
		if (selectedFirstPR) {
			const selectedItems = selectedFirstPR.prItems.map(item => ({
				...item,
				prNo: selectedFirstPR.prNumber,
				prId: selectedFirstPR.id,
				prSubject: selectedFirstPR.prSubject,
				prDescription: selectedFirstPR.prDescription,
				requisitioner: selectedFirstPR.requisitioner,
				purchOrgId: selectedFirstPR.purchOrgId,
				purchGrpId: selectedFirstPR.purchGrpId
			}));
			setSelectedPRItemModal(selectedItems);
		} else {
			setSelectedPRItemModal([]);
		}

		findSelectedItemsActive();

		setFirstPR(selectedFirstPR);
	};

	const [prloader, setPRLoader] = useState(false)
	//pr to rfq
	const createRFQfromPR = async () => {

		const pritem = Array.from(rfqItemSet);
		// Check if pritem is empty
		if (pritem.length === 0) {
			toast.error("Please select atleast one line item to configure RFQ.");
			return;
		}

		setPRLoader(true)

		// Get PR info from the first selected item instead of stale firstpr state
		const firstItem = pritem[0];
		const activePR = recorddata?.find((x) => x.id === firstItem.prId) || firstpr;

		const data = {
			subject: activePR?.prSubject,
			description: activePR?.prDescription,
			requisitioner: activePR?.requisitioner,
			stage: "Draft",
			startDate: null,
			endDate: new Date(),
			baseCurrency: userDetail && userDetail?.defaultCurrency
				? userDetail?.defaultCurrency
				: "INR",
			termandCondition: 'terms and condition',
			purchGrpId: activePR?.purchGrpId,
			purchOrgId: activePR?.purchOrgId,
			boqReq: activePR?.isBoq || activePR?.boqReq || false, // Maintain BOQ flag from PR
			Version: 1,
			createdById: userDetail?.id,
			createdByName: userDetail?.name,
			customerId: userDetail?.customerId,
			rfqParameters: RFQModalFromPR(pritem, userDetail),
			RFQVersionHistory: [{
				version: 1,
				bidOpeningDate: null,
				autoOpenEnabled: false
			}]
		};
		const statedata = {
			EventType: "RFQ",
			CustomerId: customerid,
			EventId: 0,
			OrgId: activePR?.purchOrgId,
			OrgGroupId: activePR?.purchGrpId,
		}

		const queryParams = buildQueryParams(statedata)
		const stagelist = await apiClient.getres(`/api/EventStage/EventStageFind?${queryParams}`, atoken)

		const prdatapayload = getPayloadWithStage(
			"currentStage",
			"Draft",
			stagelist?.data?.result,
			data,
			"currentStage",
			firstpr?.purchOrgId,
			firstpr?.purchGrpId
		);

		const res = await apiClient.postres(`/api/RFQManage/Add`, prdatapayload, atoken);
		//const res = await apiClient.postres(`/api/RFQManage/Add`, data, atoken);

		if (res) {
			const id = res.data;

			// Fetch and save attachments from selected PR items
			try {
				const prAttachments = await fetchAttachmentsFromPRItems(pritem, 'RFQ', atoken, customerid);
				if (prAttachments && prAttachments?.length > 0) {
					// Update eventId for each attachment
					const attachmentsToSave = prAttachments?.map(att => ({
						...att,
						eventId: id,
						createdById: userDetail?.id,
						createdByName: userDetail?.name
					}));
					// Save attachments
					await handlesaveAttachment(attachmentsToSave, id, atoken);
					console.log(`Saved ${attachmentsToSave.length} attachments from PR to RFQ`);
				}
			} catch (error) {
				console.error("Error saving PR attachments:", error);
				// Don't block RFQ creation if attachment save fails
			}

			toast.success(`RFQ Created successfully.`);
			navigate(`/configuration/manage-rfq/${id}`);
		}
		setPRLoader(false)
	};

	//pr to auction
	const createAuctionFromPR = async () => {

		const pritem = Array.from(rfqItemSet);

		if (pritem.length === 0) {
			toast.error("Please select atleast one line item to configure Auction.");
			return;
		}

		setPRLoader(true)

		// Get PR info from the first selected item instead of stale firstpr state
		const firstItem = pritem[0];
		const activePR = recorddata?.find((x) => x.id === firstItem.prId) || firstpr;

		const data = {
			subject: activePR?.prSubject,
			description: activePR?.prDescription,
			bidSubTypeId: 81,
			bidClosingType: 'A',
			showRankToVendor: 'Y',
			maximumExtension: -1,
			extensionDuration: 2,
			hideVendor: false,
			hidePrice: false,
			baseCurrency: userDetail && userDetail?.defaultCurrency
				? userDetail?.defaultCurrency
				: "INR",
			bidTypeID: selectedBidType?.bidTypeId,
			tnC: "terms and condition",
			stage: "Draft",
			bidStDate: new Date(),
			bidEndDate: new Date(),
			bidDuration: 0,
			configureDate: new Date(),
			prebid: false,
			quotesinWords: false,
			rankToVendorPost: false,
			noOfStaggerItems: 0,
			boqReq: activePR?.isBoq || activePR?.boqReq || false, // Maintain BOQ flag from PR
			createdById: userDetail?.id,
			createdByName: userDetail?.name,
			customerId: userDetail?.customerId,
			bidParamater: AuctionModalFromPR(pritem, userDetail),
		};
		const statedata = {
			EventType: "Auction",
			CustomerId: customerid,
			EventId: 0,
			OrgId: activePR?.purchOrgId,
			OrgGroupId: activePR?.purchGrpId,
		}

		const queryParams = buildQueryParams(statedata)
		const stagelist = await apiClient.getres(`/api/EventStage/EventStageFind?${queryParams}`, atoken)

		const prdatapayload = getPayloadWithStage(
			"currentStage",
			"Draft",
			stagelist?.data?.result,
			data,
			"currentStage",
			firstpr?.purchOrgId,
			firstpr?.purchGrpId
		);

		const res = await apiClient.postres(`/api/AuctionManage/Add`, prdatapayload, atoken);
		if (res) {

			const id = res.data;

			// Fetch and save PR attachments to the new Auction
			try {
				const prAttachments = await fetchAttachmentsFromPRItems(pritem, 'Auction', atoken, customerid);
				if (prAttachments && prAttachments.length > 0) {
					const attachmentsToSave = prAttachments.map(att => ({
						...att,
						eventId: id,
						createdById: userDetail?.id,
						createdByName: userDetail?.name
					}));
					await handlesaveAttachment(attachmentsToSave, id, atoken);
				}
			} catch (err) {
				console.error('Failed to copy PR attachments to Auction:', err);
				// Don't block the auction creation flow
			}

			const bidTypeMap = {
				1: 'Forward Auction',
				2: 'Reverse Auction',
				3: 'Freight Auction',
				4: 'Formula Based Auction',
				5: 'French Forward Auction',
				6: 'French Reverse Auction'
			};
			const BidType = bidTypeMap[selectedBidType?.bidTypeId];
			const selectedBid = Object.values(bidlist).find(
				(item) => item.bidTypeName === BidType
			);

			if (selectedBid) {
				dispatch({ type: actionTypes.SET_Bidtype, value: selectedBid });
				var jsonStringTemp = JSON.stringify(selectedBid);
				var selectedBidCookie = CryptoJS.AES.encrypt(`${jsonStringTemp}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
				setCookie("pcbt", selectedBidCookie, { path: '/', maxAge: 86400 });
				navigate(`/configuration/manage-auction/${id}`);

			} else {
				toast.error("Please contact to Administrator.");
			}
			toast.success(`Auction Created successfully.`);
		}
		setPRLoader(false)
	};

	const [divVisible, setDivVisible] = useState(false);

	const toggleDivVisibility = () => {
		setDivVisible(!divVisible);
	};

	const closeDivVisibility = () => {
		setDivVisible(false);
	};
	const CustomToolbar = React.useCallback(({ onFilterClick }) => {
		return (
			<GridToolbarContainer className="row">
				<div className="d-flex justify-content-between mt-2 ">

					<div>
						<GridToolbarColumnsButton />
						<GridToolbarFilterButton className="ms-2" />
						<GridToolbarExport className="ms-2" />
					</div>
					<div className="d-flex align-items-center gap-2">
						<GridToolbarQuickFilter />
						<div
							className="filterIconCircle shadow-sm"
							onClick={onFilterClick}
							title="Open Filters"
						>
							<FilterListIcon />
						</div>
					</div>
				</div>
			</GridToolbarContainer>
		);
	}, []);
	const [prLoading, setPrLoading] = useState(false);

	//###
	return (
		<>
			<div className="mainContainer d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
				{/* LEFT CONTENT */}
				<div className={`leftContent ${divVisible ? "col-9" : "col-12"}`} style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
					<div className="bg-white rounded-default shadow-sm p-3" style={{ height: 'calc(100vh - 90px)', margin: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
						<div className="d-flex justify-content-between border-bottom align-items-center pb-2 mb-2" style={{ flexShrink: 0 }}>
							<div className="page-heading text-dark-blue">
								<BackButton title="Manage PR" />
							</div>

							<div className="d-flex align-items-center gap-2">
								<Button
									variant="text"
									size="large"
									startIcon={<HiPlusSm />}
									className="text-capitalize blue-text font-normal"
									onClick={handleAddNewClick}
								>
									Add New
								</Button>
								{rfqItemSet?.size > 0 && (
									<>
										<Dropdown>
											<Dropdown.Toggle
												variant="text"
												size="small"
												className="text-capitalize font-normal"
											>
												<span className="button-text">
													Create Event
												</span>
												<Badge className="ml-3rem" color="primary" pill>
													{rfqItemSet?.size}
												</Badge>
											</Dropdown.Toggle>

											<Dropdown.Menu>
												<Dropdown.Item onClick={() => handleCreateRFQ("RFQ")}>
													<span className="f11 fw500">Create RFQ</span>
												</Dropdown.Item>
												<Dropdown.Item onClick={() => handleCreateAuction("Auction")}>
													<span className="f11 fw500">Create Auction</span>
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>

										{/* Show Auction Type dropdown only when applicable */}
										{showAuctionDropdown && (
											<Dropdown>
												<Dropdown.Toggle
													variant="outlined"
													size="small"
													className="text-capitalize font-normal"
												>
													<span className="button-text">
														Select Auction Type
													</span>
												</Dropdown.Toggle>
												<Dropdown.Menu>
													{[
														{ label: "Forward Auction", bidTypeId: 1 },
														{ label: "Reverse Auction", bidTypeId: 2 },
														{ label: "Freight Auction", bidTypeId: 3 },
														{ label: "Formula Based Auction", bidTypeId: 4 },
														{ label: "French Forward Auction", bidTypeId: 5 },
														{ label: "French Reverse Auction", bidTypeId: 6 },
													].map((option) => (
														<Dropdown.Item
															key={option.bidTypeId}
															onClick={() => handleAuctionTypeSelection(option)}
														>
															<span className="f11 fw500">{option.label}</span>
														</Dropdown.Item>
													))}
												</Dropdown.Menu>
											</Dropdown>
										)}
									</>
								)}
							</div>
						</div>

						<div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
							{gridloading && !searchMode ? (
								<GridSkeleton />
							) : recorddata?.length === 0 ? (
								<div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
									<h5 className="text-muted">No PR found</h5>
								</div>
							) : (
								<DataGrid
									disableColumnSelector
									getRowId={getRowId}
									rows={recorddata}
									loading={gridloading && !searchMode}
									columns={columns}
									pagination
									paginationMode={searchMode ? "client" : "server"}
									pageSizeOptions={[10, 25, 50, 100]}
									rowCount={searchMode ? recorddata.length : totalCount}
									paginationModel={{ page: page, pageSize: pageSize }}
									onPaginationModelChange={(model) => {
										if (model.page !== page) {
											setPage(model.page);
										}
										if (model.pageSize !== pageSize) {
											setPageSize(model.pageSize);
											setPage(0);
										}
										if (!searchMode) {
											const nextPageNumber = model.pageSize !== pageSize ? 1 : model.page + 1;
											pullPRManageFind(nextPageNumber, model.pageSize, false);
										}
									}}
									onFilterModelChange={(filterModel) => {
										const nextQuickFilterValue = filterModel?.quickFilterValues?.[0] || '';
										setQuickFilterValue((prevQuickFilterValue) =>
											prevQuickFilterValue === nextQuickFilterValue ? prevQuickFilterValue : nextQuickFilterValue
										);
									}}
									rowHeight={45}
									columnHeaderHeight={40}
									className="f13 border-0"
									disableRowSelectionOnClick
									disableColumnResize
									disableColumnReorder
									sx={{
										height: '100%',
										width: '100%',
										border: 'none',
										'& .MuiDataGrid-main': {
											overflow: 'hidden',
										},
										'& .MuiDataGrid-virtualScroller': {
											overflowY: 'auto',
											overflowX: 'hidden',
											'&::-webkit-scrollbar': {
												width: '8px',
											},
											'&::-webkit-scrollbar-track': {
												background: '#f1f1f1',
												borderRadius: '10px',
											},
											'&::-webkit-scrollbar-thumb': {
												background: '#888',
												borderRadius: '10px',
												'&:hover': {
													background: '#555',
												},
											},
										},
										'& .MuiDataGrid-footerContainer': {
											minHeight: '52px',
											maxHeight: '52px',
											borderTop: '1px solid #e0e0e0',
											backgroundColor: '#fff',
										},
										'& .MuiDataGrid-columnHeaders': {
											backgroundColor: '#fafafa',
											borderBottom: '2px solid #e0e0e0',
										}
									}}
									getRowClassName={(params) =>
										params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
									}
									onRowSelectionModelChange={(ids) => handleChangeRFQPR(ids)}
									isRowSelectable={(params) =>
										params.row.prItems.length > 0 && params?.row.stage == "Open"
									}
									slots={{
										toolbar: CustomToolbar,
									}}
									slotProps={{
										toolbar: {
											onFilterClick: toggleDivVisibility,
											showQuickFilter: true,
											quickFilterProps: {
												debounceMs: 400,
											},
										},
									}}
								/>
							)}
						</div>
					</div>
				</div>

				<div className={`rightContent ${divVisible ? " col-3" : "d-none"}`}>
					<div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column ms-3 right-panel-container">
						<form onSubmit={formik.handleSubmit} autoComplete="off" className="d-flex flex-column flex-grow-1">
							<div className="d-flex flex-column flex-grow-1" style={{ height: '100%' }}>
								<div className="d-flex justify-content-between border-bottom align-items-center py-1">
									<div className="page-heading text-dark-blue ms-2">
										Advance Search
									</div>
									<IconButton onClick={closeDivVisibility} size="small" edge="start">
										<HiOutlineX className="f16" />
									</IconButton>
								</div>
								<div className="flex-grow-1">
									<div className="p-3 ps-2 pe-2">
										<div className="row">
											<div className="col-12 mb-3">
												<TextFieldCell
													id="Id"
													name="Id"
													label="PR ID"
													className="textDefault text-dark-blue"
													value={formik?.values?.Id}
													onChange={(e) => {
														formik?.setFieldValue("Id", e.target?.value);
													}}
												/>
											</div>
											<div className="col-12 mb-3">
												<TextFieldCell
													id="PRSubject"
													name="PRSubject"
													label="PR Subject"
													placeholder=""
													maxLength={200}
													className="textDefault text-dark-blue"
													value={formik?.values?.PRSubject}
													onChange={(e) => {
														formik?.setFieldValue("PRSubject", e.target?.value);
													}}
													InputProps={{
														endAdornment: formik?.values?.PRSubject && (
															<InputAdornment position="end">
																<Typography variant="body2" className="content-text">
																	{formik?.values?.PRSubject.length}/200
																</Typography>
															</InputAdornment>
														),
													}}
												/>
											</div>

											<div className="col-12 mb-3">
												<TextFieldCell
													id="PRNumber"
													name="PRNumber"
													label="PR No."
													placeholder=""
													className="textDefault text-dark-blue"
													value={formik?.values?.PRNumber}
													onChange={(e) => {
														formik?.setFieldValue("PRNumber", e?.target?.value);
													}}
												/>
											</div>

											<div className="col-12 mb-3">
												<TextFieldCell
													id="PRItems_ItemName"
													name="PRItems_ItemName"
													label="Item Name"
													placeholder=""
													className="textDefault text-dark-blue"
													value={formik?.values?.PRItems_ItemName}
													onChange={(e) => {
														formik?.setFieldValue("PRItems_ItemName", e.target?.value);
													}}
												/>
											</div>

											<div className="col-12 mb-3">
												<FormControl fullWidth className="textDefault text-dark-blue">
													<InputLabel id="PRItems_Plant" className="textDefault text-dark-blue">Plant</InputLabel>
													<Select
														labelId="PRItems_Plant"
														InputLabelProps={{ shrink: true }}
														variant="outlined"
														size="small"
														id="PRItems_Plant"
														name="PRItems_Plant"
														value={formik?.values?.PRItems_Plant}
														label="Plant"
														onChange={(e) => {
															formik?.setFieldValue("PRItems_Plant", e.target?.value);
														}}
														className="textDefault text-dark-blue"
														onOpen={() => {

															// Call API only when user opens the dropdown
															if (!plantAllList || plantAllList.length === 0) {
																PullPlantStorage();
															}
														}}
													>
														{plantAllList?.map((option, i) => (
															<MenuItem
																key={i}
																value={`${option.slDesc} - ${option.slCode?.trim()}`}
																className="textDefault text-dark-blue"
															>
																{`${option.slDesc} - ${option.slCode?.trim()}`}
															</MenuItem>
														))}
													</Select>
												</FormControl>
											</div>

											<div className="col-12 mb-3">
												<FormControl fullWidth className="textDefault text-dark-blue">
													<InputLabel id="PRItems_ItemCategory" className="textDefault text-dark-blue">
														Item Category
													</InputLabel>
													<Select
														labelId="PRItems_ItemCategory"
														InputLabelProps={{ shrink: true }}
														variant="outlined"
														size="small"
														id="PRItems_ItemCategory"
														name="PRItems_ItemCategory"
														value={formik?.values?.PRItems_ItemCategory}
														label="Item Category"
														onChange={(e) => {
															formik?.setFieldValue("PRItems_ItemCategory", e.target?.value);
														}}
														className="textDefault text-dark-blue"
														onOpen={() => {
															// Call API only when user opens the dropdown
															if (!itemCatAllList || itemCatAllList.length === 0) {
																PullItemCateogory();
															}
														}}
													>
														{itemCatAllList?.map((option, i) => (
															<MenuItem
																key={i}
																value={option?.categoryDescription}
																className="textDefault text-dark-blue"
															>
																{option?.categoryDescription}
															</MenuItem>
														))}
													</Select>
												</FormControl>
											</div>

											<div className="col-12 mb-3">
												<Autocomplete
													id="purchOrgId"
													name="purchOrgId"
													size="small"
													className="w-100 textDefault text-dark-blue"
													sx={{ width: "100%" }}
													options={purchaseAllList}
													value={formik?.values?.purchOrgId}
													getOptionLabel={(option) => option?.orgName ?? ""}
													onOpen={() => {

														// Call only if data not already loaded
														if (!purchaseAllList || purchaseAllList.length === 0) {
															PullPurchaseOrgAll();
														}
													}}
													onChange={(e, value) => {
														formik.setFieldValue("purchOrgId", value);
														formik.setFieldValue("purchGrpId", null);
													}}
													renderOption={(props, option) => (
														<Box component="li" {...props}>
															{option?.orgName}
														</Box>
													)}
													renderInput={(params) => (
														<TextField
															{...params}
															variant="outlined"
															label="Purchase Org"
															size="small"
														/>
													)}
												/>
											</div>

											<div className="col-12 mb-3">
												<Autocomplete
													id="purchGrpId"
													name="purchGrpId"
													className="w-100 textDefault text-dark-blue"
													sx={{ width: "50%" }}
													options={purchaseGroupAllList}
													getOptionLabel={(option) => option?.groupName ?? ""}
													value={formik?.values?.purchGrpId}
													onOpen={() => {

														// Load groups only if org is already selected
														if (
															formik?.values?.purchOrgId?.id &&
															(!purchaseGroupAllList || purchaseGroupAllList.length === 0)
														) {
															PullPurchaseGroupAll(formik.values.purchOrgId.id);
														}
													}}
													onChange={(e, value) => {
														formik.setFieldValue("purchGrpId", value);
													}}
													renderOption={(props, option) => (
														<Box component="li" {...props}>
															{option?.groupName}
														</Box>
													)}
													renderInput={(params) => (
														<TextField
															{...params}
															variant="outlined"
															size="small"
															label="Purchase Group"
														/>
													)}
												/>
											</div>

											<div className="col-12 mb-4">
												<FormControl fullWidth className="textDefault text-dark-blue">
													<InputLabel id="Status" className="textDefault text-dark-blue">Status</InputLabel>
													<Select
														labelId="stage"
														InputLabelProps={{ shrink: true }}
														variant="outlined"
														size="small"
														id="stage"
														name="stage"
														value={formik?.values?.stage}
														label="stage"
														onChange={(e) => {
															formik?.setFieldValue("stage", e.target?.value);
														}}
														onOpen={() => {
															if (!prStatusLoaded) pullGetEventStage("PR", setPrStatusList, setPrStatusLoaded);
														}}
														className="textDefault text-dark-blue"
													>
														{prStatusList.length
															? prStatusList.map(item => (
																<MenuItem key={item.id} value={item.stageName} className="textDefault text-dark-blue">
																	{item.stageName}
																</MenuItem>
															))
															: <MenuItem disabled>No options available</MenuItem>}
													</Select>
												</FormControl>
											</div>

											<div className="col-12 text-end">
												<LoadingButton
													variant="contained"
													color="primary"
													className="me-3 text-capitalize textDefault text-white"
													onClick={handleReset}
													type="button"
												>
													Clear
												</LoadingButton>
												<LoadingButton
													loading={prLoading}
													variant="outlined"
													color="primary"
													className="text-capitalize textDefault text-dark-blue"
													size="medium"
													type="submit"
												>
													Submit
												</LoadingButton>
											</div>
										</div>
									</div>
								</div>
							</div>
						</form>
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
									<div className="ms-3 text-white">Add Workflow</div>
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
							<Box sx={{ flexGrow: 1, p: 2 }}>d</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>

			<Modal
				size="lg"
				show={modal}
				backdrop="static"
				keyboard={false}
				className="zindex10002"
				backdropClassName="zindex10002"
				centered
				contentClassName="border-0 rounded-default"
				onHide={() => CloseModal()}
			>

				<Modal.Header className="pt-2 pb-2 modal-custom-header">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center modal-title-text text-white">
							What would you like to do?
						</div>
					</Modal.Title>
					<IconButton onClick={() => CloseModal()} size="small" edge="start">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<div className="row">
							<div className="col-12">
								<FormControl>
									<RadioGroup
										aria-labelledby=""
										defaultValue="new"
										name="new-pr"
										value={value}
										onChange={handleChange}
									>
										<FormControlLabel
											value="new"
											control={<Radio />}
											label="Create a New PR"
										/>
									</RadioGroup>
								</FormControl>
							</div>

							<div className="col-12 mt-4 text-end">
								<LoadingButton
									variant="outlined"
									onClick={() => navigate("/configuration/manage-pr/add")}
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


			<Modal
				size="xl"
				show={itemmodal}
				backdrop="static"
				centered
				className="zindex1280"
				backdropClassName="zindex1280"
				onHide={ItemCloseModal}
			>
				<Modal.Header className="pt-2 pb-2 modal-custom-header">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center modal-title-text text-white">
							PR No : {firstpr?.prNumber}
						</div>
					</Modal.Title>

					<div className="d-flex align-items-center gap-2">
						{selectedItemsActive.length > 0 && (
							<Button
								variant="contained"
								size="small"
								className="text-capitalize"
								color="error"
								onClick={openClosePRModal}
								style={{ fontSize: '11px', fontWeight: 500 }}
							>
								Close PR
								<Badge className="ms-2" bg="light" text="dark" pill>
									{selectedItemsActive.length}
								</Badge>
							</Button>
						)}
						<IconButton onClick={ItemCloseModal} size="small" edge="start">
							<HiOutlineX className="f20 text-white" />
						</IconButton>
					</div>
				</Modal.Header>

				<Modal.Body className="p-0">
					<div className="bg-white p-3">
						<div className="row">
							<div style={{ height: "400px", width: "100%" }}>
								<DataGrid
									rows={selectedPRITemModal}
									columns={prrfqcolumn}
									//pageSize={10}
									checkboxSelection
									onRowSelectionModelChange={(ids) => selectItemsById(ids)}
									rowSelectionModel={selectedItemsActive}
									rowHeight={40}
									columnHeaderHeight={40}
									className="consistent-datagrid bg-white"
									disableRowSelectionOnClick
									isRowSelectable={(params) => {
										return !params?.row?.eventId && !params?.row?.closeDate;
									}}
									pagination
									pageSizeOptions={[10, 25, 50]}
									initialState={{
										pagination: { paginationModel: { pageSize: 10, page: 0 } },
									}}
								/>
							</div>
						</div>
					</div>
				</Modal.Body>
			</Modal>


			<Modal
				size="xl"
				show={rfqprcartmodal}
				backdrop="static"
				centered
				// contentClassName="border-0 rounded-default"
				className="zindex1280"
				backdropClassName="zindex1280"
				onHide={() => rfqPrCartCloseModal()}
			>

				<Modal.Header className="pt-2 pb-2 modal-custom-header">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center modal-title-text text-white">
							{selectedEventType === "RFQ"
								? "Create RFQ From PR"
								: selectedBidType?.bidTypeId === 1
									? "Create Forward Auction From PR"
									: selectedBidType?.bidTypeId === 2
										? "Create Reverse Auction From PR"
										: selectedBidType?.bidTypeId === 3
											? "Create Freight Auction From PR"
											: selectedBidType?.bidTypeId === 4
												? "Create Formula Based Auction From PR"
												: selectedBidType?.bidTypeId === 5
													? "Create French Forward Auction From PR"
													: selectedBidType?.bidTypeId === 6
														? "Create French Reverse Auction From PR"
														: "Create Auction From PR"}
						</div>
					</Modal.Title>
					<IconButton
						onClick={() => rfqPrCartCloseModal()}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="">
					<div className="p-3">
						<div className="row">
							<div style={{ height: '400px', width: '100%' }}>
								<DataGrid
									getRowId={getBRRowId}
									rows={Array.from(rfqItemSet)}
									columns={selectedEventType === 'RFQ' ? prrfqcolumn.filter(col => col?.field !== 'eventId' && col?.field !== 'eventType' && col?.field !== 'reason' && col?.field !== 'closeDate') : prauctioncolumn}
									//pageSize={10}
									onSelectionModelChange={(ids) => selectItemsById(ids)}
									selectionModel={selectedItemsActive}
									rowHeight={40}
									columnHeaderHeight={40}
									className="consistent-datagrid bg-white"
									disableSelectionOnClick
									pagination
									pageSizeOptions={[10, 25, 50]}
									initialState={{
										pagination: { paginationModel: { pageSize: 10, page: 0 } },
									}}
								/>
							</div>
						</div>

					</div>
				</Modal.Body>
				{/*  Footer Section */}
				{Array.from(rfqItemSet).length > 0 && (

					<div className="d-flex justify-content-end px-3 pb-3">
						<Button
							variant="outlined"
							className="me-2"
							onClick={rfqPrCartCloseModal}
						>
							Cancel
						</Button>
						<LoadingButton
							loading={prloader}
							variant="contained"
							onClick={() => setShowConfirmationModal(true)}
						>
							Confirm
						</LoadingButton>
					</div>
				)}

			</Modal>

			<Dialog
				open={showConfirmationModal}
				onClose={() => setShowConfirmationModal(false)}
				maxWidth="sm"
				fullWidth
				aria-labelledby="confirm-submission-dialog-title"
				PaperProps={{
					sx: { borderRadius: 2 },
				}}
			>
				<DialogTitle
					className="dialog-title"
					id="confirm-submission-dialog-title"
				>
					<div className="d-flex justify-content-between align-items-center">
						<span className="page-heading">Create event from selected PR items. Do you want to continue?</span>
						<IconButton onClick={() => setShowConfirmationModal(false)} size="small">
							<HiOutlineX className="f20" style={{ color: '#1a2742' }} />
						</IconButton>
					</div>
				</DialogTitle>
				<DialogActions className="dialog-actions">
					<Button
						onClick={() => setShowConfirmationModal(false)}
						variant="outlined"
					// className="me-2"
					>
						Cancel
					</Button>
					<LoadingButton
						onClick={() => {
							setShowConfirmationModal(false);
							selectedEventType === "RFQ"
								? createRFQfromPR()
								: createAuctionFromPR();
						}}
						loading={prloader}
						variant="contained"
					>
						{selectedEventType == 'RFQ' ? 'Create RFQ' : 'Create Auction'}
					</LoadingButton>
				</DialogActions>
			</Dialog>

			{/* Close PR Items Modal */}
			<Modal
				size="lg"
				show={closePRModal}
				backdrop="static"
				centered
				className="zindex10002"
				backdropClassName="zindex10002"
				contentClassName="border-0 rounded-default"
				onHide={closeClosePRModal}
			>
				<Modal.Header className="pt-2 pb-2 modal-custom-header">
					<Modal.Title id="close-pr-modal-heading">
						<div className="d-flex align-items-center modal-title-text text-white">
							Close PR Items
						</div>
					</Modal.Title>
					<IconButton onClick={closeClosePRModal} size="small" edge="start">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>

				<Modal.Body className="p-4">
					<div className="row g-3">
						{/* Row 1 */}
						<div className="col-md-6">
							<TextField
								label="PO Number"
								placeholder="PO Number"
								fullWidth
								size="small"
								variant="outlined"
								className="textDefault"
								value={closePRFormData.poNumber}
								onChange={(e) => setClosePRFormData(prev => ({ ...prev, poNumber: e.target.value }))}
							/>
						</div>
						<div className="col-md-6">
							<TextField
								label="Vendor Name"
								placeholder="Vendor Name"
								fullWidth
								size="small"
								variant="outlined"
								className="textDefault"
								value={closePRFormData.vendorName}
								onChange={(e) => setClosePRFormData(prev => ({ ...prev, vendorName: e.target.value }))}
							/>
						</div>

						{/* Row 2 */}
						<div className="col-md-6">
							<TextField
								label="PO Value"
								placeholder="PO Value"
								type="number"
								fullWidth
								size="small"
								variant="outlined"
								className="textDefault"
								value={closePRFormData.poValue}
								onChange={(e) => setClosePRFormData(prev => ({ ...prev, poValue: e.target.value }))}
							/>
						</div>
						<div className="col-md-6">
							<TextField
								label="Unit Rate"
								placeholder="Unit Rate"
								type="number"
								fullWidth
								size="small"
								variant="outlined"
								className="textDefault"
								value={closePRFormData.unitRate}
								onChange={(e) => setClosePRFormData(prev => ({ ...prev, unitRate: e.target.value }))}
							/>
						</div>

						{/* Row 3 */}
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<div className="col-md-6">
								<MobileDateTimePicker
									variant="outlined"
									label="PO Date"
									size="small"
									timezone={userDetail?.timeZone}
									value={closePRFormData.poDate}
									className="w-100 f14"
									slotProps={{
										textField: {
											variant: 'outlined',
											size: 'small',
											InputLabelProps: { shrink: true },
										},
										actionBar: { actions: ['clear', 'cancel', 'accept'] },
										dialog: { sx: { zIndex: 20000 } },
									}}
									onChange={(newValue) => setClosePRFormData(prev => ({ ...prev, poDate: newValue }))}
									format={getDateFormatPatteronLocale(userDetail)}
									ampm={userampm(userDetail)}
								/>
							</div>
							<div className="col-md-6">
								<MobileDateTimePicker
									variant="outlined"
									label="Close Date *"
									size="small"
									timezone={userDetail?.timeZone}
									value={closePRFormData.closeDate}
									className="w-100 f14"
									slotProps={{
										textField: {
											variant: 'outlined',
											size: 'small',
											InputLabelProps: { shrink: true },
										},
										actionBar: { actions: ['clear', 'cancel', 'accept'] },
										dialog: { sx: { zIndex: 20000 } },
									}}
									onChange={(newValue) => setClosePRFormData(prev => ({ ...prev, closeDate: newValue }))}
									format={getDateFormatPatteronLocale(userDetail)}
									ampm={userampm(userDetail)}
								/>
							</div>
						</LocalizationProvider>

						{/* Row 4 - Reason */}
						<div className="col-12">
							<TextField
								label="Reason *"
								fullWidth
								multiline
								rows={4}
								variant="outlined"
								className="textDefault"
								value={closePRFormData.reason}
								onChange={(e) => setClosePRFormData(prev => ({ ...prev, reason: e.target.value }))}
							/>
						</div>
					</div>
				</Modal.Body>

				<Modal.Footer className="d-flex justify-content-center gap-3 border-0 pb-3">
					<LoadingButton
						loading={closePRLoading}
						variant="contained"
						color="primary"
						className="text-capitalize px-4"
						onClick={handleClosePRSubmit}
					>
						Submit
					</LoadingButton>
					<Button
						variant="contained"
						style={{ backgroundColor: '#b8860b', color: '#fff' }}
						className="text-capitalize px-4"
						onClick={closeClosePRModal}
					>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>

		</>
	);
};

export default ManagePR;
