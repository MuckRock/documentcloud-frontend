<template>
  <div class="title">
    <h1 v-if="doc != null">{{doc.title}}</h1>
    <h2 v-if="doc != null">Contributed by {{doc.organization}}</h2>
  </div>
</template>

<script>
export default {
  props: {
    doc: Object
  }
};
</script>

<style scoped>
.title {
  display: inline-block;
  vertical-align: middle;
}

h1 {
  font-weight: bold;
  font-size: 16px;
  margin: 0;
}

h2 {
  font-weight: normal;
  font-size: 13px;
  margin: 0;
}
</style>