<!-- @component
A text area for writing text
-->
<script lang="ts">
  import { textAreaResize } from "@/util/textareaResize.js";

  export let name: string = null;
  export let value = "";
  export let placeholder = "";
  export let required = false;
  export let disabled = false;
</script>

<textarea
  bind:value
  {name}
  {required}
  {disabled}
  {placeholder}
  use:textAreaResize
/>

<style>
  textarea {
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
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
</style>
