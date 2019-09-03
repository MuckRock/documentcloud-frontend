<template>
  <div class="main">
    <Hamburger
      @toggle="$emit('expandSidebar')"
      bg="white"
      style="margin-top: 16px; padding: 1.5em 36px;"
    />
    <div class="container">
      <SearchBar />
      <Documents v-bind:documents="documents" />
    </div>
  </div>
</template>

<style scoped>
.main {
  position: absolute;
  left: var(--sidebar-width);
  top: 0;
}

.container {
  padding: 36px 48px;
}

@media only screen and (max-width: 600px) {
  .main {
    left: 0;
  }
}
</style>

<script>
import SearchBar from "./SearchBar";
import Documents from "./Documents";
import Hamburger from "../common/Hamburger";

export default {
  components: {
    SearchBar,
    Documents,
    Hamburger
  },
  props: {
    query: {
      type: Object
    },
    documents: {
      type: Array
    }
  }
};
</script>