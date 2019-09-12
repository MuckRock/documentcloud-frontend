<template>
  <div class="field">
    <div class="name">{{name}}</div>
    <div class="input">
      <input
        @keyup.enter="$emit('enter')"
        @input="$emit('input', $event.target.value)"
        :type="type"
        :placeholder="placeholder"
      />
    </div>
  </div>
</template>

<style scoped>
.field {
  margin: 1em 0;
}

.name {
  text-transform: uppercase;
  font-size: 14px;
}

.input input {
  background: white;
  border: solid 1px var(--primary);
  border-radius: var(--radius);
  width: 100%;
  max-width: 300px;
  outline: none;
  font-family: inherit;
  font-size: 16px;
  padding: 3px 6px;
  box-sizing: border-box;
}
</style>

<script>
export default {
  props: {
    name: String,
    type: {
      type: String,
      default: "text"
    },
    placeholder: {
      type: String,
      default: ""
    },
    value: {
      type: String,
      default: ""
    }
  }
};
</script>

