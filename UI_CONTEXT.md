# UI_CONTEXT.md — ProcurEngine New UI Standard

> **Single source of truth** for all new/revamped module UI.
> Verified from: `ManageRFQV2`, `ManageBidV2`, `CustomerListV2`, `PETableToolbar`, `PETable`, `StatusBadge`, `CommonBottomDrawer`.
> Do NOT assume — every value here is extracted from actual source files.

---

## 1. Design Tokens

### 1.1 Color Palette

All tokens defined in `src/assets/css/design-system.css`.

#### Layout / Brand tokens (`--pe-*`)

```css
--pe-bg: #f3f4f6 /* page background */ --pe-card: #ffffff
  /* card / panel background */ --pe-sidebar: #03172b /* dark nav sidebar */
  --pe-sidebar-accent: #0d2e53 /* sidebar hover */ --pe-border: #dfe3e8
  /* default border */ --pe-text: #1f2937 /* body text */ --pe-muted: #6b7280
  /* secondary / muted text */ --pe-primary: #1976d2
  /* MUI theme primary (not used in new UI directly) */ --pe-success: #49a052
  --pe-danger: #b8232f --pe-radius: 14px;
```

#### Button tokens (`--pe-btn-*`)

```css
--pe-btn-blue: #2082db --pe-btn-blue-hover: #1769bb --pe-btn-blue-light: #e8f1fb
  --pe-btn-muted: #616161 --pe-btn-muted-hover: #616161;
```

#### Hardcoded recurring colors (no token, use as-is)

| Role                     | Hex                   |
| ------------------------ | --------------------- |
| Primary action blue      | `#2a68d3`             |
| Primary blue hover       | `#1d5bbf`             |
| Info / link blue         | `#2388d9`             |
| Page bg                  | `#f3f4f6` / `#f5f5f5` |
| Card bg                  | `#ffffff`             |
| Border light             | `#e5e7eb`             |
| Border inner (row sep)   | `#f3f4f6`             |
| Header bg (modal/drawer) | `#fafcff`             |
| Text primary             | `#111827` / `#101828` |
| Text secondary           | `#374151`             |
| Text muted               | `#6b7280`             |
| Text light               | `#9ca3af`             |
| Draft status bg          | `#fff1bf`             |
| Orange accent            | `#f87100`             |
| Danger red               | `#ef4444` / `#b8232f` |

#### StatusBadge color map (`src/components/StatusBadge.js`)

| Status                                                                         | bg        | color     | dot       |
| ------------------------------------------------------------------------------ | --------- | --------- | --------- |
| `draft`                                                                        | `#eeeeee` | `#374151` | `#9ca3af` |
| `cancel`, `cancelled`, `rejected`                                              | `#fee2e2` | `#991b1b` | `#ef4444` |
| `open`, `running`, `active`, `published`, `approved`, `confirmed`, `completed` | `#dcfce7` | `#166534` | `#22c55e` |
| `awarded`, `forwarded`                                                         | `#fef9c3` | `#854d0e` | `#eab308` |
| `paused`                                                                       | `#fff3cd` | `#7a3f00` | `#b45309` |
| `forward for approval`                                                         | `#ffedd5` | `#9a3412` | `#f97316` |
| `pre approval` / `under pre approval`                                          | `#fff3cd` | `#7a3f00` | `#b45309` |
| `technical approval` / `under technical approval`                              | `#dcfce7` | `#065f46` | `#10b981` |
| `commercial approval` / `under commercial approval`                            | `#dff2ff` | `#075985` | `#0284c7` |
| `allocation`, `allocated`                                                      | `#e0e7ff` | `#3730a3` | `#6366f1` |
| `closed`, `close`                                                              | `#e5e7eb` | `#374151` | `#6b7280` |
| `pending`                                                                      | `#fef3c7` | `#92400e` | `#d97706` |
| fallback                                                                       | `#f3f4f6` | `#6b7280` | `#9ca3af` |

---

### 1.2 Typography

**Font family (all new UI pages):**

```css
font-family:
  "Inter",
  "Segoe UI",
  system-ui,
  -apple-system,
  sans-serif;
```

Declared on `.rfq-v2-page` and `.rfq-v2-event-drawer` in `manage-rfq-v2.css`. The body inherits this.

**Font size scale:**
| Role | Size | Weight |
|---|---|---|
| Page / drawer header title | `14px` | `700` |
| Table column header | `12px` | `600` |
| Table cell text | `13px` | `400` |
| Button label | `13px` | `500` |
| Small button (toolbar / drawer) | `12px`–`12.5px` | `500`–`600` |
| Field label (above input) | `12px` | `400` |
| Detail row label | `12px` | `500` |
| Detail row value | `12px` | `700` |
| Status badge text | `12px` | `500` |
| Cell sub-code (id/ref) | `11px` | `500` |
| Breadcrumb path | `12px` | `400` |
| Breadcrumb current | `14px` | `800` |

---

### 1.3 Spacing Scale (recurring values)

| Usage                                    | Value                            |
| ---------------------------------------- | -------------------------------- |
| Page padding                             | `0 20px 12px`                    |
| Page header padding                      | `20px 2px`                       |
| Card inner padding (via toolbar + table) | toolbar `12px 20px`, body `18px` |
| Drawer header height                     | `48px`                           |
| Drawer header padding                    | `0 18px`                         |
| Drawer body padding                      | `18px`                           |
| Modal header padding                     | `10px 20px`                      |
| Modal body padding                       | `16px 20px`                      |
| Modal footer padding                     | `10px 20px`                      |
| Table column header height               | `40px`                           |
| Table row height (standard)              | `52px`                           |
| Table row height (compact)               | `36px`                           |
| Table row height (comfortable)           | `60px`                           |
| Table footer height                      | `44px`                           |
| Button gap (icon + label)                | `6px`–`8px`                      |

---

### 1.4 Border Radius Values

| Element                                                | Radius           |
| ------------------------------------------------------ | ---------------- |
| Page card (`.rfq-v2-card`)                             | `12px`           |
| MUI Dialog (`.pe-modal-paper`)                         | `8px !important` |
| Bottom drawer (`.rfq-v2-event-drawer`)                 | `16px 16px 0 0`  |
| Filter panel (`.rfq-v2-filter-panel`)                  | `12px 0 0 12px`  |
| Standard buttons (`.pe-btn`)                           | `6px`            |
| Toolbar buttons (`.rfq-v2-tbtn`, `.rfq-v2-create-btn`) | `8px`            |
| Create button (`.rfq-v2-create-btn`)                   | `8px`            |
| Icon buttons (`.pe-icon-btn`)                          | `8px`            |
| Search input                                           | `8px`            |
| Dropdown / filter input                                | `6px`–`8px`      |
| Status badge                                           | `4px`            |
| Status dot                                             | `50%`            |
| File drop zone                                         | `8px`            |
| Floating selection box                                 | `100px`          |

---

### 1.5 Shadow / Elevation

| Element                    | Box-shadow                                                      |
| -------------------------- | --------------------------------------------------------------- |
| Bottom drawer              | `0 -18px 48px rgba(15, 23, 42, 0.24)`                           |
| Filter panel               | `0px 4px 16px 4px rgba(0, 0, 0, 0.12)`                          |
| Notification drawer        | `0 8px 24px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)` |
| Floating selection box     | `0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)`        |
| Create button hover        | `0 2px 8px rgba(42, 104, 211, 0.3)`                             |
| Approval modal             | `0 18px 42px rgba(15,23,42,0.24)`                               |
| Page header (`.pe-header`) | none — only `border-bottom: 1px solid #dfe3e8`                  |
| Card (`.rfq-v2-card`)      | **none** — only `border: 1px solid #e5e7eb`                     |

---

### 1.6 Breakpoints

No custom breakpoints defined — uses Bootstrap 5 grid (`col-12 col-md-6` etc.) and MUI defaults.

---

## 2. Component Patterns

### 2.1 Page Shell

Every revamped list page follows this exact structure.

```jsx
// CSS imports (MANDATORY — always these 2 minimum)
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';
// If it's a detail page also add:
import '../../../assets/css/rfq-detail-v2.css';

// JSX structure
<div className="rfq-v2-page">

  {/* ── Page header: breadcrumb left, action right ── */}
  <div className="rfq-v2-page-header">
    <div className="rfq-v2-breadcrumb">
      <span>Home</span>
      <span className="rfq-v2-breadcrumb-sep">/</span>
      <span>Module Name</span>
    </div>
    <button className="rfq-v2-create-btn" onClick={handleOpen}>
      <AddOutlined /> Add Record
    </button>
  </div>

  {/* ── Main card ── */}
  <div className="rfq-v2-card">
    <PETableToolbar ... />
    <div className="rfq-v2-table-wrapper">
      {gridloading ? <GridSkeleton /> : (
        <PETable rows={data} columns={columns} rowHeight={52} columnHeaderHeight={40} ... />
      )}
    </div>
  </div>

</div>
```

**Source:** `src/pages/MasterData/CustomerSetup/CustomerListV2.js`, `src/pages/Configuration/Auctions/ManageBid.js`

---

### 2.2 Button Variants

All from `src/assets/css/design-system.css` lines 102–174.

```jsx
{
  /* Primary — blue filled */
}
<button type="button" className="pe-btn pe-btn--primary" disabled={loading}>
  {loading ? "Saving..." : "Save"}
</button>;

{
  /* Secondary — blue outlined */
}
<button type="button" className="pe-btn pe-btn--secondary">
  Export
</button>;

{
  /* Ghost — gray, transparent border */
}
<button type="button" className="pe-btn pe-btn--ghost" onClick={handleReset}>
  Reset
</button>;

{
  /* Danger — red filled */
}
<button type="button" className="pe-btn pe-btn--danger">
  Delete
</button>;

{
  /* Create / page-level CTA (larger, in page header) */
}
<button className="rfq-v2-create-btn" onClick={handleOpen}>
  <AddOutlined /> Create New
</button>;
```

**Disabled state:** add `disabled={condition}` — CSS applies `opacity: 0.5; cursor: not-allowed` automatically.

**Form footer buttons (always right-aligned, gap-2):**

```jsx
<div className="d-flex justify-content-end gap-2 mt-2">
  <button type="button" className="pe-btn pe-btn--ghost" onClick={handleReset}>
    Reset
  </button>
  <button type="submit" className="pe-btn pe-btn--primary" disabled={loading}>
    {loading ? "Saving..." : "Save & Continue"}
  </button>
</div>
```

**Source:** `src/pages/MasterData/CustomerSetup/AddCustomer.js`

---

### 2.3 Icon Buttons (Table action cells)

All from `src/assets/css/design-system.css` lines 176–340.

```jsx
{
  /* Edit */
}
<Tooltip title="Edit" arrow>
  <button
    type="button"
    className="pe-icon-btn pe-icon-btn--edit"
    onClick={() => handleEdit(row)}
  >
    <HiPencilAlt style={{ fontSize: 11 }} />
  </button>
</Tooltip>;

{
  /* Delete */
}
<Tooltip title="Delete" arrow>
  <button
    type="button"
    className="pe-icon-btn pe-icon-btn--delete"
    onClick={() => handleDelete(row)}
  >
    <HiTrash style={{ fontSize: 11 }} />
  </button>
</Tooltip>;

{
  /* Download */
}
<Tooltip title="Download" arrow>
  <button type="button" className="pe-icon-btn pe-icon-btn--download">
    <HiDownload style={{ fontSize: 11 }} />
  </button>
</Tooltip>;

{
  /* Close (in modals/drawers) */
}
<button
  type="button"
  className="pe-icon-btn pe-icon-btn--close"
  onClick={onClose}
>
  <HiOutlineX style={{ fontSize: 14 }} />
</button>;

{
  /* Subscription — gray when inactive, orange when active */
}
<button
  className={`pe-icon-btn ${hasSubscription ? "pe-icon-btn--subscribed" : "pe-icon-btn--subscribe"}`}
>
  <SiSubstack style={{ fontSize: 11 }} />
</button>;
```

**Source:** `src/pages/MasterData/CustomerSetup/CustomerListV2.js` lines 355–375

---

### 2.4 Status Badge

```jsx
import StatusBadge from '../../../components/StatusBadge';

// Usage inside DataGrid renderCell:
{ field: 'stage', headerName: 'Status', width: 140,
  renderCell: (params) => <StatusBadge status={params.row.stage || '—'} />
}
```

**Output HTML:**

```html
<span class="rfq-v2-status-badge" style="background: #dcfce7; color: #166534;">
  <span class="rfq-v2-status-dot" style="background: #22c55e;"></span>
  Open
</span>
```

**Source:** `src/components/StatusBadge.js`

---

### 2.5 Table (PETable + PETableToolbar)

```jsx
import { PETableToolbar } from "../../../components/RFQ/PETableToolbar";
import { PETable } from "../../../components/RFQ/PETable";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";

// State
const [searchText, setSearchText] = useState("");
const [filterModel, setFilterModel] = useState({ items: [] });
const [columnVisibility, setColumnVisibility] = useState({
  col1: true,
  col2: true,
});
const [density, setDensity] = useState("standard");

const DENSITY_OPTIONS = [
  { key: "compact", height: 36 },
  { key: "standard", height: 48 },
  { key: "comfortable", height: 60 },
];
const rowHeight = DENSITY_OPTIONS.find((d) => d.key === density)?.height ?? 48;

const FILTER_COLUMNS = [
  { field: "name", label: "Name" },
  { field: "status", label: "Status" },
];

// Columns definition pattern
const columns = [
  {
    field: "name",
    headerName: "Name",
    flex: 2,
    minWidth: 180,
    renderCell: (params) => (
      <div
        className="rfq-v2-cell"
        onClick={() => navigate(`/path/${params.row.id}`)}
      >
        <span className="rfq-v2-cell-subject">{params.row.name}</span>
        <span className="rfq-v2-cell-code">#{params.row.id}</span>
      </div>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    minWidth: 130,
    renderCell: (params) => <StatusBadge status={params.row.status} />,
  },
  {
    field: "createdBy",
    headerName: "Created By",
    flex: 1,
    minWidth: 120,
    renderCell: (params) => (
      <span className="rfq-v2-cell-subject">{params.row.createdByName}</span>
    ),
  },
  {
    field: "action",
    headerName: "Action",
    width: 80,
    sortable: false,
    renderCell: (params) => (
      <Tooltip title="Edit" arrow>
        <button
          type="button"
          className="pe-icon-btn pe-icon-btn--edit"
          onClick={() => handleEdit(params.row)}
        >
          <HiPencilAlt style={{ fontSize: 11 }} />
        </button>
      </Tooltip>
    ),
  },
];

// JSX
<div className="rfq-v2-card">
  <PETableToolbar
    searchText={searchText}
    onSearchChange={setSearchText}
    searchPlaceholder="Search..."
    showFilter
    filterColumns={FILTER_COLUMNS}
    filterModel={filterModel}
    onFilterModelChange={setFilterModel}
    showColumns
    columns={columns}
    hiddenAlways={["__check__"]}
    columnVisibilityModel={columnVisibility}
    onColumnVisibilityChange={setColumnVisibility}
    onColumnVisibilityReset={() => setColumnVisibility(defaultVisibility)}
    showDensity
    density={density}
    onDensityChange={setDensity}
    showExport
    onExport={handleExport}
  />
  <div className="rfq-v2-table-wrapper">
    {gridloading ? (
      <GridSkeleton />
    ) : (
      <PETable
        rows={filteredData}
        columns={columns}
        getRowId={(row) => row.id}
        rowHeight={rowHeight}
        columnHeaderHeight={40}
        columnVisibilityModel={columnVisibility}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={{ page, pageSize: 25 }}
        onPaginationModelChange={({ page }) => setPage(page)}
        disableColumnResize
        pagination
      />
    )}
  </div>
</div>;
```

**Source:** `src/components/RFQ/PETableToolbar.js`, `src/components/RFQ/PETable.js`, `src/pages/MasterData/CustomerSetup/CustomerListV2.js`

**PETable design tokens (hardcoded in component, do not override):**

- Header bg: `#f9fafb`, font `12px/600`, color `#6b7280`
- Cell font `13px`, color `#1f2937`, padding `0 16px`
- Row hover: `#f8fafc`
- Row selected: `#eff6ff`
- Row separator: `1px solid #f3f4f6`

---

### 2.6 Bottom Drawer (CommonBottomDrawer)

```jsx
import CommonBottomDrawer from "../../../components/CommonBottomDrawer";

<CommonBottomDrawer
  open={isOpen}
  onClose={handleClose}
  title="Section Title"
  actions={
    // Form action buttons go here (header right side).
    // Use rfq-v2-event-btn classes — NOT pe-btn — in drawer header.
    <>
      <button
        type="button"
        className="rfq-v2-event-btn rfq-v2-event-btn-ghost"
        onClick={handleClose}
      >
        Cancel
      </button>
      <button
        type="button"
        className="pe-btn pe-btn--secondary"
        onClick={() => resetRef.current?.()}
      >
        Reset
      </button>
      <button
        type="submit"
        form="my-form-id"
        className="pe-btn pe-btn--primary"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </>
  }
  sectionStyle={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
  bodyStyle={{
    padding: 0,
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
  }}
>
  {/* Tab bar — when multiple tabs needed */}
  <div
    style={{
      borderBottom: "1px solid #e5e7eb",
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
    }}
  >
    <div className="rfq-dv2-workflow-tabs" style={{ width: "fit-content" }}>
      <button
        type="button"
        className={`rfq-dv2-workflow-tab ${activeTab === 1 ? "active" : ""}`}
        style={{ flex: "none", padding: "0 20px" }}
        onClick={() => setActiveTab(1)}
      >
        Tab One
      </button>
      <button
        type="button"
        className={`rfq-dv2-workflow-tab ${activeTab === 2 ? "active" : ""}`}
        style={{ flex: "none", padding: "0 20px" }}
        onClick={() => setActiveTab(2)}
      >
        Tab Two
      </button>
    </div>
  </div>

  {/* Content */}
  <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
    {activeTab === 1 ? <TabOneContent /> : <TabTwoContent />}
  </div>
</CommonBottomDrawer>;
```

**Critical notes:**

- `rfq-dv2-workflow-tabs` has `width: 100%` by default — ALWAYS override with `style={{ width: 'fit-content' }}` when inside a drawer
- `rfq-dv2-workflow-tab` has `flex: 1 1 0` — ALWAYS override with `style={{ flex: 'none', padding: '0 20px' }}`
- `bodyStyle={{ padding: 0 }}` — the drawer body already has `padding: 18px`; set to 0 when you control layout with inner divs

**Source:** `src/components/CommonBottomDrawer.js`, `src/assets/css/manage-rfq-v2.css` lines 1105–1237, `src/pages/MasterData/CustomerSetup/CustomerListV2.js` lines 832–1047

---

### 2.7 Form Fields

MUI `TextField` or `TextFieldCell` — always `size="small"` and `variant="outlined"`.

```jsx
import TextFieldCell from "../../BaseCells/TextFieldCell";

{
  /* Text input with label above */
}
<div className="col-12 col-md-6 mb-3">
  <label className="pe-field-label">Field Label *</label>
  <TextFieldCell
    id="fieldName"
    name="fieldName"
    placeholder="Enter value"
    value={value}
    maxLength={100}
    onChange={(e) => setValue(e.target.value)}
  />
  {formik.errors.fieldName && formik.touched.fieldName && (
    <div className="error error-red" style={{ fontSize: "12px" }}>
      {formik.errors.fieldName}
    </div>
  )}
</div>;

{
  /* MUI Autocomplete (multi-select dropdown) */
}
<div className="col-12 col-md-6 mb-3">
  <Autocomplete
    multiple
    options={options}
    getOptionLabel={(o) => o.label}
    value={selected}
    onChange={handleChange}
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        size="small"
        label="Select Options *"
      />
    )}
  />
</div>;

{
  /* Password field with eye toggle */
}
<TextFieldCell
  type={showPassword ? "text" : "password"}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <HiOutlineEye /> : <HiOutlineEyeOff />}
        </IconButton>
      </InputAdornment>
    ),
  }}
  variant="outlined"
/>;
```

**Source:** `src/pages/MasterData/CustomerSetup/CustomerListV2.js`, `src/pages/MasterData/CustomerSetup/AddCustomer.js`

---

### 2.8 Modal / Dialog

Use `PEModal` component — wraps MUI Dialog with `pe-modal-*` classes. **Never assemble raw MUI Dialog manually.**

```jsx
import PEModal from "../../../components/PEModal";

<PEModal
  open={open}
  onClose={handleClose}
  size="sm" // xs | sm | md | lg | xl
  title="Modal Title"
  subtitle="Optional subtitle"
  footer={
    <>
      <button
        type="button"
        className="rfq-v2-event-btn rfq-v2-event-btn-muted"
        onClick={handleClose}
      >
        Cancel
      </button>
      <button
        type="button"
        className="rfq-v2-event-btn rfq-v2-event-btn-primary"
        onClick={handleSubmit}
      >
        Confirm
      </button>
    </>
  }
  // hideCloseButton   — omit X icon (e.g. for confirmation dialogs)
  // disableBackdropClose — prevent closing on backdrop click
  // bodyStyle={{ padding: '8px 0' }}  — override body padding if needed
>
  {/* modal body content */}
</PEModal>;
```

**Props reference:**

| Prop                   | Type      | Notes                                                     |
| ---------------------- | --------- | --------------------------------------------------------- |
| `open`                 | bool      | required                                                  |
| `onClose`              | func      | required                                                  |
| `size`                 | string    | `xs` / `sm` / `md` / `lg` / `xl` — maps to MUI `maxWidth` |
| `title`                | string    | shown in header                                           |
| `subtitle`             | string    | shown below title, muted                                  |
| `footer`               | ReactNode | rendered in `pe-modal-footer`                             |
| `hideCloseButton`      | bool      | omits X icon in header                                    |
| `disableBackdropClose` | bool      | backdrop click does not close                             |
| `bodyStyle`            | object    | overrides body padding                                    |
| `bodyClassName`        | string    | extra class on body                                       |
| `fullWidth`            | bool      | default `true`                                            |

**Source:** `src/components/PEModal.js`, `src/pages/MasterData/CustomerSetup/CustomerListV2.js`

---

### 2.9 Empty State

```jsx
{
  data.length === 0 && !loading && (
    <div className="rfq-v2-empty">
      <p className="rfq-v2-empty-title">No records found</p>
      <p className="rfq-v2-empty-sub">
        Try adjusting filters or create a new entry.
      </p>
    </div>
  );
}
```

**Source:** `src/assets/css/manage-rfq-v2.css`

---

### 2.10 Loading State

```jsx
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';

{gridloading ? <GridSkeleton /> : <PETable ... />}
```

**Source:** `src/components/Skeleton/gridSkeleton.js`

---

### 2.11 Tabs — Two Patterns

There are **two distinct tab patterns** in the new UI. Pick the right one based on context.

---

#### Pattern 1: MUI Tabs — Main page section navigation

**When to use:** Top-level multi-section navigation on a detail page (e.g., RFQ detail, Auction detail). Each tab switches the main content area.

**CSS needed:** `manage-rfq-v2.css` (already imported for detail pages)

```jsx
import { Tabs, Tab } from '@mui/material';

<Tabs
  value={tabValue}
  onChange={(e, v) => setTabValue(v)}
  className="tabstheme"
  indicatorColor="primary"
  variant="scrollable"
  scrollButtons="auto"
>
  <Tab value={0} label={<span className="section-heading">General</span>} />
  <Tab value={1} label={<span className="section-heading">Items</span>} />
  <Tab value={2} label={<span className="section-heading">Suppliers</span>} />
</Tabs>

{/* Tab panel content */}
{tabValue === 0 && <div>...</div>}
{tabValue === 1 && <div>...</div>}
```

**Source:** `src/pages/Configuration/RequestForQuotation/RequestForQuotation.js`

---

#### Pattern 2: Button Tabs (`rfq-dv2-workflow-tab`) — Workflow panel / drawer sub-tabs

**When to use:** Sub-tabs inside a workflow panel or a `CommonBottomDrawer` (e.g., Workflow / History / Attachments, or Customer Setup / Subscription Setup).

**CSS needed:** `rfq-detail-v2.css`

```jsx
<div className="rfq-dv2-workflow-tabs">
  <button
    type="button"
    className={`rfq-dv2-workflow-tab ${activeTab === 'workflow' ? 'active' : ''}`}
    onClick={() => setActiveTab('workflow')}
  >
    Approval Workflow
  </button>
  <button
    type="button"
    className={`rfq-dv2-workflow-tab ${activeTab === 'history' ? 'active' : ''}`}
    onClick={() => setActiveTab('history')}
  >
    View History
  </button>
</div>

{activeTab === 'workflow' && <div>...</div>}
{activeTab === 'history' && <div>...</div>}
```

> **Drawer override:** When `rfq-dv2-workflow-tabs` is used inside a `CommonBottomDrawer`, add `style={{ width: 'fit-content' }}` on the container and `style={{ flex: 'none', padding: '0 20px' }}` on each tab button to prevent them from stretching full-width.

**Source:** `src/pages/Configuration/Auctions/AuctionWorkflowPanel.js`, `src/pages/Configuration/RequestForQuotation/RFQWorkflowPanel.js`, `src/pages/MasterData/CustomerSetup/CustomerListV2.js`

---

#### Quick-reference: which pattern to use?

| Scenario | Pattern |
|---|---|
| Detail page top-level section tabs (General / Items / Suppliers…) | Pattern 1 — MUI Tabs + `className="tabstheme"` |
| Workflow panel side panel sub-tabs | Pattern 2 — `rfq-dv2-workflow-tab` buttons |
| Drawer sub-tabs (Customer Setup / Subscription) | Pattern 2 + drawer width override |

---

## 3. Layout Rules

### 3.1 Page Structure

```
pe-shell (100vh, bg #f3f4f6)
├── pe-header (fixed, height 72px, left 84px, width calc(100% - 84px))
├── pe-sidebar (fixed, width 84px, bg #03172b)
└── pe-main-content (margin-left 84px, margin-top 72px, padding 16px)
    └── rfq-v2-page (padding 0 20px 12px)
        ├── rfq-v2-page-header (padding 20px 2px) — breadcrumb + CTA
        └── rfq-v2-card (border-radius 12px, border 1px solid #e5e7eb, bg #fff)
            ├── rfq-v2-toolbar (padding 12px 20px)
            └── rfq-v2-table-wrapper (height calc(100vh - 260px))
```

### 3.2 Grid / Columns

Use Bootstrap 5 responsive grid inside forms:

- 2-column form: `col-12 col-md-6`
- 3-column form: `col-12 col-md-4`
- Full-width: `col-12`
- Row spacing: `mb-3` on each field wrapper
- Row container: `<div className="row mt-2">`

### 3.3 Section Spacing

- Between page header and card: handled by `rfq-v2-page-header` bottom padding
- Between toolbar and table: `border-bottom: 1px solid #f3f4f6` on toolbar
- Between form rows: `mb-3` (Bootstrap, = `16px`)
- Between action buttons: `gap-2` (Bootstrap, = `8px`)

---

## 4. Icons & Assets

### 4.1 Icon Libraries (in use)

| Library               | Import                                                                                                                         | Used for                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `react-icons/hi`      | `import { HiPencilAlt, HiOutlineX, HiTrash, HiDownload, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'`                 | Action buttons, close, password toggle |
| `react-icons/si`      | `import { SiSubstack } from 'react-icons/si'`                                                                                  | Subscription icon                      |
| `react-icons/ri`      | `import { RiMailSendFill } from 'react-icons/ri'`                                                                              | Email/SMTP icon                        |
| `@mui/icons-material` | `import { AddOutlined, GavelOutlinedIcon, SearchOutlined, FilterListOutlined, ViewColumnOutlined } from '@mui/icons-material'` | Page CTA, table toolbar                |

**Icon sizing in `pe-icon-btn`:** `style={{ fontSize: 11 }}` on the icon SVG (button is 28×28, svg is 14×14 via CSS).

### 4.2 Icon Size Convention

| Context                             | fontSize prop                |
| ----------------------------------- | ---------------------------- |
| Inside `pe-icon-btn`                | `11`                         |
| Inside `pe-icon-btn--close`         | `14`                         |
| Page-level CTA icon (next to label) | default (inherits `13px`)    |
| Workflow panel icons                | `16` (via `className="f16"`) |

---

## 5. Do's and Don'ts

### ✅ Do

- Always import `manage-rfq-v2.css` + `design-system.css` on every new module
- Use `<PETableToolbar>` + `<PETable>` — never raw `DataGrid` with ad-hoc sx overrides
- Use `<StatusBadge status={row.stage} />` for all status columns
- Use `<CommonBottomDrawer>` for all slide-up drawer forms
- Use `<PEModal>` for all modal/dialog needs — never assemble raw MUI Dialog manually
- Use `<GridSkeleton>` while data loads
- Use `pe-btn pe-btn--primary/secondary/ghost` for all form/modal action buttons
- Use `pe-icon-btn pe-icon-btn--{variant}` for all table row action buttons
- Wrap every icon button in `<Tooltip title="..." arrow>`
- Form fields: **always use `<label className="pe-field-label">` above the input — NO `label` prop on TextFieldCell/TextField**
- Form layout: Bootstrap grid `col-12 col-md-6`, `mb-3` per field
- **Drawer form actions (Reset/Submit) go in `actions` prop of `CommonBottomDrawer` — in the header right side, NOT at form bottom**
- When Submit button is outside `<form>`, connect via `form="form-id"` on button + `id="form-id"` on form element
- In drawer header actions: use `rfq-v2-event-btn rfq-v2-event-btn-primary` (blue) and `rfq-v2-event-btn rfq-v2-event-btn-muted` (gray) — NOT `pe-btn`
- Page breadcrumb: always plain `<span>` elements with `.rfq-v2-breadcrumb-sep` between
- Define `FILTER_COLUMNS` as a constant array at top of file, outside component
- Define `DENSITY_OPTIONS` as constant if using density control
- `rfq-dv2-workflow-tabs` inside a drawer: always add `style={{ width: 'fit-content' }}`
- `rfq-dv2-workflow-tab` inside a drawer: always override `style={{ flex: 'none', padding: '0 20px' }}`
- `CommonBottomDrawer` `sectionStyle` must always include `display: 'flex', flexDirection: 'column'`
- `CommonBottomDrawer` `bodyStyle` must always include `flex: 1` for proper scroll behavior

### ❌ Don't

- **Don't use MUI `Drawer` (right-slide)** — replaced by `CommonBottomDrawer` everywhere
- **Don't use raw MUI `Dialog` assembled manually** — use `<PEModal>` component
- **Don't use MUI `Tabs` + `Tab`** for workflow-panel or drawer sub-tabs — use `rfq-dv2-workflow-tab` buttons (MUI Tabs are only correct for main detail-page section navigation with `className="tabstheme"`)
- **Don't use MUI `Button`** for page actions — use `pe-btn` + `pe-btn--*` native buttons
- **Don't use raw MUI `DataGrid`** with custom `sx` — always wrap in `PETable`
- **Don't use `Box` wrapper** around form content inside drawers — use plain `<div>` with Bootstrap grid
- **Don't nest `padding: 16px` inside drawer body** when body already has `padding: 18px` — set `bodyStyle={{ padding: 0 }}` and control spacing with inner divs
- **Don't define status colors inline** — always use `<StatusBadge>` from `src/components/StatusBadge.js`
- **Don't use three primary blue values interchangeably** — `#2a68d3` is the UI standard for action elements
- **Don't use `LoadingButton` from MUI Lab for form submits** — use `<button type="submit" className="rfq-v2-event-btn rfq-v2-event-btn-primary" disabled={loading}>` inside drawer, or `pe-btn pe-btn--primary` in modals
- **Don't add `box-shadow` to cards** — new cards use only `border: 1px solid #e5e7eb`, no shadow
- **Don't use `.itemstable`, `.thead-sticky`, `.custom-fix`** etc. — these are legacy table classes from old UI
- **Don't use `<BackButton>`** in new pages — use `.rfq-v2-breadcrumb` pattern
- **Don't leave `console.log` statements** in production code (existing ones are legacy debt)
- **Don't use `div.h50px` spacer divs** — these are legacy from old MUI Drawer headers; CommonBottomDrawer handles its own header spacing
- **Don't pass `label` prop to `TextFieldCell` or MUI `TextField` in new UI** — floating MUI label is old pattern; always use `<label className="pe-field-label">` above the input
- **Don't put Reset/Submit buttons at the bottom of the form inside a drawer** — they belong in the `actions` slot of `CommonBottomDrawer` (header right side)

---

## 6. Mandatory File Checklist for a New Module

When implementing a new module in the new UI standard, verify:

```
□ CSS imports: manage-rfq-v2.css + design-system.css
□ Page wrapper: rfq-v2-page > rfq-v2-page-header + rfq-v2-card
□ Breadcrumb in page header
□ CTA button: rfq-v2-create-btn
□ Toolbar: <PETableToolbar> with all applicable props
□ Table: <PETable> (NOT raw DataGrid)
□ Loading: <GridSkeleton> while fetching
□ Status column: <StatusBadge>
□ Row actions: pe-icon-btn + pe-icon-btn--{variant} inside <Tooltip>
□ Drawer: <CommonBottomDrawer> (NOT MUI Drawer)
□ Modal/Dialog: <PEModal> (NOT raw MUI Dialog)
□ Tabs (detail page sections): MUI <Tabs className="tabstheme"> + <Tab>
□ Tabs (panel/drawer sub-tabs): rfq-dv2-workflow-tab buttons (add width:fit-content in drawer)
□ Form fields: <label className="pe-field-label"> above each input, NO label prop on TextFieldCell
□ Drawer header actions: Reset/Submit in actions prop (NOT at form bottom); form id + button form= attribute pattern
□ Drawer header action buttons: rfq-v2-event-btn rfq-v2-event-btn-muted / rfq-v2-event-btn-primary (NOT pe-btn)
□ Form layout: Bootstrap col-12 col-md-6, mb-3 per field
□ Tabs in drawer: rfq-dv2-workflow-tabs with style={{ width: 'fit-content' }}, each tab flex: none
□ No MUI Tabs, no MUI Button, no raw DataGrid, no Box wrappers in drawers, no label prop on TextFieldCell
```

### Self-Verification After Implementation

Before marking any UI task done, read the rendered JSX and verify:

1. Every input has `<label className="pe-field-label">` above it — no MUI floating label
2. Drawer action buttons are in `actions` prop — not inside `<form>` body
3. Tab container has `style={{ width: 'fit-content' }}` if inside a drawer
4. No `label="..."` prop passed to `TextFieldCell` or MUI `TextField`
5. `CommonBottomDrawer` has `sectionStyle` with `display: flex, flexDirection: column`

---

_Last updated from: `CustomerListV2.js`, `ManageBidV2.js`, `ManageRFQV2.js`, `PETableToolbar.js`, `PETable.js`, `StatusBadge.js`, `CommonBottomDrawer.js`, `PEModal.js`, `design-system.css`, `manage-rfq-v2.css`, `rfq-detail-v2.css`_
