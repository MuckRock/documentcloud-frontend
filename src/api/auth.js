import wrapLoad from './wrapload';

const DOCUMENTCLOUD_TOKEN_STORAGE_KEY = 'documentcloud_token';

export default {
  install(Vue) {
    Vue.prototype.$auth = new Vue({
      data() {
        return {
          key: null,
        };
      },
      computed: {
        isAuthenticated() {
          return this.key != null;
        },
      },
    });

    if (Vue.API == null) Vue.API = {};

    Vue.API.login = wrapLoad(async function () {
      setToken(true);
    });

    Vue.API.logout = wrapLoad(async function () {
      // TODO: use some Squarelet method and have a finally clause of removeToken()
      // for now, we just "forget" we're logged in
      removeToken();
    });

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

      Vue.prototype.$auth.key = key;
    }
    function removeToken() {
      localStorage.removeItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY);
      // delete session.defaults.headers.Authorization;
      Vue.prototype.$auth.key = null;
    }

    initialize();
  },
};
