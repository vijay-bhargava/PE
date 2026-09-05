import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
} from "@mui/material";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { ApiClient, api } from "../../Apiclient";
import { actionTypes, useStateValue } from "../../store";
import { AddPurcOrg, getPurchaseOrgList, UpdatePuchaseOrg } from "./utility";
import { BackButton } from "./component";
import MasterFormPanel, { MfpEditBtn } from "../../components/MasterFormPanel/MasterFormPanel";

const PurchaseOrg = (props) => {
  const { isModal } = props;
  const [{ atoken, customerid, customersuffix }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [cookies] = useCookies(["patkn", "prtkn"]);

  const [orgName, setOrgName] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editRecordData, setEditRecordData] = useState(null);
  const [orgList, setOrgList] = useState([]);
  const [gridloading, setGridloading] = useState(true);

  useEffect(() => {
    pullOrgList();
  }, []);

  useEffect(() => {
    if (editRecordData && editRecordData?.id > 0) {
      setOrgName(editRecordData.orgName || "");
      setAddress(editRecordData.address || "");
      setIsActive(editRecordData.isActive ?? true);
    }
  }, [editRecordData]);

  const pullOrgList = () => {
    setGridloading(true);
    getPurchaseOrgList({ CustomerId: customerid, SortingColumn: "Id" }, atoken).then((res) => {
      if (res) setOrgList(res);
      setGridloading(false);
    });
  };

  const resetDocument = () => {
    setEditRecordData(null);
    setOrgName("");
    setAddress("");
    setIsActive(true);
  };

  const handleSubmit = async () => {
    if (!orgName?.trim()) {
      toast.error("Please enter Organization Name", { toastId: "po-name" });
      return;
    }
    const data = {
      id: editRecordData?.id || 0,
      customerId: customerid,
      customerid,
      orgName,
      address,
      isActive,
      orgGroupMsts: [],
    };
    setLoading(true);
    try {
      if (editRecordData?.id > 0) {
        await UpdatePuchaseOrg(data, editRecordData.id, atoken);
        toast.success("Organization updated successfully.", { toastId: "po-update" });
      } else {
        await apiClient.postres("api/OrgMaster/Add", data, atoken);
        toast.success("Organization added successfully.", { toastId: "po-add" });
      }
      dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
      pullOrgList();
      if (props.selectedPurOrg) props.selectedPurOrg();
      resetDocument();
    } finally {
      setLoading(false);
    }
  };

  const callbackedit = useCallback((data) => {
    setOrgName(data?.orgName || "");
    setAddress(data?.address || "");
    setIsActive(data?.isActive ?? true);
    setEditRecordData(data);
  }, []);

  const columns = [
    { field: "orgName", headerName: "Organization Name", flex: 2, minWidth: 160 },
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
          <BackButton title={<span className="page-heading">Purchase Organization</span>} />
        </div>
      )}

      <div className="flex-grow-1" style={{ minHeight: 0 }}>
        <MasterFormPanel
          title="Purchase Organization"
          isModal={true}
          onReset={resetDocument}
          onSubmit={handleSubmit}
          loading={loading}
          columns={columns}
          rows={orgList}
          gridLoading={gridloading}
          getRowId={(row) => row.id}
        >
          {/* Organization Name */}
          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">
              Organization Name <span className="rfq-required-star">*</span>
            </label>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Enter organization name"
              label={null}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              inputProps={{ maxLength: 100 }}
              InputProps={{
                endAdornment: orgName ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      {orgName.length}/100
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
                onChange={(e) => setIsActive(e.target.value)}
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

export default PurchaseOrg;
