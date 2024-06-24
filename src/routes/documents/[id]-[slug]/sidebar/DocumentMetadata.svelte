<script lang="ts">
  import type { Document } from "$lib/api/types";
  import {
    MODAL,
    type ModalContext,
  } from "$lib/components/layouts/Modal.svelte";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Clock16, Pencil16 } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Metadata from "$lib/components/common/Metadata.svelte";
  import Edit from "$lib/components/forms/Edit.svelte";

  import { LANGUAGE_MAP } from "@/config/config.js";
  import { userOrgString } from "$lib/api/documents";

  export let document: Document;

  const modal: ModalContext = getContext(MODAL);

  function dateFormat(date: Date | string) {
    return new Date(date).toLocaleDateString();
  }

  function openEdit() {
    $modal = {
      title: $_("edit.title"),
      component: Edit,
      props: { document },
    };
  }
</script>

<!--
  @component
  Document metadata:

  - title
  - description
  - contributor
  - source
  - last modified
  - uploaded
-->
<Flex direction="column" gap={1}>
  <header>
    <h1>
      {document.title}
    </h1>
    {#if document.edit_access}
      <Action icon={Pencil16} on:click={openEdit}>{$_("sidebar.edit")}</Action>
    {/if}
  </header>

  {#if document.description}
    <p class="description">
      {document.description}
    </p>
  {/if}
  <Metadata key={$_("sidebar.contributed")} value={userOrgString(document)} />
  <Flex>
    <Metadata
      key={$_("sidebar.created")}
      value={dateFormat(document.created_at)}
      ><Clock16 slot="icon" />
    </Metadata>
    <Metadata
      key={$_("sidebar.updated")}
      value={dateFormat(document.updated_at)}
      ><Clock16 slot="icon" />
    </Metadata>
  </Flex>
</Flex>

<Metadata
  key={$_("sidebar.language")}
  value={LANGUAGE_MAP.get(document.language)}
/>

<style>
  header h1 {
    display: inline;
    overflow-wrap: break-word;
  }
</style>
