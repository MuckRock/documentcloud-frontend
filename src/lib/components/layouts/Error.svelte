<script lang="ts">
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Error from "../common/Error.svelte";
  import Modal from "./Modal.svelte";
  import Portal from "./Portal.svelte";
  import UserFeedback from "../forms/UserFeedback.svelte";

  import { page } from "$app/stores";
  import type { Maybe } from "$lib/api/types";
  import { getCurrentUser } from "$lib/utils/permissions";
  import { SIGN_IN_URL } from "@/config/config";

  const me = getCurrentUser();

  export let status: Maybe<number> = undefined;

  let feedbackOpen = false;

  $: sign_in_url = new URL(`?next=${$page.url.href}`, SIGN_IN_URL);
</script>

<div class="container">
  <Error>
    {#if status}
      <h1 class="status-code">
        {status}
      </h1>
    {/if}
    <slot name="message" />
  </Error>
  <slot />
  {#if status === 404 && !me}
    <p class="signInMessage">
      {@html $_("error.signIn", { values: { href: sign_in_url.href } })}
    </p>
  {/if}
  <Button
    ghost
    size="small"
    mode="primary"
    on:click={() => (feedbackOpen = true)}
  >
    {$_("error.report")}
  </Button>
</div>

{#if feedbackOpen}
  <Portal>
    <Modal on:close={() => (feedbackOpen = false)}>
      <h1 slot="title">{$_("feedback.title")}</h1>
      <UserFeedback
        user={$me}
        feedbackType="Bug"
        on:close={() => (feedbackOpen = false)}
      />
    </Modal>
  </Portal>
{/if}

<style>
  .container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  .status-code {
    font-size: var(--font-xl);
    font-weight: var(--font-semibold);
  }
  .signInMessage {
    margin: 0;
    font-size: var(--font-sm);
    color: var(--gray-5);
  }
</style>
