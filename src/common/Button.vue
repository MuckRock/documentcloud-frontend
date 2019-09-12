<template>
  <button @click="$emit('click')" :class="{secondary, tertiary, small, nondescript}">
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
  background: var(--primary);
  color: white;
  font-family: inherit;
}

button:hover {
  opacity: var(--hover-opacity);
}

button.secondary {
  background: var(--secondary);
}

button.tertiary {
  background: var(--tertiary);
}

.small {
  padding: 4px 17px;
  font-size: 12px;
}

.nondescript {
  background: none;
  border-radius: none;
  border-bottom: dashed 1px var(--gray);
  font-size: 14px;
  padding: 0;
  color: black;
  font-weight: normal;
}
</style>

<script>
export default {
  props: {
    small: {
      type: Boolean,
      default: false
    },
    secondary: {
      type: Boolean,
      default: false
    },
    tertiary: {
      type: Boolean,
      default: false
    },
    nondescript: {
      type: Boolean,
      default: false
    }
  }
};
</script>