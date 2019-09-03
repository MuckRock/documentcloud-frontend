<template>
  <div class="primary" v-bind:class="{small}">
    <slot></slot>
  </div>
</template>

<style scoped>
.primary {
  font-weight: 600;
  font-size: 18px;
  padding-right: 33px;
  display: inline-block;
  vertical-align: middle;
}

.small {
  font-size: 16px;
  padding-right: 33px;
}
</style>

<script>
export default {
  props: {
    small: {
      type: Boolean,
      default: false
    }
  }
};
</script>