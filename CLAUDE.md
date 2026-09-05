# ProcurEngine — Project Reference (CLAUDE.md)

## What This Project Is

**ProcurEngine** is a multi-tenant B2B procurement SaaS platform built as a React 18 SPA. It manages the full procurement lifecycle: Purchase Requests → RFQ/RFI → Auctions → Purchase Orders, with approval workflows, supplier management, and analytics. Production URLs follow the subdomain-per-tenant pattern: `buyer.procurengine.io`, `supplier.procurengine.io`.

---

## Tech Stack

| Concern | Library/Tool |
|---|---|
| Framework | React 18, Create React App |
| Routing | React Router v6 |
| Primary UI | MUI v5 (`@mui/material`, `@mui/x-data-grid`, `@mui/x-date-pickers`) |
| Secondary UI | Bootstrap 5 + React-Bootstrap |
| Icons | React Icons (`react-icons`), MUI Icons, FontAwesome |
| State | Context API + `useReducer` (custom `StateProvider`) |
| Forms | Formik + Yup |
| Rich Text | CKEditor 4 (`ckeditor4-react`), CKEditor 5 (`ckeditor5`), React Quill, Draft.js |
| Data Tables | MUI X DataGrid, TanStack Table v8, react-table v7 |
| Charts | Highcharts (`highcharts-react-official`), Recharts |
| HTTP | Axios via custom `ApiClient` (`src/Apiclient.js`) and `FastApiClient` |
| Auth | JWT + AES encryption (CryptoJS) stored in cookies |
| Real-time | SignalR (`@microsoft/signalr-protocol-msgpack`) |
| Export | ExcelJS, jsPDF, html2canvas, file-saver, xlsx |
| Analytics | react-pivottable |
| Notifications | react-toastify (top-center, limit 1, 2s autoclose) |
| Drag & Drop | react-dnd, react-beautiful-dnd |
| Animation | react-fast-marquee |
| Styling | Plain CSS files + CSS Modules (ComparisonScreen) + styled-components (layout only) |

---

## Project Structure

```
src/
├── App.js                      # Root: token init, ThemeProvider, ToastContainer
├── theme.js                    # MUI theme (primary: #2A68D3)
├── config.js                   # App config
├── Apiclient.js                # Main REST client (wraps Axios)
├── FastApiClient.js            # Secondary API client
├── routes/
│   ├── index.js                # Combines Login + Main routes
│   ├── LoginRoutes.js          # Public routes under MinimalLayout
│   ├── MainRoutes.js           # Auth-protected routes under MainLayout
│   └── claimlist.js            # Permission claim constants per module
├── store/
│   ├── index.js                # useStateValue hook export
│   ├── StateProvider.jsx       # Context provider wrapping
│   └── reducer.js              # All action types + reducer
├── layout/
│   ├── MainLayout/
│   │   ├── index.js            # Shell: Header + LeftMenu + <Outlet />
│   │   ├── Header.js           # Fixed top bar (logo, user menu, notifications)
│   │   └── LeftMenu.js        # Fixed icon-only sidebar (84px wide)
│   └── MinimalLayout/
│       └── index.js            # Bare layout for login/public pages
├── pages/
│   ├── Login/                  # Login, ChangePassword, UserChangePassword
│   ├── Dashboard/              # KPI dashboard
│   ├── Configuration/
│   │   ├── PurchaseRequest/    # PR create/manage
│   │   ├── RequestForQuotation/# RFQ create/manage/compare/reports
│   │   ├── RequestForInformation/ # RFI create/manage/compare
│   │   ├── Auctions/           # Auction create/manage/control/graphs
│   │   └── NFA/                # Note For Approval workflow
│   ├── POOrders/               # Purchase Order list + detail
│   ├── Manage/ManageParticipants/ # Supplier register/invite
│   ├── CommunucationHub/       # Query list + message threads
│   ├── Reports/                # RFQ/BID/NFA/PO/TAT/Invoice reports
│   ├── Settings/               # Org, Users, Roles, Workflows, Templates, etc.
│   ├── MasterData/             # Customer setup
│   └── BaseCells/              # Shared cell/widget components
├── components/
│   ├── Event/ComparisonScreen/ # Supplier quote comparison (CSS Modules)
│   ├── Analytics/              # Pivot table dashboard
│   ├── PermissionAware/        # PermissionWrapper, PermissionAwareComponents
│   ├── Reports/                # RFQ action drawer, supplier technical responses
│   ├── Loader/                 # LockLoader
│   ├── Skeleton/               # gridSkeleton, listSkeleton
│   ├── Svg/                    # MultiCurrencySVG
│   ├── chatbot.js              # Embedded chatbot widget
│   ├── chatbotfullscreen.js    # Full-screen chatbot page
│   ├── approvalflow.js         # Approval chain component
│   ├── alertpopup.js           # Alert dialog
│   ├── customTable.js          # Reusable table wrapper
│   └── customerlogo.js         # Tenant logo display
├── contexts/
│   └── PermissionContext.js    # Claims-based permission context
├── hooks/
│   ├── useInternetChecker.js   # Offline detection
│   └── useSleepDetector.js     # Sleep/wake detection
├── assets/
│   ├── css/                    # All global CSS files (see Styling section)
│   ├── images/                 # pelogo, chatbotlogo, Jakson_Logo, aalogo
│   └── samplefiles/            # bulkfile.xlsx (template)
└── utils/                      # common/, purchaseRequest, apiConstants, users, etc.
```

---

## UI Structure & Layouts

### Shell Layout (authenticated)

```
┌─────────────────────────────────────────────────────────┐
│  Header (.header .pe-header)  — fixed, 70px tall        │
│  [Logo] ──────────── [Timezone] [Filter] [Msgs] [User]  │
├────────┬────────────────────────────────────────────────┤
│ Left   │  #mainRightContant .pe-main-content            │
│ Menu   │  (margin-left: 84px, margin-top: 72px)         │
│ 84px   │                                                │
│ fixed  │  <Outlet /> — page content renders here        │
│ dark   │                                                │
│ sidebar│                                                │
└────────┴────────────────────────────────────────────────┘
```

- **`pe-shell`** — outermost wrapper, `min-height: 100vh`, `background: #f3f4f6`
- **`pe-header`** — fixed top bar, `height: 72px`, `left: 84px`, `width: calc(100% - 84px)`
- **`pe-sidebar`** — fixed left, `width: 84px`, `background: #03172b` (dark navy)
- **`pe-main-content`** — content area with `margin-left: 84px`, `margin-top: 72px`, `padding: 16px`

### Login Layout

Minimal layout: just the page component centered, no sidebar/header.

---

## Global State (Context + Reducer)

State lives in `src/store/` and is accessed via `useStateValue()`:

| Key | Purpose |
|---|---|
| `atoken` | JWT access token (null = logged out) |
| `rtoken` | Refresh token |
| `customerid` | Tenant customer ID |
| `customersuffix` | Tenant slug (e.g. `"buyer"`) |
| `userDetail` | Logged-in user object (name, email, roleId, timeZone) |
| `menuList` | Dynamic sidebar menu from API |
| `roleClaims` | Permission claims array |
| `logincount` | 0 = force password change on first login |
| `eventId/Type/Code` | Active procurement event context |
| `bidtype` | Active auction bid type |
| `CommId` | Active communication thread ID |
| `dashboardFilter` | Dashboard date filter (default: "Last 7 days") |
| `messageCount` | Unread message badge count |
| `isNotificationOpen` | Notification drawer open state |

---

## Styling Approach

The project uses **three styling methods simultaneously**:

### 1. Global CSS files (`src/assets/css/`)

Each concern has its own file. They are imported in component files directly.

| File | Covers |
|---|---|
| `base.css` | CSS variables (`--vz-*`), typography helpers, layout utilities |
| `design-system.css` | CSS variables (`--pe-*`), shell/header/sidebar layout classes, new UI buttons/icon-buttons/badges |
| `manage-rfq-v2.css` | **New UI standard** — page shell, toolbar, table wrapper, drawer, tabs, empty state |
| `rfq-detail-v2.css` | **New UI standard** — detail page layout, sections, field labels, status badges |
| `header.css` | Header, user info, dropdown, marquee |
| `sidebar.css` | Sidebar menu items, dropdown behavior |
| `datagrid.css` | Table classes, data grid scrolling, bid table, responsive breakpoints |
| `event.css` | Event/sourcing page layouts |
| `rfq-modern.css` | RFQ-specific modern styling |
| `supplierquotation.css` | Supplier quote form |
| `approvalflow.css` | Approval workflow steps |
| `communication.css` | Communication hub threads |
| `configuremodule.css` | Configuration module pages |
| `nfa.css` | NFA (Note For Approval) pages |
| `querylist.css` | Query list page |
| `registerSuppliers.css` | Supplier registration |
| `detailsreport.css` | Details report page |
| `role.css` | Roles/security page |
| `userprofile.css` | User profile page |
| `customerlogo.css` | Customer logo display |
| `marque.css` | Subscription expiry marquee banner |
| `lockloader.css` | Lock/loading overlay |
| `scrollbar.css` | Custom scrollbar styles |
| `ckeditor5-fixes.css` | CKEditor 5 override fixes |

### 2. CSS Modules

Used only in `src/components/Event/ComparisonScreen/`:
- `ComparativeAnalysis.module.css`
- `ComparisonTable.module.css`
- `ExecutiveSummary.module.css`
- `ItemLevelDetails.module.css`
- `PackageLevelSummary.module.css`
- `PriceTrendChart.module.css`
- `UnifiedComparisonTable.module.css`

### 3. Styled Components

Used only in `src/layout/MainLayout/index.js` for the shell container (largely unused; the actual layout uses the `pe-*` CSS classes instead).

---

## CSS Variable Conventions

Two parallel variable systems exist (both in use):

**`--vz-*` system** (base.css — older Velzon-derived):
- `--vz-primary-color: #1e74ca` — main brand blue
- `--vz-body-bg: #fafafa`
- `--vz-heading-color: #111`
- `--vz-light-gray: #f6f9fe`
- `--vg-bg-grey: #eaeaea`
- `--radius-default: 16px`
- `--font-base: 14px`, `--font-small: 12px`, `--font-medium: 16px`, `--font-large: 18px`

**`--pe-*` system** (design-system.css — newer ProcurEngine system):
- `--pe-primary: #1976d2`
- `--pe-bg: #f3f4f6`
- `--pe-card: #ffffff`
- `--pe-sidebar: #03172b`
- `--pe-sidebar-accent: #0d2e53`
- `--pe-border: #dfe3e8`
- `--pe-text: #1f2937`
- `--pe-muted: #6b7280`
- `--pe-success: #49a052`
- `--pe-danger: #b8232f`
- `--pe-radius: 14px`

**MUI theme** (`src/theme.js`):
- `primary.main: #2A68D3`
- `typography.fontSize: 13`

> Note: Three slightly different blues exist: `#1e74ca` (CSS var), `#1976d2` (pe- system), `#2A68D3` (MUI theme). They are not unified.

---

## Key CSS Class Conventions

### Layout
- `.pe-shell` — app root
- `.pe-header` — fixed header
- `.pe-sidebar` — fixed left nav
- `.pe-main-content` — scrollable page content area
- `.pe-card` — white card with border-radius

### Typography / Utilities
- `.boldText` — `font-weight: 500`
- `.textDefault` / `.textMedium` / `.textLarge` / `.textXsmall` — font size helpers
- `.f14.fw500` — inline utility (font-size 14, font-weight 500)
- `.orange-text` — `#f87100`

### Tables (New UI — use these)
- `.rfq-v2-card` — page card wrapper (border-radius 12px, border 1px #e5e7eb)
- `.rfq-v2-table-wrapper` — table container (`height: calc(100vh - 260px)`)
- `<PETable>` + `<PETableToolbar>` — canonical table + toolbar components

### Tables (Legacy — old UI only, DO NOT use in new modules)
- `.itemstable` — old sticky dark-header table
- `.thead-sticky` — old `#343a40` sticky header
- `.data-grid-scrollable` / `.data-grid-wrapper` — old DataGrid height wrappers
- `.custom-fix` / `.custom-table-fix` / `.table-fix` / `.custom-manage-fix` — old vh-based scroll areas
- `.productTd` / `.productTdDesc` — old truncated text cells
- `.headBidTable` / `.cellBidtable` — old auction table styles

### Auction-specific
- `.auction-table-fix` — `87vh` flex layout
- `.auctionControl` — `70vh` scrollable control panel
- `.cardAuction` — left border accent card
- `.bidButton` — primary-colored bid action button

### Header
- `.header` / `.headerContainer` / `.headerItem` — header structure
- `.user-info-circle` — orange avatar circle (`#f87100`)
- `.user-info-name` / `.user-info-role` — user details typography
- `.sidebaraccmenu` — icon menu button (56×56, border-radius 12px)

### Forms
- `.formulaEditor` — formula/text input with `#d7d7d7` border
- `.auctionEditor` — borderless auction input

---

## Authentication & Multi-Tenancy

- Tokens stored in AES-encrypted cookies with `.procurengine.io` domain (shared across subdomains)
- Cookie names: `patkn` (access), `prtkn` (refresh), `pcid` (customer), `pcsu` (suffix), `pcuserDetail`, `pcutz`, `pcudc`, `pcbt`, `pcmlDetail`, `pcloginCount`
- Cookie TTL: 24h (`maxAge: 86400`)
- `logincount === 0` forces password change before entering the app
- Cross-tab logout via `BroadcastChannel('auth_logout')`
- Customer mismatch (logged into `buyer`, visiting `supplier`) shows a switch-account dialog

---

## Core Modules & Routes

| Module | Route | Page |
|---|---|---|
| Dashboard | `/app` | `pages/Dashboard/Dashboard` |
| Purchase Request list | `/configuration/manage-PR` | `ManagePR` |
| Purchase Request detail | `/configuration/manage-pr/:pageSlug` | `PurchaseRequest` |
| RFQ list | `/configuration/manage-rfq` | `ManageRFQ` |
| RFQ detail | `/configuration/manage-rfq/:pageSlug` | `RequestForQuotation` |
| RFQ comparison | `/configuration/manage-rfq/comparative-rfq/:pageSlug` | `ERFQComparative` |
| RFQ supplier quotation | `/configuration/manage-rfq/supplier-quotation` | `EERFQComparative` |
| RFI list | `/configuration/manage-rfi` | `ManageRFI` |
| RFI detail | `/configuration/manage-rfi/:pageSlug` | `RequestForInformation` |
| Auction list | `/configuration/manage-auction` | `ManageBid` |
| Auction detail | `/configuration/manage-auction/:pageSlug` | `Auctions` |
| Auction control | `/configuration/auction-control/:pageSlug` | `AuctionControl` |
| NFA list | `/configuration/manage-nfa` | `ManageNFA` |
| NFA detail | `/configuration/manage-nfa/:pageSlug` | `NoteForApproval` |
| PO list | `/PO/POlist` | `POOrderList` |
| PO detail | `/purchase-order/:poId/:pageSlug` | `PurchaseOrder` |
| Supplier management | `/manage/manage-participants` | `ManageParticipants` |
| Register supplier | `/manage/manage-participants/register-participants` | `RegisterSuppliers` |
| Communication Hub | `/query-list` | `QueryList` |
| Reports | `/reports/RFQSummaryReport` etc. | Various report pages |
| Org Setup | `/settings/OrgSetup` | `OrganisationProfile` |
| User Management | `/settings/manage-user` | `UserManage` |
| Roles | `/settings/security` | `RolesTable` |
| Workflows | `/settings/manage-workflows` | `ManageWorkflows` |
| Email templates | `/settings/email-master` | `ManageEmailTemplate` |
| Question library | `/settings/question-library` | `QuestionLibrary` |
| Document library | `/settings/documents-library` | `DocumentsLibraryList` |
| Dynamic fields | `/settings/dynamic-fields` | `DynamicFieldsSettings` |
| Commercial terms | `/settings/commercial-terms` | `CommercialTerms` |
| Delegation | `/settings/manage-delegate` | `Delegation` |
| Analytics | `/test` | `PivotTableDashboard` |
| Chatbot | `/procurengine/chatbot` | `ChatbotFullScreen` |

---

## Shared/Reusable Components

### BaseCells (`src/pages/BaseCells/`)
Small cell components used inside data tables and forms:
- `ApprovalBox`, `EventApprovalBoxRFQ`, `eventapprovalbox` — approval action UI
- `SelectApprovalsCell`, `SelectQuestionCell` — dropdown cell selectors
- `EventQuestionCell`, `EventQuestionTable`, `QuestionTabCell` — question management cells
- `DateTimePickerCell` — date/time picker cell
- `TextFieldCell`, `TableDCell` — editable text/table cells
- `RulesCell` — configurable rules cell
- `HistoryCell` — audit/history view cell
- `FilterAuctionCell`, `FilterRFQCell`, `FilterCustomerCell` — filter cell components (used in PETableToolbar `advFilterPanel`)
- `approvalworkflow`, `attachmentworkflow` — workflow step components
- `editortemplate` — rich text editor wrapper
- `CkEditor` — CKEditor integration

### New UI Components (`src/components/` — use in all revamped modules)
- `PEModal.js` — standard modal/dialog (wraps MUI Dialog with `pe-modal-*` classes; props: `open`, `onClose`, `size`, `title`, `footer`, `hideCloseButton`)
- `StatusBadge.js` — color-mapped status badge (`<StatusBadge status={row.stage} />`)
- `CommonBottomDrawer.js` — bottom slide-up drawer (`open`, `onClose`, `title`, `actions`, `sectionStyle`, `bodyStyle`)
- `RFQ/PETable.js` — standard data table wrapper (replaces raw DataGrid)
- `RFQ/PETableToolbar.js` — toolbar with search/filter/columns/density/export flags

### Shared Components (`src/components/`)
- `approvalflow.js` — multi-level approval chain UI
- `alertpopup.js` — legacy confirmation/alert dialog (use PEModal for new UI)
- `customTable.js` — reusable HTML table wrapper (legacy)
- `customerlogo.js` — tenant logo with fallback
- `chatbot.js` / `chatbotfullscreen.js` — AI chatbot widget
- `RichTextEditor.js` — rich text editor abstraction
- `SQInvitationAll.js` — supplier quotation invitation
- `backbutton.js` — back navigation button (legacy; use `.rfq-v2-breadcrumb` in new UI)
- `whitetooltip.js` — white-background MUI tooltip
- `NoRecordCell.js` — empty state cell
- `NotAllowed.js` — permission denied page
- `NoInternet.js` — offline state page
- `ScrollTop.js` — scroll-to-top on route change
- `Skeleton/gridSkeleton.js`, `listSkeleton.js` — loading skeletons
- `Loader/LockLoader.js` — full-page lock loading overlay

### Permission System (`src/components/PermissionAware/`)
- `PermissionContext.js` — context providing claims array
- `PermissionWrapper.js` — hides children if claim missing
- `PermissionAwareComponents.js` — pre-wrapped MUI components

### Event Comparison Screen (`src/components/Event/ComparisonScreen/`)
Standalone comparison module with its own CSS Modules:
- `ComparativeAnalysis` — top-level comparison orchestrator
- `UnifiedComparisonTable` — unified technical + commercial table
- `CommercialComparative` / `TechnicalComparative` — split views
- `ExecutiveSummary` — summary card
- `ItemLevelDetails` / `PackageLevelSummary` — drill-down views
- `ComparisonTable` — base comparison table
- `HighestLowestPriceChart`, `InvitedParticipatedChart`, `PriceTrendChart`, `SavingsLineChart`, `SupplierPriceChart` — Highcharts/Recharts visualizations
- `useComparisonTableData` — data processing hook

---

## Main User Flows

### Buyer Flow
1. Login → Dashboard (KPIs, date filter)
2. Create **Purchase Request** → add items, questions, submit for approval
3. Create **RFQ** from PR → set commercial terms, add products/questions → invite suppliers
4. Suppliers submit quotes → view **Comparative Analysis** (technical + commercial tabs)
5. Award supplier → generate **Purchase Order**
6. Create **NFA** for internal spend approval if required
7. Alternatively, run a live **Auction** → real-time bidding with graphs → auction control panel
8. View **Reports** (savings, TAT, summary, detailed)

### Supplier Flow
- Access via `supplier.procurengine.io`
- Receive invitation notifications
- Submit quotations / RFI responses
- Participate in auctions (live bidding)
- View sealed quote status

### Admin Flow
- Configure org profile, user roles & permissions
- Set up email templates, question library, document library
- Define approval workflows, stages, grades
- Manage delegation rules

---

## API Client Usage

```js
// Standard usage pattern
const res = await new ApiClient(customersuffix).getres('/api/endpoint', atoken);
const res = await new ApiClient().postres('/api/endpoint', payload, atoken);
```

The `ApiClient` in `src/Apiclient.js` wraps Axios and attaches the JWT bearer token. A separate `FastApiClient` handles a secondary backend (likely Python FastAPI).

---

## Known Issues / Notes

- Three different primary blues in use (`#1e74ca`, `#1976d2`, `#2A68D3`) — not unified.
- `default` case in the reducer appears before some cases due to misplaced placement (`logincount` and below actions are after `default`, meaning they may never execute).
- Several commented-out route blocks for old auction types (FOA, RA, FA, CA, FFA, FRA) exist in `MainRoutes.js` — these were replaced by a unified `/configuration/manage-auction` route.
- `console.log` statements present in `Header.js` and other files (development artifacts).
- `useSleepDetector` and `useInternetChecker` hooks are imported but commented out in `App.js`.

---

## ⚠️ MANDATORY: UI Work Protocol

**ANY task involving UI — new component, revamp, drawer, form, table, page — MUST follow this protocol exactly. No exceptions.**

### Step 1 — Read UI_CONTEXT.md FIRST (non-negotiable)

Before writing a single line of JSX for any UI task:

1. Read `UI_CONTEXT.md` (project root) fully
2. Identify which sections apply to the task (drawers? forms? tables? tabs?)
3. Extract the exact classNames, patterns, and don'ts relevant to the task
4. Only then start implementing

### Step 2 — Use the correct reference module, not memory

Do NOT rely on memory of what the UI "should look like." Always read the actual source of an already-correct module:

| Task type | Read this file |
|---|---|
| Drawer with form | `src/pages/MasterData/CustomerSetup/SMTPDrawer.js` |
| Page with table + toolbar | `src/pages/MasterData/CustomerSetup/CustomerListV2.js` |
| Page with tabs + drawer | `src/pages/Configuration/RequestForQuotation/ManageRFQV2.js` |
| Modal / Dialog | `src/components/PEModal.js` |
| Status badge | `src/components/StatusBadge.js` |
| Toolbar | `src/components/RFQ/PETableToolbar.js` |

Copy the exact className patterns from these files — do not invent or paraphrase.

### Step 3 — Known traps (confirmed mistakes from actual sessions)

These specific patterns have been written incorrectly before. Check explicitly:

| ❌ Wrong | ✅ Correct |
|---|---|
| `<TextFieldCell label="Host Name *" />` | `<label className="pe-field-label">Host Name *</label>` above `<TextFieldCell />` |
| Reset/Submit buttons at bottom of form inside drawer | Reset/Submit in `actions` prop of `CommonBottomDrawer` |
| `<button type="submit">` inside `<form>` in drawer body | `<button type="submit" form="form-id">` in `actions` + `<form id="form-id">` in body |
| `rfq-dv2-workflow-tabs` without width override in drawer | Add `style={{ width: 'fit-content' }}` on container |
| `rfq-dv2-workflow-tab` with default flex in drawer | Add `style={{ flex: 'none', padding: '0 20px' }}` on each tab |
| `<MUI Drawer>` (right-slide) | `<CommonBottomDrawer>` (bottom slide-up) |
| Raw `<Dialog>` + `<DialogTitle>` + `pe-modal-*` assembled manually | `<PEModal title="..." footer={...}>` component |
| `pe-btn pe-btn--primary` in drawer header | `rfq-v2-event-btn rfq-v2-event-btn-primary` in drawer header |

### Step 4 — Self-verify before finishing

After implementation, read your own JSX and check each item:

```
□ Every input has <label className="pe-field-label"> above it — no label prop on TextFieldCell
□ Drawer Reset/Submit are in actions prop — not inside form body
□ Form has id="..." and submit button has form="..." if submit is outside form
□ Tab container has style={{ width: 'fit-content' }} if inside drawer
□ CommonBottomDrawer has sectionStyle with display:flex, flexDirection:column
□ Modal/Dialog uses <PEModal> — not raw MUI Dialog assembled manually
□ No MUI Drawer, no MUI Tabs, no MUI Button for page actions
□ No Box wrappers inside drawer body
```

If any item fails — fix it before reporting task as complete.
