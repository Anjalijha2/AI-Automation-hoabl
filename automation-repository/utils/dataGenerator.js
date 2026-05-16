/**
 * DATA GENERATOR — Generates test data for use in test specs
 */

function generatePhone() {
  return '9' + Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
}

function generateInvalidPhone() {
  return Math.floor(Math.random() * 99999).toString(); // 5 digits — always too short
}

const TEST_PHONES = {
  VALID:    '8888888888',
  SHORT:    '12345',
  ALL_ZERO: '0000000000',
  LETTERS:  'abcXYZ!@#',
};

const TEST_OTP = {
  VALID:    '258369',
  WRONG:    '123456',
  ALL_ZERO: '000000',
  PARTIAL:  '258',
};

module.exports = { generatePhone, generateInvalidPhone, TEST_PHONES, TEST_OTP };
