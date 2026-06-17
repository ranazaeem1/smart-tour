export const stripNumbers = (value: string) => value.replace(/[0-9]/g, "");

export const onlyDigits = (value: string, maxLength = 15) =>
  value.replace(/\D/g, "").slice(0, maxLength);

export const normalizeEmail = (value: string) => value.replace(/\s/g, "").toLowerCase();

export const textOnlyPattern = "[A-Za-z\\s.'-]+";
export const emailPattern = "[^\\s@]+@[^\\s@]+\\.[^\\s@]+";
