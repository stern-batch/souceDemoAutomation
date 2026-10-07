# SauceDemo – Test Cases

- **Application:** https://www.saucedemo.com/
- **Environment:** Google Chrome 146 (desktop), https://www.saucedemo.com/, executed 6–7 Oct 2026
- **General precondition for every case:** use a fresh browser window (or Incognito), so no cart or login from a previous run is left over.
- **Summary:** 18 test cases · **12 Pass** · **6 Fail** · all 18 automated as **29 automated tests**

Every test case is automated. The steps below are written so they can also be followed by hand. The tests are split into three suites, so the known-defect tests can never break the main run:

| Suite | Purpose | Test cases | Automated tests | Command | Result today |
|---|---|---|---|---|---|
| **Core** | Original end-to-end and negative tests | 5: TC-01, TC-11, TC-13, TC-14, TC-15 | 5 | `npm test` | ✅ 5 pass |
| **Regression** | Website works correctly; guards against future breakage | 7: TC-02, TC-03, TC-04, TC-06, TC-07, TC-09, TC-12 | 18 | `npm run test:regression` | ✅ 18 pass |
| **Known defect** | Asserts the *correct* behaviour, so it fails while the bug exists | 6: TC-05, TC-08, TC-10, TC-16, TC-17, TC-18 | 6 | `npm run test:defects` | ❌ 6 fail |
| **Total** | | **18** | **29** | `npm run test:everything` | |

**Why 18 test cases make 29 automated tests:** TC-02 checks 5 variations, TC-03 checks 5 variations, TC-06 checks 4 variations. Each variation is a separate automated test, so a failure points to the exact variation that broke. Every other case has exactly one test. Every test name starts with its test case ID.

When a developer fixes a defect, its known-defect test turns green. It can then move into the regression suite.

## Index

| ID | Module | Title | Priority | Suite | Tests | Status | Defect |
|---|---|---|---|---|---|---|---|
| [TC-01](#tc-01) | Login | Locked-out user cannot log in | P1 | Core | 1 | ✅ Pass | — |
| [TC-02](#tc-02) | Login | Login validation messages for missing or wrong credentials | P2 | Regression | 5 | ✅ Pass | — |
| [TC-03](#tc-03) | Session & navigation | Protected pages cannot be opened without logging in | P1 | Regression | 5 | ✅ Pass | — |
| [TC-04](#tc-04) | Session & navigation | Browser Back after logout does not show the Products page | P2 | Regression | 1 | ✅ Pass | — |
| [TC-05](#tc-05) | Session & navigation | Cart is not carried over to a different user after logout | P2 | Known defect | 1 | ❌ Fail | D3 |
| [TC-06](#tc-06) | Catalogue | Products can be sorted by name and price | P2 | Regression | 4 | ✅ Pass | — |
| [TC-07](#tc-07) | Catalogue | Product price is the same on the list and the detail page | P2 | Regression | 1 | ✅ Pass | — |
| [TC-08](#tc-08) | Catalogue | A non-existent product cannot be added to the cart | P3 | Known defect | 1 | ❌ Fail | D5 |
| [TC-09](#tc-09) | Catalogue | Products page fits a mobile screen without horizontal scrolling | P3 | Regression | 1 | ✅ Pass | — |
| [TC-10](#tc-10) | Cart | Reset App State clears the cart and resets all product buttons | P3 | Known defect | 1 | ❌ Fail | D4 |
| [TC-11](#tc-11) | Checkout | Successful purchase of two products with correct totals | P1 | Core | 1 | ✅ Pass | — |
| [TC-12](#tc-12) | Checkout | Totals are correct for three products | P2 | Regression | 1 | ✅ Pass | — |
| [TC-13](#tc-13) | Checkout | Checkout is blocked when First Name is missing | P2 | Core | 1 | ✅ Pass | — |
| [TC-14](#tc-14) | Checkout | Checkout is blocked when Last Name is missing | P2 | Core | 1 | ✅ Pass | — |
| [TC-15](#tc-15) | Checkout | Checkout is blocked when Postal Code is missing | P2 | Core | 1 | ✅ Pass | — |
| [TC-16](#tc-16) | Checkout | Checkout rejects customer details that contain only spaces | P2 | Known defect | 1 | ❌ Fail | D2 |
| [TC-17](#tc-17) | Checkout | Customer information step cannot be skipped by URL | P2 | Known defect | 1 | ❌ Fail | D2 |
| [TC-18](#tc-18) | Checkout | An order cannot be placed with an empty cart | P1 | Known defect | 1 | ❌ Fail | D1 |
| | | **Total** | | | **29** | | |

---

## Login

<a id="tc-01"></a>

### TC-01 – Locked-out user cannot log in

| | |
|---|---|
| **Type** | Negative |
| **Priority** | P1 |
| **Execution** | Automated · Core suite · run with `npm test` |
| **Automated test** | `tests/negative.spec.js › locked-out user is blocked with a clear message and stays on login` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in |
| **Test data** | Username: `locked_out_user` · Password: `secret_sauce` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `locked_out_user`
3. Enter Password `secret_sauce`
4. Click **Login**

**Expected result**

- Error message shown: *Epic sadface: Sorry, this user has been locked out.*
- User stays on the login page
- Products page is not displayed

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-02"></a>

### TC-02 – Login validation messages for missing or wrong credentials

| | |
|---|---|
| **Type** | Negative |
| **Priority** | P2 |
| **Execution** | Automated · Regression suite · run with `npm run test:regression` |
| **Automated test** | `tests/regression/login.spec.js › TC-02 … (4 credential cases + password masked)` |
| **Number of automated tests** | **5**, one per variation: both fields empty; password empty; wrong password; username in different case; password field is masked |
| **Preconditions** | Not logged in |
| **Test data** | See steps |

**Steps**

1. Open https://www.saucedemo.com/
2. Leave both fields empty and click **Login**
3. Enter Username `standard_user`, leave Password empty, click **Login**
4. Enter Username `standard_user`, Password `wrong_password`, click **Login**
5. Enter Username `Standard_User` (different case), Password `secret_sauce`, click **Login**

**Expected result**

- Step 2: *Epic sadface: Username is required*
- Step 3: *Epic sadface: Password is required*
- Steps 4 and 5: *Epic sadface: Username and password do not match any user in this service*
- User is never logged in; password field is masked

**Actual result:** As expected  
**Status:** ✅ Pass

---

## Session & navigation

<a id="tc-03"></a>

### TC-03 – Protected pages cannot be opened without logging in

| | |
|---|---|
| **Type** | Security |
| **Priority** | P1 |
| **Execution** | Automated · Regression suite · run with `npm run test:regression` |
| **Automated test** | `tests/regression/session.spec.js › TC-03 <page> shows the login form instead of the page (5 pages)` |
| **Number of automated tests** | **5**, one per variation: /inventory.html; /cart.html; /checkout-step-one.html; /checkout-step-two.html; /inventory-item.html |
| **Preconditions** | Not logged in (fresh or incognito window) |
| **Test data** | URLs listed in steps |

**Steps**

1. Open https://www.saucedemo.com/inventory.html
2. Open https://www.saucedemo.com/cart.html
3. Open https://www.saucedemo.com/checkout-step-one.html
4. Open https://www.saucedemo.com/checkout-step-two.html
5. Open https://www.saucedemo.com/inventory-item.html?id=4

**Expected result**

- For every URL the login form is shown instead of the page
- Error shown: *Epic sadface: You can only access '<page>' when you are logged in.*

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-04"></a>

### TC-04 – Browser Back after logout does not show the Products page

| | |
|---|---|
| **Type** | Security |
| **Priority** | P2 |
| **Execution** | Automated · Regression suite · run with `npm run test:regression` |
| **Automated test** | `tests/regression/session.spec.js › TC-04 browser Back after logout does not show the Products page` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in |
| **Test data** | `standard_user` / `secret_sauce` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Open the menu (☰) and click **Logout**
5. Click the browser **Back** button

**Expected result**

- Login form is shown with *Epic sadface: You can only access '/inventory.html' when you are logged in.*
- No product data is visible

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-05"></a>

### TC-05 – Cart is not carried over to a different user after logout

| | |
|---|---|
| **Type** | Functional / Privacy |
| **Priority** | P2 |
| **Execution** | Automated · Known defect suite · run with `npm run test:defects` |
| **Automated test** | `tests/defects/known-defects.spec.js › [D3] TC-05 cart is not carried over to a different user after logout` |
| **Number of automated tests** | 1 |
| **Preconditions** | Fresh browser window (no previous SauceDemo data) |
| **Test data** | User A: `standard_user` · User B: `visual_user` · Password: `secret_sauce` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Click **Add to cart** on *Sauce Labs Fleece Jacket*
5. Open the menu (☰) and click **Logout**
6. Log in as `visual_user` / `secret_sauce`
7. Open the cart

**Expected result**

- User B's cart badge is not shown
- User B's cart is empty

**Actual result:** Badge shows **1** and User B's cart contains *Sauce Labs Fleece Jacket* (User A's item)  
**Status:** ❌ Fail · **Defect:** D3 (see `SUBMISSION.md` §3). The automated test fails until this defect is fixed.
  
**Evidence:** `evidence/D3-cart-carried-to-different-user.png`

---

## Catalogue

<a id="tc-06"></a>

### TC-06 – Products can be sorted by name and price

| | |
|---|---|
| **Type** | Functional |
| **Priority** | P2 |
| **Execution** | Automated · Regression suite · run with `npm run test:regression` |
| **Automated test** | `tests/regression/catalogue.spec.js › TC-06 Name (A to Z) / Name (Z to A) / Price (low to high) / Price (high to low)` |
| **Number of automated tests** | **4**, one per variation: Name (A to Z); Name (Z to A); Price (low to high); Price (high to low) |
| **Preconditions** | Not logged in |
| **Test data** | `standard_user` / `secret_sauce` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Select **Name (A to Z)** in the sort dropdown
5. Select **Name (Z to A)**
6. Select **Price (low to high)**
7. Select **Price (high to low)**

**Expected result**

- A to Z: list is alphabetical, first item *Sauce Labs Backpack*
- Z to A: reverse alphabetical, first item *Test.allTheThings() T-Shirt (Red)*
- Low to high: prices ascending, first item *Sauce Labs Onesie* $7.99
- High to low: prices descending, first item *Sauce Labs Fleece Jacket* $49.99

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-07"></a>

### TC-07 – Product price is the same on the list and the detail page

| | |
|---|---|
| **Type** | Functional |
| **Priority** | P2 |
| **Execution** | Automated · Regression suite · run with `npm run test:regression` |
| **Automated test** | `tests/regression/catalogue.spec.js › TC-07 product price is the same on the list and the detail page` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in |
| **Test data** | `standard_user` / `secret_sauce` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Note the price of *Sauce Labs Backpack* on the Products page
5. Click the product name to open its detail page
6. Note the price on the detail page

**Expected result**

- Both prices are **$29.99**

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-08"></a>

### TC-08 – A non-existent product cannot be added to the cart

| | |
|---|---|
| **Type** | Negative / Robustness |
| **Priority** | P3 |
| **Execution** | Automated · Known defect suite · run with `npm run test:defects` |
| **Automated test** | `tests/defects/known-defects.spec.js › [D5] TC-08 a non-existent product cannot be added to the cart` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in; empty cart |
| **Test data** | `standard_user` / `secret_sauce` · URL id `999` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. In the address bar open https://www.saucedemo.com/inventory-item.html?id=999
5. Click **Add to cart**
6. Open the cart
7. Click **Checkout**, enter First Name `A`, Last Name `B`, Postal Code `1`, click **Continue**

**Expected result**

- Invalid product cannot be added (no button or an error)
- Cart badge and cart contents always match
- Checkout overview loads normally

**Actual result:** Page shows *ITEM NOT FOUND* priced *$√-1* with an **Add to cart** button. After adding, badge shows **1** but the cart lists no items. Checkout overview renders a **blank white page**.  
**Status:** ❌ Fail · **Defect:** D5 (see `SUBMISSION.md` §3). The automated test fails until this defect is fixed.
  
**Evidence:** `evidence/D5a-item-not-found-add-to-cart.png, D5b-cart-after-invalid-item.png, D5c-checkout-overview-crash.png`

<a id="tc-09"></a>

### TC-09 – Products page fits a mobile screen without horizontal scrolling

| | |
|---|---|
| **Type** | UI / Responsive |
| **Priority** | P3 |
| **Execution** | Automated · Regression suite · run with `npm run test:regression` |
| **Automated test** | `tests/regression/catalogue.spec.js › TC-09 Products page fits a 375px screen without horizontal scrolling` |
| **Number of automated tests** | 1 |
| **Preconditions** | Chrome DevTools device toolbar set to 375 × 667 (e.g. iPhone SE) |
| **Test data** | `standard_user` / `secret_sauce` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Look at the Products page and try to scroll horizontally

**Expected result**

- No horizontal scrollbar; all product cards fit the screen width

**Actual result:** As expected  
**Status:** ✅ Pass

---

## Cart

<a id="tc-10"></a>

### TC-10 – Reset App State clears the cart and resets all product buttons

| | |
|---|---|
| **Type** | Functional |
| **Priority** | P3 |
| **Execution** | Automated · Known defect suite · run with `npm run test:defects` |
| **Automated test** | `tests/defects/known-defects.spec.js › [D4] TC-10 Reset App State clears the cart and resets all product buttons` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in |
| **Test data** | `standard_user` / `secret_sauce` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Click **Add to cart** on *Sauce Labs Backpack* and *Sauce Labs Bike Light*
5. Open the menu (☰) and click **Reset App State**
6. Close the menu and look at the two products

**Expected result**

- Cart badge disappears
- Both products show **Add to cart** again

**Actual result:** Badge disappears but both products still show **Remove** until the page is reloaded  
**Status:** ❌ Fail · **Defect:** D4 (see `SUBMISSION.md` §3). The automated test fails until this defect is fixed.
  
**Evidence:** `evidence/D4-reset-state-stale-remove-buttons.png`

---

## Checkout

<a id="tc-11"></a>

### TC-11 – Successful purchase of two products with correct totals

| | |
|---|---|
| **Type** | Functional (E2E) |
| **Priority** | P1 |
| **Execution** | Automated · Core suite · run with `npm test` |
| **Automated test** | `tests/checkout.e2e.spec.js › user can buy two products and totals are calculated correctly @smoke` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in; empty cart |
| **Test data** | `standard_user` / `secret_sauce` · Products: Sauce Labs Backpack ($29.99), Sauce Labs Fleece Jacket ($49.99) · Customer: Ada / Lovelace / 560001 |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Click **Add to cart** on *Sauce Labs Backpack*
5. Click **Add to cart** on *Sauce Labs Fleece Jacket*
6. Click the cart icon
7. Click **Checkout**
8. Enter First Name `Ada`, Last Name `Lovelace`, Postal Code `560001` and click **Continue**
9. Review the Checkout: Overview page
10. Click **Finish**
11. Click **Back Home**, then open the cart

**Expected result**

- After step 5: both buttons show **Remove**; cart badge shows **2**
- Step 6: cart lists exactly the 2 products, quantity 1 each, at $29.99 and $49.99
- Step 9: same 2 items; Item total **$79.98**; Tax **$6.40** (8 %); Total **$86.38**
- Step 10: *Checkout: Complete!* page with *Thank you for your order!*; cart badge gone
- Step 11: all products show **Add to cart**; cart is empty

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-12"></a>

### TC-12 – Totals are correct for three products

| | |
|---|---|
| **Type** | Functional |
| **Priority** | P2 |
| **Execution** | Automated · Regression suite · run with `npm run test:regression` |
| **Automated test** | `tests/regression/checkout.spec.js › TC-12 totals are correct for three products` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in; empty cart |
| **Test data** | `standard_user` / `secret_sauce` · Backpack $29.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99 · Customer: Ada / Lovelace / 560001 |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Add *Sauce Labs Backpack*, *Sauce Labs Bolt T-Shirt* and *Sauce Labs Fleece Jacket* to the cart
5. Open the cart and click **Checkout**
6. Enter First Name `Ada`, Last Name `Lovelace`, Postal Code `560001` and click **Continue**

**Expected result**

- Item total **$95.97**
- Tax **$7.68** (8 %)
- Total **$103.65**

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-13"></a>

### TC-13 – Checkout is blocked when First Name is missing

| | |
|---|---|
| **Type** | Negative |
| **Priority** | P2 |
| **Execution** | Automated · Core suite · run with `npm test` |
| **Automated test** | `tests/negative.spec.js › checkout is blocked when First Name is missing` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in; empty cart |
| **Test data** | `standard_user` / `secret_sauce` · Customer: Ada / Lovelace / 560001 |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Click **Add to cart** on *Sauce Labs Backpack*
5. Open the cart and click **Checkout**
6. Fill in the other two fields, leave **First Name** empty
7. Click **Continue**

**Expected result**

- Error shown: *Error: First Name is required*
- User stays on *Checkout: Your Information*

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-14"></a>

### TC-14 – Checkout is blocked when Last Name is missing

| | |
|---|---|
| **Type** | Negative |
| **Priority** | P2 |
| **Execution** | Automated · Core suite · run with `npm test` |
| **Automated test** | `tests/negative.spec.js › checkout is blocked when Last Name is missing` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in; empty cart |
| **Test data** | `standard_user` / `secret_sauce` · Customer: Ada / Lovelace / 560001 |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Click **Add to cart** on *Sauce Labs Backpack*
5. Open the cart and click **Checkout**
6. Fill in the other two fields, leave **Last Name** empty
7. Click **Continue**

**Expected result**

- Error shown: *Error: Last Name is required*
- User stays on *Checkout: Your Information*

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-15"></a>

### TC-15 – Checkout is blocked when Postal Code is missing

| | |
|---|---|
| **Type** | Negative |
| **Priority** | P2 |
| **Execution** | Automated · Core suite · run with `npm test` |
| **Automated test** | `tests/negative.spec.js › checkout is blocked when Postal Code is missing` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in; empty cart |
| **Test data** | `standard_user` / `secret_sauce` · Customer: Ada / Lovelace / 560001 |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Click **Add to cart** on *Sauce Labs Backpack*
5. Open the cart and click **Checkout**
6. Fill in the other two fields, leave **Postal Code** empty
7. Click **Continue**

**Expected result**

- Error shown: *Error: Postal Code is required*
- User stays on *Checkout: Your Information*

**Actual result:** As expected  
**Status:** ✅ Pass

<a id="tc-16"></a>

### TC-16 – Checkout rejects customer details that contain only spaces

| | |
|---|---|
| **Type** | Negative |
| **Priority** | P2 |
| **Execution** | Automated · Known defect suite · run with `npm run test:defects` |
| **Automated test** | `tests/defects/known-defects.spec.js › [D2] TC-16 checkout rejects customer details that contain only spaces` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in; empty cart |
| **Test data** | `standard_user` / `secret_sauce` · three spaces in each field |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Add *Sauce Labs Backpack* to the cart
5. Open the cart and click **Checkout**
6. Type three spaces into First Name, Last Name and Postal Code
7. Click **Continue**

**Expected result**

- Same *is required* error as for empty fields
- User stays on *Checkout: Your Information*

**Actual result:** Values accepted; Checkout: Overview opens and the order can be finished  
**Status:** ❌ Fail · **Defect:** D2 (see `SUBMISSION.md` §3). The automated test fails until this defect is fixed.
  
**Evidence:** `evidence/D2b-whitespace-only-info.png, D2c-whitespace-accepted-overview.png`

<a id="tc-17"></a>

### TC-17 – Customer information step cannot be skipped by URL

| | |
|---|---|
| **Type** | Negative / Security |
| **Priority** | P2 |
| **Execution** | Automated · Known defect suite · run with `npm run test:defects` |
| **Automated test** | `tests/defects/known-defects.spec.js › [D2] TC-17 customer information step cannot be skipped by URL` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in; empty cart |
| **Test data** | `standard_user` / `secret_sauce` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Add *Sauce Labs Backpack* to the cart
5. In the address bar open https://www.saucedemo.com/checkout-step-two.html
6. Click **Finish**

**Expected result**

- User is sent back to *Checkout: Your Information* until it is completed

**Actual result:** Checkout: Overview opens without customer details, and **Finish** completes the order  
**Status:** ❌ Fail · **Defect:** D2 (see `SUBMISSION.md` §3). The automated test fails until this defect is fixed.
  
**Evidence:** `evidence/D2a-deeplink-overview-no-info.png`

<a id="tc-18"></a>

### TC-18 – An order cannot be placed with an empty cart

| | |
|---|---|
| **Type** | Negative |
| **Priority** | P1 |
| **Execution** | Automated · Known defect suite · run with `npm run test:defects` |
| **Automated test** | `tests/defects/known-defects.spec.js › [D1] TC-18 an order cannot be placed with an empty cart` |
| **Number of automated tests** | 1 |
| **Preconditions** | Not logged in; empty cart |
| **Test data** | `standard_user` / `secret_sauce` |

**Steps**

1. Open https://www.saucedemo.com/
2. Enter Username `standard_user` and Password `secret_sauce`
3. Click **Login**
4. Without adding any product, click the cart icon
5. Click **Checkout**
6. Enter First Name `A`, Last Name `B`, Postal Code `1` and click **Continue**
7. Click **Finish**

**Expected result**

- Checkout is disabled or blocked with a message such as *Your cart is empty*

**Actual result:** Overview shows *Total: $0.00* and Finish shows *Thank you for your order!*  
**Status:** ❌ Fail · **Defect:** D1 (see `SUBMISSION.md` §3). The automated test fails until this defect is fixed.
  
**Evidence:** `evidence/D1a-empty-cart-overview.png, D1b-empty-cart-order-complete.png`

