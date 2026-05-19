import React, { useState, useCallback, useEffect } from "react";
import { Autocomplete, Box, Button, Checkbox, DialogActions, DialogContent, DialogContentText, Drawer, IconButton, Radio, Switch, TextField } from "@mui/material";
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { useFormik } from "formik";
import { useStateValue } from "../../../store";
import AddEditCell from "./AddEditCell";
import {
  getCommercialList,
  getMenuMaster,
  updateCommercial,
} from "../../../utils/commerciallibrary";
import { LibraryFindAll } from "../../../utils/questionlibrary";
import { BackButton } from "../../../utils/common/component";
import useResponsiveColumns from "../../../components/useResponsiveColumns";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { api, ApiClient } from "../../../Apiclient";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid

const CommercialTerms = () => {
  const [{atoken,customerid,customersuffix}, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [state, setState] = useState({
    opensidebar: false,
  });
  const toggleDrawer = (anchor, open) => (event) => {
    if (open === false) {
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

 
  const [expanded, setExpanded] = React.useState("panel1");
  const [editRecordData, seteditRecordData] = useState(null);
  const [totalRecords, setTotalRecords] = useState("");
  const [pageCount, setPageCount] = useState(1);
  const [recorddata, setRecorddata] = useState([]);
  const [id, setId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [eventtype, SetEventType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [createdon, setCreatedon] = useState("2023-09-11T10:39:57.410Z");

  const callbackstep = useCallback(() => {
    setState({ ...state, "opensidebar": false });
    seteditRecordData(null);
    pullCommercialList();
  }, []);

  useEffect(() => {
    PullLibraryList();
    pullCommercialList();
    pullMenuMaster();
  }, []);
  const handleReflectedComData = () => {
    PullLibraryList();
    pullCommercialList();
    pullMenuMaster();
  };
  const callbackedit = useCallback((data) => {
    seteditRecordData(data);
    setState({ ...state, opensidebar: true });
  }, []);

  const UpdateStageStatus = (data, id, atoken) => {
    if (id > 0) {
      updateCommercial(data, id, data?.fieldNameGroup, atoken).then(() => {
        pullCommercialList();
      });
    }
  };

  const [selectedLibraryId, setSelectedLibraryId] = useState(null);
  const handleStatus = (rowValue) => {
    // Check if isActive exists, if not default to false
    let isActive = rowValue?.isActive;  // Safely access isActive
  
    // If isactive is undefined, set to false by default
    if (isActive === undefined) {
      isActive = false;
    }
  
    // Toggle the value of isactive
    isActive = !isActive;
  
    // Update the isActive status on rowValue
    rowValue.isActive = isActive;
  
    // Log the updated row to check if isActive has toggled correctly
    console.log("Updated Row with Toggled isActive:", rowValue);
  
    // Call the Update function to send updated data to backend
    UpdateStageStatus(rowValue, rowValue.id, atoken);
  };
  
  // const handleStatus = (rowValue, isActive) => {
  //   
  //   if (isActive) {
  //     isActive = false;
  //   } else {
  //     isActive = true;
  //   }

  //   rowValue.isActive = isActive;
  //   UpdateStageStatus(rowValue, rowValue.id, atoken);
  // };

  const pullCommercialList = (libraryId) => {
    var data = {
      CustomerId: customerid,
      SortingColumn: "Id",
      LibraryId: libraryId
    };

    setLoading(true);

    getCommercialList(data, atoken).then((res) => {
      setRowLoading((prev) => ({ ...prev, [libraryId]: false }));
      if (res?.length) {
        const sortedRes = [...res].sort((a, b) => a.id - b.id);
        setRecorddata(sortedRes);
        setTotalRecords(res?.length);
        setPageCount(Math.ceil(res?.length / 10));
      }

      setLoading(false);
      setGridloading(false);
    });
  };

  const [openDrawer, setOpenDrawer] = useState({
    LibraryGrandTotal: false
  });
  const toggleOpenDrawer = (anchor, open) => {
    setOpenDrawer({ ...openDrawer, [anchor]: open });
  };

const handleLibraryGrandTotalTerm = async (data) => {
    const { id, grandTotalTermName } = data; // Destructure the data

    // Use the passed id (row.libraryId) instead of `selectedrow` for the libraryId
    const payload = {
        id: id, // Use the libraryId that was passed from handleRadioChange
        grandTotalTermName: grandTotalTermName // Pass the grandTotalTermName to update
    };

    const res = await apiClient.postres(`/api/LibraryOrgEntity/Update`, payload, atoken);
    if (res) {
        toast.success(`Term updated Successfully`, {
            toastid: "grandTotalTermName"
        });
        setGrandTotalName(grandTotalTermName); 
        pullCommercialList(id);
        PullLibraryList(id);// Refresh the commercial list after the update
    }
};


  const [expandedLibraryId, setExpandedLibraryId] = useState(null);
  const [libraryList, setlibraryList] = useState([]);
  const PullLibraryList = () => {
    var data = {
      CustomerId: customerid,
      LibraryType: 'CommercialLibrary',
      IsActive: true
    };
    LibraryFindAll(data, atoken).then((res) => {
      setlibraryList(res);
    });
  };

  const [showCommercialTerms, setShowCommercialTerms] = useState(false);
  const [libraryName, setlibraryName] = useState();
  const [GrandTotalName, setGrandTotalName] = useState();

  const [gridloading, setGridloading] = useState(true);
  const columnWidths = useResponsiveColumns();
  const [selectedrow, setSelectedRow] = useState(null);
  const [MenuMasterList, setMenuMasterList] = useState([]);
  const pullMenuMaster = () => {
    var data = {
      MenuType: "Event",
    };

    getMenuMaster(data, atoken).then((res) => {
      setMenuMasterList(res);
    });
  };

  const [libraryTermList, setLibraryTermList] = useState([]);
  useEffect(() => {
    formik_GrandTotal.setFieldValue("grandTotalTermName", selectedrow?.grandTotalTermName ?? "");
  }, [libraryTermList]);

  const formik_GrandTotal = useFormik({
    enableReinitialize: true,
    initialValues: {
      grandTotalTermName: ""
    },

    onSubmit: async (values) => {
      handleLibraryGrandTotalTerm(values)
    },
  });

  const [openItems, setOpenItems] = React.useState({});
  const handleClose = (index) => {
    setOpenItems(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const [rowLoading, setRowLoading] = useState({});

  const handleRowToggle = (libraryId) => {
    if (expandedLibraryId === libraryId) {
      setExpandedLibraryId(null);
      setRowLoading((prev) => ({ ...prev, [libraryId]: false }));
    } else {
      setExpandedLibraryId(libraryId);
      setRowLoading((prev) => ({ ...prev, [libraryId]: true }));
      pullCommercialList(libraryId);
    }
  };

const handleRadioChange = (row) => {
   
  
    const isSelected = row?.grandTotalTermName && row?.name === row?.grandTotalTermName;
  
  // If the row is already selected, unselect it
  if (isSelected) {
    setGrandTotalName(null);  // Unselect if the same row is clicked again
  } else {
    setGrandTotalName(row.name);  // Select the new row
  }
    // Update the 'grandTotalTermName' in formik
    formik_GrandTotal.setFieldValue("grandTotalTermName", row.name);
  
    // Call the API to update the term for the selected row
    handleLibraryGrandTotalTerm({ grandTotalTermName: row.name, id: row.libraryId });
  };

  // const closeDrawer = 

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-column min-vh-100">
             
			  <div className="flex-grow-1">
                <div className="row m-2">
                  <div className="col-12">
                    <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 60px)' }}>
                      {/* Header with BackButton, title and Add New button */}
                      <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
                        <div className="d-flex align-items-center">
                          <BackButton title={<span className="page-heading">Commercial Terms</span>} />
                        </div>
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
                      
                      {gridloading ? (
                        <GridSkeleton />
                      ) : (
                        <>
                          <div className="table-responsive item-Table" style={{ flex: 1, overflowY: 'auto' }}>
                            
                            {libraryList.length === 0 ? (
                              <div className="no-terms-message">
                                <p>There are no libraries associated with this customer.</p>
                              </div>
                            ) : (
                              <table className="roles-table stripped">
                                <thead >
                                  <tr>                    
                                    <th className="text-white ">Event</th>
                                    <th className="text-white ">Library</th>
                                    <th className="text-white "></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {libraryList.map((item, index) => {
                                    // Check if recorddata contains any terms for this libraryId
                                    const hasTermsForLibrary = recorddata.some((term) => term.libraryId === item.id);

                                    return ( 
                                      <React.Fragment key={index}>
                                        <tr className={index % 2 === 0 ? 'even' : 'odd'}>
                                        <td className=" productTd" style={{ cursor: "pointer" }}>{item?.eventType}</td>
                                          <td className=" productTd" style={{ cursor: "pointer" }}>{item?.libraryEntity}</td>
                                         
                                          <td className=" productTd" style={{ cursor: "pointer" }}>
                                            <IconButton size="small" onClick={() => handleRowToggle(item.id)}>
                                              {expandedLibraryId === item.id ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                                            </IconButton>
                                          </td>
                                        </tr>

                                        {/* Show the table if expanded and if there are terms for this library */}
                                        {expandedLibraryId === item?.id && hasTermsForLibrary ? (
                                          <tr>
                                            <td colSpan={3}>
                                              <div className="table-responsive">
                                                <DataGrid 
                                                columnHeaderHeight={35}

                                                  rows={recorddata.filter((term) => term.libraryId === item.id)}  // Filter records by current libraryId
                                                  columns={[
                                                    { field: "name", headerName: "Term Name", width: 150},
                                                    { field: "valuetype", headerName: "UOM", width: 120 },
                                                    { field: "formulavalue", headerName: "Formula", width: 150 },
                                                    {
                                                      field: 'isGrandTotal',
                                                      headerName: 'Grand Total',
                                                      width: 150,
                                                      renderCell: (params) => {
                                                        // Check if valuetype is "Currency" and if the grandTotal term matches
                                                        if (params.row.valuetype === "Currency") {
                                                          const isSelected = item?.grandTotalTermName && params.row.name === item?.grandTotalTermName;
                                                          return (
                                                            <Checkbox
                                                              checked={isSelected}
                                                              onChange={() => handleRadioChange(params.row)}

                                                              inputProps={{ 'aria-label': 'isGrandTotal' }}
                                                            />
                                                          );
                                                        } else {
                                                          return null; // If valuetype is not "Currency", do not show the radio button
                                                        }
                                                      },
                                                    },
                                                    {
                                                      field: "isActive",
                                                      headerName: "Status",
                                                      width: 150,
                                                  
                                                      renderCell: (params) => (
                                                        <Switch
                                                          checked={params.value}
                                                          onChange={() => handleStatus(params.row)}
                                                          inputProps={{ 'aria-label': 'controlled' }}
                                                        />
                                                      ),
                                                    },
                                                    {
                                                      field: "actions",
                                                      headerName: "",
                                                      width: 150,
                                                  
                                                      renderCell: (params) => (
                                                        <IconButton size="small" onClick={() => callbackedit(params.row)}>
                                                          <HiPencilAlt className="f17 text-primary" />
                                                        </IconButton>
                                                      ),
                                                    },
                                                  ]}
                                                  sortModel={[{ field: 'id', sort: 'asc' }]}
                                                  disableColumnSorting
                                                  pageSize={5}
                                                  rowsPerPageOptions={[5]}
                                                  loading={rowLoading[item.id]}
                                                  sx={{
                                                    '& .MuiDataGrid-columnHeaders': {
                                                      backgroundColor: '#E9EAEC !important', // Column header background color
                                                      color: '#0c0a0af2', // Text color for headers
                                                    },
                                                    // '& .MuiDataGrid-columnHeaderTitle': {
                                                    //   fontWeight: 'bold', // Optional: Make header titles bold
                                                    // },
                                                  }}
                                                  

                                                />
                                              </div>
                                            </td>
                                          </tr>
                                        ) : (
                                          // Show message when expanded but no terms for this library
                                          expandedLibraryId === item?.id && !hasTermsForLibrary && (
                                            <tr>
                                              <td colSpan={3} className="no-terms-message">
                                                <p>No terms associated with this library: {item?.libraryEntity}</p>
                                              </td>
                                            </tr>
                                          )
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer for Add New */}
      <React.Fragment key="top">
        <Drawer
          anchor="right"
          open={state["opensidebar"]}
          onClose={(e) => {
            toggleDrawer("opensidebar", false)(e);
            PullLibraryList();
          }}
        >
          <Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
            <div className="flex flex-col">
              <Box className="bgheaderCards">
                <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                  <div className="ms-3 text-white">Manage Terms</div>
                  <div>
                    <IconButton
                      onClick={(e) => {
                        toggleDrawer("opensidebar", false)(e);
                        PullLibraryList();
                      }}
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
                  handleReflectedComData={handleReflectedComData}
                  seteditRecordData={seteditRecordData}
		
                />
              </Box>
            </div>
          </Box>
        </Drawer>
      </React.Fragment>
    </>
  );
};

export default CommercialTerms;
