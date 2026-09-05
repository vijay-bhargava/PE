import React from "react";
import { HiPencilAlt, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { formatDateViaTimeZone, formatoption } from "../../../utils/common/utility";
import { downloadFilesOnAzure, getFileName, fetchStates, fetchCities } from "../../../utils/common";
import { PETableSimple } from "../../../components/RFQ/PETable";

const AddressBlock = ({ address, city, state, country }) => {
  if (!address && !city && !state && !country) return null;
  return (
    <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6, marginBottom: 12 }}>
      {address && <div>{address}</div>}
      {(city || state) && <div>{[city, state].filter(Boolean).join(', ')}</div>}
      {country && <div>{country}</div>}
    </div>
  );
};

const DetailRow = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span className="pe-field-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>{label}:</span>
      <span style={{ fontSize: 13, color: '#1f2937', fontWeight: 500 }}>{value}</span>
    </div>
  );
};

const PODetailsTab = ({
  versionError,
  loadPOVersionData,
  pageSlug,
  selectedVersion,
  isDraft,
  poNumberInput,
  setPoNumberInput,
  loadingVersion,
  latestVersion,
  setSelectedVersion,
  stagedPODate,
  poSpecificDetails,
  currentStage,
  addressCountryOptions,
  atoken,
  setBillToCountryObj,
  setBillToCountry,
  setBillToStateObj,
  setbillToState,
  setBillToCityObj,
  setbillToCity,
  setBillStateOptions,
  setBillCityOptions,
  setOpenEditBill,
  setshipToAddress,
  setshipToCity,
  setshipToState,
  setShipToCountry,
  setShipToCountryObj,
  setShipToStateObj,
  setShipToCityObj,
  setShipStateOptions,
  setShipCityOptions,
  setOpenEditShip,
  selectedPaymentTermId,
  paymentTermsFieldRef,
  setPaymentTermModal,
  setSelectedPaymentTermId,
  paymentTermsLoading,
  paymentTermsOptions,
  selectPOAttachedFile,
  handleOpenAddCondition,
  setIsAddingCondition,
  setEditingCondition,
  setConditionForm,
  setOpenEditCondition,
  setConditionToDelete,
  setDeleteConditionDialogOpen,
  isPoDetailsReadDisabled,
  expiryDate,
  setExpiryDate,
  setbillToAddress,
}) => {
  const isDraftStage = String(currentStage ?? '').toLowerCase().includes('draft');

  if (isPoDetailsReadDisabled) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HiOutlineX style={{ fontSize: 18 }} />
          Access Denied: You don't have permission to view PO Details.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>

      {versionError && (
        <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#991b1b', borderRadius: 6, fontSize: 13, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{versionError}</span>
          <button type="button" className="pe-btn pe-btn--outline" style={{ fontSize: 12, padding: '2px 10px' }} onClick={() => loadPOVersionData(pageSlug, selectedVersion)}>Retry</button>
        </div>
      )}

      {/* Row 1: PO Details + Company Tax Details */}
      <div className="row mb-4 g-4">
        <div className="col-12 col-md-6">
          <div className="pe-info-card">
            <div className="pe-info-card-title">PO Details</div>
            <div className="pe-info-card-grid">
              <DetailRow label="PO Number" value={
                isDraft ? (
                  <input
                    type="text"
                    className="pe-detail-form-input"
                    style={{ height: 28, fontSize: 13, width: 200 }}
                    value={poNumberInput}
                    onChange={(e) => setPoNumberInput(e.target.value)}
                    placeholder="Enter PO Number"
                  />
                ) : (
                  poNumberInput || poSpecificDetails?.externalSourcePONumber || poSpecificDetails?.poNumber || 'N/A'
                )
              } />
              <DetailRow label="Version" value={
                <select
                  className="pe-detail-form-input"
                  style={{ height: 28, padding: '0 6px', fontSize: 13, width: 90 }}
                  value={selectedVersion ?? (poSpecificDetails?.version || poSpecificDetails?.poVersion || 1)}
                  disabled={loadingVersion}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!v || v <= 0 || v === selectedVersion) return;
                    setSelectedVersion(v);
                    loadPOVersionData(pageSlug, v);
                  }}
                >
                  {Array.from({ length: Number(latestVersion) > 0 ? Number(latestVersion) : 1 }, (_, i) => i + 1).map(v => (
                    <option key={v} value={v}>V{v}</option>
                  ))}
                </select>
              } />
              {/* <DetailRow label="Status" value={<StatusBadge status={poSpecificDetails?.stage || poSpecificDetails?.status || ''} />} /> */}
              <DetailRow
                label="PO Amount"
                value={`${poSpecificDetails?.currency ? poSpecificDetails.currency + ' ' : ''}${Number(poSpecificDetails?.poAmount || 0).toLocaleString('en-IN')}`}
              />
              <DetailRow label="PO Date" value={
                formatDateViaTimeZone(stagedPODate ?? poSpecificDetails?.pO_Date ?? poSpecificDetails?.createdOn, 'en-GB', formatoption)
              } />
              <DetailRow label="Expiry Date" value={
                isDraft ? (
                  <input
                    type="date"
                    className="pe-detail-form-input"
                    style={{ height: 28, fontSize: 13, width: 160 }}
                    value={expiryDate ? new Date(expiryDate).toISOString().slice(0, 10) : ''}
                    onChange={(e) => setExpiryDate(e.target.value ? new Date(e.target.value) : null)}
                  />
                ) : (
                  (expiryDate || poSpecificDetails?.expiryDate)
                    ? formatDateViaTimeZone(expiryDate ?? poSpecificDetails?.expiryDate, 'en-GB', formatoption)
                    : null
                )
              } />
            </div>
          </div>
        </div>

        {(poSpecificDetails?.company || poSpecificDetails?.supplierGST || poSpecificDetails?.panNumber || poSpecificDetails?.supplierAddress) && (
          <div className="col-12 col-md-6">
            <div className="pe-info-card">
              <div className="pe-info-card-title">Company Tax Details</div>
              <div className="pe-info-card-grid">
                <DetailRow label="Supplier Company" value={poSpecificDetails?.company} />
                <DetailRow label="GST" value={poSpecificDetails?.supplierGST || '-'} />
                <DetailRow label="PAN" value={poSpecificDetails?.panNumber || '-'} />
                {poSpecificDetails?.supplierAddress && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span className="pe-field-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Supplier Address:</span>
                    <span style={{ fontSize: 13, color: '#1f2937' }}>{poSpecificDetails.supplierAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Bill To + Ship To */}
      <div className="row mb-4 g-4">
        <div className="col-12 col-md-6">
          <div className="pe-info-card">
            <div className="pe-info-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Bill To</span>
              {isDraftStage && (
                <button
                  type="button"
                  className="pe-icon-btn"
                  title="Edit Bill To"
                  onClick={() => {
                    setbillToAddress(poSpecificDetails?.billToAddress || '');
                    setbillToCity(poSpecificDetails?.billToCity || '');
                    setbillToState(poSpecificDetails?.billToState || '');
                    setBillToCountry(poSpecificDetails?.billToCountry || '');
                    const cObj = addressCountryOptions.find(o => o.countryName === poSpecificDetails?.billToCountry) ?? null;
                    setBillToCountryObj(cObj);
                    setBillToStateObj(null); setBillToCityObj(null); setBillStateOptions([]); setBillCityOptions([]);
                    if (cObj?.id) fetchStates(cObj.id, atoken).then(res => {
                      if (res) {
                        setBillStateOptions(res);
                        const sObj = res.find(o => o.stateName === poSpecificDetails?.billToState) ?? null;
                        setBillToStateObj(sObj);
                        if (sObj?.id) fetchCities(sObj.id, atoken).then(cr => {
                          if (cr) { setBillCityOptions(cr); setBillToCityObj(cr.find(o => o.cityName === poSpecificDetails?.billToCity) ?? null); }
                        });
                      }
                    });
                    setOpenEditBill(true);
                  }}
                >
                  <HiPencilAlt style={{ fontSize: 15 }} />
                </button>
              )}
            </div>
            <AddressBlock
              address={poSpecificDetails?.billToAddress}
              city={poSpecificDetails?.billToCity}
              state={poSpecificDetails?.billToState}
              country={poSpecificDetails?.billToCountry}
            />
            <div className="pe-info-card-grid">
              <DetailRow label="Phone" value={poSpecificDetails?.billToPhone} />
              <DetailRow label="E-Mail" value={poSpecificDetails?.billToEmail} />
              <DetailRow label="PAN" value={poSpecificDetails?.billToPAN} />
              <DetailRow label="GST" value={poSpecificDetails?.billToGST} />
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="pe-info-card">
            <div className="pe-info-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Ship To</span>
              {isDraftStage && (
                <button
                  type="button"
                  className="pe-icon-btn"
                  title="Edit Ship To"
                  onClick={() => {
                    setshipToAddress(poSpecificDetails?.shipToAddress || '');
                    setshipToCity(poSpecificDetails?.shipToCity || '');
                    setshipToState(poSpecificDetails?.shipToState || '');
                    setShipToCountry(poSpecificDetails?.shipToCountry || '');
                    const cObjS = addressCountryOptions.find(o => o.countryName === poSpecificDetails?.shipToCountry) ?? null;
                    setShipToCountryObj(cObjS);
                    setShipToStateObj(null); setShipToCityObj(null); setShipStateOptions([]); setShipCityOptions([]);
                    if (cObjS?.id) fetchStates(cObjS.id, atoken).then(res => {
                      if (res) {
                        setShipStateOptions(res);
                        const sObjS = res.find(o => o.stateName === poSpecificDetails?.shipToState) ?? null;
                        setShipToStateObj(sObjS);
                        if (sObjS?.id) fetchCities(sObjS.id, atoken).then(cr => {
                          if (cr) { setShipCityOptions(cr); setShipToCityObj(cr.find(o => o.cityName === poSpecificDetails?.shipToCity) ?? null); }
                        });
                      }
                    });
                    setOpenEditShip(true);
                  }}
                >
                  <HiPencilAlt style={{ fontSize: 15 }} />
                </button>
              )}
            </div>
            <AddressBlock
              address={poSpecificDetails?.shipToAddress}
              city={poSpecificDetails?.shipToCity}
              state={poSpecificDetails?.shipToState}
              country={poSpecificDetails?.shipToCountry}
            />
            <div className="pe-info-card-grid">
              <DetailRow label="Phone" value={poSpecificDetails?.shipToPhone} />
              <DetailRow label="E-Mail" value={poSpecificDetails?.shipToEmail} />
              <DetailRow label="PAN" value={poSpecificDetails?.shipToPAN} />
              <DetailRow label="GST" value={poSpecificDetails?.shipToGST} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Payment Terms + Confirmation Details */}
      <div className="row mb-4 g-4">
        <div className="col-12 col-md-6">
          <div className="pe-info-card">
            <div className="pe-info-card-title">Payment Terms</div>
            <div>
              <label className="pe-field-label">Payment Terms</label>
              <select
                className="pe-detail-form-input"
                ref={paymentTermsFieldRef}
                value={selectedPaymentTermId ?? ''}
                disabled={!poSpecificDetails || paymentTermsLoading || !isDraftStage}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') { setPaymentTermModal(true); return; }
                  setSelectedPaymentTermId(e.target.value);
                }}
              >
                <option value="">-- Select --</option>
                {paymentTermsOptions.map((opt) => {
                  const id = opt.id ?? opt.paymentTermsId ?? opt.paymentTermId;
                  return (
                    <option key={id} value={id}>
                      {opt.paymentTerms || opt.termsOfPayment || opt.paymentTerm || opt.paymentTermsName}
                    </option>
                  );
                })}
                <option value="__add_new__">+ ADD NEW</option>
              </select>
            </div>
          </div>
        </div>

        {(poSpecificDetails?.confirmationNo || poSpecificDetails?.confirmedDelDate || poSpecificDetails?.supplierRef ||
          poSpecificDetails?.shippingCost || poSpecificDetails?.confirmedShipDate || poSpecificDetails?.reqDeliveryDate ||
          selectPOAttachedFile?.length > 0) && (
            <div className="col-12 col-md-6">
              <div className="pe-info-card">
                <div className="pe-info-card-title">Confirmation Details</div>
                <div className="pe-info-card-grid">
                  <DetailRow label="Confirmation No" value={poSpecificDetails?.confirmationNo} />
                  <DetailRow label="Confirmed Date" value={poSpecificDetails?.confirmedDelDate ? formatDateViaTimeZone(poSpecificDetails.confirmedDelDate, 'en-GB', formatoption) : null} />
                  <DetailRow label="Supplier Ref" value={poSpecificDetails?.supplierRef} />
                  <DetailRow label="Shipping Cost" value={poSpecificDetails?.shippingCost} />
                  <DetailRow label="Shipping Date" value={poSpecificDetails?.confirmedShipDate ? formatDateViaTimeZone(poSpecificDetails.confirmedShipDate, 'en-GB', formatoption) : null} />
                  <DetailRow label="Requested Delivery" value={poSpecificDetails?.reqDeliveryDate ? formatDateViaTimeZone(poSpecificDetails.reqDeliveryDate, 'en-GB', formatoption) : null} />
                </div>
                {selectPOAttachedFile?.filter(f => f.filePath).map((f, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="pe-btn pe-btn--link"
                    style={{ fontSize: 12, marginTop: 6, display: 'block' }}
                    onClick={() => downloadFilesOnAzure(f.filePath, getFileName(f.filePath), atoken)}
                  >
                    {f.poAttachment}
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* PO Conditions — full width */}
      <div className="pe-info-card" style={{ marginBottom: 3 }}>
        <div className="pe-info-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>PO Conditions</span>
          {isDraftStage && (
            <button type="button" className="pe-btn pe-btn--primary" style={{ fontSize: 12 }} onClick={handleOpenAddCondition}>
              + Add New Condition
            </button>
          )}
        </div>

        {(poSpecificDetails?.poConditions ?? []).filter(c => c.isHeaderCondition).length > 0 ? (
          <PETableSimple
            columns={[
              { key: 'conditionCategory', label: 'Condition Category', renderCell: (v) => v || 'N/A' },
              {
                key: 'conditionValue',
                label: 'Value',
                renderCell: (v, row) => {
                  if (row.conditionText && String(row.conditionText).trim()) return row.conditionText;
                  if (v !== null && v !== undefined && v !== '') return v;
                  return '';
                },
              },
              ...(isDraftStage ? [{
                key: '__actions__',
                label: 'Actions',
                width: 100,
                renderCell: (_, row) => (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      className="pe-icon-btn pe-icon-btn--edi"
                      title="Edit"
                      onClick={() => {
                        setIsAddingCondition(false);
                        setEditingCondition(row);
                        setConditionForm({
                          conditionType: row.conditionType || '',
                          conditionCategory: row.conditionCategory || '',
                          conditionRate: row.conditionRate ?? '',
                          conditionValue: row.conditionValue ?? '',
                          currency: row.currency || '',
                          calculationType: row.calculationType || '',
                          conditionText: row.conditionText || '',
                        });
                        setOpenEditCondition(true);
                      }}
                    >
                      <HiPencilAlt style={{ fontSize: 15, color: '#1976d2' }} />
                    </button>
                    <button
                      type="button"
                      className="pe-icon-btn pe-icon-btn--delete"
                      title="Delete"
                      onClick={() => { setConditionToDelete(row); setDeleteConditionDialogOpen(true); }}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                ),
              }] : []),
            ]}
            rows={(poSpecificDetails?.poConditions ?? []).filter(c => c.isHeaderCondition).map((c, i) => ({ ...c, _key: c.id ?? i }))}
            getRowKey={(r) => r._key}
            wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', overflow: 'hidden' }}
          />
        ) : (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
            No header conditions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PODetailsTab;
