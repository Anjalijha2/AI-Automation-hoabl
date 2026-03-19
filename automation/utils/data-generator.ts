/**
 * DATA GENERATOR — Generates test data for use in test specs
 */
export function generatePhone(): string {
  return '9' + Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
}

export function generateInvalidPhone(): string {
  return Math.floor(Math.random() * 99999).toString(); // 5 digits — always too short
}

export const TEST_PHONES = {
  VALID:    '8888888888',
  SHORT:    '12345',
  ALL_ZERO: '0000000000',
  LETTERS:  'abcXYZ!@#',
};

export const TEST_OTP = {
  VALID:    '258369',
  WRONG:    '123456',
  ALL_ZERO: '000000',
  PARTIAL:  '258',
};
