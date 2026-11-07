/**
 * Simple logger utility that respects NODE_ENV
 * In production, only errors are logged
 * In development, all levels are logged
 */

const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  error: (...args) => console.error("[ERROR]", ...args),
  warn: (...args) => !isProduction && console.warn("[WARN]", ...args),
  info: (...args) => !isProduction && console.info("[INFO]", ...args),
  debug: (...args) => !isProduction && console.log("[DEBUG]", ...args),
};

export default logger;
