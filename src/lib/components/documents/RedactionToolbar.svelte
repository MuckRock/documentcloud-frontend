<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { _ } from "svelte-i18n";
  import {
    Check16,
    EyeClosed16,
    Question16,
    Undo16,
    X16,
  } from "svelte-octicons";

  import type { Document, ViewerMode } from "$lib/api/types";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import ConfirmRedaction from "$lib/components/forms/ConfirmRedaction.svelte";
  import {
    redactions,
    undo,
    clear,
  } from "$lib/components/documents/RedactionPane.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Tooltip from "@/common/Tooltip.svelte";

  export let document: Document;

  let confirmOpen = false;
  const currentMode: Writable<ViewerMode> = getContext("currentMode");

  function onCancel() {
    if ($redactions.length > 0) {
      if (
        confirm(
          "You will lose unconfirmed redactions. Are you sure you want to cancel?",
        )
      ) {
        clear();
        $currentMode = "document";
      }
    } else {
      $currentMode = "document";
    }
  }
</script>

<PageToolbar>
  <Flex align="center" slot="left">
    <h3 class="title"><EyeClosed16 /> {$_("redact.title")}</h3>
    <Tooltip caption={$_("redact.instructions")}
      ><Question16 fill="var(--blue-3)" /></Tooltip
    >
  </Flex>
  <Flex gap={0} justify="end" align="center" slot="right">
    <Button ghost size="small" mode="danger" on:click={onCancel}>
      <X16 />
      {$_("redact.cancel")}
    </Button>
    <Button
      size="small"
      ghost
      disabled={$redactions.length === 0}
      on:click={undo}
    >
      <Undo16 /> Undo
    </Button>
    <Button size="small" mode="primary" on:click={() => (confirmOpen = true)}>
      <Check16 />
      {$_("redact.confirm")}
    </Button>
  </Flex>
</PageToolbar>
{#if confirmOpen}
  <Portal>
    <Modal on:close={() => (confirmOpen = false)}>
      <h1 slot="title">{$_("redact.confirmTitle")}</h1>
      <ConfirmRedaction {document} on:close={() => (confirmOpen = false)} />
    </Modal>
  </Portal>
{/if}

<style>
  .title {
    font-weight: var(--font-semibold);
    font-size: var(--font-md);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }
</style>
