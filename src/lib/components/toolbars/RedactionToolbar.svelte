<!-- @component
Assumes it's a child of a ViewerContext 
-->

<script lang="ts">
  import { goto } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import {
    Check16,
    EyeClosed16,
    Question16,
    Undo16,
    X16,
  } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Tooltip from "$lib/components/common/Tooltip.svelte";

  import ConfirmRedaction from "$lib/components/forms/ConfirmRedaction.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";

  import { redactions, undo, clear } from "../viewer/RedactionLayer.svelte";
  import { remToPx } from "$lib/utils/layout";
  import { getViewerHref } from "$lib/utils/viewer";
  import { getDocument } from "../viewer/ViewerContext.svelte";

  const documentStore = getDocument();
  let document = $derived($documentStore);

  let width: number = $state(800);
  let confirmOpen = $state(false);

  let BREAKPOINTS = $derived({
    SHOW_LABELS: width > remToPx(32),
    X_SMALL: width < remToPx(24),
  });

  let hasRedactions = $derived($redactions.length > 0);

  function onCancel() {
    const href = getViewerHref({ document });
    if (hasRedactions) {
      if (confirm($_("redact.cancelWarning"))) {
        clear();
        goto(href);
      }
    } else {
      goto(href);
    }
  }
</script>

<div class="toolbar" bind:clientWidth={width}>
  <Flex align="center">
    <h3 class="title"><EyeClosed16 /> {$_("redact.title")}</h3>
    <Tooltip caption={$_("redact.instructions")}>
      <Question16 fill="var(--blue-3)" />
    </Tooltip>
  </Flex>
  <Flex gap={BREAKPOINTS.X_SMALL ? 0.5 : 1} justify="end" align="center">
    <Button
      ghost
      size="small"
      mode="danger"
      title={$_("redact.cancel")}
      minW={false}
      on:click={onCancel}
    >
      <X16 />
      {#if BREAKPOINTS.SHOW_LABELS}
        {$_("redact.cancel")}
      {/if}
    </Button>
    <Button
      size="small"
      ghost
      disabled={!hasRedactions}
      title={$_("redact.undo")}
      minW={false}
      on:click={(e) => undo()}
    >
      <Undo16 />
      {#if BREAKPOINTS.SHOW_LABELS}
        {$_("redact.undo")}
      {/if}
    </Button>
    <Button
      size="small"
      mode="primary"
      title={$_("redact.confirm")}
      minW={!BREAKPOINTS.X_SMALL}
      on:click={() => (confirmOpen = true)}
    >
      <Check16 />
      {#if BREAKPOINTS.SHOW_LABELS}
        {$_("redact.confirm")}
      {/if}
    </Button>
  </Flex>
</div>

{#if confirmOpen}
  <Portal>
    <Modal on:close={() => (confirmOpen = false)}>
      <h1 slot="title">{$_("redact.confirmTitle")}</h1>
      <ConfirmRedaction {document} on:close={() => (confirmOpen = false)} />
    </Modal>
  </Portal>
{/if}

<style>
  .toolbar {
    display: inline-flex;
    min-height: 2.5rem;
    padding: 0 0.25rem;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: unset;
    background: var(--white);
  }
  .title {
    font-weight: var(--font-semibold);
    font-size: var(--font-md);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }
</style>
