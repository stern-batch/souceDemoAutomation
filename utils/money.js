// @ts-check

/**
 * Parses "$29.99", "Item total: $29.99", "Tax: $2.40" into integer cents to avoid float drift.
 * @param {string | null} text
 * @returns {number}
 */
function toCents(text) {
  const match = text?.match(/\$(\d+(?:\.\d{1,2})?)/);
  if (!match) throw new Error(`No currency amount found in: "${text}"`);
  return Math.round(parseFloat(match[1]) * 100);
}

module.exports = { toCents };
