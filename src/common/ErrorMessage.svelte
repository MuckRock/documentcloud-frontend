<script lang="ts">
  import { _ } from "svelte-i18n";
  import Error from "./icons/Error.svelte";

  export let message = $_("errorMessage.default");
</script>

<div class="error">
  <div class="errorIcon"><Error /></div>
  <p>{message}</p>
  <slot />
</div>

<style>
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    font-weight: 600;
    font-size: 0.875em;
    color: var(--caution);
  }

  .errorIcon {
    text-align: center;
    height: 3em;
    width: 3em;
  }
</style>
