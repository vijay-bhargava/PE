import React, { useState, useCallback, useEffect } from "react";
import { Autocomplete, Box, Button, Chip, DialogActions, DialogContent, DialogContentText, Drawer, IconButton, InputAdornment, MenuItem, Switch, TextField, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { HiOutlineChevronDown, HiOutlineChevronRight, HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { useFormik } from "formik";
import { useStateValue } from "../../../store";
import AddEditCell from "./AddEditCell";
import {
	getCommercialList,
	getCommercialListFind,
	getCommLibList,
	getMenuMaster,
	updateCommercial,
} from "../../../utils/commerciallibrary";
import { useRef } from "react";
import { LibraryFindAll } from "../../../utils/questionlibrary";
import { DataGrid, GridColumnHeaderTitle, GridToolbar } from "@mui/x-data-grid";
import { BackButton } from "../../../utils/common/component";
import useResponsiveColumns from "../../../components/useResponsiveColumns";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { api, ApiClient } from "../../../Apiclient";
import { LoadingButton } from "@mui/lab";
import { useLocation, useNavigate } from "react-router-dom";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { toast } from "react-toastify";
import CommercialTerms from "./CommercialTerms";
import { ExpandMore } from "@mui/icons-material";
const ShowCommercialTerms = () => {
	const [{ atoken, customerid,customersuffix }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	const navigate = useNavigate();
	const [state, setState] = useState({
		opensidebar: false,
	});
	const toggleDrawer = (anchor, open) => (event) => {
		//
		if (open == false) {
			seteditRecordData(null);
		}
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};
	
    const [expanded, setExpanded] = React.useState('panel1');
	const [editRecordData, seteditRecordData] = useState(null);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [recorddata, setRecorddata] = useState([]);
	const [id, setId] = useState(1);

	const [loading, setLoading] = useState(false);

	
	const [eventtype, SetEventType] = useState("");


	
	const [isActive, setIsActive] = useState(true);
	const [createdon, setCreatedon] = useState("2023-09-11T10:39:57.410Z");

	const callbackstep = useCallback((data) => {
		
		setState({ ...state, "opensidebar": false });
		seteditRecordData(null);
		pullCommercialList();
	}, []);
	useEffect(() => {
		PullLibraryList();
		pullCommercialList();
		pullMenuMaster();
	}, []);

	const callbackedit = useCallback((data) => {
		console.log("data to edit", data);
		seteditRecordData(data);
		setState({ ...state, opensidebar: true });
	}, []);
	const UpdateStageStatus = (data, id, atoken) => {
		
		if (id > 0) {
			updateCommercial(data, id,data?.fieldNameGroup, atoken).then((res) => {
				pullCommercialList();
			});
		}
	};
	const [selectedLibraryId, setSelectedLibraryId] = useState(null); 
	const handleStatus = (rowValue, isActive) => {
		console.log(rowValue);

		if (isActive) {
			isActive = false;
		} else {
			isActive = true;
		}

		rowValue.isActive = isActive;
          
		UpdateStageStatus(rowValue, rowValue.id, atoken);
	};
	const pullCommercialList = (libraryId) => {
		var data = {
			CustomerId: customerid,
			SortingColumn: "Id",
		    LibraryId:libraryId
		};

		setLoading(true);

		getCommercialList(data, atoken).then((res) => {
			
			console.log(data);
			setGridloading(true);
			// if (res?.length) {
				
			// 	setRecorddata(res);
			// 	setTotalRecords(res[0]?.totalrecords);
			// 	setGridloading(false);
			// 	setPageCount(Math.ceil(res[0]?.totalrecords / 10));
			// }

			if (res?.length) {
				
				setRecorddata(res);
				setTotalRecords(res?.length);
				setGridloading(false);
				setPageCount(Math.ceil(res?.length/10));
			}

			setLoading(false);
			setGridloading(false);
		});
	};

	//to handle grand total term name 
	const [openDrawer, setOpenDrawer] = useState({
		LibraryGrandTotal: false	
	  }); 
	const toggleOpenDrawer = (anchor, open) => {
		setOpenDrawer({ ...openDrawer, [anchor]: open });
	};
    
	const handleLibraryGrandTotalTerm= async(v)=>{
		;
        const libraryId  = selectedrow;
		 
		const data={
			id:libraryId,
			grandTotalTermName:v?.grandTotalTermName
		}
		const res = await apiClient.postres(`/api/LibraryOrgEntity/Update`,data,atoken)
		if(res){
			toast.success(`Term updated Successfully`,{
				toastid:"grandTotalTermName"
			})

			pullCommercialList()
		}
	}
	const [expandedLibraryId, setExpandedLibraryId] = useState(null); 
	const handleAccordionChange = (libraryId) => {
		setExpandedLibraryId((prev) => (prev === libraryId ? null : libraryId)); // Toggle accordion open/close
	  };
	
	const [libraryList, setlibraryList] = useState([]);

	const PullLibraryList = () => {
		var data = {
			CustomerId: customerid,
			LibraryType:'CommercialLibrary',
			IsActive:true
		};
		LibraryFindAll(data,atoken).then((res) => {
			
			setlibraryList(res);
		});
	};

	const formik = useFormik({
		initialValues: {
			customerid: customerid,
			name: "",
			libraryName: "",
			libraryId: 0,
			eventtype: "",
			required: true,
			isActive: true,
			createdon: createdon,
		},
		onSubmit: (values) => {
			console.log(values);
			getCommercialList(values).then((res) => {
				if (res != "") {
					setRecorddata(res);
				}
				setLoading(false);
			});
		},
	});
	const [showCommercialTerms, setShowCommercialTerms] = useState(false); // State to control visibility
	const [libraryName, setlibraryName] = useState();
	const [GrandTotalName, setGrandTotalName] = useState();

	const handleLibraryClick = (row) => {
		;
        setSelectedLibraryId(row.id);  // Set selected Library ID
        // Fetch record data for this library
		setlibraryName(row.libraryEntity);
		setGrandTotalName(row.grandTotalTermName);
		setRecorddata(row);
        pullCommercialList(row.id);
    };
	
	const getMenuItemName = (MenuItemCode) => {
		const MenuItem = MenuMasterList.find(
			(data) => data?.menuIdentity === MenuItemCode
		);
		return MenuItem ? MenuItem.menuName : "";
	};
	const [gridloading, setGridloading] = useState(true);
	
  const columnWidths = useResponsiveColumns();
  const [selectedrow,setSelectedRow]=useState(null)
//   const columns = [

// 	{
// 		field: "libraryEntity",
// 		headerName: "Library Name",
// 		width: 400,
// 		renderCell: (params) => (
// 		  <Button
// 			onClick={() => handleLibraryClick(params.row)}
// 			style={{ textTransform: 'none' }}
// 		  >
// 			{params.value}
// 		  </Button>
// 		),
// 	  },
   
  
	

//     {
//       field: "isActive",
//       headerName: "Status",
//       width: columnWidths.organisation,
//       renderCell: (params) => (
//         <Switch
//           checked={params.value}
//           onChange={() => handleStatus(params.row, params.value)}
//           inputProps={{ "aria-label": "controlled" }}
//           classes={{
//             thumb: "MuiSwitch-thumb",
//             switchBase: "MuiSwitch-switchBase",
//             checked: "Mui-checked",
//           }}
//         />
//       ),
//     },
   
//   ];
// const columns = [
//     {
//       field: 'libraryEntity',
//       headerName: 'Library Name',
//       flex: 1,
//       renderCell: (params) => (
//         <div className="d-flex justify-content-between w-100">
//           <Typography variant="body1">{params.row.libraryEntity}</Typography>
//         </div>
//       ),
//     },
//     {
//       field: 'accordion',
//       headerName: 'Accordion',
//       renderCell: (params) => (
//         <Accordion
//           expanded={expandedLibraryId === params.row.libraryId}
//           onChange={() => handleAccordionChange(params.row.libraryId)}
//           className="w-100"
//         >
//           <AccordionSummary expandIcon={<ExpandMore />}>
//             <Typography variant="body2">Show Details</Typography>
//           </AccordionSummary>
//           <AccordionDetails>
//             {expandedLibraryId === params.row.libraryId && (
//               <div style={{ width: '100%', height: 'auto' }}>
//                 <DataGrid
//                   getRowId={getRowId}
//                   rows={params.row.recorddata || []} // Ensure there's data for this row's recorddata
//                   loading={gridloading}
//                   columns={columnRecord}
//                   getRowClassName={(params) => params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'}
//                   autoHeight={true} // Make sure it takes the height it needs
//                   rowHeight={40}
//                   columnHeaderHeight={40}
//                   className="f13 border-0 data-grid-scrollable"
//                   disableRowSelectionOnClick
//                   slots={{ toolbar: GridToolbar }}
//                   slotProps={{ toolbar: { showQuickFilter: true } }}
//                 />
//               </div>
//             )}
//           </AccordionDetails>
//         </Accordion>
//       ),
//     },
//   ];
// const columns = [
// 	{
// 	  field: 'libraryEntity',
// 	  headerName: 'Library Name',
// 	  flex: 1,
// 	  renderCell: (params) => (
// 		<div className="d-flex justify-content-between w-100">
// 		  <Typography variant="body1">{params.row.libraryEntity}</Typography>
// 		</div>
// 	  ),
// 	},
// 	{
// 	  field: 'accordion',
// 	  headerName: 'Accordion',
// 	  renderCell: (params) => (
// 		<Accordion
// 		  expanded={expandedLibraryId === params.row.libraryId}
// 		  onChange={() => handleAccordionChange(params.row.libraryId)}
// 		  className="w-100"
// 		>
// 		  <AccordionSummary expandIcon={<ExpandMore />}>
// 			<Typography variant="body2">Show Details</Typography>
// 		  </AccordionSummary>
// 		  <AccordionDetails>
// 			{expandedLibraryId === params.row.libraryId && (
// 			  <div style={{ width: '100%' }}>
// 				{/* Table inside Accordion */}
// 				<div className="table-responsive item-Table">
// 				  <table className="itemstable stripped">
// 					<thead style={{ backgroundColor: '#0d6efd', color: 'white' }}>
// 					  <tr>
// 						<th className="text-white fw500 f14">S.No</th>
// 						<th className="text-white fw500 f14">Event</th>
// 						<th className="text-white fw500 f14">Term Name</th>
// 						<th className="text-white fw500 f14">UOM</th>
// 						<th className="text-white fw500 f14">Formula</th>
// 						<th className="text-white fw500 f14">Status</th>
// 						<th className="text-white fw500 f14">Actions</th>
// 					  </tr>
// 					</thead>
// 					<tbody>
// 					  {params.row.recorddata && params.row.recorddata.length > 0 && 
// 						params.row.recorddata.map((item, index) => (
// 						  <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
// 							<td className="f14">{index + 1}</td>
// 							<td className="f14">{item?.eventtype}</td>
// 							<td className="f14">{item?.name}</td>
// 							<td className="f14">{item?.valuetype}</td>
// 							<td className="f14">{item?.formulavalue}</td>
// 							<td className="f14">
// 							  <Switch
// 								checked={item?.isActive}
// 								onChange={() => handleStatus(item)}
// 								inputProps={{ "aria-label": "controlled" }}
// 								classes={{
// 								  thumb: "MuiSwitch-thumb",
// 								  switchBase: "MuiSwitch-switchBase",
// 								  checked: "Mui-checked",
// 								}}
// 							  />
// 							</td>
// 							<td className="f14">
// 							  <IconButton size="small" onClick={() => callbackedit(item)}>
// 								<HiPencilAlt className="f17 text-primary" />
// 							  </IconButton>
// 							</td>
// 						  </tr>
// 						))}
// 					</tbody>
// 				  </table>
// 				</div>
// 			  </div>
// 			)}
// 		  </AccordionDetails>
// 		</Accordion>
// 	  ),
// 	},
//   ];
  
  
  
//    const columnRecord = [
// 	{
// 		field: "eventtype",
// 		headerName: "Event",
// 		width: columnWidths.stages,
// 	  },
// 	//   {
// 	// 	field: "libraryEntity",
// 	// 	headerName: "Library Name",
// 	// 	width: columnWidths.stages,
// 	//   },	
// 	  {
// 		field: "name",
// 		headerName: "Term Name",
// 		renderCell: (params) => <div>{params?.formattedValue}</div>,
// 		width: columnWidths.stages,
// 	  },
// 	  {
// 		field: "valuetype",
// 		headerName: "UOM",
// 		width: columnWidths.stages,
// 	  },
// 	{
// 		field: "formulavalue",
// 		headerName: "Formula",
// 		width: columnWidths.stages,
// 	  },
// 	//   {
// 	// 	field: "grandTotalTermName",
// 	// 	headerName: "Grand Total Field",
// 	// 	width: columnWidths.stages,
// 	// 	renderCell: (params) =>
// 	// 		(
// 	// 			params.formattedValue ?<div className="pointer" onClick={()=>{
// 	// 				;
// 	// 				toggleOpenDrawer("grandTotalTermName", true)
// 	// 				setSelectedRow(params?.row)
// 	// 				pullTermList(params?.row)
					
// 	// 			}}>{params?.formattedValue}</div>:<Tooltip  title={"click to change Library GrandTotal Term"}>	
// 	// 		 <Chip
// 	// 		size="small"
// 	// 		color="primary"
// 	// 		className="ps-1 me-3 align-center"
// 	// 		variant="outlined"
// 	// 		label={"add term"}
  
// 	// 		onClick={()=>{
// 	// 			toggleOpenDrawer("grandTotalTermName", true)
// 	// 			setSelectedRow(params?.row)
// 	// 			pullTermList(params?.row)
// 	// 		}}
			
	   
// 	// 	></Chip></Tooltip>
// 	// 	  )
// 	//   },
// 	  {
// 		field: "isActive",
// 		headerName: "Status",
// 		width: columnWidths.organisation,
// 		renderCell: (params) => (
// 		  <Switch
// 			checked={params.value}
// 			onChange={() => handleStatus(params.row, params.value)}
// 			inputProps={{ "aria-label": "controlled" }}
// 			classes={{
// 			  thumb: "MuiSwitch-thumb",
// 			  switchBase: "MuiSwitch-switchBase",
// 			  checked: "Mui-checked",
// 			}}
// 		  />
// 		),
// 	  },
// 	  {
// 		field: "action",
// 		headerName: "Action",
// 		width: columnWidths.action,
// 		renderCell: (params) => (
// 		  <IconButton
// 			size="small"
// 			className="bg-white"
// 			onClick={() => callbackedit(params?.row)}
// 		  >
// 			<HiPencilAlt className="f17 text-primary" />
// 		  </IconButton>
// 		),
// 	  },
// 	];

  
	const getRowId = (row) => {
		return row.id;
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
		SetEventType(event.target.value);
	};
	
    const [libraryTermList,setLibraryTermList]=useState([])
    // const pullTermList = (row) => {
	// 	;
	// 	const { libraryId } = row;
	// 	getCommLibList({ LibraryId: libraryId?.toString() }, atoken)
	// 	  .then((res) => {
			
	// 		if (res && res.length > 0) {
	// 			setLibraryTermList(res);
	// 		}
	// 		else
	// 		{
	// 			setLibraryTermList([]);
	// 		}
	// 	  })
	// 	  .catch((error) => {
			
	// 		console.error("Error fetching CommLibList:", error);
	// 	  });
	//   };
	const pullTermList = (libraryId) => {
		;
		getCommLibList({ LibraryId: libraryId?.toString() }, atoken)
		  .then((res) => {
			if (res && res.length > 0) {
			  setLibraryTermList(res);
			} else {
			  setLibraryTermList([]);
			}
		  })
		  .catch((error) => {
			console.error("Error fetching CommLibList:", error);
		  });
	  };
	  
	  useEffect(()=>{
		;
		formik_GrandTotal.setFieldValue("grandTotalTermName",selectedrow?.grandTotalTermName ?? "");},[libraryTermList])
	const formik_GrandTotal = useFormik({
		enableReinitialize: true,
		initialValues: {
			grandTotalTermName: ""
		},
	
		onSubmit: async (values) =>
		{
			handleLibraryGrandTotalTerm(values)
		},
	});

	const handleBackToLibraryList = () => {
		setSelectedLibraryId(null);
     
    };
	const columns = [
		{
		  field: 'libraryEntity',
		  headerName: 'Library Name',
		  flex: 1,
		  renderCell: (params) => (
			<div className="d-flex justify-content-between w-100">
			  <Typography variant="body1">{params.row.libraryEntity}</Typography>
			</div>
		  ),
		},
		{
		  field: 'accordion',
		  headerName: 'Accordion',
		  renderCell: (params) => (
			<Accordion
			  expanded={expandedLibraryId === params.row.libraryId}
			  onChange={() => handleAccordionChange(params.row.libraryId)}
			  className="w-100"
			>
			  <AccordionSummary expandIcon={<HiOutlineChevronDown />}>
				<Typography variant="body2">Show Details</Typography>
			  </AccordionSummary>
			  <AccordionDetails>
				{expandedLibraryId === params.row.libraryId && (
				  <div style={{ width: '100%' }}>
					{/* Render the table inside the accordion */}
					<div className="table-responsive item-Table">
					  <table className="itemstable stripped">
						<thead style={{ backgroundColor: '#0d6efd', color: 'white' }}>
						  <tr>
							<th className="text-white fw500 f14">S.No</th>
							<th className="text-white fw500 f14">Event</th>
							<th className="text-white fw500 f14">Term Name</th>
							<th className="text-white fw500 f14">UOM</th>
							<th className="text-white fw500 f14">Formula</th>
							<th className="text-white fw500 f14">Status</th>
							<th className="text-white fw500 f14">Actions</th>
						  </tr>
						</thead>
						<tbody>
						  {params.row.recorddata && params.row.recorddata.length > 0 ? (
							params.row.recorddata.map((item, index) => (
							  <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
								<td className="f14">{index + 1}</td>
								<td className="f14">{item?.eventtype}</td>
								<td className="f14">{item?.name}</td>
								<td className="f14">{item?.valuetype}</td>
								<td className="f14">{item?.formulavalue}</td>
								<td className="f14">
								  <Switch
									checked={item?.isActive}
									onChange={() => handleStatus(item)}
									inputProps={{ 'aria-label': 'controlled' }}
									classes={{
									  thumb: 'MuiSwitch-thumb',
									  switchBase: 'MuiSwitch-switchBase',
									  checked: 'Mui-checked',
									}}
								  />
								</td>
								<td className="f14">
								  <IconButton size="small" onClick={() => callbackedit(item)}>
									<HiPencilAlt className="f17 text-primary" />
								  </IconButton>
								</td>
							  </tr>
							))
						  ) : (
							<tr>
							  <td colSpan={7} className="text-center">No Data Available</td>
							</tr>
						  )}
						</tbody>
					  </table>
					</div>
				  </div>
				)}
			  </AccordionDetails>
			</Accordion>
		  ),
		},
	  ];
	  

	

    const columnRecord = [
        {
            field: "eventtype",
            headerName: "Event",
            width: columnWidths.stages,
        },
        {
            field: "name",
            headerName: "Term Name",
            renderCell: (params) => <div>{params?.formattedValue}</div>,
            width: columnWidths.stages,
        },
        {
            field: "valuetype",
            headerName: "UOM",
            width: columnWidths.stages,
        },
        {
            field: "formulavalue",
            headerName: "Formula",
            width: columnWidths.stages,
        },
        {
            field: "isActive",
            headerName: "Status",
            width: columnWidths.organisation,
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={() => handleStatus(params.row, params.value)}
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
            headerName: "Action",
            width: columnWidths.action,
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


	return (
		<>
			<div className="container-fluid">
			<div className="row">
    <div className="col-12 col-md-8 col-lg-12 p-0">
        <div className="d-flex flex-column min-vh-100">
            <div className="d-flex justify-content-between minh50px align-items-center bg-white p-2 border-bottom">
                <BackButton title="Commercial Terms" />
                <div>
                    <div className="action-wrap">
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<HiPlusSm />}
                            className="text-capitalize font-normal"
                            onClick={toggleDrawer("opensidebar", true)}
                        >
                            Add New
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex-grow-1 m-2 bg-white rounded">
                <div className="p-3">
                    <div className="row">
                        <div className="col-12" style={{ marginBottom: '7rem' }}>
                            {gridloading ? (
                                <GridSkeleton />
                            ) : (
                                <DataGrid
                                    getRowId={getRowId} // Assuming libraryId is unique for each row
                                    rows={libraryList} // The library list data
                                    loading={gridloading}
                                    columns={columns} // Columns for the main DataGrid
                                    getRowClassName={(params) =>
                                        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                                    }
                                    autoHeight={false}
                                    rowHeight={40}
                                    columnHeaderHeight={40}
                                    className="f13 border-0 data-grid-scrollable"
                                    disableRowSelectionOnClick
                                    slots={{ toolbar: GridToolbar }}
                                    slotProps={{ toolbar: { showQuickFilter: true } }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

           
            {libraryList && libraryList.length > 0 && libraryList.map((row, rowIndex) => (
                <div key={rowIndex} className="table-responsive item-Table">
                    {/* Render the table for each library */}
                    <table className="itemstable stripped">
                        <thead style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                            <tr>
                                <th className="text-white fw500 f14">S.No</th>
                                <th className="text-white fw500 f14">Event</th>
                                <th className="text-white fw500 f14">Term Name</th>
                                <th className="text-white fw500 f14">UOM</th>
                                <th className="text-white fw500 f14">Formula</th>
                                <th className="text-white fw500 f14">Status</th>
                                <th className="text-white fw500 f14">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Check if recorddata exists for this row */}
                            {row?.recorddata && row.recorddata.length > 0 ? (
                                row.recorddata.map((item, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                                        <td className="f14">{index + 1}</td>
                                        <td className="f14">{item?.eventtype}</td>
                                        <td className="f14">{item?.name}</td>
                                        <td className="f14">{item?.valuetype}</td>
                                        <td className="f14">{item?.formulavalue}</td>
                                        <td className="f14">
                                            <Switch
                                                checked={item?.isActive}
                                                onChange={() => handleStatus(item)}
                                                inputProps={{ "aria-label": "controlled" }}
                                                classes={{
                                                    thumb: "MuiSwitch-thumb",
                                                    switchBase: "MuiSwitch-switchBase",
                                                    checked: "Mui-checked",
                                                }}
                                            />
                                        </td>
                                        <td className="f14">
                                            <IconButton size="small" onClick={() => callbackedit(item)}>
                                                <HiPencilAlt className="f17 text-primary" />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center">No Data Available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ))}

            {/* Accordion Render */}
            {libraryList && libraryList.map((row) => (
                <Accordion
                    expanded={expandedLibraryId === row.libraryId}
                    onChange={() => handleAccordionChange(row.libraryId)}
                    className="w-100"
                    key={row.libraryId}
                >
                    <AccordionSummary expandIcon={<HiOutlineChevronDown />}>
                        <Typography variant="body2">Show Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {expandedLibraryId === row.libraryId && (
                            <div style={{ width: '100%' }}>
                                {/* Render the table inside the accordion */}
                                <div className="table-responsive item-Table">
                                    <table className="itemstable stripped">
                                        <thead style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                                            <tr>
                                                <th className="text-white fw500 f14">S.No</th>
                                                <th className="text-white fw500 f14">Event</th>
                                                <th className="text-white fw500 f14">Term Name</th>
                                                <th className="text-white fw500 f14">UOM</th>
                                                <th className="text-white fw500 f14">Formula</th>
                                                <th className="text-white fw500 f14">Status</th>
                                                <th className="text-white fw500 f14">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {row?.recorddata && row.recorddata.length > 0 ? (
                                                row.recorddata.map((item, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                                                        <td className="f14">{index + 1}</td>
                                                        <td className="f14">{item?.eventtype}</td>
                                                        <td className="f14">{item?.name}</td>
                                                        <td className="f14">{item?.valuetype}</td>
                                                        <td className="f14">{item?.formulavalue}</td>
                                                        <td className="f14">
                                                            <Switch
                                                                checked={item?.isActive}
                                                                onChange={() => handleStatus(item)}
                                                                inputProps={{ 'aria-label': 'controlled' }}
                                                                classes={{
                                                                    thumb: 'MuiSwitch-thumb',
                                                                    switchBase: 'MuiSwitch-switchBase',
                                                                    checked: 'Mui-checked',
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="f14">
                                                            <IconButton size="small" onClick={() => callbackedit(item)}>
                                                                <HiPencilAlt className="f17 text-primary" />
                                                            </IconButton>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="text-center">No Data Available</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    </div>
</div>

	</div>
			{/* Drawer for Add New */}
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
									<div className="ms-3 text-white">Manage Terms</div>
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
							<Box sx={{ flexGrow: 1, p: 2 }}>
								<AddEditCell
									callbackstep={callbackstep}
									editRecordData={editRecordData}
									pullCommercialList={pullCommercialList}
								/>
							</Box>
						</div>
					</Box>
				</Drawer>
	
				{/* Drawer for Extend Event */}
				<Drawer
					anchor="right"
					open={openDrawer.grandTotalTermName}
					onClose={() => toggleOpenDrawer("grandTotalTermName", false)}
				>
					<div
						style={{
							width: 600,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Library Grand Total Term</div>
								<IconButton
									onClick={() => toggleOpenDrawer("grandTotalTermName", false)}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>
						<form onSubmit={formik_GrandTotal.handleSubmit} autoComplete="off">
							<DialogContent style={{ minWidth: "300px" }}>
								<DialogContentText>
									<div className="row mt-2">
										<div className="col-12 col-md-6 mb-4">
											<Autocomplete
												id="grandTotalTermName"
												name="grandTotalTermName"
												options={libraryTermList || []}
												getOptionLabel={(option) => option.fieldName}
												onChange={(event, value) => {
													if (value) {
														formik_GrandTotal.setFieldValue("grandTotalTermName", value.fieldName);
													} else {
														formik_GrandTotal.setFieldValue("grandTotalTermName", "");
													}
												}}
												value={libraryTermList?.find(
													(cl) => cl.fieldName === formik_GrandTotal?.values?.grandTotalTermName
												)}
												renderInput={(params) => (
													<TextField
														{...params}
														InputLabelProps={{
															shrink: true,
														}}
														name="grandTotalTermName"
														label="Grand Total Term"
														variant="outlined"
														size="small"
														className="w-100 f14"
													/>
												)}
												renderOption={(props, option) => (
													<MenuItem {...props}>{option.fieldName}</MenuItem>
												)}
												noOptionsText="No options"
												style={{ width: "100%" }}
											/>
										</div>
									</div>
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<LoadingButton
									color="btn"
									onClick={() => toggleOpenDrawer("grandTotalTermName", false)}
								>
									Cancel
								</LoadingButton>
								<LoadingButton
									loading={loading}
									variant="contained"
									type="submit"
									autoFocus
								>
									Update
								</LoadingButton>
							</DialogActions>
						</form>
					</div>
				</Drawer>
			</React.Fragment>
		</>
	);
	
};
export default ShowCommercialTerms;
