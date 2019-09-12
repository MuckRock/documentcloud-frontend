<template>
  <HomePage>
    <div class="vpad">
      <Loader :active="loading">
        <h2>Sign up</h2>
        <p>Create an account to use the DocumentCloud web application.</p>
        <TextBox @enter="signup()" v-model="name" name="Full Name" />
        <TextBox @enter="signup()" v-model="email" name="Email" type="email" />
        <TextBox @enter="signup()" v-model="password" name="Password" type="password" />
        <div class="actions">
          <Button @click="signup()">Sign up</Button>
        </div>
      </Loader>
    </div>
  </HomePage>
</template>

<script>
import HomePage from "./HomePage";
import TextBox from "../common/TextBox";
import Button from "../common/Button";
import Loader from "../common/Loader";

import Vue from "vue";

export default {
  components: { HomePage, TextBox, Button, Loader },
  data() {
    return {
      name: "",
      email: "",
      password: "",
      loading: false
    };
  },
  methods: {
    async signup() {
      const [firstName, lastName] = this.name.split(" ");
      await Vue.API.createAccount(
        this,
        firstName,
        lastName,
        this.email,
        this.password
      );
      if (this.$auth.isAuthenticated) {
        this.$router.push({ name: "app" });
      }
    },
    async logout() {
      await Vue.API.logout(null);
    }
  }
};
</script>

<style scoped>
.actions,
.vpad {
  padding-top: 1em;
}
</style>