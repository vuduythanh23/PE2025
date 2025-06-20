/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {string} Error message or empty string if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    } is required.`;
  }
  return "";
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateEmail = (email) => {
  if (!email) {
    return "Email is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address.";
  }

  return "";
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum password length (default: 6)
 * @returns {string} Error message or empty string if valid
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < minLength) {
    return "Password does not meet security requirements.";
  }

  return "";
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Password confirmation
 * @returns {string} Error message or empty string if valid
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return "";
};

/**
 * Validate phone number
 * @param {string} phoneNumber - Phone number to validate
 * @returns {string} Error message or empty string if valid
 */
export const validatePhone = (phoneNumber) => {
  if (!phoneNumber) {
    return "Phone number is required.";
  }

  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phoneNumber.trim())) {
    return "Please enter a valid phone number.";
  }

  return "";
};

/**
 * Validate credit card number (basic Luhn algorithm)
 * @param {string} cardNumber - Credit card number to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateCreditCard = (cardNumber) => {
  if (!cardNumber) {
    return "Credit card number is required.";
  }

  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s\-]/g, "");

  // Check if it's all digits and has reasonable length
  if (!/^\d{13,19}$/.test(cleaned)) {
    return "Please enter a valid credit card number.";
  }

  // Luhn algorithm check
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return "Please enter a valid credit card number.";
  }

  return "";
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateUrl = (url) => {
  if (!url) {
    return "URL is required.";
  }

  try {
    new URL(url);
    return "";
  } catch {
    return "Please enter a valid URL.";
  }
};

/**
 * Validate number within range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value (default: 0)
 * @param {number} max - Maximum value (default: Infinity)
 * @param {string} fieldName - Name of the field (default: "Value")
 * @returns {string} Error message or empty string if valid
 */
export const validateNumberRange = (
  value,
  min = 0,
  max = Infinity,
  fieldName = "Value"
) => {
  if (value === null || value === undefined || value === "") {
    return `${fieldName} is required.`;
  }

  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number.`;
  }

  if (num < min || num > max) {
    if (max === Infinity) {
      return `${fieldName} must be at least ${min}.`;
    }
    return `${fieldName} must be between ${min} and ${max}.`;
  }

  return "";
};

/**
 * Validate address
 * @param {string} address - Address to validate
 * @param {number} minLength - Minimum address length (default: 10)
 * @returns {string} Error message or empty string if valid
 */
export const validateAddress = (address, minLength = 10) => {
  if (!address || address.trim() === "") {
    return "Delivery address is required.";
  }

  if (address.trim().length < minLength) {
    return `Address must be at least ${minLength} characters long.`;
  }

  // Basic validation for address completeness
  const addressLower = address.toLowerCase();
  const hasNumbers = /\d/.test(address);

  if (!hasNumbers) {
    return "Please include street number or building number in your address.";
  }

  return "";
};

/**
 * Validate city name
 * @param {string} city - City to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateCity = (city) => {
  if (!city || city.trim() === "") {
    return "City is required.";
  }

  if (city.trim().length < 2) {
    return "City name must be at least 2 characters long.";
  }

  // Allow letters, spaces, hyphens, apostrophes
  const cityRegex = /^[a-zA-Z\s\-']+$/;
  if (!cityRegex.test(city.trim())) {
    return "City name can only contain letters, spaces, hyphens, and apostrophes.";
  }

  return "";
};

/**
 * Validate state/province
 * @param {string} state - State to validate
 * @returns {string} Error message or empty string if valid
 */
export const validateState = (state) => {
  if (!state || state.trim() === "") {
    return "State/Province is required.";
  }

  if (state.trim().length < 2) {
    return "State/Province must be at least 2 characters long.";
  }

  // Allow letters, spaces, hyphens, apostrophes
  const stateRegex = /^[a-zA-Z\s\-']+$/;
  if (!stateRegex.test(state.trim())) {
    return "State/Province can only contain letters, spaces, hyphens, and apostrophes.";
  }

  return "";
};

/**
 * Validate postal code
 * @param {string} postalCode - Postal code to validate
 * @returns {string} Error message or empty string if valid
 */
export const validatePostalCode = (postalCode) => {
  if (!postalCode || postalCode.trim() === "") {
    return "Postal code is required.";
  }

  // Remove spaces and convert to uppercase
  const cleaned = postalCode.replace(/\s/g, "").toUpperCase();

  // Basic pattern for various postal code formats
  // US: 12345 or 12345-1234
  // Canada: A1A 1A1 or A1A1A1
  // UK: SW1A 1AA or similar
  // General: alphanumeric, 3-10 characters
  const postalRegex = /^[A-Z0-9\-]{3,10}$/;

  if (!postalRegex.test(cleaned)) {
    return "Please enter a valid postal code.";
  }

  return "";
};
