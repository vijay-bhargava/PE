# NFA Module — Gap Analysis (Prod vs Our Repo)

> Compared: `E:/pragya/iife-training/ProcureEngine/src31Aug/` (prod) vs `E:/pragya/iife-training/PE/src/` (our repo)
> No NFA files are entirely missing — all gaps are within existing files.

---

## 🔴 Priority 1 — Bugs / Breaking Issues

### 1. Wrong API Response Path (Silent Empty Data)

| File | Our Repo (wrong) | Prod (correct) |
|------|-----------------|----------------|
| `NFASOBEventBox.js` | `res?.data?.result` | `res?.data` |
| `NFAQuestionScreen.js` | `res?.data?.result` | `res?.data \|\| []` |

`NFAQuestionScreen.js` crash: `setQuestionList([...undefined])` → `TypeError` on every question tab load.

### 2. Invalid Import in `NFAReport.js`
```js
import { use } from 'react' // ❌ invalid — causes runtime error
```

### 3. `NoteForApproval.js` — Tab Advance After Save Wrong
- **Tab 2 → Tab 3**: Our repo advances unconditionally. Prod checks `res == true` from SOB save first.
- **After Update save**: Our repo stays on current tab. Prod advances to next tab.

### 4. `NFASOBEventBoxRFQ.js` — Version Fallback Missing
Our repo: `Version: props.Version ?? 1`
Prod: `Version: props.eventId != null ? props.Version : props.nfaEventVersion ?? 1`
Causes wrong version sent when NFA hasn't been saved yet.

### 5. `FilterNFACell.js` — Wrong Search API Endpoint + `debugger` Statement
- Our repo calls `/api/NFAManage/FindAdvnceSearch` (old endpoint)
- Prod calls `/api/NFAManage/Find?pageNumber=1&pageSize=...` (unified)
- Our repo has a `debugger;` statement left in `onSubmit` — will pause in devtools

### 6. `NFASOBEventBoxRFQ.js` — Delete Item Wrong Endpoint
- Our repo: `POST /api/NFAItemService/Delete` with `{ id: itemId }` in body
- Prod: `POST /api/NFAItemService/${itemId}/DeleteAll` with empty body

### 7. `utils/common/utility.js` — `getNFAManageFind` Missing Pagination Params
Our repo signature: `(data, atoken)` — no `pageNumber`/`pageSize`, server-side pagination broken.

---

## 🟠 Priority 2 — Missing Features

### 8. `downloadNfaPdf` — Entirely Absent from Our Repo Utils
Function exists in prod's `utils/common/index.js`. Calls `api/NFAManage/{id}/generatePdf`, triggers browser download. "Download PDF" in NFAReport is non-functional.

### 9. `NFASOBEventBoxRFQ.js` — Several Missing Capabilities
- **`handleRemoveSupplier`**: completely absent — no way to remove a supplier from SOB
- **`handleSaveUpdateItem`**: prod has separate update flow with allocation reset; our repo has none
- **`currency` state + `props.updateCurrency` callback**: our repo never syncs currency selection to parent form
- **`props.updateAmount` call**: our `handleTotalAmount` only sets local state; prod also calls `props.updateAmount(total)` to sync total to parent form
- **`saveSOBDetails` validation**: prod validates each item has at least one supplier with non-zero allocation before saving; our repo has no such guard

### 10. `NFASOBEventBoxAuction.js` + `NFASOBEventBoxPR.js` — Remarks Column Missing
Both prod versions have:
- `handleRemarksChange(vendorId, value)` function
- "Remarks" column in vendor table
- `remarks` field included in `saveSOBDetails` payload

Both missing from our repo.

### 11. `NFASOBItemWise.js` — Delete Item Feature Missing
Prod has `handleDeleteItem`, `deleteLoading` state, trash icon, and an Actions column in the table.
Our repo has no delete capability in this component.

### 12. `ManageNFA.js` — Template Clone Workflow Missing
- `getTemplateList()` — fetches from `/api/EventTemplate/Find`
- `handleTemplateNavigation()` — calls `POST /api/NFAManage/NFATemplateClone`, then navigates to new NFA
- UI: template picker dropdown in toolbar

### 13. `ManageNFA.js` — Date-Range Filter Logic Missing
- `applyDateRangeFilter()` using `dayjs`
- Full `handleFilterList(res, criteria, pageMetadata, queryParams)` — prod version handles filter mode, stores query params, applies date filter client-side
- `filterMode`, `totalCount`, `filterQueryParams` states absent
- `FilterNFACell.js` in our repo also missing `EventCode` filter field and `setFilterValues` prop

### 14. `NoteForApproval.js` — "Save as Templates" Dialog JSX Missing
`handleClickOpen` / `open` state exist but the MUI Dialog JSX is absent. MUI `Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle` not even imported.

---

## 🟡 Priority 3 — Error Handling (Silent Failures)

### 15. No `getApiErrorMessage` Error Toasts
All these files use `.then()` chains with no error feedback to the user:
- `NoteForApproval.js` — all async functions (`getUserRoleRights`, `pullgetNFAManageFind`, `handleRFQSubmit`, `handleCancelNFAModal`, and more)
- `AddUpdateException.js`, `AddUpdateProject.js`, `AddUpdateSpend.js` — entire `onSubmit` and all data fetch calls
- `NFASOBEventBoxRFQ.js` — `saveSOBDetails`, `getSOBDetails`
- `NFAQuestionScreen.js` — `getQuestionList`, `saveQuestion`

Prod wraps all of these in try/catch/finally with `toast.error(getApiErrorMessage(error))`.

---

## 🔵 Priority 4 — Dead Code to Remove from Our Repo

### `NoteForApproval.js`
**Unused state:** `preview`, `showInputFieldText`, `searchQuery`, `EventHeaderDetails`

**Unused imports:** `SOB`, `NFADetail`, `EventQuestionScreen`, `NFASOBEventBoxAuction`, `NFASOBEventBoxPR`, `DecimalValueRegEx`, `getFileName`, `uploadFilesOnAzure2`, `UOMMasterList`, `checkFields`, `downloadFilesOnAzure`, `renderHtmlAsText`, `checkUTC`, `current` from `@reduxjs/toolkit`, `forwardRef`, bare `api`

### `NFAReport.js`
**Unused imports:** `formatDateViaLocale2`, `formatDateViaLocalet`, `formatDateViaTime`, `formatDateViaTimeZone`, `formattimeoption`, `renderHtmlAsText`, `getNFAManageFindById`, `findStringByValueFromArray`
**Duplicate state:** `loading` (duplicate of `isLoading`)

---

## ✅ Files Confirmed Identical / Not Missing Anything
`SOB.js`, `NFADetail.js`, `NFATempData.js`, `NFASOBEventBoxAuction.js` (structure identical — only remarks column missing, covered above)

## ✅ Files Where Our Repo Has More Code (Our Additions — OK)
`NFAQuestionScreenList.js`, `NFAQuestionTabCell.js`, `NFAGeneralPreview.js`, `AddNFAQuestionFromCell.js` — these have more code than prod; represent work done in our repo not yet in prod.
