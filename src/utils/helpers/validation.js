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
    return `Password must be at least ${minLength} characters long.`;
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
export const validateNumberRange = (value, min = 0, max = Infinity, fieldName = "Value") => {
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
