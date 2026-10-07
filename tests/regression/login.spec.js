// @ts-check
const { test, expect } = require('../fixtures');
const { users } = require('../data/testData');

test.describe('TC-02 Login validation messages', () => {
  const cases = [
    { name: 'both fields empty', username: '', password: '', error: 'Epic sadface: Username is required' },
    { name: 'password empty', username: users.standard.username, password: '', error: 'Epic sadface: Password is required' },
    {
      name: 'wrong password',
      username: users.standard.username,
      password: 'wrong_password',
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
    {
      name: 'username in different case',
      username: 'Standard_User',
      password: users.standard.password,
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
  ];

  for (const c of cases) {
    test(`TC-02 ${c.name} shows the right error and does not log in`, async ({ page, loginPage }) => {
      await loginPage.goto();
      await loginPage.login(c.username, c.password);

      await expect(loginPage.error).toHaveText(c.error);
      await expect(loginPage.loginButton).toBeVisible();
      await expect(page.getByTestId('inventory-list')).toHaveCount(0);
    });
  }

  test('TC-02 password field is masked', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });
});
