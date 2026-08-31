import React, { useEffect, useState, useCallback } from "react";
import dayjs from 'dayjs';
import { LoadingButton } from "@mui/lab";
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
import { actionTypes, useStateValue } from "../../../store";
// import {
//   FindItemCategory,
//   FindPlantStorage,
//   getPRAdvanceFind,
//   getPRManageFind,
// } from "../../../utils/PurchaseRequest";
import {getNFAManageFind} from "../../../utils/common/utility"
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from "@mui/x-data-grid";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { useFormik } from "formik";
import {
  buildQueryParams,
  formatDateViaLocale,
} from "../../../utils/common/utility";
import {
  AuctionModalFromPR,
  RFQModalFromPR,
  findObjListByValueFromArray,
  getPayloadWithStage,
  getApiErrorMessage,
} from "../../../utils/common";
import NotFoundPage from "../../../components/NotAllowed";
import {
  PushPinOutlined,
} from "@mui/icons-material";
import { ApiClient, api } from "../../../Apiclient";
import { toast } from "react-toastify";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { BackButton } from "../../../utils/common/component";
import FilterListIcon from '@mui/icons-material/FilterList';
import { getPurchaseOrgList, OrgGroupMasterList } from "../../../utils/commerciallibrary";
import FilterNFACell from './FilterNFACell';

const ManageNFA = ({ claimType }) => {
  const navigate = useNavigate();
  const [
    { atoken, rtoken, customerid, userDetail, customersuffix, eventId, eventType, roleClaims },
    dispatch,
  ] = useStateValue();
  const apiClient = new ApiClient(customersuffix);

  useEffect(() => {

    if (userDetail && atoken)
      if (userDetail?.roleId) {
        getRoles();
      }
  }, [userDetail, atoken])

  const [searchMode, setSearchMode] = useState(false);
  const [filterMode, setFilterMode] = useState(false);
  const [filterQueryParams, setFilterQueryParams] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [filterSearchCriteria, setFilterSearchCriteria] = useState(null);
  const [filterFromDayjs, setFilterFromDayjs] = useState(null);
  const [filterToDayjs, setFilterToDayjs] = useState(null);
  const [columnFilterMode, setColumnFilterMode] = useState(false);
  const [searchDataLoaded, setSearchDataLoaded] = useState(false);
  const [iscreateDisabled, setIsCreateDisabled] = useState(true);
  const [isreadDisabled, setIsReadDisabled] = useState(true);
  const [iseditDisabled, setIsEditDisabled] = useState(true);
  const [listaccessLevel, setListAccessLevel] = useState('');

  const getRoles = async () => {
    const dataR = {
      roleId: parseInt(userDetail?.roleId),
      featureName: "Note For Approval",
      claimType: "List",
    };
    const queryParams = buildQueryParams(dataR);
    try {
      const res = await apiClient.getres(`/api/auth/UserRoleClaim?${queryParams}`, atoken);
      if (res) {
        const data = res?.data;
        if (data.length === 0) {
          setIsReadDisabled(false);
        }
        dispatch({ type: actionTypes.SET_RoleClaims, value: data });
        const accessLevels = res?.data.map(item => {
          if ((item.claimType === 'List') && (item.claimValue === 'Read')) {
            setListAccessLevel(item.accessLevel);
          }
          if ((item.claimType === 'List') && (item.claimValue === 'Create') && (item.accessLevel === 'None')) {
            setIsCreateDisabled(false);
          }
          if ((item.claimType === 'List') && (item.claimValue === 'Read') && (item.accessLevel === 'None')) {
            setIsReadDisabled(false);
          }

          if ((item.claimType === 'List') && (item.claimValue === 'Edit') && (item.accessLevel === 'None')) {
            setIsEditDisabled(false);
          }
          if (item.claimValue === 'Create') {
            return { create: item.accessLevel };
          }
          if (item.claimValue === 'Read') {
            return { read: item.accessLevel };
          }
          return null;
        }).filter(item => item !== null);
        accessLevels.forEach(level => {


        });
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };



  const [accessLevel, setAccessLevel] = useState("");

  useEffect(() => {

    if (roleClaims && claimType && roleClaims.length > 0) {
      const obj = findObjListByValueFromArray(
        roleClaims,
        claimType,
        `claimType`,
        `Note For Approval`
      );

      obj ? setAccessLevel(obj) : setAccessLevel("");
    }
  }, [roleClaims, claimType]);

  useEffect(() => {

    // const pullMessageList = async () => {
    //   var data = {
    //     CustomerId: customerid,
    //     EventType: "NFA"
    //   };
    //   const queryParams = buildQueryParams(data)
    //   const res = await apiClient.getres(`api/Communication/Find?${queryParams}`, atoken)

    //   if (res) {
    //     const data = res?.data?.result ?? []

    //     dispatch({ type: actionTypes.SET_Notificationlist, value: data });
    //   }


    // }
    // pullMessageList() // Removed automatic call - now triggered only on bell icon click

  }, []);

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




  const [value, setValue] = React.useState("new");
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const [templatelist, setTemplateList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const getTemplateList = async () => {
    const data = { CustomerId: customerid, EventType: "NFA" };
    const queryParams = buildQueryParams(data);
    try {
      const res = await apiClient.getres(`/api/EventTemplate/Find?${queryParams}`, atoken);
      if (res?.data?.result) {
        setTemplateList(res.data.result);
      } else {
        setTemplateList([]);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "template_list_error" });
    }
  };

  const handleTemplateNavigation = useCallback(async () => {
    try {
      if (value !== "new") {
        const data = { EventId: selectedTemplate?.eventId, EventType: selectedTemplate?.eventType };
        const queryParams = buildQueryParams(data);
        const res = await apiClient.postres(`/api/NFAManage/NFATemplateClone?${queryParams}`, null, atoken);
        if (res?.data?.length > 0) {
          navigate(`/configuration/manage-nfa/${res.data[0].id}`);
        }
      } else {
        navigate(`/configuration/manage-nfa/add`);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "template_nav_error" });
    }
  }, [selectedTemplate, value]);

  const [recorddata, setRecorddata] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [quickFilterValue, setQuickFilterValue] = useState('');
  const [debouncedQuickFilterValue, setDebouncedQuickFilterValue] = useState('');
  console.log("recorddatarecorddata:", recorddata)

  // Advanced search states and functions
  const [divVisible, setDivVisible] = useState(false);
  const toggleDivVisibility = () => {
    setDivVisible(!divVisible);
  };

  const closeDivVisibility = () => {
    setDivVisible(false);
  };

  const applyDateRangeFilter = (result, fromDayjs, toDayjs) => {
    if (!fromDayjs && !toDayjs) return result;
    return result.filter((item) => {
      if (fromDayjs) {
        if (!item.createdOn) return false;
        const dateStr = item.createdOn.endsWith('Z') ? item.createdOn : item.createdOn + 'Z';
        if (dayjs(dateStr).isBefore(fromDayjs)) return false;
      }
      if (toDayjs) {
        if (!item.createdOn) return false;
        const dateStr = item.createdOn.endsWith('Z') ? item.createdOn : item.createdOn + 'Z';
        if (dayjs(dateStr).isAfter(toDayjs)) return false;
      }
      return true;
    });
  };

  const handleFilterList = (res, searchCriteria, pageMetadata, queryParams) => {
    const fromDayjs = searchCriteria?.StartDate ? dayjs(searchCriteria.StartDate) : null;
    const toDayjs = searchCriteria?.EndDate ? dayjs(searchCriteria.EndDate) : null;
    const hasDateRange = !!(fromDayjs || toDayjs);
    let filteredData = res || [];
    if (hasDateRange) {
      filteredData = applyDateRangeFilter(filteredData, fromDayjs, toDayjs);
    }
    setRecorddata(filteredData);
    setTotalCount(hasDateRange ? filteredData.length : (pageMetadata?.totalCount || filteredData.length));
    setPage(0);
    setFilterMode(true);
    setFilterQueryParams(queryParams);
    setFilterSearchCriteria(searchCriteria);
    setFilterFromDayjs(fromDayjs);
    setFilterToDayjs(toDayjs);
  };

  const clearFilterList = () => {
    setFilterMode(false);
    setFilterQueryParams(null);
    setFilterSearchCriteria(null);
    setFilterFromDayjs(null);
    setFilterToDayjs(null);
    setPage(0);
    pullNFAManageFind(1, pageSize);
  };
  
  const getRowId = (row) => {
    //console.log('getrowid', row.id)
    return row?.id;
  };




  const columns = [
    {
      field: "nfaSubject",
      headerName: "NFA Subject",
      flex: 1,
      valueGetter: (params) => `${params?.row?.nfaSubject || ""} ${params?.row?.id || ""} ${params?.row?.nfaNumber || ""}`,
      renderCell: (params) => (
        <Tooltip disabled={!iseditDisabled} title="click to view/edit NFA">
          <div disabled={!iseditDisabled}>
            <div
            className="content-text"
              onClick={() => {
                if (iseditDisabled) {
                  
                  navigate(`/configuration/manage-nfa/${params?.row.id}`);
                }
              }}
              style={{ cursor: iseditDisabled ? "pointer" : "not-allowed" }}
            >
             <div className="content-text" disabled={!iseditDisabled}>
				{params?.row?.nfaSubject}
              </div>
            </div>

            <div
              disabled={!iseditDisabled}
             className="content-text"
              onClick={() => {
                if (iseditDisabled) {
                  navigate(`/configuration/manage-nfa/${params?.row.id}`);
                }
              }}
              style={{ cursor: iseditDisabled ? "pointer" : "not-allowed" }}
            >
              <span disabled={!iseditDisabled}>NFA Id: </span>
              {params?.row.id}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      field: "nfaNumber",
      headerName: "NFA Number",
      flex: 1,
      minWidth: 135,
      renderCell: (params) => (
        <div
         className="content-text"
          onClick={() => {
            if (iseditDisabled) {
              navigate(`/configuration/manage-nfa/${params?.row.id}`);
            }
          }}
          style={{ cursor: iseditDisabled ? "pointer" : "not-allowed" }}
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
          className="textLigblue"
          onClick={() => {
            if (iseditDisabled) {
              navigate(`/configuration/manage-nfa/${params?.row.id}`);
            }
          }}
          style={{ cursor: iseditDisabled ? "pointer" : "not-allowed" }}
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
          onClick={() => {
            if (iseditDisabled) {
              navigate(`/configuration/manage-nfa/${params?.row.id}`);
            }
          }}
          style={{ cursor: iseditDisabled ? "pointer" : "not-allowed" }}
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
            onClick={() => {
              if (iseditDisabled) {
                
                navigate(`/configuration/manage-nfa/${params?.row.id}`);
              }
            }}
            style={{ cursor: iseditDisabled ? "pointer" : "not-allowed" }}
          >
            {params?.formattedValue}
          </div>
        );
      },
    },
    {field: "purchOrg",
      headerName: "Purchase Org",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <div
         className="content-text"
          onClick={() => {
            if (iseditDisabled) {
              navigate(`/configuration/manage-nfa/${params?.row.id}`);
            }
          }}
          style={{ cursor: iseditDisabled ? "pointer" : "not-allowed" }}
        >
          {params?.formattedValue}
        </div>
      ),
    },
    {field: "purchGroup",
      headerName: "Purchase Group",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <div
         className="content-text"
          onClick={() => {
            if (iseditDisabled) {
              navigate(`/configuration/manage-nfa/${params?.row.id}`);
            }
          }}
          style={{ cursor: iseditDisabled ? "pointer" : "not-allowed" }}
        >
          {params?.formattedValue}
        </div>
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

  useEffect(() => {
    PullPurchaseOrgAll();
    PullPurchaseGroupAll()
  }, [atoken, customerid]);


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

  useEffect(() => {
    pullNFAManageFind();
  }, [atoken, customerid, accessLevel]);

  const [gridloading, setGridloading] = useState(false);
  const [QuotesMessage, setQuotesMessage] = useState("You Are Not Authorized To View This");

  const pullNFAManageFind = (pageNumber = 1, pageSizeVal = pageSize) => {
    var data = {
      CustomerId: customerid,
      AccessLevel: listaccessLevel,
      SortingColumn: "Id",
    };
    setGridloading(true);
    getNFAManageFind(data, atoken, pageNumber, pageSizeVal).then((res) => {
      setGridloading(false);
      if (res) {
        setTotalCount(res?.pageMetadata?.totalCount || 0);
        if (res?.result?.length > 0) {
          setRecorddata(res.result);
        } else {
          setRecorddata([]);
        }
      } else {
        setRecorddata([]);
      }
    });
  };

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

  // const handleSelectSinglePRRFQ = (itemid, boolean) => {
  //   const updatedList = selectedItems.map((x) => {
  //     if (x.id === itemid) {
  //       return {
  //         ...x,
  //         isSelected: boolean,
  //       };
  //     }
  //     return x;
  //   });
  //   setSelectedItems(updatedList);
  // };

  // const handleSelectAllPRRFQ = (boolean) => {
  //   const updatedList = selectedItems.map((x) => ({
  //     ...x,
  //     isSelected: boolean,
  //   }));
  //   setSelectedItems(updatedList);
  // };

  const handleToggleDetails = (itemId) => {
    // Toggle showDetails state for the specific item ID
    setShowDetails((prevShowDetails) => ({
      ...prevShowDetails,
      [itemId]: !prevShowDetails[itemId],
    }));
  };
  const handleAddNewClick = () => {
    navigate("/configuration/manage-nfa/add");
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentItems.length === itemsPerPage) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // const formik = useFormik({
  //   initialValues: {
  //     PRSubject: "",
  //     PRNumber: "",
  //     stage: "",
  //     PRItems_Plant: "",
  //     PRItems_ItemCategory: "",
  //     purchOrgId: null,
  //     purchGrpId: ""
  //   },
  //   onSubmit: (values) => {
  //     setPrLoading(true);
  //     const { purchOrgId, purchGrpId, ...restValues } = values;
  //     const PurchOrgId = values.purchOrgId?.id || 0;
  //     const PurchGrpId = values.purchGrpId?.id || 0;
  //     const searchParams = {
  //       CustomerId: customerid,
  //       PurchOrgId,
  //       PurchGrpId,
  //       ...restValues,
  //       AccessLevel: listaccessLevel,
  //     };

  //     getPRAdvanceFind(searchParams, atoken).then((responseData) => {
  //       setPrLoading(false);
  //       setRecorddata(responseData);
  //     });
  //   },
  // });

  // const formik = useFormik({
  // 	initialValues: {
  // 		PRSubject: "",
  // 		PRNumber: "",
  // 		// createdOn: "",
  // 		stage: "",
  // 		PRItems_Plant: "",
  // 		PRItems_ItemCategory: "",
  // 	},
  // 	onSubmit: (values) => {
  // 		
  // 		console.log("valuesvalues::",values)
  // 		setPrLoading(true);
  // 		// Call the API to get all data
  // 		getPRManageFind(values, atoken).then((responseData) => {

  // 			setPrLoading(false);
  // 			setRecorddata(responseData);
  // 		});
  // 	},
  // });

  const handleReset = () => {
    // formik.resetForm();
    pullNFAManageFind();
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedQuickFilterValue(quickFilterValue);
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [quickFilterValue]);

  useEffect(() => {
    // Keep users on first page while searching so filtered results are immediately visible.
    setPage(0);
  }, [debouncedQuickFilterValue]);

  // const [firstpr, setFirstPR] = useState(null);

  // const handleChangeRFQPR = (ids) => {

  //   const selectedItems = recorddata
  //     .filter((x) => ids.includes(x.id))
  //     .flatMap((x) => x?.prItems || []);

  //   setSelectedItems(selectedItems);
  // };

  // //to add items from pr to rfq
  // const [selectedPRITemModal, setSelectedPRItemModal] = useState([]);
  // const [rfqItemSet, setRFQItemSet] = useState(new Set());
  // console.log("setRFQItemSet:", rfqItemSet)
  // const [selectedItemsActive, setSelectedItemsActive] = useState([])
  // const [selectedEventType, setSelectedEventType] = useState(null);
  // const [selectedBidType, setSelectedBidType] = useState(null); // For auction types
  // const [showAuctionDropdown, setShowAuctionDropdown] = useState(false);


  // const handleCreateRFQ = (eventtype) => {
  //   // Open the RFQ modal directly
  //   setSelectedEventType(eventtype)
  //   // rfqPrCartOpenModal();
  //   setShowAuctionDropdown(false)
  // };

  // const handleCreateAuction = (eventtype) => {
  //   setSelectedEventType(eventtype)
  //   setShowAuctionDropdown(true);
  // };

  // const handleAuctionTypeSelection = (auctionType) => {
  //   setSelectedBidType(auctionType);
  //   // rfqPrCartOpenModal();
  // };

  // // const handleRFQItemSet = (selectedItems, unselectedItems) => {
  // // 	setRFQItemSet((prevSet) => {
  // // 		const newSet = new Set(prevSet);
  // // 		selectedItems.forEach((item) => newSet.add(item));
  // // 		unselectedItems.forEach((item) => newSet.delete(item));
  // // 		console.log("newSetnewSet",newSet)
  // // 		return newSet;
  // // 	});
  // // };

  // const handleRFQItemSet = (selectedItems, unselectedItems) => {
  //   setRFQItemSet((prevSet) => {
  //     const newSet = new Set(prevSet);

  //     // Add selected items to the set
  //     selectedItems.forEach((newItem) => {
  //       // Check if the set already has an item with the same ID
  //       const existingItem = Array.from(newSet).find(item => item.id === newItem.id);
  //       if (!existingItem) {
  //         newSet.add(newItem);
  //       }
  //     });

  //     // Remove unselected items from the set
  //     unselectedItems.forEach((itemToRemove) => {
  //       newSet.forEach((item) => {
  //         if (item.id === itemToRemove.id) {
  //           newSet.delete(item);
  //         }
  //       });
  //     });
  //     return newSet;
  //   });
  // };

  // // const handleDeleteItemSet = (item) => {
  // // 	setRFQItemSet((prevSet) => {
  // // 		prevSet.delete(item);
  // // 		return new Set(prevSet);
  // // 	});
  // // };

  // const handleDeleteItemSet = (itemId) => {
  //   setRFQItemSet((prevSet) => {
  //     const newSet = new Set(prevSet);
  //     for (let item of newSet) {
  //       if (item.id === itemId) {
  //         newSet.delete(item);
  //         break;
  //       }
  //     }
  //     return newSet;
  //   });
  // };

  // const findSelectedItemsActive = () => {
  //   const commonObjects = [...rfqItemSet].filter(item => selectedPRITemModal.some(modalItem => item.state === modalItem.state));
  //   const commonObjectsId = commonObjects.map(x => x.id)
  //   setSelectedItemsActive(commonObjectsId);
  // };
  // const selectItemsById = (ids) => {

  //   const selecteditems = selectedPRITemModal.filter((object) =>
  //     ids.includes(object.id)
  //   );
  //   const unselectedItems = selectedPRITemModal.filter((object) =>
  //     !ids.includes(object.id)
  //   );
  //   setSelectedItemsActive(ids)
  //   handleRFQItemSet(selecteditems, unselectedItems);
  // };

  // const handleADDtoRFQ = (id) => {
  //   const selectedFirstPR = recorddata?.find((x) => x.id === id) ?? null;
  //   if (selectedFirstPR) {
  //     const selectedItems = selectedFirstPR.prItems.map(item => ({
  //       ...item,
  //       prNo: selectedFirstPR.prNumber // Add the prNo field here
  //     }));
  //     setSelectedPRItemModal(selectedItems);
  //   } else {
  //     setSelectedPRItemModal([]);
  //   }

  //   findSelectedItemsActive();
  //   setFirstPR(selectedFirstPR);
  // };

  // const [prloader, setPRLoader] = useState(false)
  //pr to rfq
  // const createRFQfromPR = async () => {
  //   setPRLoader(true)
  //   const pritem = Array.from(rfqItemSet);
  //   const data = {
  //     subject: firstpr?.prSubject,
  //     description: firstpr?.prDescription,
  //     status: "Draft",
  //     //requisitioner: firstpr?.requisitioner,
  //     purchGrpId: firstpr?.purchGrpId,
  //     purchOrgId: firstpr?.purchOrgId,
  //     rfqParameters: RFQModalFromPR(pritem),
  //   };
  //   const statedata = {
  //     EventType: "RFQ",
  //     CustomerId: customerid,
  //     EventId: 0,
  //     OrgId: firstpr?.purchOrgId,
  //     OrgGroupId: firstpr?.purchGrpId,
  //   }
  //   const queryParams = buildQueryParams(statedata)
  //   const stagelist = await apiClient.getres(`/api/EventStage/EventStageFind?${queryParams}`, atoken)

  //   const prdatapayload = getPayloadWithStage(
  //     "currentStage",
  //     "Draft",
  //     stagelist?.data?.result,
  //     data,
  //     "currentStage",
  //     firstpr?.purchOrgId,
  //     firstpr?.purchGrpId
  //   );
  //   const res = await apiClient.postres(`/api/RFQManage/Add`, prdatapayload, atoken);
  //   //const res = await apiClient.postres(`/api/RFQManage/Add`, data, atoken);

  //   if (res) {
  //     const id = res.data;
  //     toast.success(`RFQ Created successfully.`);
  //     navigate(`/configuration/manage-rfq/${id}`);
  //   }
  //   setPRLoader(false)
  // };

  // //pr to auction
  // const createAuctionFromPR = async () => {
  //   setPRLoader(true)

  //   const pritem = Array.from(rfqItemSet);
  //   const data = {
  //     subject: firstpr?.prSubject,
  //     description: firstpr?.prDescription,
  //     bidSubTypeId: 81,
  //     bidClosingType: 'A',
  //     showRankToVendor: 'Y',
  //     maximumExtension: -1,
  //     extensionDuration: 2,
  //     hideVendor: false,
  //     hidePrice: false,
  //     baseCurrency: 'INR',
  //     bidTypeID: selectedBidType?.bidTypeId,
  //     tnC: "terms and condition",
  //     stage: "Draft",
  //     bidStDate: new Date(),
  //     bidEndDate: new Date(),
  //     bidDuration: 0,
  //     configureDate: new Date(),
  //     prebid: false,
  //     quotesinWords: false,
  //     rankToVendorPost: false,
  //     noOfStaggerItems: 0,
  //     bidParamater: AuctionModalFromPR(pritem),
  //   };
  //   const statedata = {
  //     EventType: "Auction",
  //     CustomerId: customerid,
  //     EventId: 0,
  //     OrgId: firstpr?.purchOrgId,
  //     OrgGroupId: firstpr?.purchGrpId,
  //   }

  //   const queryParams = buildQueryParams(statedata)
  //   const stagelist = await apiClient.getres(`/api/EventStage/EventStageFind?${queryParams}`, atoken)

  //   const prdatapayload = getPayloadWithStage(
  //     "currentStage",
  //     "Draft",
  //     stagelist?.data?.result,
  //     data,
  //     "currentStage",
  //     firstpr?.purchOrgId,
  //     firstpr?.purchGrpId
  //   );
  //   const res = await apiClient.postres(`/api/AuctionManage/Add`, prdatapayload, atoken);
  //   if (res) {
  //     const id = res.data;
  //     toast.success(`BID Created successfully.`);
  //     switch (selectedBidType?.bidTypeId) {
  //       case 1:
  //         navigate(`/configuration/manage-foa/${id}`);
  //         break;
  //       case 2:
  //         navigate(`/configuration/manage-ra/${id}`);
  //         break;
  //       case 3:
  //         navigate(`/configuration/manage-fa/${id}`);
  //         break;
  //       case 4:
  //         navigate(`/configuration/manage-ca/${id}`);
  //         break;
  //       case 5:
  //         navigate(`/configuration/manage-ffa/${id}`);
  //         break;
  //       case 6:
  //         navigate(`/configuration/manage-fra/${id}`);
  //         break;
  //       default:
  //         toast.error(`Unhandled bidTypeID: ${id}`);
  //         break;
  //     }
  //     //navigate(`/configuration/manage-ra/${id}`);
  //   }
  //   setPRLoader(false)
  // };

  const CustomToolbar = React.useCallback(({ onFilterClick }) => {
    return (
      <GridToolbarContainer className="row">
        <div className="d-flex justify-content-between">
          <div>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
            <Button
              variant="text"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={onFilterClick}
              className="text-capitalize"
            >
              Advance Search
            </Button>
          </div>
          <div>
            <GridToolbarQuickFilter />
          </div>
        </div>
      </GridToolbarContainer>
    );
  }, []);
  // const [prLoading, setPrLoading] = useState(false);

  //###
  return (
    <>
      <div className="mainContainer d-flex">
        {/* LEFT CONTENT */}
        <div className={`leftContent ${divVisible ? "col-9" : "col-12"} d-flex flex-column`}>
          <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
            <div className="d-flex justify-content-between border-bottom align-items-center mb-3">
              <div className="page-heading text-dark-blue textMedium">
                <BackButton title="Manage NFA" />
              </div>

              <div className="d-flex align-items-center gap-2">
                {accessLevel?.list?.created != "None" && (
                  <Button
                    variant="text"
                    size="large"
                    startIcon={<HiPlusSm />}
                    className="text-capitalize blue-text font-normal me-3"
                    onClick={OpenModal}
                  >
                    Add New
                  </Button>
                )}
              </div>
            </div>

            <div className="row gx-0 flex-grow-1">
              <div className="col-12 mb-3 d-flex flex-column" style={{ height: '100%' }}>
                {gridloading ? (
                  <GridSkeleton />
                ) : recorddata?.length === 0 ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                    <h5 className="text-muted">No NFA found</h5>
                  </div>
                ) : (
                  <div className="data-grid-wrapper flex-grow-1" style={{ overflow: 'hidden' }}>
                    <DataGrid
                      getRowId={getRowId}
                      rows={recorddata}
                      columns={columns}
                      pagination
                      paginationMode="client"
                      pageSizeOptions={[10, 25, 50, 100]}
                      paginationModel={{ page: page, pageSize: pageSize }}
                      onPaginationModelChange={(model) => {
                        setPage(model.page);
                        setPageSize(model.pageSize);
                      }}
                      onFilterModelChange={(filterModel) => {
                        const nextQuickFilterValue = filterModel?.quickFilterValues?.[0] || '';
                        setQuickFilterValue((prevQuickFilterValue) =>
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
                          showQuickFilter: true,
                          quickFilterProps: {
                            debounceMs: 400,
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT (Filter Panel) */}
        {divVisible && (
          <div className={`rightContent ${divVisible ? " col-3" : "d-none"}`}>
            <div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column ms-3 right-panel-container">
              <form className="d-flex flex-column flex-grow-1">
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
                    <FilterNFACell
                      handleFilterList={handleFilterList}
                      clearFilterList={clearFilterList}
                      setFilterValues={setFilterValues}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* <React.Fragment key="top">
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
      </React.Fragment> */}
      <Modal
        size="lg"
        show={modal}
        backdrop="static"
        keyboard={false}
        className='zindex10002'
        backdropClassName='zindex10002'
        centered
        contentClassName='border-0 rounded-default'
        onHide={() => CloseModal()}
      >
        <Modal.Header className='pt-2 pb-2'>
          <Modal.Title id="modal-heading">
            <div className='d-flex align-items-center f14'>What would you like to do?</div>
          </Modal.Title>
          <IconButton onClick={() => CloseModal()} size="small" edge="start">
            <HiOutlineX className='' />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className='p-3'>
            <div className='row'>
              <div className='col-12'>
                <FormControl>
                  <RadioGroup
                    aria-labelledby=""
                    defaultValue="new"
                    name="new-nfa"
                    value={value}
                    onChange={handleChange}
                  >
                    <FormControlLabel value="new" control={<Radio />} label="Create a New NFA" />
                    <FormControlLabel value="template" control={<Radio />} label="Select From Template" />
                  </RadioGroup>
                </FormControl>
              </div>
              {value === 'template' && (
                <div className='col-12 mt-2'>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    size='small'
                    options={templatelist ?? []}
                    getOptionLabel={(option) => option.templateTitle ?? ""}
                    fullWidth
                    renderInput={(params) => <TextField {...params} InputLabelProps={{ shrink: true }} label="Select Template" />}
                    onChange={(e, v) => setSelectedTemplate(v)}
                    onOpen={() => { if (templatelist.length === 0) getTemplateList(); }}
                  />
                </div>
              )}
              <div className='col-12 mt-4 text-end'>
                <LoadingButton
                  variant='outlined'
                  onClick={handleTemplateNavigation}
                  color='primary'
                  className='text-capitalize'
                  size='small'
                >
                  Continue
                </LoadingButton>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* <Modal
        size="xl"
        show={rfqprcartmodal}
        backdrop="static"
        centered
        contentClassName="border-0 rounded"
        className="zindex1280"
        backdropClassName="zindex1280"
        onHide={() => rfqPrCartOpenModal()}
      >
        <Modal.Header className="pt-2 pb-2 bgheaderCards">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14 text-white">
              Create  From PR
            </div>
          </Modal.Title>
          <div className="action-wrap">

            <IconButton
              onClick={() => rfqPrCartCloseModal()}
              size="small"
              edge="start"
            >
              <HiOutlineX className="f20 text-white" />
            </IconButton>
          </div>

        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <div className="row">
              <div style={{ height: '400px', width: '100%' }}>
                <DataGrid
                  getRowId={getBRRowId}
                  rows={Array.from(rfqItemSet)}
                  columns={prrfqcolumn}
                  pageSize={10}
                  onSelectionModelChange={(ids) => selectItemsById(ids)}
                  selectionModel={selectedItemsActive}
                  rowHeight={40}
                  columnHeaderHeight={40}
                  className="f13 border-0"
                  disableSelectionOnClick
                />
              </div>
            </div>
            <div className="row jusitfy-content-end">
              <div className="col-md-12 text-end">

                <LoadingButton
                  loading={prloader}
                  variant="outlined"
                  size="medium"
                  className=" rounded-pill me-2"
                  onClick={createRFQfromPR}
                >
                  <span className="text-capitalize">Submit</span>
                </LoadingButton>
              </div>

            </div>
          </div>
        </Modal.Body>
      </Modal> */}
    </>
  );
};

export default ManageNFA;
