# PE2.0 → PE Migration Notes

## Auction Module Changes

---

### 1. Pause / Resume Modal Buttons

**File:** `StaggerAuction.js`

Pause, Re-open, aur Remove Quote modals mein MUI `Button` ki jagah PE button system use kiya.

- `pe-btn pe-btn--secondary` → Cancel/secondary actions
- `pe-btn pe-btn--primary` → Confirm/primary actions

---

### 2. Duplicate Quote Detection Modal

**File:** `StaggerAuction.js`

Pre-bid submit karte waqt same line item pe same quote value detect karta hai.

- `getDuplicateQuoteGroups()` function added — vendors ke across same price check karta hai per line item
- Submit flow: empty check → duplicate check → API call
- Duplicate milne par modal show hota hai vendor names aur price ke saath
- Group Auction enabled hone par duplicate check skip hota hai

---

### 3. Add New Commercial Term — Bottom Drawer

**Files:** `Auctions.js`, `AuctionCommercialTab.js`

Right-side MUI Drawer ko `CommonBottomDrawer` se replace kiya (RFQ ke drawer ke consistent).

- "Add More" button ab dropdown ke right mein align hota hai (`marginLeft: auto`)
- Button `canEdit` aur `permissionManager.hasPermission(COMMERCIAL_TERMS, CREATE)` se gated hai

---

### 4. Checkbox Grid Alignment (General Tab)

**File:** `AuctionGeneralTab.js`

Group Auction, Quotes in Words, Rank to Vendor, Pre Bid checkboxes ek single CSS Grid (`repeat(3, 1fr)`) mein hain.

- Freight/Formula auction types mein Group Auction hidden hota hai — baaki checkboxes column 1 se start rehte hain (`gridColumn: '1'`)
- Sab rows ka alignment dono conditions (Forward/Reverse vs Freight/Formula) mein consistent hai

---

### 5. Server Time Sync

**File:** `AuctionControl.js`

Countdown timer aur slot check ab server time use karte hain (client clock drift fix).

- Har 5 seconds mein `/api/AuctionParticipation/GetServerTime` call hota hai
- `serverTimeRef` + `performance.now()` se between polls accurate time interpolate hota hai
- `getCurrentServerTime()` → `StaggerAuction` ko bhi pass kiya jaata hai slot timer ke liye

---

### 6. Actual Duration Tracking

**File:** `AuctionControl.js`

Auction ka actual running duration separately track hota hai.

- SignalR `AuctionTimeUpdate` se `actualDuration` store hota hai
- Extension adjust value initialize karte waqt `actualDuration ?? bidDuration` use hota hai

---

### 7. Loading Factor — Endpoint + Payload Fix

**File:** `Auctions.js`

- Endpoint: `AuctionLoadingFactor` → `AuctionLoadingFactorFromRFQ` (correct endpoint)
- Payload mein `factorPerc` field add kiya (percentage loading factor)

---

### 8. BidGeneralPreview — Missing Fields

**File:** `BidGeneralPreview.js`

Preview tab ab Group Auction related fields show karta hai:

- **Group Auction:** Yes (sirf agar enabled ho)
- **Show L1/H1 Package Price:** Yes/No (Forward = H1, others = L1)
- **Extension On L1/H1 Package Breach:** Yes/No (sirf agar showL1BidValue = true ho)

---

### 9. `getApiErrorMessage` Utility

**File:** `utils/common/index.js`

API error responses se meaningful message extract karta hai.

- `error.response.data.Message` → `error.data.message` → `"Something went wrong"` fallback chain
- Auctions.js, AuctionControl.js, StaggerAuction.js ke catch blocks mein hardcoded strings replace kiye

---

### 10. `downloadEventExcelTemplate` Utility

**File:** `utils/common/index.js`, `Auctions.js`

Event-specific Excel template download (generic `downloadExcelTemplate` replace).

- `eventId` bhi pass hota hai query params mein (auction-specific data ke liye)
- Python API (`REACT_APP_APIPYTHON_CALL`) se download hota hai `bulk-download/download-excel` endpoint se
- `X-Tenant` header se multi-tenancy support

---

### 11. Navigation — Open/Running Stage

**File:** `Auctions.js`

Auction Open/Running stage mein automatically standalone AuctionControl page pe redirect hota hai.

- Tab 6 click → `navigate('/configuration/auction-control/:id')`
- Data load hone par stage check → redirect
- Stage transition (e.g. reopen) par bhi redirect
- `?tab=6` query param se bypass possible (manage auction tabs force-open ke liye)
