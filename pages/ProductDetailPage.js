// @ts-check
const { expect } = require('@playwright/test');
const { HeaderComponent } = require('./HeaderComponent');
const { toCents } = require('../utils/money');

class ProductDetailPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.name = page.getByTestId('inventory-item-name');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.backButton = page.getByTestId('back-to-products');
  }

  /** @param {number | string} id */
  async goto(id) {
    await this.page.goto(`/inventory-item.html?id=${id}`);
    await expect(this.backButton).toBeVisible();
  }

  async priceInCents() {
    return toCents(await this.price.textContent());
  }
}

module.exports = { ProductDetailPage };
