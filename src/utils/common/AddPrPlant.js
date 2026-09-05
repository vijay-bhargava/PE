import React, { useState, useEffect, useCallback } from "react";
import {
  Autocomplete,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useStateValue } from "../../store";
import { toast } from "react-toastify";
import MasterFormPanel, { MfpEditBtn } from "../../components/MasterFormPanel/MasterFormPanel";
import { FindPlantStorage, PlantAdd, UpdatePlant } from "../purchaseRequest";
import { fetchMasters, fetchStates, fetchCities } from "./index";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const AddPrPlant = ({ handlePlantList, isModal = false }) => {
  const [{ atoken, customerid }] = useStateValue();

  const [slDesc, setSlDesc] = useState("");
  const [slCode, setSlCode] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState(null);
  const [Cstate, setCstate] = useState(null);
  const [city, setCity] = useState(null);
  const [panNumber, setPanNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [gridloading, setGridloading] = useState(true);
  const [list, setList] = useState([]);
  const [editRecordData, setEditRecordData] = useState(null);

  useEffect(() => {
    pullList();
    fetchMasters(atoken, customerid).then((res) => {
      if (res) setCountryList(res.countryList || []);
    });
  }, [customerid]);

  const pullList = () => {
    if (!customerid) return;
    setGridloading(true);
    FindPlantStorage({ CustomerId: customerid }, atoken).then((res) => {
      const data = Array.isArray(res) ? res : [];
      setList(data);
      if (handlePlantList) handlePlantList(data);
      setGridloading(false);
    });
  };

  const handleCountryChange = (_, value) => {
    setCountry(value);
    setCstate(null);
    setCity(null);
    setStateList([]);
    setCityList([]);
    if (value?.id) {
      fetchStates(value.id, atoken).then((res) => {
        setStateList(Array.isArray(res) ? res : []);
      });
    }
  };

  const handleStateChange = (_, value) => {
    setCstate(value);
    setCity(null);
    setCityList([]);
    if (value?.id) {
      fetchCities(value.id, atoken).then((res) => {
        setCityList(Array.isArray(res) ? res : []);
      });
    }
  };

  const resetForm = () => {
    setEditRecordData(null);
    setSlDesc(""); setSlCode(""); setAddress("");
    setCountry(null); setCstate(null); setCity(null);
    setPanNumber(""); setGstNumber("");
    setIsActive(true);
    setStateList([]); setCityList([]);
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!slDesc?.trim()) errs.slDesc = "Plant Name is required.";
    if (panNumber.trim() && !PAN_REGEX.test(panNumber.trim().toUpperCase()))
      errs.panNumber = "Invalid PAN format (e.g. ABCDE1234F).";
    if (gstNumber.trim() && !GST_REGEX.test(gstNumber.trim().toUpperCase()))
      errs.gstNumber = "Invalid GST format (e.g. 22AAAAA0000A1Z5).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      id: editRecordData?.id || 0,
      customerId: parseInt(customerid) || 0,
      slDesc: slDesc.trim(),
      slCode: slCode.trim(),
      address: address.trim(),
      country: country?.countryName || "",
      countryId: country?.id || 0,
      state: Cstate?.stateName || "",
      stateId: Cstate?.id || 0,
      city: city?.cityName || "",
      cityId: city?.id || 0,
      panNumber: panNumber.trim().toUpperCase(),
      gstNumber: gstNumber.trim().toUpperCase(),
      isActive,
    };
    setLoading(true);
    try {
      if (editRecordData?.id > 0) {
        await UpdatePlant(payload, editRecordData.id, atoken);
        toast.success("Plant updated successfully.", { toastId: "plant-update" });
      } else {
        await PlantAdd(payload, atoken);
        toast.success("Plant added successfully.", { toastId: "plant-add" });
      }
      pullList();
      resetForm();
    } catch {
      toast.error("Operation failed.", { toastId: "plant-err" });
    } finally {
      setLoading(false);
    }
  };

  // Re-apply country when countryList loads after edit was clicked
  useEffect(() => {
    if (!editRecordData || countryList.length === 0) return;
    const found = countryList.find(
      c => (editRecordData.countryId && Number(c.id) === Number(editRecordData.countryId))
        || (editRecordData.country && c.countryName === editRecordData.country)
    );
    if (found) setCountry(found);
  }, [countryList, editRecordData]);

  const callbackedit = useCallback((row) => {
    setEditRecordData(row);
    setSlDesc(row.slDesc || "");
    setSlCode(row.slCode || "");
    setAddress(row.address || "");
    setPanNumber(row.panNumber || "");
    setGstNumber(row.gstNumber || "");
    setIsActive(row.isActive ?? true);
    setErrors({});
    setCstate(null); setCity(null);
    setStateList([]); setCityList([]);

    // Match country by id OR by name (API may not return countryId)
    const foundCountry = countryList.find(
      c => (row.countryId && Number(c.id) === Number(row.countryId))
        || (row.country && c.countryName === row.country)
    );
    setCountry(foundCountry || null);

    const countryIdToUse = foundCountry?.id || row.countryId;
    if (countryIdToUse) {
      fetchStates(countryIdToUse, atoken).then((res) => {
        const states = Array.isArray(res) ? res : [];
        setStateList(states);

        const foundState = states.find(
          s => (row.stateId && Number(s.id) === Number(row.stateId))
            || (row.state && s.stateName === row.state)
        );
        setCstate(foundState || null);

        const stateIdToUse = foundState?.id || row.stateId;
        if (stateIdToUse) {
          fetchCities(stateIdToUse, atoken).then((cr) => {
            const cities = Array.isArray(cr) ? cr : [];
            setCityList(cities);
            const foundCity = cities.find(
              c => (row.cityId && Number(c.id) === Number(row.cityId))
                || (row.city && c.cityName === row.city)
            );
            setCity(foundCity || null);
          });
        }
      });
    }
  }, [atoken, countryList]);

  const columns = [
    { field: "slDesc", headerName: "Plant Name", flex: 2, minWidth: 140 },
    { field: "slCode", headerName: "Plant Code", flex: 1, minWidth: 100 },
    { field: "address", headerName: "Address", flex: 2, minWidth: 140 },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 90,
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
      <div className="flex-grow-1" style={{ minHeight: 0 }}>
        <MasterFormPanel
          title="Manage Plant"
          isModal={true}
          onReset={resetForm}
          onSubmit={handleSubmit}
          loading={loading}
          columns={columns}
          rows={list}
          gridLoading={gridloading}
          getRowId={(row) => row.id || row.slDesc}
        >
          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">
              Plant Name <span className="rfq-required-star">*</span>
            </label>
            <TextField
              variant="outlined" size="small" fullWidth
              placeholder="Enter plant name"
              value={slDesc}
              onChange={(e) => { setSlDesc(e.target.value); setErrors(p => ({ ...p, slDesc: "" })); }}
              error={!!errors.slDesc}
              helperText={errors.slDesc}
              inputProps={{ maxLength: 100 }}
              InputProps={{
                endAdornment: slDesc ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">{slDesc.length}/100</Typography>
                  </InputAdornment>
                ) : null,
              }}
            />
          </div>

          <div className="mfp-field mfp-field--sm">
            <label className="pe-field-label">Plant Code</label>
            <TextField
              variant="outlined" size="small" fullWidth
              placeholder="Enter code"
              value={slCode}
              onChange={(e) => setSlCode(e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </div>

          <div className="mfp-field mfp-field--lg">
            <label className="pe-field-label">Address</label>
            <TextField
              variant="outlined" size="small" fullWidth
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              inputProps={{ maxLength: 200 }}
            />
          </div>

          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">Country</label>
            <Autocomplete
              size="small"
              options={countryList}
              value={country}
              getOptionLabel={(o) => o.countryName || ""}
              onChange={handleCountryChange}
              slotProps={{ popper: { style: { zIndex: 99999 } } }}
              renderInput={(params) => (
                <TextField variant="outlined" {...params} placeholder="Select country" />
              )}
            />
          </div>

          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">State</label>
            <Autocomplete
              size="small"
              options={stateList}
              value={Cstate}
              disabled={!country}
              getOptionLabel={(o) => o.stateName || ""}
              onChange={handleStateChange}
              slotProps={{ popper: { style: { zIndex: 99999 } } }}
              renderInput={(params) => (
                <TextField variant="outlined" {...params} placeholder={!country ? "Select country first" : "Select state"} />
              )}
            />
          </div>

          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">City</label>
            <Autocomplete
              size="small"
              options={cityList}
              value={city}
              disabled={!Cstate}
              getOptionLabel={(o) => o.cityName || ""}
              onChange={(_, v) => setCity(v)}
              slotProps={{ popper: { style: { zIndex: 99999 } } }}
              renderInput={(params) => (
                <TextField variant="outlined" {...params} placeholder={!Cstate ? "Select state first" : "Select city"} />
              )}
            />
          </div>

          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">PAN Number</label>
            <TextField
              variant="outlined" size="small" fullWidth
              placeholder="e.g. ABCDE1234F"
              value={panNumber}
              onChange={(e) => { setPanNumber(e.target.value.toUpperCase()); setErrors(p => ({ ...p, panNumber: "" })); }}
              error={!!errors.panNumber}
              helperText={errors.panNumber}
              inputProps={{ maxLength: 10 }}
            />
          </div>

          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">GST Number</label>
            <TextField
              variant="outlined" size="small" fullWidth
              placeholder="e.g. 22AAAAA0000A1Z5"
              value={gstNumber}
              onChange={(e) => { setGstNumber(e.target.value.toUpperCase()); setErrors(p => ({ ...p, gstNumber: "" })); }}
              error={!!errors.gstNumber}
              helperText={errors.gstNumber}
              inputProps={{ maxLength: 15 }}
            />
          </div>

          <div className="mfp-field mfp-field--sm">
            <label className="pe-field-label">Status</label>
            <FormControl fullWidth size="small">
              <Select
                variant="outlined" size="small"
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
                MenuProps={{ sx: { zIndex: 99999 } }}
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

export default AddPrPlant;
