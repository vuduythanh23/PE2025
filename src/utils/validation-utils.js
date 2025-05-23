export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === "") {
    return `${
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    } is required.`;
  }
  return "";
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email is required.";
  }
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }
  return "";
};

export const validatePassword = (password) => {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return "";
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return "";
};

export const validatePhone = (phoneNumber) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneNumber) {
    return "Phone number is required.";
  }
  if (!phoneRegex.test(phoneNumber)) {
    return "Please enter a valid phone number.";
  }
  return "";
};
