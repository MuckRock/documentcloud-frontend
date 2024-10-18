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
  import { redactions, undo, clear } from "./RedactionLayer.svelte";
  import ConfirmRedaction from "$lib/components/forms/ConfirmRedaction.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";

  import { remToPx } from "$lib/utils/layout";
  import { getViewerHref } from "$lib/utils/viewer";
  import { getDocument } from "./ViewerContext.svelte";

  const documentStore = getDocument();
  $: document = $documentStore;

  let width: number;
  let confirmOpen = false;

  $: BREAKPOINTS = {
    SHOW_LABELS: width > remToPx(32),
    X_SMALL: width < remToPx(24),
  };

  function onCancel() {
    const href = getViewerHref({ document });
    if ($redactions.length > 0) {
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
      disabled={$redactions.length === 0}
      title={$_("redact.undo")}
      minW={false}
      on:click={undo}
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
    width: 100%;
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
