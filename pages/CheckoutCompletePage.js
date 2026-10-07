// @ts-check
const { expect } = require('@playwright/test');

class CheckoutCompletePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.header = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async expectOrderConfirmed() {
    await expect(this.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(this.title).toHaveText('Checkout: Complete!');
    await expect(this.header).toHaveText('Thank you for your order!');
  }

  async backHome() {
    await this.backHomeButton.click();
  }
}

module.exports = { CheckoutCompletePage };
