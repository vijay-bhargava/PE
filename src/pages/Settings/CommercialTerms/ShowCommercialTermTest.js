import React, { useState, useCallback, useEffect } from "react";
import { Autocomplete, Box, Button, DialogActions, DialogContent, DialogContentText, Drawer, IconButton, Radio, Switch, TextField } from "@mui/material";
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

const ShowCommercialTermsTest = () => {
  const [{ atoken,customersuffix, customerid }, dispatch] = useStateValue();
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
  const handleStatus = (rowValue, isActive) => {
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
      LibraryId: libraryId
    };

    setLoading(true);

    getCommercialList(data, atoken).then((res) => {
      setRowLoading((prev) => ({ ...prev, [libraryId]: false }));
      if (res?.length) {
        setRecorddata(res);
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
        ;
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

// const handleRadioChange = (row) => {
//     ;
//     const isSelected = row.name === GrandTotalName; // Check if current row's name matches the grandTotalTermName
  
//     // If the row is selected (i.e., it matches GrandTotalName), toggle its state
//     row.isGrandTotal = !isSelected;  
  
//     formik_GrandTotal.setFieldValue("grandTotalTermName", row.name);
  
//     handleLibraryGrandTotalTerm({ grandTotalTermName: row.name, id: row.libraryId });
// };

const handleRadioChange = (row) => {
    ;
  
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
                        <>
                          <div className="table-responsive item-Table">
                            <table className="itemstable stripped">
                              <thead style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                                <tr>
                                  <th className="text-white fw500 f14">Library</th>
                                  <th className="text-white fw500 f14">Event</th>
                                  <th className="text-white fw500 f14"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {libraryList.length > 0 && libraryList.map((item, index) => (
                                  <React.Fragment key={index}>
                                    <tr className={index % 2 === 0 ? 'even' : 'odd'}>
                                      <td className="f14 productTd" style={{ cursor: "pointer" }}>{item?.libraryEntity}</td>
                                      <td className="f14 productTd" style={{ cursor: "pointer" }}>
            {item?.eventType} 
          </td>
                                      
                                      <td className="f14 productTd" style={{ cursor: "pointer" }}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRowToggle(item.id)}
                                        >
                                          {expandedLibraryId === item.id ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                                        </IconButton>
                                      </td>
                                    </tr>
                                    {expandedLibraryId === item.id && (
                                      <tr>
                                        <td colSpan={3}>
                                          <div className="table-responsive">
                                            <DataGrid
                                              rows={recorddata}
                                              columns={[
                                               
                                                { field: "name", headerName: "Term Name", width: 150 },

                                                { field: "valuetype", headerName: "UOM", width: 120 },
                                                { field: "formulavalue", headerName: "Formula", width: 150 },
                                              
                                                {
                                                    field: 'isGrandTotal', // Add a new field for the radio button
                                                    headerName: 'Grand Total',
                                                    width: 150,
                                                    renderCell: (params) => {
                                                      const isSelected =
                                                        item?.grandTotalTermName && params.row.name === item?.grandTotalTermName;
      
                                                      return (
                                                        <Radio
                                                          checked={isSelected} // If matched, check the radio button
                                                          onChange={() => handleRadioChange(params.row)} // Handle the radio change
                                                          inputProps={{ 'aria-label': 'isGrandTotal' }}
                                                        />
                                                      );
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
                                                  )
                                                },
                                                {
                                                  field: "actions",
                                                  headerName: "Actions",
                                                  width: 150,
                                                  renderCell: (params) => (
                                                    <IconButton size="small" onClick={() => callbackedit(params.row)}>
                                                      <HiPencilAlt className="f17 text-primary" />
                                                    </IconButton>
                                                  )
                                                }
                                              ]}
                                              pageSize={5}
                                              rowsPerPageOptions={[5]}
                                              loading={rowLoading[item.id]}
                                            />
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </table>
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
      </React.Fragment>
    </>
  );
}

export default ShowCommercialTermsTest;
