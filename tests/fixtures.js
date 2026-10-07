// @ts-check
const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutInfoPage } = require('../pages/CheckoutInfoPage');
const { CheckoutOverviewPage } = require('../pages/CheckoutOverviewPage');
const { CheckoutCompletePage } = require('../pages/CheckoutCompletePage');
const { ProductDetailPage } = require('../pages/ProductDetailPage');
const { users } = require('./data/testData');

/**
 * @typedef {{
 *   loginPage: LoginPage,
 *   inventoryPage: InventoryPage,
 *   cartPage: CartPage,
 *   checkoutInfoPage: CheckoutInfoPage,
 *   checkoutOverviewPage: CheckoutOverviewPage,
 *   checkoutCompletePage: CheckoutCompletePage,
 *   productDetailPage: ProductDetailPage,
 *   loggedIn: InventoryPage,
 * }} Pages
 */

const test = base.test.extend(/** @type {import('@playwright/test').Fixtures<Pages>} */ ({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),
  productDetailPage: async ({ page }, use) => use(new ProductDetailPage(page)),
  /** Logs in as standard_user through the UI and lands on the inventory page. */
  loggedIn: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
  },
}));

module.exports = { test, expect: base.expect };
