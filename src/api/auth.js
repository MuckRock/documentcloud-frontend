import session from './session';
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
    Vue.API.createAccount = wrapLoad(async function(
      firstName,
      lastName,
      email,
      password
    ) {
      const {data} = await session.post('registration/', {
        first_name: firstName,
        last_name: lastName,
        password1: password,
        password2: password,
        email,
      });
      setToken(data.key);
    });

    Vue.API.logout = wrapLoad(async function() {
      try {
        await session.post('/auth/logout/', {});
      } finally {
        removeToken();
      }
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
      session.defaults.headers.Authorization = `Token ${key}`;

      Vue.prototype.$auth.key = key;
    }
    function removeToken() {
      localStorage.removeItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY);
      delete session.defaults.headers.Authorization;
      Vue.prototype.$auth.key = null;
    }

    initialize();
  },
};

// const _a = {
//   data() {
//     return {
//       authUser: null,
//     };
//   },
//   created() {
//     this.initialize();
//   },
//   methods: {
//     // Auth methods
//     async createAccount(firstName, lastName, email, password) {
//       const {data} = await session.post('registration/', {
//         first_name: firstName,
//         last_name: lastName,
//         password1: password,
//         password2: password,
//         email,
//       });
//       this.setToken(data.key);
//     },

//     // Token internal methods
//     initialize() {
//       try {
//         const storedData = localStorage.getItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY);
//         if (storedData == null) {
//           // Logged in
//           return;
//         }
//         if (storedData != null) {
//           const userData = JSON.parse(storedData);
//           this.setToken(userData);
//           return;
//         }
//       } catch (e) {
//         this.removeToken();
//         return;
//       }

//       this.removeToken();
//       return;
//     },
//     setToken(userData) {
//       // Set the token state.
//       localStorage.setItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY, JSON.stringify(userData));
//       this.authUser = userData;
//     },
//     removeToken() {
//       localStorage.removeItem(DOCUMENTCLOUD_TOKEN_STORAGE_KEY);
//       delete session.defaults.headers.Authorization;
//       this.authUser = null;
//     },
//   },
// };
