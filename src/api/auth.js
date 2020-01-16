import { Svue } from 'svue';

const DOCUMENTCLOUD_TOKEN_STORAGE_KEY = 'documentcloud_token';

export const SIGN_IN_URL = process.env.DC_BASE + process.env.DC_LOGIN;
export const SIGN_UP_URL =
  process.env.SQUARELET_BASE +
  process.env.SQUARELET_SIGNUP +
  encodeURIComponent(window.location.href);


export const auth = new Svue({
  data() {
    return {
      signingIn: false,
      key: null,
    }
  },
  computed: {
    isAuthenticated(key) {
      return key != null;
    }
  }
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
    if (storedData == null) {
      // Logged in
      return;
    }
    if (storedData != null) {
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
  localStorage.setItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY, JSON.stringify(key));

  // Set the default session header.
  // session.defaults.headers.Authorization = `Token ${key}`;

  auth.key = key;
}

function removeToken() {
  localStorage.removeItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY);
  // delete session.defaults.headers.Authorization;
  auth.key = null;
}

// Initialize the token
initialize();
