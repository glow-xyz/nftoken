import * as EmailValidator from "email-validator";
import tlds from "tlds";

const tldSet = new Set(tlds);

export const isValidEmail = (email: string): boolean => {
  if (!EmailValidator.validate(email)) {
    return false;
  }

  const suffix = email.split(".").pop();
  return suffix !== undefined && tldSet.has(suffix.toLowerCase());
};
