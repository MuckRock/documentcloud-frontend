<!-- @component
  The Text input provides styling to the default `<input type="text" … />`.
-->

<script lang="ts">
  export let name: null | string = null;
  export let placeholder = "";
  export let value: undefined | number = undefined;
  export let autofocus = false;
  export let required = false;
  export let disabled = false;
  export let min: undefined | number = undefined;
  export let max: undefined | number = undefined;
  export let step: undefined | number = undefined;
</script>

<!-- svelte-ignore a11y-autofocus -->
<input
  type="number"
  {name}
  {placeholder}
  {required}
  {disabled}
  {autofocus}
  {min}
  {max}
  {step}
  bind:value
  on:change
  on:input
  on:focus
  on:blur
/>

<style>
  input {
    display: flex;
    padding: 0.375rem 0.75rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: 100%;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-3, hwb(205 60% 30%));
    background: var(--white, #fff);
    box-shadow: 0px 2px 0px 0px var(--gray-2, #d8dee2) inset;

    color: var(--gray-5, #233944);
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: "Source Sans Pro";
    font-size: var(--font-size, 1rem);
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
  input::placeholder {
    color: var(--gray-3, #99a8b3);
  }
</style>
