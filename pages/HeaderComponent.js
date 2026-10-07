// @ts-check
const { expect } = require('@playwright/test');

class HeaderComponent {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.openMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeMenuButton = page.getByRole('button', { name: 'Close Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
  }

  async openCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.openMenuButton.click();
    await this.logoutLink.click();
  }

  async resetAppState() {
    await this.openMenuButton.click();
    await this.resetAppStateLink.click();
    await this.closeMenuButton.click();
    await expect(this.resetAppStateLink).toBeHidden();
  }
}

module.exports = { HeaderComponent };
