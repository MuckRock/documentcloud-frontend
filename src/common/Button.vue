<template>
  <span style="display: inline-block">
    <button
      :disabled="disabled"
      v-if="hasColor"
      @click="$emit('click')"
      :style="{ background: color }"
    >
      <slot></slot>
    </button>
    <button
      :disabled="disabled"
      v-if="!hasColor"
      @click="$emit('click')"
      :class="{ secondary, tertiary, small, caution, nondescript }"
    >
      <slot></slot>
    </button>
  </span>
</template>

<style lang="scss" scoped>
$disabled-opacity: 0.4;

button {
  padding: 6px 15px;
  margin: 6px 0;
  border-radius: $radius;
  outline: none;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  vertical-align: middle;
  background: $primary;
  color: white;
  font-family: inherit;

  &:disabled {
    opacity: $disabled-opacity;
    cursor: inherit;
    filter: grayscale(70%);
  }

  &:hover {
    opacity: $hover-opacity;

    &:disabled {
      opacity: $disabled-opacity;
    }
  }

  &.secondary {
    background: $secondary;
  }

  &.tertiary {
    background: $tertiary;
  }

  &.small {
    padding: 4px 17px;
    font-size: 12px;
  }

  &.nondescript {
    background: none;
    border-radius: none;
    border-bottom: dashed 1px $gray;
    font-size: 14px;
    padding: 0;
    color: black;
    font-weight: normal;
  }

  &.caution {
    color: $caution;

    &.nondescript {
      border-bottom: dashed 1px rgba($caution, 0.5);
    }
  }
}
</style>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
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
    },
    caution: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: null
    }
  },
  computed: {
    hasColor() {
      return this.color != null;
    }
  }
};
</script>
