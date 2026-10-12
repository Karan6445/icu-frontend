/**
 * Phone and numeric validation utilities for 10-digit phone numbers
 */

/**
 * Strips non-digit characters and removes common country/trunk prefixes (+91 or leading 0)
 * Returns at most 10 numeric digits.
 */
export const clean10DigitPhone = (value: string | undefined | null): string => {
  if (!value) return '';
  // Strip all non-digits
  let digits = value.toString().replace(/\D/g, '');

  // If user entered +91 prefix (12 digits starting with 91)
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    // If user entered standard 0 prefix
    digits = digits.slice(1);
  }

  // Cap at 10 digits
  return digits.slice(0, 10);
};

/**
 * Checks whether the given string contains exactly 10 digits.
 */
export const isValid10DigitPhone = (value: string | undefined | null): boolean => {
  const clean = clean10DigitPhone(value);
  return /^[0-9]{10}$/.test(clean);
};

/**
 * Validation function compatible with react-hook-form and manual form validation.
 * Returns true if valid, or an error message string if invalid.
 */
export const validate10DigitPhone = (
  value: string | undefined | null,
  label = 'Phone number',
  required = true
): string | true => {
  const raw = (value ?? '').toString().trim();

  if (!raw) {
    return required ? `${label} is required` : true;
  }

  const clean = clean10DigitPhone(raw);
  if (clean.length === 0) {
    return required ? `${label} is required` : true;
  }

  if (clean.length < 10) {
    return `${label} must be exactly 10 digits (currently ${clean.length} digit${clean.length === 1 ? '' : 's'})`;
  }

  if (!/^[0-9]{10}$/.test(clean)) {
    return `Please enter a valid 10-digit ${label.toLowerCase()}`;
  }

  return true;
};

/**
 * Generic contact number validator alias for validate10DigitPhone
 */
export const validateContactNumber = (
  value: string | undefined | null,
  label = 'Contact number',
  required = true
): string | true => {
  return validate10DigitPhone(value, label, required);
};

/**
 * Formats a 10-digit number into standard +91 XXXXX XXXXX representation for display.
 */
export const format10DigitPhone = (value: string | undefined | null): string => {
  if (!value) return '';
  const clean = clean10DigitPhone(value);
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return value.toString();
};

/**
 * Pincode / Postal Code Utilities
 */

/**
 * Strips non-digit characters and caps at 6 digits for standard postal pincodes.
 */
export const cleanPincode = (value: string | undefined | null): string => {
  if (!value) return '';
  return value.toString().replace(/\D/g, '').slice(0, 6);
};

/**
 * Checks whether the value is a valid 6-digit PIN code.
 * Standard Indian PIN codes are 6 numeric digits, starting with 1-9.
 */
export const isValidPincode = (value: string | undefined | null): boolean => {
  const clean = cleanPincode(value);
  return /^[1-9][0-9]{5}$/.test(clean);
};

/**
 * Validation function compatible with react-hook-form and manual form validation.
 * Returns true if valid, or an error message string if invalid.
 */
export const validatePincode = (
  value: string | undefined | null,
  required = true
): string | true => {
  const raw = (value ?? '').toString().trim();

  if (!raw) {
    return required ? 'Pincode is required' : true;
  }

  const clean = cleanPincode(raw);
  if (clean.length === 0) {
    return required ? 'Pincode is required' : true;
  }

  if (clean.length < 6) {
    return `Pincode must be exactly 6 digits (currently ${clean.length} digit${clean.length === 1 ? '' : 's'})`;
  }

  if (clean.startsWith('0')) {
    return 'Pincode cannot start with 0';
  }

  if (!/^[1-9][0-9]{5}$/.test(clean)) {
    return 'Please enter a valid 6-digit postal pincode';
  }

  return true;
};

/**
 * Email Validation Utilities
 */

// Standard RFC 5322 compatible email pattern
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Trims and sanitizes an email string
 */
export const cleanEmail = (value: string | undefined | null): string => {
  if (!value) return '';
  return value.toString().trim();
};

/**
 * Checks whether the given string is a syntactically valid email address
 */
export const isValidEmail = (value: string | undefined | null): boolean => {
  const clean = cleanEmail(value);
  if (!clean || clean.length > 254) return false;
  return EMAIL_REGEX.test(clean);
};

/**
 * Validation function compatible with react-hook-form and manual form validation.
 * Returns true if valid, or a descriptive error message string if invalid.
 */
export const validateEmail = (
  value: string | undefined | null,
  label = 'Email address',
  required = true
): string | true => {
  const clean = cleanEmail(value);

  if (!clean) {
    return required ? `${label} is required` : true;
  }

  if (clean.length > 254) {
    return `${label} must be 254 characters or fewer`;
  }

  if (/\s/.test(clean)) {
    return `${label} cannot contain spaces`;
  }

  if (!clean.includes('@')) {
    return `${label} must include an '@' symbol`;
  }

  const [local, domain] = clean.split('@');
  if (!local || local.length === 0) {
    return `${label} is missing username/local part before '@'`;
  }

  if (!domain || !domain.includes('.')) {
    return `${label} must include a valid domain with extension (e.g. hospital.in or gmail.com)`;
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return `${label} domain extension must be at least 2 characters`;
  }

  if (!isValidEmail(clean)) {
    return `Please enter a valid ${label.toLowerCase()} (e.g. name@hospital.in)`;
  }

  return true;
};

