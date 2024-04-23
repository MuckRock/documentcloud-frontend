import { Svue } from "svue";
import * as config from "../config/config.js";

const DOCUMENTCLOUD_TOKEN_STORAGE_KEY = "documentcloud_token";

export const SQUARELET_URL = config.SQUARELET_BASE;
export const SIGN_IN_URL = config.DC_BASE + config.DC_LOGIN;
export const SIGN_UP_URL =
  config.SQUARELET_BASE +
  config.SQUARELET_SIGNUP +
  encodeURIComponent(window.location.href);
export const SIGN_OUT_URL = config.DC_BASE + config.DC_LOGOUT;

export const auth = new Svue({
  data() {
    return {
      signingIn: false,
      key: null,
    };
  },
  computed: {
    isAuthenticated(key) {
      return key !== null;
    },
  },
});

export function login() {
  setToken(true);
}

export function logout() {
  // TODO: use some Squarelet method and have a finally clause of removeToken()
  // for now, we just "forget" we're logged in
  removeToken();
}

// Token methods
function initialize() {
  try {
    const storedData = localStorage.getItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY);
    if (storedData === null) {
      // Logged in
      return;
    }
    if (storedData !== null) {
      const key = JSON.parse(storedData);
      setToken(key);
      return;
    }
  } catch (e) {
    removeToken();
    return;
  }

  removeToken();
  return;
}

function setToken(key) {
  // Set the token state.
  try {
    localStorage.setItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY, JSON.stringify(key));
  } catch (e) {
    // Ignore if local storage is not available
  }

  auth.key = key;
}

function removeToken() {
  try {
    localStorage.removeItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY);
  } catch (e) {
    // Ignore if local storage is not available
  }

  auth.key = null;
}

// Initialize the token
initialize();
