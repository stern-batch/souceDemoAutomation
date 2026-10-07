// @ts-check
const { expect } = require('@playwright/test');

/** @typedef {{ firstName?: string, lastName?: string, postalCode?: string }} CustomerInfo */

class CheckoutInfoPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.error = page.getByTestId('error');
  }

  async goto() {
    await this.page.goto('/checkout-step-one.html');
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(this.title).toHaveText('Checkout: Your Information');
  }

  /** @param {CustomerInfo} info Omitted fields are left blank. */
  async submit(info) {
    if (info.firstName !== undefined) await this.firstName.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastName.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCode.fill(info.postalCode);
    await this.continueButton.click();
  }
}

module.exports = { CheckoutInfoPage };
