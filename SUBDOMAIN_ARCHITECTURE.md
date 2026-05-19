# Subdomain Multi-Tenancy Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACCESS LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Production URLs:           Development URLs:                    │
│  ┌─────────────────┐        ┌──────────────────────┐           │
│  │ buyer.          │        │ localhost:3001       │           │
│  │ procurengine.io │        │ /buyer               │           │
│  └────────┬────────┘        └──────────┬───────────┘           │
│           │                            │                         │
│  ┌────────┴────────┐        ┌──────────┴───────────┐           │
│  │ supplier.       │        │ localhost:3001       │           │
│  │ procurengine.io │        │ /supplier            │           │
│  └─────────────────┘        └──────────────────────┘           │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUBDOMAIN HELPER LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  getCustomerIdentifier()                                  │  │
│  │  ─────────────────────────                                │  │
│  │  Priority: Subdomain > Path Parameter                     │  │
│  │                                                            │  │
│  │  Input:  buyer.procurengine.io                           │  │
│  │  Output: 'buyer' ✓                                        │  │
│  │                                                            │  │
│  │  Input:  localhost:3001/agileapt                         │  │
│  │  Output: 'agileapt' ✓                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  getCookieDomain()                                        │  │
│  │  ──────────────────                                       │  │
│  │  Environment Detection                                    │  │
│  │                                                            │  │
│  │  Production:  domain='.procurengine.io' 🌐               │  │
│  │  Development: domain=undefined (localhost) 💻            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN COMPONENT LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐      ┌─────────────┐      ┌──────────────┐    │
│  │  Login.js   │─────▶│ LoginCell.js│─────▶│ API Call     │    │
│  └─────────────┘      └─────────────┘      └──────────────┘    │
│        │                     │                      │            │
│        │ Extract             │ Authenticate         │ Validate   │
│        │ Customer            │ User                 │ Customer   │
│        ▼                     ▼                      ▼            │
│  currentCustomer        Set Cookies           Customer Assets   │
│  = 'buyer'              with domain           (logo, theme)     │
│                         '.procurengine.io'                       │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COOKIE MANAGEMENT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Production Cookies (Shared across subdomains):                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ patkn   = encrypted_access_token                          │  │
│  │ prtkn   = encrypted_refresh_token                         │  │
│  │ pcid    = encrypted_customer_id                           │  │
│  │ pcsu    = customer_suffix                                 │  │
│  │ pcuserDetail = encrypted_user_data                        │  │
│  │                                                            │  │
│  │ Options:                                                   │  │
│  │   domain: '.procurengine.io'  ← Shared! 🔗               │  │
│  │   path: '/'                                                │  │
│  │   maxAge: 86400 (24 hours)                                │  │
│  │   secure: true (HTTPS only)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CROSS-CUSTOMER NAVIGATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Scenario: User logged in as 'buyer' visits 'supplier'          │
│                                                                   │
│  Step 1: User at buyer.procurengine.io (logged in)              │
│          │                                                        │
│          ▼                                                        │
│  Step 2: User clicks link to supplier.procurengine.io           │
│          │                                                        │
│          ▼                                                        │
│  Step 3: System detects mismatch                                 │
│          ┌────────────────────────────────────┐                 │
│          │ isCustomerMismatch('buyer',        │                 │
│          │                    'supplier')     │                 │
│          │ Returns: true ⚠️                   │                 │
│          └────────────────────────────────────┘                 │
│          │                                                        │
│          ▼                                                        │
│  Step 4: Show confirmation dialog                                │
│          ┌────────────────────────────────────┐                 │
│          │ "You are currently logged in as   │                 │
│          │  buyer. Switch to supplier?"      │                 │
│          │                                    │                 │
│          │  [Cancel]  [Switch Account]       │                 │
│          └────────────────────────────────────┘                 │
│          │                                                        │
│          ▼                                                        │
│  Step 5: User confirms → Logout from 'buyer'                    │
│          │                                                        │
│          ▼                                                        │
│  Step 6: Redirect to supplier.procurengine.io/login             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘


## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. User visits URL
   buyer.procurengine.io
        │
        ▼
2. Extract customer identifier
   getCustomerIdentifier() → 'buyer'
        │
        ▼
3. Fetch customer configuration
   GET /api/customer/assets?suffix=buyer
        │
        ▼
4. Validate customer
   ┌─ Customer exists? ─┐
   │                     │
   Yes                  No
   │                     │
   │                     ▼
   │              Show 404 error
   │              "Customer not found"
   ▼
5. Store customer info
   Redux: SET_CUSTOMERSUFFIX → 'buyer'
        │
        ▼
6. User enters credentials
   email: user@example.com
   password: ********
        │
        ▼
7. Login API call
   POST /api/login
   { email, password, customerId }
        │
        ▼
8. Receive tokens
   { accessToken, refreshToken, userDetail }
        │
        ▼
9. Encrypt and store tokens
   Crypto: encrypt(accessToken)
        │
        ▼
10. Set cookies with domain
    getCookieDomain() → '.procurengine.io'
    setCookie('patkn', token, {
        domain: '.procurengine.io',
        path: '/',
        maxAge: 86400
    })
        │
        ▼
11. Broadcast login event
    BroadcastChannel → 'auth_login'
        │
        ▼
12. Redirect to dashboard
    navigate('/app')
        │
        ▼
13. ✓ User logged in successfully!
```

## Cookie Scope Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                 COOKIE DOMAIN HIERARCHY                          │
└─────────────────────────────────────────────────────────────────┘

                    procurengine.io
                    domain: '.procurengine.io' 🍪
                           │
           ┌───────────────┴───────────────┐
           │                               │
    buyer.procurengine.io        supplier.procurengine.io
    Can access cookies! ✓        Can access cookies! ✓
           │                               │
    ┌──────┴──────┐                ┌──────┴──────┐
    │ patkn       │                │ patkn       │
    │ prtkn       │                │ prtkn       │
    │ pcid        │                │ pcid        │
    └─────────────┘                └─────────────┘
         SAME COOKIES SHARED!

But different customer data:
- buyer:    customerId=1, suffix='buyer'
- supplier: customerId=2, suffix='supplier'

When mismatch detected → Logout required!
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      REDUX STATE FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Initial State:
┌─────────────────────┐
│ customersuffix: null│
│ atoken: null        │
│ customerid: null    │
│ userDetail: []      │
└─────────────────────┘
        │
        ▼ User visits buyer.procurengine.io
        │
┌───────────────────────────────────┐
│ dispatch({                        │
│   type: SET_CUSTOMERSUFFIX,      │
│   value: 'buyer'                 │
│ })                                │
└───────────────────────────────────┘
        │
        ▼ User logs in
        │
┌───────────────────────────────────┐
│ dispatch({                        │
│   type: SET_ATOKEN,              │
│   value: 'eyJhbG...'             │
│ })                                │
└───────────────────────────────────┘
        │
        ▼
┌─────────────────────┐
│ customersuffix: 'buyer'│
│ atoken: 'eyJhbG...'   │
│ customerid: 123       │
│ userDetail: {...}     │
└─────────────────────┘

When user visits supplier.procurengine.io:
┌─────────────────────────────────────┐
│ Current state: customersuffix='buyer'│
│ New URL: 'supplier'                  │
│                                      │
│ if (isCustomerMismatch) {           │
│   Show logout dialog                 │
│ }                                    │
└─────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING SCENARIOS                      │
└─────────────────────────────────────────────────────────────────┘

Scenario 1: Invalid Customer
   User visits: invalid.procurengine.io
        │
        ▼ getCustomerAssets({ suffix: 'invalid' })
        │
        ▼ API returns: 0 or null
        │
        ▼ Show error
   ┌────────────────────────────────┐
   │ ❌ Customer not found          │
   │ Please check the URL           │
   └────────────────────────────────┘
        │
        ▼ navigate('/404')

Scenario 2: Network Error
   User visits: buyer.procurengine.io
        │
        ▼ getCustomerAssets() fails
        │
        ▼ catch(error)
   ┌────────────────────────────────┐
   │ ❌ Failed to load customer    │
   │ configuration                  │
   └────────────────────────────────┘
        │
        ▼ navigate('/404')

Scenario 3: Customer Mismatch
   Logged in as 'buyer', visit 'supplier'
        │
        ▼ isCustomerMismatch('buyer', 'supplier')
        │
        ▼ true
   ┌────────────────────────────────┐
   │ ⚠️  Confirm Logout             │
   │ Switch to different customer?  │
   │ [No] [Yes]                     │
   └────────────────────────────────┘
        │
        ▼ User clicks Yes
        │
        ▼ logout() → Clear cookies
        │
        ▼ Redirect to supplier login
```

---

**For more details, see:**
- `/SUBDOMAIN_MULTI_TENANCY.md` - Complete documentation
- `/SUBDOMAIN_QUICKSTART.md` - Quick start guide
- `/SUBDOMAIN_IMPLEMENTATION_SUMMARY.md` - Implementation details
