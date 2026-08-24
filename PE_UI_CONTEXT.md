# ProcurEngine — New UI Design Context

> Reference for all module revamps. Use this to implement UI without re-explaining patterns each time.

---

## Color Tokens (`--pe-*`)

Defined in `src/assets/css/design-system.css`. Always prefer these over hardcoded colors.

| Token                 | Value     | Use                                           |
| --------------------- | --------- | --------------------------------------------- |
| `--pe-primary`        | `#1976d2` | Primary actions, links                        |
| `--pe-bg`             | `#f3f4f6` | Page background                               |
| `--pe-card`           | `#ffffff` | Card / panel background                       |
| `--pe-sidebar`        | `#03172b` | Left nav background                           |
| `--pe-sidebar-accent` | `#0d2e53` | Sidebar hover/active                          |
| `--pe-border`         | `#dfe3e8` | Dividers, card borders                        |
| `--pe-text`           | `#1f2937` | Primary text                                  |
| `--pe-muted`          | `#6b7280` | Secondary / label text                        |
| `--pe-success`        | `#49a052` | Success state                                 |
| `--pe-danger`         | `#b8232f` | Danger / delete                               |
| `--pe-radius`         | `14px`    | Card border-radius                            |
| `--pe-btn-blue`       | `#2563eb` | Button blue (slightly different from primary) |

MUI theme primary: `#2A68D3` (in `src/theme.js`). Three slightly different blues exist — don't unify unless explicitly asked.

---

## Buttons

### Action Buttons (`.pe-btn`)

All defined in `design-system.css`. Use `<button type="button" className="pe-btn pe-btn--{variant}">`.

| Class                | Appearance                             | Use                                |
| -------------------- | -------------------------------------- | ---------------------------------- |
| `.pe-btn--primary`   | Blue fill, white text                  | Primary CTA (Save, Submit, Add)    |
| `.pe-btn--secondary` | White bg, blue border+text             | Secondary action (Reset, Edit)     |
| `.pe-btn--ghost`     | Transparent, muted text, subtle border | Cancel, dismiss                    |
| `.pe-btn--danger`    | Red fill, white text                   | Destructive (Delete, Cancel Event) |

```jsx
<button type="button" className="pe-btn pe-btn--ghost" onClick={onCancel}>Cancel</button>
<button type="reset" form="my-form" className="pe-btn pe-btn--secondary">Reset</button>
<button type="submit" form="my-form" className="pe-btn pe-btn--primary">Save</button>
<button type="button" className="pe-btn pe-btn--danger" onClick={onDelete}>Delete</button>
```

### Icon Buttons (`.pe-icon-btn`)

Small square icon-only buttons. Use `<button type="button" className="pe-icon-btn pe-icon-btn--{variant}" title="...">`.

| Class                    | Color | Use                |
| ------------------------ | ----- | ------------------ |
| `.pe-icon-btn--edit`     | Blue  | Edit row           |
| `.pe-icon-btn--delete`   | Red   | Delete row         |
| `.pe-icon-btn--add`      | Green | Add item           |
| `.pe-icon-btn--close`    | Gray  | Close panel/dialog |
| `.pe-icon-btn--download` | Blue  | Export / download  |
| `.pe-icon-btn--expand`   | Gray  | Expand row / panel |
| `.pe-icon-btn--reminder` | Amber | Send reminder      |
| `.pe-icon-btn--confirm`  | Green | Confirm action     |

```jsx
<button type="button" className="pe-icon-btn pe-icon-btn--edit" title="Edit" onClick={() => setEdit(row)}>
  <MdEdit />
</button>
<button type="button" className="pe-icon-btn pe-icon-btn--delete" title="Delete" onClick={() => handleDelete(row.id)}>
  <MdDelete />
</button>
```

---

## Input Fields

Use MUI `TextField` with `size="small"` and `variant="outlined"`. Label above field with `.pe-field-label`.

```jsx
<div className="col-12 col-md-6 mb-4">
  <label className="pe-field-label" htmlFor="fieldId">
    Field Label <span className="rfq-required-star">*</span>
  </label>
  <TextField
    id="fieldId"
    name="fieldName"
    fullWidth
    size="small"
    variant="outlined"
    className="f14"
    autoComplete="off"
    value={formik.values.fieldName}
    onChange={formik.handleChange}
    error={formik.touched.fieldName && Boolean(formik.errors.fieldName)}
    helperText={formik.touched.fieldName && formik.errors.fieldName}
  />
</div>
```

### Select Dropdown

```jsx
<TextField
  select
  fullWidth
  size="small"
  variant="outlined"
  className="f14 w-100"
  value={formik.values.status}
  onChange={(e) => formik.setFieldValue("status", e.target.value)}
>
  {options.map((opt) => (
    <MenuItem key={opt.id} value={opt.id}>
      {opt.label}
    </MenuItem>
  ))}
</TextField>
```

### Multiline / Textarea

```jsx
<TextField
  fullWidth
  size="small"
  variant="outlined"
  multiline
  rows={4}
  className="f14"
  inputProps={{ maxLength: 500 }}
  value={formik.values.remarks}
  onChange={formik.handleChange}
/>
```

### MUI Autocomplete

```jsx
<Autocomplete
  options={list}
  getOptionLabel={(opt) => opt.name}
  value={selected}
  onChange={(_, val) => setSelected(val)}
  // Do NOT add disablePortal — it clips dropdown inside modals
  renderInput={(params) => (
    <TextField
      {...params}
      size="small"
      variant="outlined"
      className="f14"
      placeholder="Search..."
    />
  )}
/>
```

> ⚠️ Never use `disablePortal` on Autocomplete inside a modal — it causes the dropdown to be clipped by modal overflow.

---

## Modal (`PEModal`)

**File:** `src/components/PEModal.js`

Wraps MUI `Dialog`. Always use `PEModal` instead of raw `Dialog`.

### Props

| Prop                   | Type                 | Default | Description                          |
| ---------------------- | -------------------- | ------- | ------------------------------------ |
| `open`                 | bool                 | —       | Controls visibility                  |
| `onClose`              | func                 | —       | Called on backdrop click / close btn |
| `size`                 | `xs\|sm\|md\|lg\|xl` | `md`    | Maps to MUI `maxWidth`               |
| `title`                | string               | —       | Modal header title                   |
| `subtitle`             | string               | —       | Smaller text below title             |
| `footer`               | JSX                  | —       | Footer action area                   |
| `bodyStyle`            | object               | —       | Inline style for body area           |
| `bodyClassName`        | string               | —       | Extra class on body area             |
| `hideCloseButton`      | bool                 | false   | Hide the × button                    |
| `disableBackdropClose` | bool                 | false   | Prevent close on backdrop click      |
| `fullWidth`            | bool                 | true    | MUI fullWidth                        |
| `dialogProps`          | object               | —       | Extra props forwarded to Dialog      |

### Basic Usage

```jsx
<PEModal
  open={isOpen}
  onClose={handleClose}
  size="sm"
  title="Modal Title"
  footer={
    <>
      <button className="pe-btn pe-btn--ghost" onClick={handleClose}>
        Cancel
      </button>
      <button className="pe-btn pe-btn--primary" onClick={handleSave}>
        Save
      </button>
    </>
  }
>
  <p>Modal content here.</p>
</PEModal>
```

### Modal with Scrollable Inner Component (e.g. PurchaseOrg)

When embedding a full component with its own scroll inside a modal:

```jsx
<PEModal
  open={purchaseOrgModal}
  onClose={ClosePurcgaseOrgModal}
  size="lg"
  title="Purchase Organization"
  bodyStyle={{ padding: 0, height: "78vh", overflow: "hidden" }}
  bodyClassName="d-flex flex-column"
>
  <div
    className="flex-grow-1 d-flex flex-column"
    style={{ minHeight: 0, overflow: "hidden" }}
  >
    <PurchaseOrg isModal={true} handlepurchaseorgList={handlepurchaseorgList} />
  </div>
</PEModal>
```

### CSS Classes (modal interior)

| Class                | Role                           |
| -------------------- | ------------------------------ |
| `.pe-modal-header`   | Header strip                   |
| `.pe-modal-title`    | Title text                     |
| `.pe-modal-subtitle` | Subtitle text                  |
| `.pe-modal-body`     | Scrollable content area        |
| `.pe-modal-footer`   | Footer (right-aligned actions) |

---

## Bottom Drawer (`CommonBottomDrawer`)

**File:** `src/components/CommonBottomDrawer.js`

Full-viewport-width bottom panel (slides up from bottom). Used for Add/Edit forms.

### Props

| Prop            | Description                                         |
| --------------- | --------------------------------------------------- |
| `open`          | Show/hide                                           |
| `onClose`       | Close handler                                       |
| `title`         | Drawer header title                                 |
| `actions`       | JSX for right side of header (buttons)              |
| `children`      | Drawer body content                                 |
| `bodyStyle`     | Inline style on body (e.g. `{ overflowY: 'auto' }`) |
| `sectionStyle`  | Inline style on drawer section                      |
| `backdropStyle` | Inline style on backdrop                            |

### CSS Classes

| Class                           | Role                                 |
| ------------------------------- | ------------------------------------ |
| `.rfq-v2-event-drawer-backdrop` | Full-screen semi-transparent overlay |
| `.rfq-v2-event-drawer`          | The drawer panel itself              |
| `.rfq-v2-event-drawer-header`   | Header: title left + actions right   |
| `.rfq-v2-event-drawer-title`    | Title text inside header             |
| `.rfq-v2-event-drawer-actions`  | Button group in header               |
| `.rfq-v2-event-drawer-body`     | Scrollable content area              |

### Usage

```jsx
<CommonBottomDrawer
  open={state["addProductDrawer"]}
  onClose={toggleDrawer("addProductDrawer", false)}
  title="Add Product / Service"
  bodyStyle={{ overflowY: "auto" }}
  actions={
    <>
      <button
        className="pe-btn pe-btn--ghost"
        onClick={toggleDrawer("addProductDrawer", false)}
      >
        Cancel
      </button>
      <button
        className="pe-btn pe-btn--secondary"
        type="reset"
        form="add-product-form"
      >
        Reset
      </button>
      <button
        className="pe-btn pe-btn--primary"
        type="submit"
        form="add-product-form"
      >
        Add
      </button>
    </>
  }
>
  <AddProductsCell {...props} />
</CommonBottomDrawer>
```

---

## Right-Side Drawer (Legacy MUI `Drawer`)

Old right-side drawers (questions, approvals) still use MUI `Drawer` + `.bgheaderCards` header pattern.
Kept for backward compat; prefer `CommonBottomDrawer` for new drawers.

```jsx
<Drawer anchor="right" open={state["qusDrawer"]}>
  <Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
    <div className="flex flex-col">
      <Box className="bgheaderCards">
        <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
          <div className="ms-3 text-white">Drawer Title</div>
          <IconButton onClick={onClose} size="small" sx={{ mr: 1 }}>
            <HiOutlineX className="f20 text-white" />
          </IconButton>
        </div>
      </Box>
      <Box sx={{ flexGrow: 1, p: 2, mt: 2 }}>{/* content */}</Box>
    </div>
  </Box>
</Drawer>
```

---

## Tables

### PETable (DataGrid Wrapper)

**File:** `src/components/RFQ/PETable.js` — export `PETable`

Drop-in MUI DataGrid with canonical RFQ styling pre-applied.

**Design tokens (hardcoded in PETable):**

- Header: `#f9fafb` bg, `#6b7280` text, 12px, 600 weight, 40px height
- Cell: `#1f2937` text, 13px, `8px 12px` padding
- Row hover: `#f8fafc`, selected: `#eff6ff`
- Default row height: 52px
- Default page sizes: 5, 10, 25, 50 (default: 10)

**Props:**

| Prop        | Description                                       |
| ----------- | ------------------------------------------------- |
| `rows`      | Row data array                                    |
| `columns`   | Column definition array                           |
| `toolbar`   | Optional JSX rendered as DataGrid toolbar slot    |
| `sx`        | Optional sx override (merged on top of canonical) |
| `rowHeight` | Default `52`                                      |
| `...rest`   | All DataGrid props forwarded                      |

**Usage:**

```jsx
import { PETable } from "../../../components/RFQ/PETable";

<PETable
  rows={rows}
  columns={columns}
  toolbar={
    <PETableToolbar
      left={<span>Items ({rows.length})</span>}
      right={
        <button className="pe-btn pe-btn--primary" onClick={onAdd}>
          + Add
        </button>
      }
    />
  }
/>;
```

**Column definition example:**

```jsx
const columns = [
  { field: "name", headerName: "Name", flex: 1 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: ({ row }) => <StatusBadge status={row.status} />,
  },
  {
    field: "actions",
    headerName: "",
    width: 80,
    sortable: false,
    renderCell: ({ row }) => (
      <>
        <button
          className="pe-icon-btn pe-icon-btn--edit"
          onClick={() => onEdit(row)}
        >
          <MdEdit />
        </button>
        <button
          className="pe-icon-btn pe-icon-btn--delete"
          onClick={() => onDelete(row.id)}
        >
          <MdDelete />
        </button>
      </>
    ),
  },
];
```

---

### PETableSimple (MUI Table Wrapper)

**File:** `src/components/RFQ/PETable.js` — export `PETableSimple`

For smaller inline/drawer tables. Supports expandable rows.

**Props:**

| Prop               | Description                                                           |
| ------------------ | --------------------------------------------------------------------- |
| `columns`          | Array of `{ key, label, width?, align?, renderHeader?, renderCell? }` |
| `rows`             | Data array                                                            |
| `getRowKey`        | `(row, index) => key` for stable row keys                             |
| `wrapperStyle`     | Inline style override on outer Box                                    |
| `getExpandContent` | `(row) => JSX` — enables expand toggle per row                        |
| `expandedKeys`     | Controlled `Set` of expanded keys                                     |
| `onExpandToggle`   | `(key) => void` for controlled mode                                   |

**Column shape:**

```js
{ key: 'name', label: 'Name', width: '40%', align: 'left',
  renderCell: (value, row) => <span>{value}</span> }
```

---

### MasterFormPanel

**File:** `src/components/MasterFormPanel/MasterFormPanel.js`

Reusable settings page with a form on the left and a table on the right.

**Layout classes:**

| Class                | Role                                                     |
| -------------------- | -------------------------------------------------------- |
| `.mfp-root`          | Outer flex container (form + table side-by-side)         |
| `.mfp-form-section`  | Left panel — form fields                                 |
| `.mfp-table-section` | Right panel — table (min-height: 160px so no-rows shows) |
| `.mfp-field-row`     | Row inside form section                                  |
| `.mfp-field--sm`     | ~25% width field slot                                    |
| `.mfp-field--md`     | ~40% width field slot                                    |
| `.mfp-field--lg`     | ~60% width field slot                                    |
| `.mfp-field--xl`     | ~80% width field slot                                    |
| `.mfp-field--full`   | 100% width field slot                                    |

Uses `PETableSimple` internally for the right panel table.

---

## Toolbar

### Manage List Page Toolbar (`.rfq-v2-toolbar`)

Defined in `src/assets/css/manage-rfq-v2.css`.

```jsx
<div className="rfq-v2-toolbar">
  <div className="rfq-v2-search-wrapper">
    <input
      type="text"
      className="rfq-v2-search"
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
  <div className="rfq-v2-toolbar-right">
    <button className="rfq-v2-tbtn" onClick={onFilter}>
      <MdFilterList /> Filter
    </button>
    <button className="rfq-v2-tbtn-export" onClick={onExport}>
      <MdDownload /> Export
    </button>
    <button className="pe-btn pe-btn--primary" onClick={onCreate}>
      + Create New
    </button>
  </div>
</div>
```

| Class                    | Role                                               |
| ------------------------ | -------------------------------------------------- |
| `.rfq-v2-toolbar`        | Full-width flex row: search left, actions right    |
| `.rfq-v2-search-wrapper` | Search input container                             |
| `.rfq-v2-search`         | Styled search input                                |
| `.rfq-v2-toolbar-right`  | Right side button cluster                          |
| `.rfq-v2-tbtn`           | Ghost-style toolbar button (filter, columns, etc.) |
| `.rfq-v2-tbtn-export`    | Export variant toolbar button                      |

---

## Status Badge

Defined in `src/assets/css/manage-rfq-v2.css`.

```jsx
<span
  className={`rfq-v2-status-badge rfq-v2-status-badge--${status.toLowerCase()}`}
>
  <span className="rfq-v2-status-dot" />
  {status}
</span>
```

| Modifier               | Color        |
| ---------------------- | ------------ |
| `--draft`              | Gray         |
| `--open`               | Blue         |
| `--running`            | Green        |
| `--close` / `--closed` | Dark         |
| `--awarded`            | Gold/success |
| `--paused`             | Amber        |
| `--cancelled`          | Red          |

---

## Breadcrumb

Defined in `src/assets/css/rfq-detail-v2.css`. Used in detail pages (RFQ, Auction).

```jsx
<nav className="rfq-dv2-breadcrumb" aria-label="breadcrumb">
  <span
    className="rfq-dv2-breadcrumb-link"
    onClick={() => navigate("/app")}
    role="button"
    tabIndex={0}
  >
    Home
  </span>
  <span className="rfq-dv2-sep">/</span>
  <span
    className="rfq-dv2-breadcrumb-link"
    onClick={() => navigate("/configuration/manage-rfq")}
    role="button"
    tabIndex={0}
  >
    RFQs
  </span>
  <span className="rfq-dv2-sep">/</span>
  <span className="rfq-dv2-breadcrumb-current">
    {rfqCode || `RFQ-${pageSlug}`}
  </span>
</nav>
```

| Class                         | Role                                       |
| ----------------------------- | ------------------------------------------ |
| `.rfq-dv2-breadcrumb`         | Nav row                                    |
| `.rfq-dv2-breadcrumb-link`    | Clickable crumb (blue, underline on hover) |
| `.rfq-dv2-breadcrumb-current` | Final non-clickable crumb (dark, bold)     |
| `.rfq-dv2-sep`                | `/` separator (muted)                      |

---

## Detail Page Head

Defined in `src/assets/css/rfq-detail-v2.css`.

```jsx
<div className="rfq-dv2-head-top">
  {breadcrumb}
  <div className="rfq-dv2-head-actions">
    {/* action buttons */}
  </div>
</div>
<div className="rfq-dv2-head-bottom">
  {/* tabs or status strip */}
</div>
```

---

## Preview Section Cards

Used in RFQ/Auction preview tabs. Defined in `rfq-detail-v2.css`.
**Pattern: header + content both inside the card.**

```jsx
<div className="rfq-preview-section-card mb-3">
  <div className="rfq-preview-card-body">
    {/* Section header — always INSIDE the card */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="rfq-preview-section-title">
        <span className="rfq-preview-section-icon">📋</span>
        Section Title
      </div>
      <button className="pe-icon-btn pe-icon-btn--edit" onClick={onEdit}>
        <MdEdit />
      </button>
    </div>
    {/* Content */}
    <div className="row">...</div>
  </div>
</div>
```

| Class                        | Role                                    |
| ---------------------------- | --------------------------------------- |
| `.rfq-preview-section-card`  | White card with border, radius, shadow  |
| `.rfq-preview-card-body`     | Padding inside card                     |
| `.rfq-preview-section-title` | Bold section heading with optional icon |
| `.rfq-preview-section-icon`  | Icon/emoji prefix in heading            |

---

## Pagination

`PETable` (DataGrid) handles pagination automatically. Default config:

- Page sizes: 5, 10, 25, 50
- Default page size: 10
- Footer height: 44px
- Font size: 12px, color: `#6b7280`

For `PETableSimple` — no built-in pagination. Implement externally if needed (rare; most small tables don't paginate).

---

## Form Layout Patterns

### Inside drawer / modal

```jsx
<form id="my-form" onSubmit={formik.handleSubmit} autoComplete="off">
  <div className="row">
    <div className="col-12 col-md-6 mb-4">
      <label className="pe-field-label">Label <span className="rfq-required-star">*</span></label>
      <TextField ... />
    </div>
    <div className="col-12 col-md-6 mb-4">
      <label className="pe-field-label">Label 2</label>
      <TextField ... />
    </div>
    <div className="col-12 mb-4">
      <label className="pe-field-label">Remarks</label>
      <TextField multiline rows={4} ... />
    </div>
  </div>
</form>
```

### Field label utility classes

| Class                | Role                                      |
| -------------------- | ----------------------------------------- |
| `.pe-field-label`    | Label above input (12px, muted, semibold) |
| `.rfq-required-star` | Red `*` for required fields               |

---

## Side Panels

### Approval Workflow Panel

Rendered as a right-side `Drawer` (legacy pattern). Opens from the detail page action buttons.

- Width: `{ xs: 280, sm: 480, md: 720 }` via MUI `Box`
- Header: `.bgheaderCards` (dark blue)
- Uses `approvalflow.js` component inside

### Notification / Message Panels

Controlled by `isNotificationOpen` in global store. Rendered as MUI `Drawer` anchor="right". Not part of `CommonBottomDrawer`.

### Query / Chat Panel

- Used in Communication Hub (`/query-list`)
- Right-anchored `Drawer` with `sx={{ width: 480 }}`
- Header uses `.bgheaderCards` pattern

---

## Shell Layout Reference

```
┌──────────────────────────────────────────────────────┐
│  .pe-header  (fixed, 72px, left: 84px)               │
├────────┬─────────────────────────────────────────────┤
│ .pe-   │  .pe-main-content                           │
│ sidebar│  margin-left: 84px, margin-top: 72px        │
│ 84px   │  padding: 16px                              │
│ fixed  │  <Outlet /> renders here                    │
└────────┴─────────────────────────────────────────────┘
```

| Class              | Role                                                 |
| ------------------ | ---------------------------------------------------- |
| `.pe-shell`        | App root, `min-height: 100vh`, bg `#f3f4f6`          |
| `.pe-header`       | Fixed top bar, 72px, `left: 84px`                    |
| `.pe-sidebar`      | Fixed left nav, 84px wide, `#03172b`                 |
| `.pe-main-content` | Page content area                                    |
| `.pe-card`         | White card, `var(--pe-radius)`, border, light shadow |

---

## Scroll Containment in Modals

When embedding a component with its own scrollable table inside a `PEModal`, use this pattern to prevent double scrollbars:

```jsx
<PEModal
  size="lg"
  title="..."
  bodyStyle={{ padding: 0, height: "78vh", overflow: "hidden" }}
  bodyClassName="d-flex flex-column"
>
  <div
    className="flex-grow-1 d-flex flex-column"
    style={{ minHeight: 0, overflow: "hidden" }}
  >
    <InnerComponent />
  </div>
</PEModal>
```

The inner component must itself use `flex: 1` / `minHeight: 0` to fill the space and scroll internally.

---

## Toast Notifications

**Library:** `react-toastify`
**Config (set in `App.js`):** position `top-center`, limit 1, autoClose 2000ms.

```js
import { toast } from "react-toastify";

toast.success("Saved successfully.");
toast.error("Something went wrong.");
toast.info("Please wait...");
toast.warning("Check your input.");
```

---

---

## PETableToolbar

**File:** `src/components/RFQ/PETableToolbar.js` — export `PETableToolbar`

Layout shell for above-table toolbars. Three named slots: `left`, `right`, `above`. Not a DataGrid `slots.toolbar` — inject directly above `<PETable>`.

> ⚠️ `background` is currently `lightgreen` (placeholder) — override via `sx={{ background: '#fff' }}` until fixed.

**Props:**

| Prop    | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| `left`  | JSX for left side (search input, dropdowns, row count)            |
| `right` | JSX for right side (filter, export, Add button)                   |
| `above` | Full-width row above left/right (date pickers, secondary filters) |
| `sx`    | Optional sx override                                              |

**Usage:**

```jsx
import { PETable } from "../../../components/RFQ/PETable";
import { PETableToolbar } from "../../../components/RFQ/PETableToolbar";

<PETable
  rows={rows}
  columns={columns}
  toolbar={
    <PETableToolbar
      sx={{ background: "#fff" }}
      left={
        <span className="f13" style={{ color: "#6b7280" }}>
          Items ({rows.length})
        </span>
      }
      right={
        <>
          <button className="rfq-v2-tbtn" onClick={onFilter}>
            <MdFilterList /> Filter
          </button>
          <button className="pe-btn pe-btn--primary" onClick={onAdd}>
            + Add
          </button>
        </>
      }
    />
  }
/>;
```

---

## ApprovalConfirmDialog

**File:** `src/components/RFQ/ApprovalConfirmDialog.js`

Reusable approve / reject / forward workflow dialog. Handles all three modes with dynamic title, message, and button label.

**Props:**

| Prop              | Type                                | Description                                |
| ----------------- | ----------------------------------- | ------------------------------------------ |
| `open`            | bool                                | Controls visibility                        |
| `onClose`         | func                                | Cancel / backdrop click                    |
| `onSubmit`        | func                                | Form submit handler                        |
| `status`          | `"Approved"\|"Rejected"\|"Forward"` | Drives title, message, button label        |
| `stageName`       | string                              | Stage name shown in message body           |
| `comment`         | string                              | Controlled comment value                   |
| `onCommentChange` | func                                | `(value) => void`                          |
| `entityLabel`     | string                              | Default `"RFQ"` — used in body text        |
| `zIndex`          | number                              | Use `1500` when inside a fullscreen Dialog |

**CSS Classes:**

| Class                                 | Role                                 |
| ------------------------------------- | ------------------------------------ |
| `.rfq-dv2-approval-modal`             | Dialog Paper                         |
| `.rfq-dv2-approval-backdrop`          | Backdrop                             |
| `.rfq-dv2-approval-modal-head`        | Header: title left + close btn right |
| `.rfq-dv2-approval-modal-body`        | Body: message + comment field        |
| `.rfq-dv2-approval-modal-actions`     | Footer buttons                       |
| `.rfq-dv2-approval-message`           | Descriptive message paragraph        |
| `.rfq-dv2-approval-message.is-reject` | Red-tinted variant for rejection     |

**Usage:**

```jsx
<ApprovalConfirmDialog
  open={state["openInvoiceApproved"]}
  onClose={toggleDrawer("openInvoiceApproved", false, [])}
  onSubmit={formik_ApproveReject.handleSubmit}
  status={formik_ApproveReject.values?.status}
  stageName={normalizedCurrentStage}
  comment={formik_ApproveReject.values?.approveComment}
  onCommentChange={(val) =>
    formik_ApproveReject.setFieldValue("approveComment", val)
  }
/>
```

---

## Tooltips

### WhiteTooltip

**File:** `src/components/whitetooltip.js`

White-background MUI Tooltip. Use when dark tooltip clashes with dark UI areas.

- Background: `#FFF`, border: `1px solid #dadde9`, black text
- `minWidth: 300`, `maxWidth: 600`

```jsx
import WhiteTooltip from '../../../components/whitetooltip';

<WhiteTooltip title="Detailed explanation here" placement="top">
  <span>{cell value}</span>
</WhiteTooltip>
```

### CommonTooltip

**File:** `src/components/commonTooltip.js`

Dark-background tooltip with larger font. Use for regular table cells, icons.

- Dark bg, `fontSize: 14px`, `maxWidth: 500px`, arrow hidden

```jsx
import CommonTooltip from "../../../components/commonTooltip";

<CommonTooltip title={longText} placement="bottom">
  <div>{truncatedValue}</div>
</CommonTooltip>;
```

---

## ExpandableTextCell

**File:** `src/components/ExpandableTextCell.js`

Clamps long text to N lines inside a table cell with "...View more / View less" toggle. Shows `CommonTooltip` with full text when truncated.

**Props:**

| Prop       | Default | Description                       |
| ---------- | ------- | --------------------------------- |
| `text`     | —       | Text to display                   |
| `maxLines` | `4`     | Max visible lines before clamping |
| `fontSize` | `12`    | Font size in px                   |

- Renders `—` (muted) for null / `'-'` / `'No Response'` values
- "View more / View less" button is blue (`#2A68D3`), inline with text

```jsx
import ExpandableTextCell from '../../../components/ExpandableTextCell';

// In column definition:
{ field: 'description', headerName: 'Description', flex: 1,
  renderCell: ({ row }) => <ExpandableTextCell text={row.description} maxLines={3} /> }
```

---

## Empty State

### NoRecordCell

**File:** `src/components/NoRecordCell.js`

White rounded card with shadow, centered "NO RECORD FOUND" text. Use when a list/table returns zero rows and there's no DataGrid (which has its own no-rows overlay).

```jsx
import NoRecordCell from "../../../components/NoRecordCell";

{
  list.length === 0 && <NoRecordCell />;
}
```

---

## Loading States

### GridSkeleton

**File:** `src/components/Skeleton/gridSkeleton.js`

MUI Skeleton placeholder for a data grid area. Shows a 400px tall rectangular skeleton + 3 text skeletons.

```jsx
import gridSkeleton from "../../../components/Skeleton/gridSkeleton";

{
  isLoading ? gridSkeleton() : <PETable rows={rows} columns={columns} />;
}
```

### ListSkeleton

**File:** `src/components/Skeleton/listSkeleton.js`

MUI Skeleton placeholder for a list card. Shows one 80px rectangular skeleton + 3 text skeletons, mimicking a list item.

```jsx
import listSkeleton from '../../../components/Skeleton/listSkeleton';

{isLoading ? listSkeleton() : <div>{items.map(...)}</div>}
```

### LockLoader

**File:** `src/components/Loader/LockLoader.js`

Animated SVG overlay shown before a destructive action completes (seal bid, update end date). Auto-fires a callback at 4 s.

**Props:** `actionlocktype` (`"sealedbid"` | `"updateenddate"`), `actionCallback`

```jsx
{
  showLock && (
    <LockLoader actionlocktype="sealedbid" actionCallback={onSealComplete} />
  );
}
```

---

## AlertPopUp (Discard Changes Dialog)

**File:** `src/components/alertpopup.js`

Simple MUI Dialog asking "Your Changes will not be saved. Are you sure you want to close?" — used when navigating away with unsaved edits.

**Props:** `open`, `setOpen` (setter), `handleYes` (confirmed discard callback)

```jsx
import AlertPopUp from "../../../components/alertpopup";

<AlertPopUp
  open={alertOpen}
  setOpen={setAlertOpen}
  handleYes={handleDiscard}
/>;
```

---

## MUI Tabs Pattern

Used on all detail pages (RFQ, Auction, NFA). Standard pattern:

```jsx
import { Tabs, Tab } from "@mui/material";

<Tabs
  value={value}
  onChange={(_, v) => setValue(v)}
  textColor="primary"
  indicatorColor="primary"
  variant="scrollable"
  allowScrollButtonsMobile
  className="tabstheme"
>
  <Tab value={1} label={<span className="section-heading">General</span>} />
  <Tab
    value={2}
    label={<span className="section-heading">Items</span>}
    disabled={!idFromURL}
  />
  {/* Conditional tab: */}
  {idFromURL && someCondition && (
    <Tab value={5} label={<span className="section-heading">Report</span>} />
  )}
</Tabs>;
```

**CSS:** `.tabstheme` (in `base.css`) styles the active tab underline indicator.  
**Label class:** always wrap tab label in `<span className="section-heading">` for consistent typography.

---

## MUI Accordion Pattern

Used in approval workflow stages. Pattern:

```jsx
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

<Accordion
  className="approvalAcordion shadow-none"
  expanded={!!expandedStages[i]}
  onChange={() => toggleStage(i)}
>
  <AccordionSummary
    expandIcon={<ExpandMoreIcon />}
    className="custom-accordion-summary-content"
  >
    {/* Summary content */}
  </AccordionSummary>
  <AccordionDetails className="approvalAcordionDetails">
    {/* Approver rows */}
  </AccordionDetails>
</Accordion>;
```

**CSS classes (approvalflow.css):**

| Class                                               | Role                            |
| --------------------------------------------------- | ------------------------------- |
| `.approvalCard`                                     | Wrapper card per stage          |
| `.approvalAcordion`                                 | Accordion — shadow-none variant |
| `.approvalAcordionDetails`                          | Expanded content area           |
| `.serial-count.Approved/Pending/Rejected/Completed` | Status-colored step number      |
| `.cell-text.Approved/Pending/Rejected/Completed`    | Status-colored cell text        |

---

## Date / Time Pickers

All wrapped in `<LocalizationProvider dateAdapter={AdapterDayjs}>`.

```jsx
import { LocalizationProvider, MobileDateTimePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Date + Time (used for RFQ start/end dates)
<LocalizationProvider dateAdapter={AdapterDayjs}>
  <MobileDateTimePicker
    label="Start Date"
    value={dayjs(formik.values.startDate)}
    onChange={(val) => formik.setFieldValue('startDate', val)}
    slotProps={{ textField: { size: 'small', fullWidth: true, className: 'f14' } }}
  />
</LocalizationProvider>

// Date only (used for item delivery dates)
<LocalizationProvider dateAdapter={AdapterDayjs}>
  <MobileDatePicker
    label="Delivery Date"
    value={dayjs(formik.values.deliveryDate)}
    onChange={(val) => formik.setFieldValue('deliveryDate', val)}
    slotProps={{ textField: { size: 'small', fullWidth: true, className: 'f14' } }}
  />
</LocalizationProvider>
```

---

## Chip / Tag Patterns

### MUI Chip (inline label/tag)

```jsx
import { Chip } from '@mui/material';

<Chip label="Active" size="small" color="primary" variant="outlined" />
<Chip label="Draft" size="small" color="default" variant="outlined" />
```

### File Chip (`.rfq-dv2-file-chip`)

Custom pill showing selected file name with dismiss button. Defined in `rfq-detail-v2.css`.

```jsx
<div className="rfq-dv2-file-chip">
  <span className="rfq-dv2-file-chip-icon">
    <MdAttachFile />
  </span>
  <span className="rfq-dv2-file-chip-name">{fileName}</span>
  <button className="rfq-dv2-file-chip-clear" onClick={onClear}>
    ×
  </button>
</div>
```

---

## Communication Hub / Chat UI Classes

Defined in `src/assets/css/communication.css`.

| Class              | Role                                                       |
| ------------------ | ---------------------------------------------------------- |
| `.userRowNew`      | Pill-shaped user name row (`border-radius: 20px`, gray bg) |
| `.userNameNew`     | Truncated bold name label inside user row                  |
| `.textarea-custom` | Normalized textarea (no focus ring, border override)       |
| `.app-container`   | Flex layout for chat split-view                            |

---

---

## PESupplier Portal — Revamped UI Reference

**Repo path:** `E:\pragya\iife-training\ProcureEngine\PESupplier\`

The supplier portal has been fully revamped with the same design language as the buyer app. When a buyer module references supplier-facing behaviour, use these components as the authority. All PE components live in `src/components/PE/`.

> **Shared design system:** PESupplier uses the same `.pe-btn`, `.pe-icon-btn`, `PEModal`, `PETable`, `PETableToolbar` classes/components as the buyer app. Button variants, icon buttons, token colors, and table styling are identical. The CSS is in `src/assets/css/pe-components.css` (ported from buyer's `design-system.css`).

---

### PESubHeader (Breadcrumb + Page Actions)

**File:** `src/components/PE/PESubHeader.js`

Sub-header bar just below the app header — breadcrumb left, action buttons right. Same visual language as buyer's `rfq-dv2-breadcrumb` but uses `.rfq-v2-breadcrumb` classes (defined in `pe-components.css`).

**Props:**

| Prop | Description |
|---|---|
| `items` | Array of `{ label, to? }`. Last item (no `to`) renders as current/non-clickable |
| `actions` | JSX for right side (Save & Continue, Regret, Create New, etc.) |

**CSS Classes:** `.rfq-v2-subheader`, `.rfq-v2-breadcrumb`, `.rfq-v2-breadcrumb-sep`, `.rfq-v2-subheader-actions`

```jsx
import PESubHeader from '../../components/PE/PESubHeader';

<PESubHeader
  items={[
    { label: 'Home', to: '/Supplier' },
    { label: 'RFQ Listing', to: '/erfqlist' },
    { label: rfqSubject },  // last — no `to` — becomes current crumb
  ]}
  actions={
    <>
      <button className="pe-btn pe-btn--ghost" onClick={onRegret}>Regret</button>
      <button className="pe-btn pe-btn--primary" onClick={onSave}>Save & Continue</button>
    </>
  }
/>
```

---

### PEDetailInfoBar (Event Detail Info Strip)

**File:** `src/components/PE/PEDetailInfoBar.js`

Horizontal info bar on RFQ/Auction/RFI detail pages. Three rows: Subject (full width) → Fields row (status, dates, etc.) → Description (full width). Has logo on left.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `logo` | string | Customer logo URL |
| `fallbackLogo` | string | Fallback if logo fails |
| `subject` | `{ label?, value }` | Full-width subject row |
| `fields` | array | Field objects (see below) |
| `description` | `{ label?, value }` | Full-width description row |
| `fieldsColumns` | number | Force N-column grid on fields row (use for Auction with many fields) |

**Field object shape:**

```js
// Plain text
{ label: 'Start Date', value: '12 Aug 2026' }

// Badge (colored dot + pill)
{ label: 'Status', type: 'badge', value: 'Open', bg: '#e8f5e9', color: '#2e7d32', dot: '#22c55e' }

// Link button
{ label: 'Event Code', type: 'link', value: 'RFQ-1234', onClick: handleClick }
```

**CSS Classes:** `.pe-detail-infobar`, `.pe-detail-infobar-logo`, `.pe-detail-infobar-rows`, `.pe-detail-infobar-cell`, `.pe-detail-infobar-cell--full`, `.pe-detail-infobar-label`, `.pe-detail-infobar-cellbox`, `.pe-detail-infobar-value`, `.pe-detail-infobar-badge`, `.pe-detail-infobar-badge-dot`, `.pe-detail-infobar-linkbtn`, `.pe-detail-infobar-fieldsrow`

```jsx
import PEDetailInfoBar from '../../components/PE/PEDetailInfoBar';

<PEDetailInfoBar
  logo={customerLogo}
  fallbackLogo={defaultLogo}
  subject={{ value: rfqSubject }}
  fields={[
    { label: 'Status', type: 'badge', value: 'Open', bg: '#e8f5e9', color: '#2e7d32', dot: '#22c55e' },
    { label: 'Start Date', value: startDate },
    { label: 'End Date', value: endDate },
    { label: 'Currency', value: currency },
  ]}
  description={{ value: rfqDescription }}
/>
```

---

### PERightDrawer (Right-Side Drawer Shell)

**File:** `src/components/PE/PERightDrawer.js`

Standard right-side drawer for the supplier portal. Provides header / scrollable body / optional footer chrome. More structured than buyer's legacy MUI Drawer pattern.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | bool | — | Show/hide |
| `onClose` | func | — | Close handler |
| `title` | string | — | Drawer title |
| `subtitle` | string | — | Smaller subtitle below title |
| `width` | number | `500` | Drawer width in px |
| `children` | JSX | — | Scrollable body content |
| `footer` | JSX | — | Fixed footer (form buttons) |

**CSS Class:** `.pe-drawer-header` (light gray header bg, flex row)

```jsx
import PERightDrawer from '../../components/PE/PERightDrawer';

<PERightDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  title="Enter Price"
  subtitle="Lot 1 — Cement"
  width={560}
  footer={
    <>
      <button className="pe-btn pe-btn--ghost" onClick={() => setDrawerOpen(false)}>Cancel</button>
      <button className="pe-btn pe-btn--primary" type="submit" form="price-form">Submit</button>
    </>
  }
>
  <form id="price-form" onSubmit={handleSubmit} className="p-3">
    {/* fields */}
  </form>
</PERightDrawer>
```

---

### PEPagination (Standalone Pagination Bar)

**File:** `src/components/PE/PEPagination.js`

Use when a table doesn't use `PETable` (DataGrid) — e.g. custom HTML tables or `PETableSimple` without built-in pagination.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `page` | number | — | Current page (1-indexed) |
| `pageSize` | number | — | Rows per page |
| `totalRows` | number | — | Total row count |
| `onPageChange` | func | — | `(newPage) => void` |
| `onPageSizeChange` | func | — | `(newSize) => void` |
| `pageSizeOptions` | array | `[10,25,50,100]` | Size options |
| `sx` | object | — | Box sx override |

Shows "Rows per page" select + "X–Y of Z" count + prev/next chevrons.

```jsx
import { PEPagination } from '../../components/PE/PEPagination';

const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

<PEPagination
  page={page}
  pageSize={pageSize}
  totalRows={rows.length}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

---

### AttachmentsDrawer

**File:** `src/components/PE/AttachmentsDrawer.js`

"View Attachments" trigger button + right-side drawer. Filters out T&C attachments (shown separately in terms modal). Handles Azure blob download internally.

**Props:** `attachments`, `satoken`, `onOpen?`, `width?` (default 500)

```jsx
import AttachmentsDrawer from '../../components/PE/AttachmentsDrawer';

<AttachmentsDrawer attachments={eventAttachments} satoken={satoken} />
```

Renders a trigger button (paperclip icon + count). On click, opens `PERightDrawer` with a list of downloadable files.

---

### PEItemDetailModal

**File:** `src/components/PE/PEItemDetailModal.js`

Item details popup for Auction modules. Adapts automatically per auction type — fields show/hide based on `item` properties (`showStartPrice`, `hidePrice`, `minimumDelta`, etc.).

**Props:** `open`, `onClose`, `item`

```jsx
<PEItemDetailModal open={itemDetailOpen} onClose={() => setItemDetailOpen(false)} item={selectedItem} />
```

---

### PETermsModal (Terms & Conditions)

**File:** `src/components/PE/PETermsModal.js`

Shared T&C modal used on RFQ/RFI/Auction supplier pages. Shows event metadata fields, terms text, attachments, and an "I Agree" checkbox.

Key props: `show`, `onClose`, `lastRevised`, `fields[]`, `checked`, `onCheckedChange`, `checkboxDisabled`, `showDashboardButton`, `onDashboardClick`, `onAccept`, `acceptDisabled`, `loading`, `attachments[]`

---

### Supplier Portal — Tab Pattern

**CSS Classes (pe-components.css):**

| Class | Role |
|---|---|
| `.pe-detail-tabs-shell` | Wrapper div around `<Tabs>` — sets bg color |
| `.pe-detail-tabstheme` | Applied to `<Tabs>` — 48px height, Inter font, no transform |
| `.MuiTab-root.Mui-selected` | Blue text (`#2388d9`), light blue bg (`#e9f2fb`) |
| `.MuiTabs-indicator` | 3px blue underline (`#2388d9`) |

```jsx
<div className="pe-detail-tabs-shell">
  <Tabs value={tab} onChange={(_, v) => setTab(v)} className="pe-detail-tabstheme">
    <Tab value={0} label={<span className="section-heading">General</span>} />
    <Tab value={1} label={<span className="section-heading">Items</span>} />
  </Tabs>
</div>
```

---

### Supplier Portal — Detail Accordion Header

Blue collapsible section header. Used by "Auction Details" and reusable across all detail-page accordions.

**CSS Class:** `.pe-detail-accordion-header`  
- Background: `#1d6fc3` (blue), white text, `border-radius: 12px 12px 0 0`, height 38px

```jsx
<Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />} className="pe-detail-accordion-header">
    <span>Auction Details</span>
  </AccordionSummary>
  <AccordionDetails>
    {/* content */}
  </AccordionDetails>
</Accordion>
```

---

### PESupplier File Locations

| What | Path |
|---|---|
| All PE components | `src/components/PE/` |
| Shared CSS (buttons, tabs, layout) | `src/assets/css/pe-components.css` |
| Auction participation CSS | `src/assets/css/auctionparticipation.css` |
| Supplier-specific CSS | `src/assets/css/supplier.css` |
| RFQ vendor CSS | `src/assets/css/erfqvendor.css` |
| Preview styles | `src/assets/css/preview.css` |
| Sidebar v2 | `src/assets/css/sidebar-v2.css` |

---

## Key File Locations

| What                           | Path                                                |
| ------------------------------ | --------------------------------------------------- |
| CSS tokens + shell + buttons   | `src/assets/css/design-system.css`                  |
| Manage list toolbar + badge    | `src/assets/css/manage-rfq-v2.css`                  |
| Detail page breadcrumb + cards | `src/assets/css/rfq-detail-v2.css`                  |
| MasterFormPanel styles         | `src/assets/css/master-form-panel.css`              |
| Approval flow colors/accordion | `src/assets/css/approvalflow.css`                   |
| Communication hub chat UI      | `src/assets/css/communication.css`                  |
| Event question screen layout   | `src/assets/css/event.css`                          |
| Legacy table (itemstable)      | `src/assets/css/datagrid.css`                       |
| Lock loader animation          | `src/assets/css/lockloader.css`                     |
| PEModal                        | `src/components/PEModal.js`                         |
| CommonBottomDrawer             | `src/components/CommonBottomDrawer.js`              |
| ApprovalConfirmDialog          | `src/components/RFQ/ApprovalConfirmDialog.js`       |
| PETable / PETableSimple        | `src/components/RFQ/PETable.js`                     |
| PETableToolbar                 | `src/components/RFQ/PETableToolbar.js`              |
| MasterFormPanel component      | `src/components/MasterFormPanel/MasterFormPanel.js` |
| WhiteTooltip                   | `src/components/whitetooltip.js`                    |
| CommonTooltip                  | `src/components/commonTooltip.js`                   |
| ExpandableTextCell             | `src/components/ExpandableTextCell.js`              |
| NoRecordCell                   | `src/components/NoRecordCell.js`                    |
| GridSkeleton / ListSkeleton    | `src/components/Skeleton/`                          |
| LockLoader                     | `src/components/Loader/LockLoader.js`               |
| AlertPopUp                     | `src/components/alertpopup.js`                      |
| MUI theme (primary color)      | `src/theme.js`                                      |
