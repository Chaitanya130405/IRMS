/**
 * Escape special regex characters in a string
 * @param {string} value - The string to escape
 * @returns {string} Escaped string safe for use in RegExp
 */
export const escapeRegex = (value) => 
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
