<template>
  <router-link :to="{name: 'home'}">
    <img svg-inline class="logo" src="../assets/dc_logo.svg" draggable="false" />
  </router-link>
</template>

<style scoped>
.logo {
  width: 166px;
  height: 29px;
  padding: 41px 25px 80px 25px;
  user-select: none;
}

@media only screen and (max-width: 600px) {
  .logo {
    padding: 10px 25px 40px 25px;
  }
}
</style>