// @ts-check
const { expect } = require('@playwright/test');
const { toCents } = require('../utils/money');

/** @typedef {{ name: string, priceCents: number, quantity: number }} LineItem */

/**
 * Cart and checkout overview render line items with the same markup, so both pages share this reader.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<LineItem[]>}
 */
async function readLineItems(page) {
  const rows = page.getByTestId('inventory-item');
  const result = [];
  for (const row of await rows.all()) {
    result.push({
      name: String(await row.getByTestId('inventory-item-name').textContent()).trim(),
      priceCents: toCents(await row.getByTestId('inventory-item-price').textContent()),
      quantity: Number(await row.getByTestId('item-quantity').textContent()),
    });
  }
  return result;
}

class CartPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.lineItems = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/cart\.html$/);
    await expect(this.title).toHaveText('Your Cart');
  }

  readItems() {
    return readLineItems(this.page);
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage, readLineItems };
