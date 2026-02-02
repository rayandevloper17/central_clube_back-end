
/**
 * Utility to generate unique codes for reservations and matches
 */

/**
 * Generates a random alphanumeric code of specified length.
 * Default length is 8.
 * Excludes confusing characters like 0, O, 1, I, L.
 */
export const generateAlphanumericCode = (length = 8) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; 
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates a random numeric code of specified length.
 */
export const generateNumericCode = (length = 6) => {
  const digits = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
};

/**
 * Generates a reservation coder: 4 random digits followed by 4 random uppercase letters.
 * This ensures uniqueness and follows the user's suggestion of letters at the end.
 * Example: 4829KJHG
 */
export const generateReservationCoder = () => {
  const digits = '0123456789';
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  
  // 4 random digits
  for (let i = 0; i < 4; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  
  // 4 random letters
  for (let i = 0; i < 4; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  return result;
};
