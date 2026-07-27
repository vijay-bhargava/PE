import React, { useState, useEffect, useRef } from 'react';
import { FormControl, Select, MenuItem, TextField, InputAdornment } from '@mui/material';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { useStateValue } from '../../../store';
import { ApiClient } from '../../../Apiclient';
import MasterFormPanel, { MfpEditBtn } from '../../../components/MasterFormPanel/MasterFormPanel';
import { HiOutlineX } from 'react-icons/hi';

const schema = yup.object({
  factorDesc: yup.string().required('Reason of Loading Factor is required'),
  factorType: yup.string().required('Loading Type is required'),
});

const BidLoadingFactor = ({ isModal, bidId, vendorId, initialFactors = [], baseCurrency, onUpdate }) => {
  const [{ atoken, customerid, customersuffix, userDetail }] = useStateValue();

  const [factorType, setFactorType] = useState('');
  const [factorPerc, setFactorPerc] = useState(0);
  const [loadingAmount, setLoadingAmount] = useState(0);
  const [factorDesc, setFactorDesc] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const keyCounter = useRef(0);

  useEffect(() => {
    keyCounter.current = 0;
    const withKeys = (initialFactors ?? []).map((f, i) => ({ ...f, _key: i }));
    keyCounter.current = withKeys.length;
    setFactors(withKeys);
    resetForm();
  }, [vendorId]);

  const resetForm = () => {
    setFactorType('');
    setFactorPerc(0);
    setLoadingAmount(0);
    setFactorDesc('');
    setEditIndex(null);
  };

  const buildPayload = (updatedFactors) =>
    updatedFactors.map(({ _key, ...f }) => ({
      ...f,
      bidId: parseInt(bidId),
      version: 1,
      customerId: parseInt(customerid),
      vendorId,
      loadingOn: 'BID',
      createdById: f.createdById ?? userDetail?.id,
      createdByName: f.createdByName ?? userDetail?.name,
      id: 0,
    }));

  const saveToApi = async (updatedFactors) => {
    const payload = buildPayload(updatedFactors);
    setLoading(true);
    try {
      const res = await new ApiClient(customersuffix).postres(
        `/api/AuctionManage/${parseInt(bidId)}/${vendorId}/AuctionLoadingFactor`,
        payload,
        atoken
      );
      if (res) {
        setFactors(updatedFactors);
        onUpdate?.(updatedFactors);
        return true;
      }
    } catch {
      toast.error('Failed to save loading factor');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleSubmit = async () => {
    try {
      schema.validateSync({ factorDesc, factorType }, { abortEarly: false });
    } catch (e) {
      e.inner.forEach(err => toast.error(err.message, { toastId: err.path }));
      return;
    }

    const entry = {
      factorDesc,
      factorType,
      ...(factorType === 'A'
        ? { loadingAmount: parseFloat(loadingAmount) }
        : { factorPerc: parseFloat(factorPerc) }),
      _key: editIndex !== null ? factors[editIndex]._key : ++keyCounter.current,
    };

    const updatedFactors = editIndex !== null
      ? factors.map((f, i) => (i === editIndex ? entry : f))
      : [...factors, entry];

    const saved = await saveToApi(updatedFactors);
    if (saved) {
      toast.success(
        editIndex !== null ? 'Loading factor updated' : 'Loading factor added',
        { toastId: 'lf-save' }
      );
      resetForm();
    }
  };

  const callbackEdit = (index) => {
    const f = factors[index];
    setFactorType(f.factorType || '');
    setFactorDesc(f.factorDesc || '');
    if (f.factorType === 'A') setLoadingAmount(f.loadingAmount || 0);
    else setFactorPerc(f.factorPerc || 0);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    const updatedFactors = factors.filter((_, i) => i !== index);
    const saved = await saveToApi(updatedFactors);
    if (saved) toast.success('Loading factor removed', { toastId: 'lf-del' });
  };

  const columns = [
    { field: 'factorDesc', headerName: 'Reason', flex: 2, minWidth: 120 },
    {
      field: 'factorType',
      headerName: 'Loading Type',
      flex: 1,
      minWidth: 110,
      valueFormatter: ({ value }) => (value === 'A' ? 'Absolute' : 'Percentage'),
    },
    {
      field: '_value',
      headerName: 'Loading Factor',
      flex: 1,
      minWidth: 110,
      renderCell: ({ row }) =>
        row.factorType === 'A'
          ? `${baseCurrency || ''} ${row.loadingAmount}`
          : `${row.factorPerc}%`,
    },
    {
      field: 'action',
      headerName: 'Actions',
      width: 90,
      sortable: false,
      renderCell: ({ row }) => {
        const idx = factors.findIndex(f => f._key === row._key);
        return (
          <div className="d-flex gap-2 align-items-center">
            <MfpEditBtn onClick={() => callbackEdit(idx)} />
            <button
              type="button"
              className="pe-icon-btn pe-icon-btn--close"
              style={{ width: 28, height: 28 }}
              onClick={() => handleDelete(idx)}
            >
              <HiOutlineX size={13} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div
      className={`bg-white rounded-default w-100 d-flex flex-column ${!isModal ? 'p-3 shadow-sm' : 'p-0'}`}
      style={!isModal ? { height: '90vh' } : { height: '100%' }}
    >
      <div className="flex-grow-1" style={{ minHeight: 0 }}>
        <MasterFormPanel
          title="Loading Factor"
          isModal={isModal}
          onReset={resetForm}
          onSubmit={handleSubmit}
          loading={loading}
          columns={columns}
          rows={factors}
          getRowId={(row) => row._key}
        >
          {/* Loading Type */}
          <div className="mfp-field mfp-field--md" style={{ marginRight: 10 }}>
            <label className="pe-field-label">
              Loading Type <span className="rfq-required-star">*</span>
            </label>
            <FormControl fullWidth size="small">
              <Select
                variant="outlined"
                size="small"
                value={factorType}
                onChange={(e) => setFactorType(e.target.value)}
                sx={{ width: 220, fontSize: 13 }}
                MenuProps={{ PaperProps: { sx: { width: '220px !important', minWidth: '220px !important' } } }}
              >
                <MenuItem value="A">Absolute</MenuItem>
                <MenuItem value="P">Percentage</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Loading Amount / Percent */}
          <div className="mfp-field mfp-field--md">
            {factorType === 'A' ? (
              <>
                <label className="pe-field-label">Loading Amount</label>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={loadingAmount}
                  onChange={(e) => {
                    if (/^-?[0-9]*\.?[0-9]*$/.test(e.target.value))
                      setLoadingAmount(e.target.value);
                  }}
                  inputProps={{ maxLength: 9, inputMode: 'decimal' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">{baseCurrency}</InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <>
                <label className="pe-field-label">Loading Percent</label>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={factorPerc}
                  onChange={(e) => {
                    if (/^[0-9]*\.?[0-9]{0,3}$/.test(e.target.value))
                      setFactorPerc(e.target.value);
                  }}
                  inputProps={{ maxLength: 7, inputMode: 'decimal' }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </>
            )}
          </div>

          {/* Reason */}
          <div className="mfp-field mfp-field--lg">
            <label className="pe-field-label">
              Reason Of Loading Factor <span className="rfq-required-star">*</span>
            </label>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={factorDesc}
              onChange={(e) => setFactorDesc(e.target.value)}
            />
          </div>
        </MasterFormPanel>
      </div>
    </div>
  );
};

export default BidLoadingFactor;
