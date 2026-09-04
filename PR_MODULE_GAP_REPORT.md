# PR Module Gap Report
**Reference (prod):** `E:\pragya\iife-training\ProcureEngine\src4SepPR\src`  
**Target (new UI):** `E:\pragya\iife-training\PE\src`  
**Generated:** 2026-09-04

---

## 1. Missing API Endpoints

### `PurchaseRequest.js` (detail page)

| Endpoint | Method | Purpose | Notes |
|---|---|---|---|
| `/api/EventTemplate/Add` | POST | Save current PR as a reusable template | Menu item "Save as Template" exists in TARGET but never calls this API |
| `/api/PRManage/ManagePRReportExcel/:id` | GET (blob) | Download Excel report for a closed/consumed PR | Entirely absent in TARGET |
| `/api/PRManage/ManagePRReportPDF/:id` | GET (blob) | Download PDF report for a closed/consumed PR | Entirely absent in TARGET |
| `/api/ApprovalAction/Recall` | POST | Recall a PR that is currently under approval | Entirely absent in TARGET |

### `ManagePR.js` (list page)

| Endpoint | Method | Purpose | Notes |
|---|---|---|---|
| `/api/EventTemplate/Find` | GET | Fetch list of saved PR templates for "Create from Template" flow | Absent; TARGET modal only shows "Create New" option |
| `/api/PRManage/PRTemplateClone` | POST | Clone a selected template to create a new PR | Absent in TARGET |
| `/api/PRItemService/Find` | GET | Fresh fetch of current PR items before Add to RFQ | TARGET reads `selectedFirstPR.prItems` from stale local state instead of re-fetching |

---

## 2. Missing Handler Functions

### `PurchaseRequest.js`

| Function | Purpose | Details |
|---|---|---|
| `handleRecall()` | Recall PR under approval | Calls `/api/ApprovalAction/Recall`, shows success/failure toast, reloads PR. Gated by `hasAnyApproval === true` |
| `handleSaveTemplate()` | Save PR as template | Collects PR data and POSTs to `/api/EventTemplate/Add`. Menu item exists in TARGET but is wired to nothing |
| `handleDownloadClosedPRExcel()` | Download Excel report | Fetches blob from `ManagePRReportExcel` endpoint, triggers browser download. Absent entirely |
| `handleDownloadClosedPRPDF()` | Download PDF report | Same pattern as Excel, for `ManagePRReportPDF`. Absent entirely |
| `handleClickOpen()` | Open Save As Template dialog | Opens confirmation dialog before saving template |
| `handleClose()` | Close Save As Template dialog | Closes the confirmation dialog |

### `ManagePR.js`

| Function | Purpose | Details |
|---|---|---|
| `getApproversForPR(prId)` | Fetch pending approvers for a PR | Async function calling `getEventApproversFind` utility. Caches result in `approverCacheRef` so hovering same row doesn't re-fetch |
| `PendingApproverTooltip` | Inline component — shows pending approvers on hover | Defined inside ManagePR.js. On hover over "Under Approval" status chip, calls `getApproversForPR`, shows tooltip with approvers list. Entirely absent from TARGET |
| `getTemplateList()` | Fetch PR templates on mount | Calls `/api/EventTemplate/Find`, populates `templatelist` state |
| `handleTemplateNavigation(template)` | Clone template and navigate | POSTs to `/api/PRManage/PRTemplateClone` with selected template, then navigates to the new PR |
| `applyDateRangeFilter(data)` | Client-side date range filter | Takes full record list, applies `filterFromDayjs`/`filterToDayjs` date range, updates `recorddata` |
| `pullFilteredPRs(params)` | Server-side paged fetch with filters | Incorporates date range + advanced search params. TARGET uses a simpler flat fetch with no date-range integration |
| `handleReset()` | Reset all filters | Resets all filter states including `filterFromDayjs`, `filterToDayjs`, `filterMode`, `columnFilterMode`, `filterSearchParams`. TARGET reset does not clear these because the states don't exist |

---

## 3. Missing UI Features / Sections

### `PurchaseRequest.js`

| Feature | Description |
|---|---|
| **Recall PR** | Dots menu item "Recall PR" shown when PR is Under Approval AND `hasAnyApproval === true`. Triggers `handleRecall()`. Entirely absent in TARGET |
| **Download Excel / PDF** | Dots menu items for closed/consumed PRs. Opens a secondary submenu (`excelMenuAnchor`) with "Download Excel" and "Download PDF" options. Absent in TARGET |
| **Save as Template dialog** | Confirmation dialog (`handleClickOpen`/`handleClose`) with a "Save" button that calls `handleSaveTemplate`. TARGET shows menu item but nothing happens on click |
| **App Tour system** | Imports `usePrTour`, `AppTour`, `TourLauncherButton`, `PR_TAB_ENTRY_STEP`. `data-tour="..."` attributes on key UI elements. Floating "Take a tour" `TourLauncherButton` button. All absent in TARGET |
| **BOQ checkbox** | "Bill of Quantities" checkbox in General Info tab. Present in REFERENCE; commented out in TARGET |

### `ManagePR.js`

| Feature | Description |
|---|---|
| **Template selection in Add PR modal** | REFERENCE modal shows radio "Create a New PR" + list of available templates. Selecting a template and clicking Proceed calls `handleTemplateNavigation`. TARGET modal only has "Create New" option |
| **PendingApproverTooltip on status column** | Hovering "Under Approval" status chip fetches and shows a tooltip listing pending approvers' names. TARGET shows plain status text only |
| **Date range filter in advanced search** | `filterFromDayjs` / `filterToDayjs` Dayjs date pickers in the toolbar/advanced search panel. Absent in TARGET |
| **`CreatedByName` field in advanced search** | Advanced search Formik form in REFERENCE includes a "Created By Name" text filter. Absent in TARGET's advanced search |
| **`itemName` column** | REFERENCE list table includes an Item Name column. Not present in TARGET column definitions |
| **`itemStatus` column** | Shows item-level status per PR row. Not present in TARGET |
| **`refEventCode` column** | Linked RFQ/Auction event code reference column. Not present in TARGET |
| **Combined `eventType/ID` column** | Merged column showing event type and event code together. TARGET shows separate or absent columns |
| **Cancel stage shown in list** | REFERENCE does NOT filter cancelled PRs: `setRecorddata(res.result)`. TARGET filters them out: `.filter(item => item.stage !== 'Cancel')` |
| **"Consumed" treated as "Close" in action column** | REFERENCE: `stage === 'Consumed'` shows the Close action chip same as `stage === 'Close'`. TARGET may not handle the Consumed stage correctly |

---

## 4. Missing State Variables

### `PurchaseRequest.js`

| State Variable | Type | Purpose |
|---|---|---|
| `recallConfirmOpen` | boolean | Controls visibility of Recall PR confirmation dialog |
| `hasAnyApproval` | boolean | `eventAppList?.some(x => x.approved === true)` — gates the Recall menu item |
| `excelMenuAnchor` | DOM element / null | Anchor element for secondary Excel/PDF download submenu |
| `downloadingPRReport` | boolean | Loading flag for Excel download — disables button during download |
| `downloadingPRPDF` | boolean | Loading flag for PDF download — disables button during download |
| `templateDialogOpen` | boolean | Controls Save As Template confirmation dialog visibility |

### `ManagePR.js`

| State Variable | Type | Purpose |
|---|---|---|
| `templatelist` | array | List of PR templates from `/api/EventTemplate/Find` |
| `selectedTemplate` | object / null | Currently selected template in the Add PR modal |
| `filterMode` | `'server'` \| `'client'` | Switches between server-pagination and client-side filter mode |
| `filterSearchParams` | object | Holds current active server-side advanced search params |
| `filterFromDayjs` | Dayjs / null | Start date for date range filter |
| `filterToDayjs` | Dayjs / null | End date for date range filter |
| `columnFilterMode` | string / boolean | Column-level filter mode flag |
| `isExporting` | boolean | Prevents concurrent export requests |
| `approverCacheRef` | `useRef({})` | Caches `{ prId: [approvers] }` so hovering the same row doesn't re-fetch approvers |

---

## 5. Missing Utility Functions / Imports

### Utility functions missing in TARGET

| Function | Source File (REFERENCE) | Purpose |
|---|---|---|
| `getEventApproversFind` | `utils/common/utility` | Fetches list of pending approvers for a given PR ID. Called by `getApproversForPR` in ManagePR.js |

### Imports missing in `PurchaseRequest.js`

| Import | Source | Purpose |
|---|---|---|
| `usePrTour` | local tour hook file | App Tour state and step definitions |
| `AppTour` | local component | Renders the guided tour overlay |
| `TourLauncherButton` | local component | Floating "Take a tour" button |
| `PR_TAB_ENTRY_STEP` | local constant | Step index for tab-entry tour step |
| `getApiErrorMessage` | `utils/common` | Extracts human-readable error text from API error responses. REFERENCE uses it in every catch block. TARGET uses hardcoded `"Something went wrong"` |

### Imports missing in `ManagePR.js`

| Import | Source | Purpose |
|---|---|---|
| `getEventApproversFind` | `utils/common/utility` | Called by `getApproversForPR` to fetch pending approvers |

---

## 6. Error Handling Gaps

### Bulk Item Upload Error Mapping (`PurchaseRequest.js`)

REFERENCE maps each error type returned by the bulk upload API to a distinct user-facing message:

| Error Type | User Message (REFERENCE) | TARGET Behavior |
|---|---|---|
| `DUPLICATE_ITEM_CODE` | "Duplicate item code found" | Generic flat error message |
| `MISSING_ITEM_CODE` | "Item code is missing" | Generic flat error message |
| `ITEM_CODE_ALREADY_EXISTS` | "Item code already exists" | Generic flat error message |
| `MISSING_REQUIRED_FIELD` | "Required field missing: [field]" | Generic flat error message |

### Close PR Field Validation (`ManagePR.js`)

REFERENCE validates all Close PR fields individually AND cross-validates:
- If **any** PO field (`poNumber`, `vendorName`, `poValue`, `unitRate`, `poDate`) is filled → **all** PO fields become required
- Required in all cases: `closeDate`, `reason`
- Fields validated: `poNumber`, `vendorName`, `poValue`, `unitRate`, `poDate`, `closeDate`, `reason`

**TARGET** only validates `closeDate` and `reason`. PO fields are not cross-validated.

### General Error Handling

- REFERENCE wraps all API calls with `getApiErrorMessage(error)` to surface server's actual validation or error message to the user
- TARGET uses hardcoded strings (`"Something went wrong"`, `"Failed to load"`) or no error display at all in catch blocks

---

## 7. TARGET-Only Dead Code (Not in REFERENCE — can be cleaned up)

| Item | File | Notes |
|---|---|---|
| `handleApiCall` | `PurchaseRequest.js` | Dead stub using raw `fetch`, not present in REFERENCE |
| `handleItemCheckboxChange` | `ManagePR.js` | Appears unused in TARGET, not present in REFERENCE |
| `handleSelectSinglePRRFQ` | `ManagePR.js` | Appears unused in TARGET, not present in REFERENCE |
| `handleSelectAllPRRFQ` | `ManagePR.js` | Appears unused in TARGET, not present in REFERENCE |
| `handleToggleDetails` | `ManagePR.js` | Appears unused in TARGET, not present in REFERENCE |

---

## 8. TARGET-Only Addition (New functionality not in REFERENCE)

| Function | File | Purpose |
|---|---|---|
| `PRMultipleAdd` | `utils/purchaseRequest/index.js` | Calls `api/PRItemService/:prId/AddItems` — bulk add items to a PR. This is intentional new functionality added in TARGET and not present in REFERENCE utils |

---

## Priority Order for Implementation

| Priority | Item | File(s) |
|---|---|---|
| 🔴 P1 | `handleRecall` + Recall API + `recallConfirmOpen` state + menu item | `PurchaseRequest.js` |
| 🔴 P1 | Wire `handleSaveTemplate` to existing "Save as Template" menu item + confirmation dialog | `PurchaseRequest.js` |
| 🔴 P1 | Download Excel / PDF for closed/consumed PRs + `excelMenuAnchor` submenu | `PurchaseRequest.js` |
| 🔴 P1 | Template clone flow in Add PR modal (`getTemplateList`, `handleTemplateNavigation`, `selectedTemplate` state) | `ManagePR.js` |
| 🟡 P2 | `PendingApproverTooltip` on status column + `getApproversForPR` + `approverCacheRef` | `ManagePR.js` |
| 🟡 P2 | Date range filter (`filterFromDayjs`/`filterToDayjs`) + `pullFilteredPRs` in advanced search | `ManagePR.js` |
| 🟡 P2 | `CreatedByName` field in advanced search form | `ManagePR.js` |
| 🟡 P2 | Missing columns: `itemName`, `itemStatus`, `refEventCode` | `ManagePR.js` |
| 🟡 P2 | Show Cancel stage PRs (remove the `.filter(item => item.stage !== 'Cancel')`) | `ManagePR.js` |
| 🟡 P2 | Handle `Consumed` stage same as `Close` in action column | `ManagePR.js` |
| 🟢 P3 | Replace `getApiErrorMessage` in all catch blocks | `PurchaseRequest.js`, `ManagePR.js` |
| 🟢 P3 | Close PR cross-field validation (all PO fields required if any is filled) | `ManagePR.js` |
| 🟢 P3 | Bulk upload — granular error type mapping | `PurchaseRequest.js` |
| 🟢 P3 | BOQ checkbox in General Info tab | `PurchaseRequest.js` |
| 🔵 P4 | Remove dead code (`handleApiCall`, `handleItemCheckboxChange`, etc.) | `ManagePR.js`, `PurchaseRequest.js` |
| 🔵 P4 | App Tour system (`usePrTour`, `AppTour`, `TourLauncherButton`) | `PurchaseRequest.js` |
