// @ts-check
const { expect } = require('@playwright/test');
const { HeaderComponent } = require('./HeaderComponent');
const { toCents } = require('../utils/money');

class InventoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.removeButtons = this.items.getByRole('button', { name: 'Remove' });
  }

  /** @param {'az' | 'za' | 'lohi' | 'hilo'} option */
  async sortBy(option) {
    await this.sortSelect.selectOption(option);
  }

  async names() {
    return this.itemNames.allTextContents();
  }

  async pricesInCents() {
    return (await this.itemPrices.allTextContents()).map(toCents);
  }

  /** @param {string} name */
  async openProduct(name) {
    await this.item(name).getByTestId('inventory-item-name').click();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
    await expect(this.title).toHaveText('Products');
  }

  /**
   * Item card located by its visible product name, not by position or generated id.
   * @param {string} name
   */
  item(name) {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }) });
  }

  /** @param {string} name */
  async priceInCents(name) {
    return toCents(await this.item(name).getByTestId('inventory-item-price').textContent());
  }

  /** @param {string} name */
  async addToCart(name) {
    const card = this.item(name);
    await card.getByRole('button', { name: 'Add to cart' }).click();
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
  }
}

module.exports = { InventoryPage };
