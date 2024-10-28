<script lang="ts">
  import { _ } from "svelte-i18n";
  import Credit from "../common/icons/Credit.svelte";
  import Button from "../common/Button.svelte";

  export let message: string;
  export let callToAction: string | null = null;
  export let href: string | null = null;
</script>

<div class="container">
  <div class="message">
    <span class="badge"><Credit badge size={2} /></span>
    <p>{message}</p>
  </div>
  {#if callToAction}
    <div class="action">
      <Button premium label={callToAction} {href} on:click />
    </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.125rem 1rem;
    border-radius: 0.1875rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    flex: 1 1 auto;
  }

  .badge {
    flex: 0 1 auto;
  }

  .message p {
    margin: 0;
  }

  .action {
    flex: 1 1 100%;
  }
</style>
