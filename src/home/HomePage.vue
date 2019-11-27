<template>
  <Loader :active="signingIn">
    <div class="container">
      <header>
        <div class="headercontents">
          <div class="logo">
            <router-link :to="{ name: 'home' }">
              <img
                svg-inline
                class="mastlogo"
                src="../assets/mastlogo.svg"
                alt
              />
            </router-link>
          </div>
          <div class="signupcontainer" v-if="!$auth.isAuthenticated">
            <div class="signin">
              <a :href="signInUrl">Sign in</a>
            </div>
            <a :href="signUpUrl">
              <Button>Sign up</Button>
            </a>
          </div>
          <div class="signupcontainer" v-if="$auth.isAuthenticated">
            <div class="signin" @click="logout()">Log out</div>
            <router-link :to="{ name: 'app' }">
              <Button>Go to app</Button>
            </router-link>
          </div>
        </div>
      </header>
      <div v-if="showMast" class="mastcontainer">
        <img svg-inline class="masthead" src="../assets/masthead.svg" alt />
        <img
          svg-inline
          class="mastheadresponsive"
          src="../assets/masthead_responsive.svg"
          alt
        />
      </div>
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </Loader>
</template>

<style lang="scss" scoped>
.masthead {
  width: 100%;
  max-width: 1200px;
}

.mastheadresponsive {
  display: none;
  width: 100%;
}

.mastlogo {
  max-width: 250px;
  height: auto;
}

.container {
  max-width: 1200px;
  margin: 2em auto;
}

header {
  display: table;
  width: 100%;
  margin-bottom: 0.8em;
}

.headercontents {
  display: table-row;
}

.logo {
  display: table-cell;
  vertical-align: middle;
}

.signupcontainer {
  display: table-cell;
  vertical-align: middle;
  text-align: right;
}

.signin {
  display: inline-block;

  a {
    text-decoration: inherit;
    color: #494949;
    font-weight: bold;
    font-size: 16px;
    margin-right: 1.5em;
    cursor: pointer;
  }

  &:hover {
    opacity: $hover-opacity;
  }
}

.content {
  margin: 2em 0;
  max-width: 80ch;
  color: #494949;
  font-size: 16px;
  line-height: 24px;
}

@media only screen and (max-width: 1240px) {
  .logo,
  .content {
    padding: 0 1em;
  }
}

@media only screen and (max-width: 1200px) {
  .signupcontainer {
    padding: 0 1em;
  }
}

@media only screen and (max-width: 600px) {
  .masthead {
    display: none;
  }

  .mastheadresponsive {
    display: block !important;
  }

  .mastlogo {
    max-width: 200px;
  }
}
</style>

<script>
import Button from "../common/Button";
import Vue from "vue";
import Loader from "../common/Loader";

export default {
  components: { Button, Loader },
  props: {
    showMast: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      signInUrl: process.env.VUE_APP_DC_BASE + process.env.VUE_APP_DC_LOGIN,
      signUpUrl:
        process.env.VUE_APP_SQUARELET_BASE +
        process.env.VUE_APP_SQUARELET_SIGNUP +
        encodeURIComponent(window.location.href),
      signingIn: false
    };
  },
  methods: {
    async logout() {
      await Vue.API.logout(null);
    }
  },
  async mounted() {
    // Check for
    const code = this.$route.query.code;
    if (code != null) {
      this.signingIn = true;
      await Vue.API.login(null, code);
      this.signingIn = false;
      if (this.$auth.isAuthenticated) {
        this.$router.replace({ name: "app" });
      }
    }
  }
};
</script>
