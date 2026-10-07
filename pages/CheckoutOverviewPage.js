// @ts-check
const { expect } = require('@playwright/test');
const { readLineItems } = require('./CartPage');
const { toCents } = require('../utils/money');

class CheckoutOverviewPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.lineItems = page.getByTestId('inventory-item');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(this.title).toHaveText('Checkout: Overview');
  }

  readItems() {
    return readLineItems(this.page);
  }

  async readSummary() {
    return {
      subtotalCents: toCents(await this.subtotal.textContent()),
      taxCents: toCents(await this.tax.textContent()),
      totalCents: toCents(await this.total.textContent()),
    };
  }

  async finish() {
    await this.finishButton.click();
  }
}

module.exports = { CheckoutOverviewPage };
