import React, { useState } from 'react';
import {
  Alert, Autocomplete, Badge, Checkbox, IconButton,
  Menu, MenuItem, TextField, Tooltip,
} from '@mui/material';
import { HiDotsHorizontal, HiOutlineX } from 'react-icons/hi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import SearchIcon from '@mui/icons-material/Search';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import { PEPagination } from '../../../components/RFQ/PEPagination';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';

const BidInviteSupplierTab = ({
  /* permissions */
  loadingPermissions,
  canReadSuppliers,
  canEditSuppliers,
  canCreateSuppliers,
  canRemoveSuppliers,
  /* data */
  tabloading,
  categoryList,
  selectedCategory,
  totalSupplier,
  selectedSupplier,
  stagearray,
  currentStage,
  /* pagination — 1-indexed, page count driven by pageCount */
  pageTS,
  pageCount,
  totalpageTS,
  pageSS,
  totalpageSS,
  /* handlers */
  setSelectedCategory,
  handleSupplierWithCategory,
  handleSelectedSupplier,
  setPageTS,
  setPageSS,
  setPageCount,
  clearALLSelectedSupplier,
  clearSelectedSupplier,
  handleLoadingFactorClick,
  getCategorylist,
}) => {
  const [supplierRowMenuAnchor, setSupplierRowMenuAnchor] = useState(null);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');

  if (loadingPermissions) return <GridSkeleton />;

  if (!canReadSuppliers) {
    return (
      <div className="p-3">
        <Alert severity="warning">You don't have permission to view Invite Supplier data.</Alert>
      </div>
    );
  }

  if (tabloading) return <GridSkeleton />;

  const canAct = stagearray.includes(currentStage);

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

  return (
    <div className="sup-two-col" style={{ height: 'calc(100vh - 220px)', overflow: 'hidden' }}>

      {/* ── Left column — All Suppliers ── */}
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
              onOpen={() => { if (!categoryList?.length) getCategorylist(); }}
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
              onChange={(e) => { setSupplierSearchQuery(e.target.value); setPageTS(1); }}
              InputProps={{
                endAdornment: supplierSearchQuery ? (
                  <IconButton size="small" onClick={() => { setSupplierSearchQuery(''); setPageTS(1); }} style={{ padding: 2 }}>
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
          {filteredTotal
            .slice((pageTS - 1) * pageCount, pageTS * pageCount)
            .map((x, i) => (
              <div className="sup-list-item" key={i}>
                {x?.isSelected ? (
                  <Checkbox
                    className="sup-row-checkbox"
                    size="small"
                    checked
                    disabled={!canAct || !canRemoveSuppliers}
                    onChange={(e) => handleSelectedSupplier(x, e.target.checked)}
                  />
                ) : (
                  <Checkbox
                    className="sup-row-checkbox"
                    size="small"
                    checked={false}
                    disabled={!canAct || !canCreateSuppliers}
                    onChange={(e) => handleSelectedSupplier(x, e.target.checked)}
                  />
                )}
                <div className="sup-row-copy">
                  <span>{`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}</span>
                </div>
              </div>
            ))}
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

      {/* ── Right column — Selected Suppliers ── */}
      <div className="sup-col-right">
        <div className="sup-col-header">
          <div className="d-flex align-items-center gap-2">
            <span className="sup-col-title">Selected Suppliers</span>
            <span className="sup-col-count">Total Suppliers: {selectedSupplier?.length ?? 0}</span>
          </div>
        </div>

        <div className="sup-filters sup-filters-right">
          <button
            type="button"
            className="sup-clear-button"
            onClick={clearALLSelectedSupplier}
            disabled={!canAct || !canRemoveSuppliers}
          >
            Clear
          </button>
        </div>

        <div className="sup-list">
          {selectedSupplier
            ?.slice((pageSS - 1) * pageCount, pageSS * pageCount)
            .map((x, i) => (
              <div className="sup-list-item" key={i}>
                <Checkbox
                  className="sup-row-checkbox"
                  size="small"
                  checked
                  disabled={!canAct || !canRemoveSuppliers}
                  onChange={(e) => handleSelectedSupplier(x, e.target.checked)}
                />
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
                    {x.id != null && x.id != 0 && (
                      <MenuItem
                        className="f12 fw500"
                        disabled={!canEditSuppliers}
                        onClick={() => { setSupplierRowMenuAnchor(null); handleLoadingFactorClick(x, i); }}
                      >
                        Loading Factor
                      </MenuItem>
                    )}
                  </Menu>
                  <button
                    type="button"
                    className="pe-icon-btn pe-icon-btn--delete"
                    disabled={!canAct || !canRemoveSuppliers}
                    onClick={() => clearSelectedSupplier(x, false)}
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>
            ))}
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
  );
};

export default BidInviteSupplierTab;
