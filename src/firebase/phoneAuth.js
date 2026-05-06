import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebase.js";

let recaptcha;

export const sendCode = async (phone) => {
  if (!recaptcha) {
    recaptcha = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );
  }

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phone,
    recaptcha
  );

  window.confirmationResult = confirmationResult;
};

export const verifyCode = async (code) => {
  const result = await window.confirmationResult.confirm(code);

const token = await result.user.getIdToken(true);
  return {
    token,
    user: result.user,
  };
};