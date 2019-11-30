<template>
  <span>
    <router-link
      v-if="!disabled"
      :to="{ name: 'viewer', params: { id: document.slugId } }"
    >
      <slot></slot>
    </router-link>
    <slot v-if="disabled"></slot>
  </span>
</template>

<script>
export default {
  props: {
    document: Object,
    disabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>
