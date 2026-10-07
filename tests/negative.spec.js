// @ts-check
const { test, expect } = require('./fixtures');
const { users, products, customer } = require('./data/testData');

test.describe('Negative paths', () => {
  test('locked-out user is blocked with a clear message and stays on login', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.error).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).toHaveURL(/saucedemo\.com\/$/);
    await expect(page.getByTestId('inventory-list')).toHaveCount(0);
  });

  const missingFieldCases = [
    { missing: 'First Name', info: { lastName: customer.lastName, postalCode: customer.postalCode } },
    { missing: 'Last Name', info: { firstName: customer.firstName, postalCode: customer.postalCode } },
    { missing: 'Postal Code', info: { firstName: customer.firstName, lastName: customer.lastName } },
  ];

  for (const { missing, info } of missingFieldCases) {
    test(`checkout is blocked when ${missing} is missing`, async ({ loggedIn: inventory, checkoutInfoPage }) => {
      await inventory.addToCart(products.backpack);
      await checkoutInfoPage.goto();

      await checkoutInfoPage.submit(info);

      await expect(checkoutInfoPage.error).toHaveText(`Error: ${missing} is required`);
      await checkoutInfoPage.expectLoaded();
    });
  }
});
