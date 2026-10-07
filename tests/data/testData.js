// @ts-check

const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

const users = {
  standard: { username: 'standard_user', password },
  lockedOut: { username: 'locked_out_user', password },
  visual: { username: 'visual_user', password },
};

const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTShirt: 'Test.allTheThings() T-Shirt (Red)',
};

const customer = { firstName: 'Ada', lastName: 'Lovelace', postalCode: '560001' };

// Business rule observed on the site; if it changes, this suite should fail loudly.
const TAX_RATE = 0.08;

module.exports = { users, products, customer, TAX_RATE };
