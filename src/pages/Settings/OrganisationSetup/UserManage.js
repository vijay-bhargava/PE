import { Box, Button, Checkbox, Drawer,  FormControl, Autocomplete, FormControlLabel, FormGroup,  IconButton,
    InputLabel,  MenuItem,  Select,  TextField,  Chip,  Avatar, Switch,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,} from "@mui/material";
  import React, { useState, useEffect, useCallback } from "react";
  import { HiOutlineTrash, HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
  import { Modal } from "react-bootstrap";
  import { useLocation, useNavigate } from "react-router-dom";
  import { LoadingButton } from "@mui/lab"; 
  import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
  import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
  import TextFieldCell from "../../BaseCells/TextFieldCell";
  import { useFormik } from "formik";
  import { useRef } from "react"; 
  import { actionTypes, useStateValue } from "../../../store"; 
  import {FindUser, UpdateUser,} from "../../../utils/users";
  import AddUpdateUser from "./AddUpdateUser";  
  import { LocalFormatDate, formatDate, getMenuMaster } from "../../../utils/common/utility";
  import { DataGrid,GridToolbar } from "@mui/x-data-grid";
  import { format } from "date-fns";
   import {getUserRoles} from "../../../utils/users";
import { getCustomerList } from "../../../utils/customerSetup";
import { toast } from "react-toastify";
import { BackButton } from "../../../utils/common/component";
import useResponsiveColumns from "../../../components/useResponsiveColumns";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";

  const UserManage = (props) => {

    const location = useLocation(); 
    const [{ atoken, rtoken ,customerid}, dispatch] = useStateValue();
    const [page, setPage] = useState(1);  
    const [managerId, setmanagerId] = useState(0);  
    const formRef = useRef(null); 
    const [loading, setLoading] = useState(false); 
    const [editRecordData, seteditRecordData] = useState(null);
    const [RoleList, setRoleList] = useState([]);
    const [userModalOpen, setuserModalOpen] = useState(false); 
    const [UserUnsavedChanges, setUserUnsavedChanges] = useState(false); 
    const handleuserModal = (confirm) => {
      if (confirm) {
        setState({ ...state, opensidebar: false });
        setUserUnsavedChanges(false); 
      }
      setuserModalOpen(false); 
    };
    const handleRoleList=(array)=>{
      setRoleList(array);
    }

    const handleChange = (event, value) => {
      setPage(value);
    };
  
    const [state, setState] = useState({
      right: false,
      viewTicketSidebar: false,
      rightLog: false,
    });
  
    // const toggleDrawer = (anchor, open) => (event) => {
    //   if (
    //     event.type === "keydown" &&
    //     (event.key === "Tab" || event.key === "Shift")
    //   ) {
    //     return;
    //   }
    //   if (open == false) {
    //     seteditRecordData(null);
    //   }
    //   setState({ ...state, [anchor]: open });
    // };
    const toggleDrawer = (anchor, open) => (event) => {
      
      
      if (UserUnsavedChanges) {
          setuserModalOpen(true); 
          return;
      }
      if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
          return;
      }
      if (open === false) {
          seteditRecordData(null);
      }
     // Uncomment this block if you want to check user limit
      // if (Numberuser === userList.length) {
      //     setState({ ...state, [anchor]: open });
      // } else {
      //     toast.error('User limit exceeded. You are unable to add more users at this time. Please reach out to customer support for assistance.');
      //     return;
      // }
     // Update the drawer state
      setState({ ...state, [anchor]: open });
  };
  
  
    const callback = useCallback((pass) => {
    }, []);
  
    useEffect(() => {
        pullUsersList(); 
        pullCustomerList();
        pullRoleList();
    }, [page]);
  
    useEffect(() => { 
      pullRoleList({
        CustomerId:customerid,
        SortingColumn: "name",
        IsAscending: "True"
      });
  }, []);

  const pullRoleList = () => {
      var data = {
        CustomerId:customerid,
        IsActive: true,
       
    
      };
    
      setLoading(true);
      getUserRoles(data, atoken)
        .then((res) => {
         
          setRoleList(res);
          setLoading(false);
         
        })
        .catch(error => {
          console.error("Error fetching user roles:", error);
          setLoading(false);
        });
    };
    const UpdateStageStatus = (data, id, atoken) => {
  
      if (id > 0) {
        UpdateUser(data, id, atoken).then((res) => { 
  
          pullUsersList();
        
        });
      }
    }
  
  
    const handleStatus = (rowValue, isActive) => {
      console.log(rowValue);
  
  
      if(isActive)
      {
        isActive = false;
      }
      else
      {
        isActive = true;
      }
      
      rowValue.isActive= isActive;
  
      UpdateStageStatus(rowValue, rowValue.id,atoken);
    };
   
    const [userList, setUserList] = useState([]);
    const pullUsersList = () => {
      
      var data = {
        CustomerId: customerid,
        SortingColumn: "Id",
        //EditYN : "Y"
      // managerId:managerId
      };
      setLoading(true);
      FindUser(data,atoken).then((res) => {
        console.log(res); 
        setGridloading(true);
        if (res != "" && res != undefined) {
            setUserList(res);
          setGridloading(false); 
        }
        setLoading(false);
        setGridloading(false);
      });
    }; 

    const [Numberuser, setNumberuser] = useState(0); 
    const [subsdata, setsubsdata] = useState([]);

	const pullCustomerList = () => {
		
		let data = {
			CustomerId: customerid,
		};
		setLoading(true);
    
		getCustomerList(data, atoken).then((res) => {
      
			 if (res != "" && res != undefined) {
        setsubsdata(res);
        if (res[0].subscriptions && res[0].subscriptions.length > 0) {
          const lastSubscription = res[0].subscriptions[res[0].subscriptions.length - 1];
          setNumberuser(lastSubscription.noOFUsers);
      }
      setGridloading(false); 
    }
			setLoading(false);
			setGridloading(false);
		});
	};

    const callbackstep = useCallback(
      (data) => {

        setState({ ...state, right: false });
        seteditRecordData(null);
        pullUsersList();
      },
      [page]
    );
   
    const callbackedit = useCallback((data) => {
      ; 
      seteditRecordData(data);
      setState({ ...state, addnewfield: true });
    }, []);
     
    const [gridloading, setGridloading] = useState(true);
    const columnWidth = useResponsiveColumns();
    const columns = [
      {
        field: "name",
        headerName: "User Name",
        renderCell: (params) => (
          <div>{params?.formattedValue}</div>
        ),
        width:columnWidth.stages,
      
      },
      {
        field: "phoneNumber",
        headerName: "Phone Number",
        renderCell: (params) => (
          <div>{params.row.dialingCode}  {params?.formattedValue}</div>
        ),
        width: columnWidth.stages,
        align: "left"
      
      }, 
      {
        field: "email",
        headerName: "Email",
        width: columnWidth.email,
       
      },  
  
      {
        field: "designation",
        headerName: "Designation",
        width: columnWidth.stages,
       
      },
      {
        field: "roleName",
        headerName: "Role Name",
        width: columnWidth.organisation,
       
      }, 
   
      {
        field: "managerName",
        headerName: "Manager",
        width: columnWidth.organisation,
       
      }, 
    
       
      {
        field: 'isActive', 
        headerName: 'Status', 
        width: columnWidth.organisation,
        renderCell: (params) => (
          <Switch
            checked={params.value}
            onChange={() => handleStatus(params.row, params.value)}
            inputProps={{ 'aria-label': 'controlled' }}
            classes={{
              thumb: "MuiSwitch-thumb",
              switchBase: "MuiSwitch-switchBase",
              checked: "Mui-checked",
            }}
          />
        )
      },
      {
        field: "action",
        headerName: "Action",
        width: columnWidth.organisation,
        renderCell: (params) => (
          <IconButton
              size="small"
              className="bg-white"
              onClick={() => callbackedit(params?.row)}
            >
              <HiPencilAlt className="f17 text-primary" />
            </IconButton>        
        )
      }
     
    ];
  
    const [rowCell,setRowCell]=useState(null);
    const getRowId = (row) => {
      //console.log('getrowid', row.id)
      return row.id;
    }
    const handleRowClick = (params) => {
      console.log("param"+params);
      setRowCell(params.row);
    };
  
  
    // #1 handling Datagrid events
    // const handleCellClick=(params)=>{
      
    //   if(params.field=='optionType'){
    //    openOptionPopup(params?.row, true)
  
    //   }
  
  
    // }
     
    // const handleInputChange = (e, index) => { 
    //   const { name, value } = e.target;
    //   const list = [...inputList];
    //   list[index][name] = value;
    //   setInputList(list);
    // };
  
    // const handleAddClick = (value) => { 
    //   setInputList([
    //     ...inputList,
    //     { id: 0, questionid: value.id, questionoption: "", deleteFlag: false },
    //   ]);
       
    // };
   
    // const [totalWeightage, settotalWeightage] = useState(0);
    // const handleInputWeightageChange = (e, index) => { 
    //   let totWeightage = totalWeightage;
    //   const { name, value } = e.target;
    //   if (value > 0) {
    //     totWeightage = totWeightage + value;
    //    // console.log("totWeightage", totWeightage);
    //     if (totWeightage > 100) {
      
    //     } else {
    //       settotalWeightage(value);
    //     }
    //   }
      
    //   const list = [...inputList];
    //   list[index][name] = value;
    //   setInputList(list);
    // };

    // const onlyNumbers = (e) => {
    //   e.target.value = e.target.value.replace(/[^0-9]/g, "");
    // };
    // const handleRemoveClick = (index) => {
    //   const list = [...inputList];
    //   list.splice(index, 1);
    //   setInputList(list);
    // };
 
    return (
      <>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-8 col-lg-12 p-0 ">
              <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
                {/* Header with BackButton and Action Buttons */}
                <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
                  <div className="d-flex align-items-center">
                    <BackButton title={<span className="page-heading">Manage User</span>} />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="d-flex align-items-center gap-2">
                    <div className="actionpin-wrap">
                      <Tooltip title={Numberuser == userList.length && 'User limit exceeded. You are unable to add more users at this time. Please reach out to customer support for assistance.'}>
                        <span>
                          <Button
                            variant="text"
                            size="large"
                            startIcon={<HiPlusSm />}
                            className="text-capitalize blue-text font-normal"
                            onClick={toggleDrawer("addnewfield", true)}
                            disabled={Numberuser == userList.length}
                          >
                            Add New
                          </Button>
                        </span>
                      </Tooltip>
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
                            rowCount={userList.length}
                            //onRowClick={handleRowClick}
                            getRowId={getRowId}
                            rows={userList}
                            loading={gridloading}
                            columns={columns}
                            disableDensitySelector
                            disableColumnMenu
                            disableColumnSelector
                            getRowClassName={(params) =>
                              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                            }
                            rowHeight={35}
                            columnHeaderHeight={35}
                            className='f13 bg-white data-grid-scrollable'
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
        <React.Fragment key="top">
          <Drawer
            anchor="right"
            open={state["addnewfield"]}
            onClose={toggleDrawer("addnewfield", false)}
          >
            <Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
              <div className="flex flex-col">
                <Box className="bgheaderCards">
                  <div className="d-flex align-items-center justify-content-between pb-2">
                   
                        <div className="ms-3 text-white mt-2">Add User</div>
                    <div class="mt-1">
                      <IconButton
                        onClick={toggleDrawer("addnewfield", false)}
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
                  <AddUpdateUser
                    callbackstep={callbackstep} 
                    editRecordData={editRecordData}
                    RoleList={RoleList}
                    handleRoleList={handleRoleList}
                    setUserUnsavedChanges={setUserUnsavedChanges}
                  />
                </Box>
              </div>
            </Box>
          </Drawer>
          <Dialog open={userModalOpen} onClose={() => handleuserModal(false)}>
				<DialogTitle>{"Are you sure?"}</DialogTitle>
				<DialogContent style={{ minWidth: "300px" }}>
					<DialogContentText>
          Are you sure you want to close? Any unsaved changes will be lost.
					</DialogContentText>
					
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleuserModal(false)}>No</Button>
					<Button onClick={() => handleuserModal(true)} autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
        </React.Fragment>
      
        
      </>
    );
  };
    
export default UserManage;
  