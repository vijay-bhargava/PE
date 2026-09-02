import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Stack
} from "@mui/material";
import { DataGrid as MuiDataGrid } from "@mui/x-data-grid";
import { HiOutlineX, HiPencilAlt, HiOutlineTrash } from "react-icons/hi";
import { Link } from "react-router-dom";
import { formatDateViaTimeZone, formatoption } from "../../../utils/common/utility";
import { downloadFilesOnAzure, getFileName, fetchStates, fetchCities } from "../../../utils/common";

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
  return (
    <>
      <div className="p-2">
        {/* PO Header Details - Editable in Draft */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'white' }}>
              <CardContent>
                {versionError && (
                  <Box mb={2}>
                    <Alert severity="error" action={
                      <Button color="inherit" size="small" onClick={() => loadPOVersionData(pageSlug, selectedVersion)}>Retry</Button>
                    }>
                      {versionError}
                    </Alert>
                  </Box>
                )}

                <Grid container spacing={2}>

                  {/* LEFT SIDE */}
                  <Grid item xs={12} md={6}>
                    <Box>

                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Box display="flex" alignItems="center">

                          <Typography sx={{ color: '#666', width: 100 }}>
                            PO Number
                          </Typography>

                          {isDraft ? (
                            <TextField
                              size="small"
                              value={poNumberInput}
                              onChange={(e) => setPoNumberInput(e.target.value)}
                              placeholder="Enter PO Number"
                              sx={{ width: 200, '& .MuiOutlinedInput-input': { padding: '4px 8px', fontSize: 14 } }}
                            />
                          ) : (
                            <Typography sx={{ fontWeight: 400, color: '#1976d2' }}>
                              {poNumberInput ||
                                poSpecificDetails?.externalSourcePONumber ||
                                poSpecificDetails?.poNumber ||
                                'N/A'}
                            </Typography>
                          )}

                          {/* GAP added here */}
                          <Typography sx={{ color: '#666', fontSize: 12, ml: 2 }}>
                            Version
                          </Typography>

                          <TextField
                            select
                            size="small"
                            value={selectedVersion}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              if (!v || v <= 0) return;
                              if (v === selectedVersion) return;
                              setSelectedVersion(v);
                              loadPOVersionData(pageSlug, v);
                            }}
                            disabled={loadingVersion}
                            sx={{
                              width: 60,
                              ml: 0.5,
                              '& .MuiOutlinedInput-input': {
                                padding: '4px 6px',
                                fontSize: 12,
                              },
                              '& .MuiSelect-select': {
                                padding: '4px 24px 4px 6px !important',
                                fontSize: 12,
                              },
                            }}
                          >
                            {(Array.from({ length: (Number(latestVersion) > 0 ? Number(latestVersion) : 1) }, (_, i) => i + 1)).map(v => (
                              <MenuItem key={v} value={v}>{v}</MenuItem>
                            ))}
                          </TextField>

                        </Box>
                      </Box>

                      <Box display="flex" mb={0.5}>
                        <Typography sx={{ color: '#666', width: 100 }}>
                          PO Date
                        </Typography>
                        <Typography>
                          {formatDateViaTimeZone(
                            stagedPODate ?? poSpecificDetails?.pO_Date ?? poSpecificDetails?.createdOn,
                            "en-GB",
                            formatoption
                          )}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <Typography sx={{ color: '#666', width: 100 }}>
                          PO Amount
                        </Typography>

                        <Typography>
                          {Number(poSpecificDetails?.poAmount || 0).toLocaleString("en-IN")}
                        </Typography>

                        {poSpecificDetails?.currency && (
                          <>
                            <Typography sx={{ color: '#666', ml: 3 }}>
                              Currency
                            </Typography>

                            <Typography sx={{ ml: 1 }}>
                              {poSpecificDetails.currency}
                            </Typography>
                          </>
                        )}
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Typography sx={{ color: '#666', width: 100 }}>
                          Expiry Date
                        </Typography>
                        {isDraft ? (
                          <TextField
                            type="date"
                            size="small"
                            value={expiryDate ? new Date(expiryDate).toISOString().slice(0, 10) : ''}
                            onChange={(e) => setExpiryDate(e.target.value ? new Date(e.target.value) : null)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 200, '& .MuiOutlinedInput-input': { padding: '4px 8px', fontSize: 14 } }}
                          />
                        ) : (
                          <Typography>
                            {expiryDate || poSpecificDetails?.expiryDate
                              ? formatDateViaTimeZone(
                                expiryDate ?? poSpecificDetails?.expiryDate,
                                "en-GB",
                                formatoption
                              )
                              : ''}
                          </Typography>
                        )}
                      </Box>

                    </Box>
                  </Grid>

                  {/* RIGHT SIDE */}
                  <Grid item xs={12} md={6}>
                    <Box>

                      <Box display="flex" mb={0.5}>
                        <Typography sx={{ color: '#666', width: 140 }}>
                          Supplier Company
                        </Typography>
                        <Typography>
                          {poSpecificDetails?.company || ''}
                        </Typography>
                      </Box>

                      <Box display="flex" mb={0.5}>
                        <Typography sx={{ color: '#666', width: 140 }}>
                          GST
                        </Typography>
                        <Typography>
                          {poSpecificDetails?.supplierGST || ''}
                        </Typography>
                      </Box>

                      <Box display="flex" mb={0.5}>
                        <Typography sx={{ color: '#666', width: 140 }}>
                          PAN
                        </Typography>
                        <Typography>
                          {poSpecificDetails?.panNumber || ''}
                        </Typography>
                      </Box>

                      {poSpecificDetails?.supplierAddress && (
                        <Box display="flex" mb={0.5}>
                          <Typography
                            sx={{
                              color: '#666',
                              width: 140,
                              flexShrink: 0
                            }}
                          >
                            Supplier Address
                          </Typography>

                          <Typography
                            sx={{
                              flex: 1,
                              minWidth: 0
                            }}
                          >
                            {(() => {
                              const address = poSpecificDetails.supplierAddress;
                              const commaIndex = address.indexOf(',');

                              if (commaIndex === -1) {
                                return address;
                              }

                              const firstLine = address.substring(0, commaIndex + 1).trim();
                              const secondLine = address.substring(commaIndex + 1).trim();

                              return (
                                <>
                                  <span style={{ whiteSpace: 'nowrap' }}>
                                    {firstLine}
                                  </span>
                                  <br />
                                  <span>
                                    {secondLine}
                                  </span>
                                </>
                              );
                            })()}
                          </Typography>
                        </Box>
                      )}

                    </Box>
                  </Grid>


                </Grid>

              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
      {!isPoDetailsReadDisabled ? (
        <>
          <div className="p-2">
            <div className="row g-3">

              <div className={poSpecificDetails?.poConditions && poSpecificDetails.poConditions.length > 0 ? "col-12 col-md-6" : "col-12 col-md-6"}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }}></Box>
                        Bill To:
                      </Typography>
                      {String(currentStage ?? "").toLowerCase().includes("draft") && (
                        <Box>
                          <Tooltip title="Edit Bill To">
                            <IconButton size="small" onClick={() => {
                              setbillToAddress(poSpecificDetails?.billToAddress || "");
                              setbillToCity(poSpecificDetails?.billToCity || "");
                              setbillToState(poSpecificDetails?.billToState || "");
                              setBillToCountry(poSpecificDetails?.billToCountry || "");
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
                            }}>
                              <HiPencilAlt className="f17 text-primary" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>

                    {poSpecificDetails?.billToAddress && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        {poSpecificDetails.billToAddress}
                      </Typography>
                    )}
                    {(poSpecificDetails?.billToCity || poSpecificDetails?.billToState) && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        {poSpecificDetails?.billToCity}
                        {poSpecificDetails?.billToState ? `, ${poSpecificDetails.billToState}` : ''}
                      </Typography>
                    )}
                    {poSpecificDetails?.billToCountry && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        {poSpecificDetails.billToCountry}
                      </Typography>
                    )}
                    {poSpecificDetails?.billToPhone && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        <strong>Phone:</strong> {poSpecificDetails.billToPhone}
                      </Typography>
                    )}
                    {poSpecificDetails?.billToEmail && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        <strong>E-Mail:</strong> {poSpecificDetails.billToEmail}
                      </Typography>
                    )}
                    {poSpecificDetails?.billToPAN && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        <strong>PAN:</strong> {poSpecificDetails.billToPAN}
                      </Typography>
                    )}
                    {poSpecificDetails?.billToGST && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        <strong>GST:</strong> {poSpecificDetails.billToGST}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className={poSpecificDetails?.poConditions && poSpecificDetails.poConditions.length > 0 ? "col-12 col-md-6" : "col-12 col-md-6"}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }}></Box>
                        Ship To:
                      </Typography>
                      {String(currentStage ?? "").toLowerCase().includes("draft") && (
                        <Box>
                          <Tooltip title="Edit Ship To">
                            <IconButton size="small" onClick={() => {
                              setshipToAddress(poSpecificDetails?.shipToAddress || "");
                              setshipToCity(poSpecificDetails?.shipToCity || "");
                              setshipToState(poSpecificDetails?.shipToState || "");
                              setShipToCountry(poSpecificDetails?.shipToCountry || "");
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
                            }}>
                              <HiPencilAlt className="f17 text-primary" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>

                    {poSpecificDetails?.shipToAddress && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        {poSpecificDetails.shipToAddress}
                      </Typography>
                    )}
                    {(poSpecificDetails?.shipToCity || poSpecificDetails?.shipToState) && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        {poSpecificDetails?.shipToCity}
                        {poSpecificDetails?.shipToState ? `, ${poSpecificDetails.shipToState}` : ''}
                      </Typography>
                    )}
                    {poSpecificDetails?.shipToCountry && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        {poSpecificDetails.shipToCountry}
                      </Typography>
                    )}
                    {poSpecificDetails?.shipToPhone && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        <strong>Phone:</strong> {poSpecificDetails.shipToPhone}
                      </Typography>
                    )}
                    {poSpecificDetails?.shipToEmail && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        <strong>Email:</strong> {poSpecificDetails.shipToEmail}
                      </Typography>
                    )}
                    {poSpecificDetails?.shipToPAN && (
                      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                        <strong>PAN:</strong> {poSpecificDetails.shipToPAN}
                      </Typography>
                    )}
                    {poSpecificDetails?.shipToGST && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        <strong>GST:</strong> {poSpecificDetails.shipToGST}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="col-12 col-md-6">
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }}></Box>
                      Payment Terms:
                    </Typography>
                    <Box>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Payment Terms"
                        value={selectedPaymentTermId ?? ""}
                        inputRef={paymentTermsFieldRef}
                        onChange={(e) => {
                          if (e.target.value === "__add_new__") {
                            setPaymentTermModal(true);
                            return;
                          }
                          setSelectedPaymentTermId(e.target.value);
                        }}
                        disabled={!poSpecificDetails || paymentTermsLoading || !String(currentStage ?? "").toLowerCase().includes("draft")}
                      >
                        <MenuItem value="">-- Select --</MenuItem>
                        {paymentTermsOptions.map((opt) => (
                          <MenuItem key={opt.id ?? opt.paymentTermsId ?? opt.paymentTermId} value={opt.id ?? opt.paymentTermsId ?? opt.paymentTermId}>
                            {opt.paymentTerms || opt.termsOfPayment || opt.paymentTerm || opt.paymentTermsName}
                          </MenuItem>
                        ))}
                        <MenuItem
                          value="__add_new__"
                          sx={{
                            color: 'primary.main',
                            fontStyle: 'italic',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            '&.Mui-selected, &.Mui-selected:hover': {
                              backgroundColor: 'transparent',
                            },
                          }}
                        >
                          ADD NEW
                        </MenuItem>
                      </TextField>
                    </Box>
                  </CardContent>
                </Card>
              </div>
              <div className="col-12 col-md-6">
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }}></Box>
                      Confirmation Details:
                    </Typography>
                    <Stack spacing={1.5}>
                      {poSpecificDetails?.confirmationNo && (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          <strong>Confirmation No:</strong> {poSpecificDetails?.confirmationNo}
                        </Typography>
                      )}
                      {poSpecificDetails?.confirmedDelDate && (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          <strong>Confirmed Date:</strong>{" "}
                          {formatDateViaTimeZone(
                            poSpecificDetails?.confirmedDelDate,
                            "en-GB",
                            formatoption
                          )}
                        </Typography>
                      )}

                      {poSpecificDetails?.supplierRef && (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          <strong>Supplier Ref:</strong> {poSpecificDetails?.supplierRef}
                        </Typography>
                      )}
                      {poSpecificDetails?.shippingCost && (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          <strong>Shipping Cost:</strong> {poSpecificDetails?.shippingCost}
                        </Typography>
                      )}
                      {poSpecificDetails?.confirmedShipDate && (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          <strong>Shipping Date:</strong>{" "}
                          {formatDateViaTimeZone(
                            poSpecificDetails?.confirmedShipDate,
                            "en-GB",
                            formatoption
                          )}
                        </Typography>
                      )}
                      {poSpecificDetails?.reqDeliveryDate && (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          <strong>Requested Delivery Date:</strong>{" "}
                          {formatDateViaTimeZone(
                            poSpecificDetails?.reqDeliveryDate,
                            "en-GB",
                            formatoption
                          )}
                        </Typography>
                      )}

                      {selectPOAttachedFile?.map(
                        (SingleRowComponent, index) => (
                          <>
                            {SingleRowComponent.filePath ? (
                              <span className="fw600 textLigblue" key={index}>
                                <Button
                                  variant="text"
                                  size="small"
                                  className="text-capitalize font-normal textLigblue"
                                  as={Link}
                                  onClick={() =>
                                    downloadFilesOnAzure(
                                      SingleRowComponent?.filePath,
                                      getFileName(SingleRowComponent?.filePath),
                                      atoken
                                    )
                                  }
                                >
                                  {SingleRowComponent?.poAttachment}
                                </Button>
                                <br />
                              </span>
                            ) : (
                              <></>
                            )}

                          </>
                        )
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* PO Header Conditions Grid */}
          <div className="p-3">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }} />
                PO Conditions
              </Typography>
              {String(currentStage ?? "").toLowerCase().includes("draft") && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>}
                  onClick={handleOpenAddCondition}
                >
                  Add New Condition
                </Button>
              )}
            </Box>
            <Box sx={{ width: '100%' }}>
              <MuiDataGrid
                rows={(poSpecificDetails?.poConditions ?? []).filter(c => c.isHeaderCondition).map((c, i) => ({ ...c, _gridId: c.id ?? i }))}
                getRowId={(row) => row._gridId}
                columns={[
                  { field: 'conditionCategory', headerName: 'Condition Category', flex: 1, minWidth: 150 },
                  {
                    field: 'conditionValue',
                    headerName: 'Value',
                    flex: 1,
                    minWidth: 200,
                    renderCell: (params) => {
                      const { conditionText, conditionValue } = params.row;
                      if (conditionText && conditionText.trim()) {
                        return conditionText;
                      }
                      if (conditionValue !== null && conditionValue !== undefined && conditionValue !== '') {
                        return conditionValue;
                      }
                      return '-';
                    }
                  },
                  ...(String(currentStage ?? "").toLowerCase().includes("draft") ? [{

                    field: '_actions',
                    headerName: 'Actions',
                    width: 120,
                    sortable: false,
                    disableColumnMenu: true,
                    renderCell: (params) => (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit Condition">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const condition = params.row;
                              setIsAddingCondition(false);
                              setEditingCondition(condition);
                              setConditionForm({
                                conditionType: condition.conditionType || "",
                                conditionCategory: condition.conditionCategory || "",
                                conditionRate: condition.conditionRate ?? "",
                                conditionValue: condition.conditionValue ?? "",
                                currency: condition.currency || "",
                                calculationType: condition.calculationType || "",
                                conditionText: condition.conditionText || "",
                              });
                              setOpenEditCondition(true);
                            }}
                          >
                            <HiPencilAlt className="f17 text-primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Condition">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setConditionToDelete(params.row);
                              setDeleteConditionDialogOpen(true);
                            }}
                          >
                            <HiOutlineTrash className="f17 text-danger" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ),
                  }] : []),
                ]}
                autoHeight
                disableRowSelectionOnClick
                rowHeight={48}
                columnHeaderHeight={48}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f5f5',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#333',
                  },
                  '& .MuiDataGrid-cell': {
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #f0f0f0',
                  },
                }}
              />
            </Box>
          </div>

        </>
      ) : (
        <div className="p-4">
          <Alert severity="error">
            <div className="d-flex align-items-center">
              <HiOutlineX className="me-2 f18" />
              Access Denied: You don't have permission to view PO Details.
            </div>
          </Alert>
        </div>
      )
      }
    </>
  );
};

export default PODetailsTab;
