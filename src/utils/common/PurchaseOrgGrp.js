import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Cookies, useCookies } from "react-cookie";
import { actionTypes, useStateValue } from "../../store";
import NoRecordCell from "../../components/NoRecordCell";
import {
  AddPurcOrgGrp,
  OrgGroupMasterList,
  UpdatePurchOrgGrp,
  getPurchaseOrgList,
} from "./utility";
import { BackButton } from "./component";
import { toast } from "react-toastify";
import MasterFormPanel, { MfpEditBtn } from "../../components/MasterFormPanel/MasterFormPanel";

const PurchaseOrgGrp = (props) => {
  const { isModal, selectedOrgMstId, selectedPurOrggrp } = props;
  const [cookies] = useCookies(["patkn", "prtkn"]);
  const [groupName, setgroupName] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [purchaseAllList, setPurchaseAllList] = useState([]);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [{ atoken, customerid }, dispatch] = useStateValue();
  const [editRecordData, seteditRecordData] = useState(null);
  const [orgMstId, setorgMstId] = useState();
  const [orgGrpList, setOrgGrpList] = useState([]);
  const [gridloading, setGridloading] = useState(true);
  const [previousIsActive, setPreviousIsActive] = useState(true);

  useEffect(() => {
    if (selectedOrgMstId) selectedPurOrggrp(selectedOrgMstId);
  }, [selectedOrgMstId, selectedPurOrggrp]);

  useEffect(() => {
    PullPurchaseOrgAll();
    pullOrgGrpList();
  }, []);

  useEffect(() => {
    if (editRecordData && editRecordData?.id > 0) prefilledDocument();
  }, [editRecordData, purchaseAllList]);

  const pullOrgGrpList = (filterOrgId) => {
    const data = { CustomerId: customerid, SortingColumn: "Id", orgMstId: filterOrgId };
    setGridloading(true);
    OrgGroupMasterList(data, atoken).then((res) => {
      if (res) setOrgGrpList(res);
      setGridloading(false);
    });
  };

  const PullPurchaseOrgAll = () => {
    getPurchaseOrgList({ CustomerId: customerid, IsActive: "true" }, atoken).then((resp) => {
      setPurchaseAllList(resp || []);
    });
  };

  const getOrganisationDefault = (id) => {
    if (!id || !purchaseAllList.length) return null;
    return purchaseAllList.find((d) => d.id === id) || null;
  };

  const prefilledDocument = () => {
    setorgMstId(editRecordData?.orgMstId);
    setgroupName(editRecordData?.groupName || "");
    setIsActive(editRecordData?.isActive ?? true);
    setAddress(editRecordData?.address || "");
    if (purchaseAllList.length > 0 && editRecordData?.orgMstId) {
      const found = purchaseAllList.find((o) => o.id === editRecordData.orgMstId);
      setOrgName(found?.orgName || editRecordData?.orgName || "");
    } else {
      setOrgName(editRecordData?.orgName || "");
    }
  };

  const resetDocument = () => {
    seteditRecordData(null);
    setorgMstId(undefined);
    setOrgName("");
    setgroupName("");
    setAddress("");
    setIsActive(true);
  };

  const callbackedit = useCallback(
    (data) => {
      setorgMstId(data?.orgMstId);
      setgroupName(data?.groupName || "");
      setIsActive(data?.isActive ?? true);
      setAddress(data?.address || "");
      seteditRecordData(data);
      if (data?.orgName) {
        setOrgName(data.orgName);
      } else if (purchaseAllList.length > 0 && data?.orgMstId) {
        const found = purchaseAllList.find((o) => o.id === data.orgMstId);
        if (found) setOrgName(found.orgName);
      }
    },
    [purchaseAllList]
  );

  const handleSubmit = () => {
    if (!orgMstId) {
      toast.error("Please select an organization", { toastId: "pog-org" });
      return;
    }
    if (!groupName?.trim()) {
      toast.error("Please enter Group Name", { toastId: "pog-grp" });
      return;
    }
    const data = {
      id: editRecordData?.id || 0,
      orgMstId,
      orgName,
      groupName,
      isActive,
      address,
    };
    setLoading(true);
    const action =
      editRecordData?.id > 0
        ? UpdatePurchOrgGrp(data, atoken, editRecordData.id)
        : AddPurcOrgGrp(data, atoken);

    action.then((res) => {
      setLoading(false);
      pullOrgGrpList();
      if (props.selectedPurOrggrp) props.selectedPurOrggrp(orgMstId);
      dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
      dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
      dispatch({ type: actionTypes.SET_MSGALERT, value: true });
      resetDocument();
      toast.success(
        editRecordData?.id > 0 ? "Group updated successfully." : "Group added successfully.",
        { toastId: "pog-save" }
      );
    });
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    if (previousIsActive === true && val === false) {
      toast.warning(
        "Deactivating this Purchase Group may impact its associated Purchase Organization. Kindly verify dependencies before proceeding.",
        { position: toast.POSITION.TOP_CENTER, autoClose: 5000 }
      );
    }
    setIsActive(val);
    setPreviousIsActive(val);
  };

  const columns = [
    { field: "orgName", headerName: "Organization", flex: 2, minWidth: 160 },
    { field: "groupName", headerName: "Group Name", flex: 2, minWidth: 160 },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className={`badge-status ${params.value ? "badge-active" : "badge-inactive"}`}>
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 80,
      sortable: false,
      renderCell: (params) => <MfpEditBtn onClick={() => callbackedit(params.row)} />,
    },
  ];

  return (
    <div
      className={`bg-white rounded-default w-100 d-flex flex-column ${!isModal ? "p-3 shadow-sm" : "p-0"}`}
      style={!isModal ? { height: "90vh" } : { height: "100%" }}
    >
      {!isModal && (
        <div className="d-flex align-items-center border-bottom rounded-default mb-3 pb-2">
          <BackButton title={<span className="page-heading">Purchase Group</span>} />
        </div>
      )}

      <div className="flex-grow-1" style={{ minHeight: 0 }}>
        <MasterFormPanel
          title="Purchase Group"
          isModal={true}
          onReset={resetDocument}
          onSubmit={handleSubmit}
          loading={loading}
          columns={columns}
          rows={orgGrpList}
          gridLoading={gridloading}
          getRowId={(row) => row.id}
        >
          {/* Organization */}
          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">
              Organization <span className="rfq-required-star">*</span>
            </label>
            <Autocomplete
              size="small"
              options={purchaseAllList}
              value={getOrganisationDefault(orgMstId)}
              onChange={(_, newVal) => {
                if (newVal) {
                  setorgMstId(newVal.id);
                  setOrgName(newVal.orgName);
                } else {
                  setorgMstId(undefined);
                  setOrgName("");
                }
              }}
              getOptionLabel={(opt) => opt.orgName}
              renderOption={(props, opt) => (
                <Box component="li" {...props}>{opt.orgName}</Box>
              )}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" size="small" placeholder="Select organization" label={null} />
              )}
            />
          </div>

          {/* Group Name */}
          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">
              Group Name <span className="rfq-required-star">*</span>
            </label>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Enter group name"
              label={null}
              value={groupName}
              onChange={(e) => setgroupName(e.target.value)}
              inputProps={{ maxLength: 100 }}
              InputProps={{
                endAdornment: groupName ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      {groupName.length}/100
                    </Typography>
                  </InputAdornment>
                ) : null,
              }}
            />
          </div>

          {/* Address */}
          <div className="mfp-field mfp-field--lg">
            <label className="pe-field-label">Address</label>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Enter address"
              label={null}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              inputProps={{ maxLength: 200 }}
              InputProps={{
                endAdornment: address ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      {address.length}/200
                    </Typography>
                  </InputAdornment>
                ) : null,
              }}
            />
          </div>

          {/* Status */}
          <div className="mfp-field mfp-field--sm">
            <label className="pe-field-label">Status</label>
            <FormControl fullWidth size="small">
              <Select
                variant="outlined"
                size="small"
                value={isActive}
                onChange={handleStatusChange}
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>
        </MasterFormPanel>
      </div>
    </div>
  );
};

export default PurchaseOrgGrp;
