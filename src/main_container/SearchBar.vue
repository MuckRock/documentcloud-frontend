<template>
  <div class="search">
    <img svg-inline src="../assets/search_icon.svg" />
    <input v-model="search" placeholder="Search" @keyup.enter="searchNow()" />
  </div>
</template>

<script>
import { clearTimeout, setTimeout } from "timers";
let timeout = null;

const SEARCH_DELAY = 500;

export default {
  data() {
    return {
      search: ""
    };
  },
  watch: {
    search() {
      if (timeout != null) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => {
        this.$emit("search", this.search);
      }, SEARCH_DELAY);
    }
  },
  methods: {
    searchNow() {
      if (timeout != null) {
        clearTimeout(timeout);
        timeout = null;
      }
      this.$emit("search", this.search);
    }
  }
};
</script>

<style lang="scss" scoped>
.search {
  background: #f1f2f4;
  height: 42px;
  border-radius: $radius;
  margin: 0 0 74px 0;
  width: 100%;
  position: relative;
  box-sizing: border-box;

  @media only screen and (max-width: 600px) {
    margin: 0 0 44px 0;
  }
}

svg {
  position: absolute;
  pointer-events: none;
  padding: 13px 17px;
}

input {
  width: 100%;
  height: 100%;
  padding-left: 56px;
  padding-right: 12px;
  font-family: inherit;
  border: none;
  line-height: 42px;
  font-size: 16px;
  color: black;
  outline: none;
  background: none;
  box-sizing: border-box;
}

::placeholder {
  color: rgba(0, 0, 0, 0.76);
}
</style>
