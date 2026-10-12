import { describe, it, expect } from 'vitest';
import {
  clean10DigitPhone,
  isValid10DigitPhone,
  validate10DigitPhone,
  format10DigitPhone,
  cleanPincode,
  isValidPincode,
  validatePincode,
  cleanEmail,
  isValidEmail,
  validateEmail
} from './validation';

describe('Phone Number Validation Utilities', () => {
  it('clean10DigitPhone strips country code and formats correctly', () => {
    expect(clean10DigitPhone('+91 98765 43210')).toBe('9876543210');
    expect(clean10DigitPhone('09876543210')).toBe('9876543210');
    expect(clean10DigitPhone('98765-43210')).toBe('9876543210');
    expect(clean10DigitPhone('')).toBe('');
    expect(clean10DigitPhone(null)).toBe('');
    expect(clean10DigitPhone(undefined)).toBe('');
  });

  it('isValid10DigitPhone checks exact 10 digit requirement', () => {
    expect(isValid10DigitPhone('9876543210')).toBe(true);
    expect(isValid10DigitPhone('+91 98765 43210')).toBe(true);
    expect(isValid10DigitPhone('12345')).toBe(false);
    expect(isValid10DigitPhone('')).toBe(false);
  });

  it('validate10DigitPhone returns true for valid phone or descriptive error', () => {
    expect(validate10DigitPhone('9876543210', 'Mobile number', true)).toBe(true);
    expect(validate10DigitPhone('', 'Mobile number', true)).toContain('Mobile number is required');
    expect(validate10DigitPhone('', 'Mobile number', false)).toBe(true);
    expect(validate10DigitPhone('98765', 'Mobile number', true)).toContain('must be exactly 10 digits');
  });

  it('format10DigitPhone formats 10 digits into standard Indian +91 format', () => {
    expect(format10DigitPhone('9876543210')).toBe('+91 98765 43210');
    expect(format10DigitPhone('+91 98765 43210')).toBe('+91 98765 43210');
  });
});

describe('Postal Pincode Validation Utilities', () => {
  it('cleanPincode strips non-digits and caps at 6 digits', () => {
    expect(cleanPincode('800 001')).toBe('800001');
    expect(cleanPincode('800-001-999')).toBe('800001');
    expect(cleanPincode('')).toBe('');
  });

  it('isValidPincode requires standard Indian 6-digit non-zero starting format', () => {
    expect(isValidPincode('800001')).toBe(true);
    expect(isValidPincode('110001')).toBe(true);
    expect(isValidPincode('080001')).toBe(false);
    expect(isValidPincode('8000')).toBe(false);
  });

  it('validatePincode returns true or validation error', () => {
    expect(validatePincode('800001')).toBe(true);
    expect(validatePincode('')).toContain('Pincode is required');
    expect(validatePincode('012345')).toContain('cannot start with 0');
    expect(validatePincode('123')).toContain('must be exactly 6 digits');
  });
});

describe('Email Validation Utilities', () => {
  it('cleanEmail sanitizes whitespace', () => {
    expect(cleanEmail('  doctor@hospital.in  ')).toBe('doctor@hospital.in');
    expect(cleanEmail(null)).toBe('');
  });

  it('isValidEmail verifies RFC format compliance', () => {
    expect(isValidEmail('admin@hospital.org')).toBe(true);
    expect(isValidEmail('doctor.kumar@aiimspatna.edu.in')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('missing-domain@')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
  });

  it('validateEmail provides clear, descriptive clinical errors', () => {
    expect(validateEmail('doctor@hospital.org', 'Work email', true)).toBe(true);
    expect(validateEmail('', 'Work email', true)).toContain('Work email is required');
    expect(validateEmail('', 'Work email', false)).toBe(true);
    expect(validateEmail('user hospital.org', 'Work email', true)).toContain('cannot contain spaces');
    expect(validateEmail('nodomain@hospital', 'Work email', true)).toContain('must include a valid domain');
  });
});
