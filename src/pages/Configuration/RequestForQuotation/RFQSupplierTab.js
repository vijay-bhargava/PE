import React, { useState, useEffect } from 'react';
import {
  Alert,
  Autocomplete,
  Badge,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { HiDotsHorizontal, HiOutlineX } from 'react-icons/hi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import SearchIcon from '@mui/icons-material/Search';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import { PEPagination } from '../../../components/RFQ/PEPagination';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import NotFoundPage from '../../../components/NotAllowed';
import { CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import EventSuppliers from '../../../components/Event/EventSuppliers';

const RFQSupplierTab = ({
  tabloading,
  issupplierreadDisabled,
  effectivePermissionManager,
  permissionManager,
  categoryList,
  selectedCategory,
  totalSupplier,
  selectedSupplier,
  stagearray,
  currentStage,
  pageTS,
  pageCount,
  pageSS,
  setPageTS,
  setPageSS,
  setPageCount,
  setSelectedCategory,
  handleSupplierWithCategory,
  handleSelectedSupplier,
  clearALLSelectedSupplier,
  clearSelectedSupplier,
  handleLoadingFactorClick,
  handleSupplierAction,
  getCategorylist,
  // non-Draft supplier view props
  updatesupplieronloading,
  totalpageSS,
  handlePaginationSS,
  issupplierraccesslevel,
  EventHeaderDetails,
  formik,
}) => {
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [supplierRowMenuAnchor, setSupplierRowMenuAnchor] = useState(null);

  useEffect(() => { setPageTS(1); }, [supplierSearchQuery]);

  const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false;
  const canCreate = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.CREATE) ?? false;
  const canRemove = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;

  const supplierMatchesSearch = (x) => {
    if (!supplierSearchQuery?.trim()) return true;
    const q = supplierSearchQuery.toLowerCase();
    return (
      x?.contactPerson?.toLowerCase().includes(q) ||
      x?.email?.toLowerCase().includes(q) ||
      x?.companyName?.toLowerCase().includes(q)
    );
  };

  const filteredTotal = totalSupplier?.filter((x) => x.isShow && supplierMatchesSearch(x)) ?? [];

  if (tabloading) return <GridSkeleton />;

  // Non-Draft stage: show EventSuppliers (submitted/published state)
  if (currentStage.trim() !== 'Draft') {
    return (
      <EventSuppliers
        updatesupplieronloading={updatesupplieronloading}
        selectedSupplier={selectedSupplier}
        stagearray={stagearray}
        currentStage={currentStage}
        handleSelectedSupplier={handleSelectedSupplier}
        handleLoadingFactorClick={handleLoadingFactorClick}
        handleSupplierAction={handleSupplierAction}
        clearSelectedSupplier={clearSelectedSupplier}
        pageSS={pageSS}
        pageCount={pageCount}
        totalpageSS={totalpageSS}
        handlePaginationSS={handlePaginationSS}
        issupplierraccesslevel={issupplierraccesslevel}
        CurrentVersion={formik?.values?.Version}
        versionhistory={EventHeaderDetails?.versionhistory}
        permissionManager={effectivePermissionManager}
      />
    );
  }

  return (
    <>
      {issupplierreadDisabled === false && (
        <div className="sup-two-col">
          {/* Left column — Select Suppliers */}
          <div className="sup-col-left">
            <div className="sup-col-header">
              <div className="d-flex align-items-center gap-2">
                <span className="sup-col-title">Select Suppliers</span>
                <span className="sup-col-count">
                  Total Suppliers: {filteredTotal.length}
                </span>
                {selectedCategory && (
                  <Badge pill bg="success" text="dark">
                    {selectedCategory?.categoryName}
                  </Badge>
                )}
              </div>
            </div>

            <div className="sup-filters">
              <div className="sup-filter-field">
                <Autocomplete
                  disablePortal
                  size="small"
                  options={categoryList ?? []}
                  fullWidth
                  className="sup-filter-control"
                  popupIcon={<KeyboardArrowDownOutlined style={{ fontSize: 16 }} />}
                  renderInput={(params) => <TextField {...params} placeholder="Sort by Category - All" />}
                  onOpen={() => { if (categoryList.length === 0) getCategorylist(); }}
                  getOptionLabel={(option) => option.itemCategory ?? ''}
                  value={selectedCategory}
                  onChange={(e, newvalue) => {
                    setSelectedCategory(newvalue);
                    handleSupplierWithCategory(newvalue);
                  }}
                />
              </div>
              <div className="sup-filter-field">
                <TextField
                  id="searchvendorbyname"
                  placeholder="Search Suppliers"
                  size="small"
                  fullWidth
                  className="sup-filter-control"
                  value={supplierSearchQuery}
                  onChange={(e) => setSupplierSearchQuery(e.target.value)}
                  InputProps={{
                    endAdornment: supplierSearchQuery ? (
                      <IconButton
                        size="small"
                        onClick={() => setSupplierSearchQuery('')}
                        style={{ padding: 2 }}
                      >
                        <HiOutlineX style={{ fontSize: 16, color: '#9ca3af' }} />
                      </IconButton>
                    ) : (
                      <SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
                    ),
                  }}
                />
              </div>
            </div>

            <div className="sup-list">
              {!canRead ? (
                <div className="p-3">
                  <Alert severity="warning">You don't have permission to view suppliers data.</Alert>
                </div>
              ) : (
                filteredTotal
                  .slice((pageTS - 1) * pageCount, pageTS * pageCount)
                  .map((x, i) => {
                    const rowCanCreate = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.CREATE) ?? false;
                    const rowCanRemove = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;
                    return (
                      <div className="sup-list-item" key={i}>
                        {stagearray.includes(currentStage) && (
                          x?.isSelected ? (
                            <Checkbox
                              className="sup-row-checkbox"
                              size="small"
                              checked
                              disabled={!rowCanRemove}
                              onChange={(e) => handleSelectedSupplier(x, e.target.checked)}
                            />
                          ) : (
                            <Checkbox
                              className="sup-row-checkbox"
                              size="small"
                              checked={false}
                              disabled={!rowCanCreate}
                              onChange={(e) => handleSelectedSupplier(x, e.target.checked)}
                            />
                          )
                        )}
                        <div className="sup-row-copy">
                          <span>{`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="sup-pagination">
              <PEPagination
                page={pageTS}
                pageSize={pageCount}
                totalRows={filteredTotal.length}
                onPageChange={setPageTS}
                onPageSizeChange={(n) => { setPageCount(n); setPageTS(1); }}
                sx={{ borderTop: 'none', px: 0, py: 0, minHeight: 0, flexShrink: 'unset', gap: 1 }}
              />
            </div>
          </div>

          {/* Right column — Selected Suppliers */}
          <div className="sup-col-right">
            <div className="sup-col-header">
              <div className="d-flex align-items-center gap-2">
                <span className="sup-col-title">Selected Suppliers</span>
                <span className="sup-col-count">Total Suppliers: {selectedSupplier?.length ?? 0}</span>
              </div>
            </div>

            <div className="sup-filters sup-filters-right">
              {stagearray.includes(currentStage) && (
                <button
                  type="button"
                  className="sup-clear-button"
                  onClick={clearALLSelectedSupplier}
                  disabled={!canRemove}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="sup-list">
              {!canRead ? (
                <div className="p-3">
                  <Alert severity="warning">You don't have permission to view selected suppliers.</Alert>
                </div>
              ) : (
                selectedSupplier
                  .slice((pageSS - 1) * pageCount, pageSS * pageCount)
                  .map((x, i) => {
                    const rowCanRemove = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;
                    return (
                      <div className="sup-list-item" key={i}>
                        {stagearray.includes(currentStage) && (
                          <Checkbox
                            className="sup-row-checkbox"
                            size="small"
                            checked
                            disabled={!rowCanRemove}
                            onChange={(e) => handleSelectedSupplier(x, e.target.checked)}
                          />
                        )}
                        <div className="sup-row-copy">
                          <span>{`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}</span>
                        </div>
                        <div className="sup-row-actions">
                          <Tooltip title="Action">
                            <IconButton
                              size="small"
                              className="sup-action-btn"
                              onClick={(e) => setSupplierRowMenuAnchor({ el: e.currentTarget, vendor: x })}
                            >
                              <HiDotsHorizontal style={{ fontSize: 16, color: '#374151' }} />
                            </IconButton>
                          </Tooltip>
                          <Menu
                            anchorEl={supplierRowMenuAnchor?.vendor === x ? supplierRowMenuAnchor?.el : null}
                            open={supplierRowMenuAnchor?.vendor === x && Boolean(supplierRowMenuAnchor?.el)}
                            onClose={() => setSupplierRowMenuAnchor(null)}
                            sx={{ maxWidth: 500 }}
                          >
                            {x.id !== 0 && (
                              <MenuItem
                                className="f12 fw500"
                                onClick={() => { setSupplierRowMenuAnchor(null); handleLoadingFactorClick(x, i); }}
                              >
                                Loading Factor
                              </MenuItem>
                            )}
                            {!stagearray.includes(currentStage) && (
                              <MenuItem
                                className="f12 fw500"
                                onClick={() => { setSupplierRowMenuAnchor(null); handleSupplierAction(x, 'Reopen'); }}
                              >
                                Re-Open Quote
                              </MenuItem>
                            )}
                          </Menu>
                          {stagearray.includes(currentStage) && (
                            <button
                              type="button"
                              className="pe-icon-btn pe-icon-btn--delete"
                              disabled={!rowCanRemove}
                              onClick={() => clearSelectedSupplier(x, false)}
                            >
                              <RiDeleteBin6Line />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="sup-pagination">
              <PEPagination
                page={pageSS}
                pageSize={pageCount}
                totalRows={selectedSupplier?.length ?? 0}
                onPageChange={setPageSS}
                onPageSizeChange={(n) => { setPageCount(n); setPageSS(1); }}
                sx={{ borderTop: 'none', px: 0, py: 0, minHeight: 0, flexShrink: 'unset', gap: 1 }}
              />
            </div>
          </div>
        </div>
      )}

      {issupplierreadDisabled === true && (
        <NotFoundPage
          heading="You Are Not Allowed To View Supplier Tab"
          body1="contact your Administrator for view rights"
        />
      )}
    </>
  );
};

export default RFQSupplierTab;
