<template>
  <button @click="$emit('click')" class="primary" v-bind:class="{small}">
    <slot></slot>
  </button>
</template>

<style scoped>
button {
  padding: 6px 15px;
  margin: 6px 0;
  border-radius: var(--radius);
  outline: none;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  vertical-align: middle;
}

button:hover {
  opacity: var(--hover-opacity);
}

.primary {
  background: var(--primary);
  color: white;
}

.small {
  padding: 4px 17px;
  font-size: 12px;
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