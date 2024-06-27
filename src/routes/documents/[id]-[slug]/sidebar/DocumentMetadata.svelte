<script lang="ts">
  import type { Document } from "$lib/api/types";
  
  import { _ } from "svelte-i18n";
  import { Clock16, Pencil16 } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Metadata from "$lib/components/common/Metadata.svelte";
  import Edit from "$lib/components/forms/Edit.svelte";

  import { LANGUAGE_MAP } from "@/config/config.js";
  import { userOrgString } from "$lib/api/documents";
  import Portal from "@/lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";

  export let document: Document;

  let editOpen = false;

  function dateFormat(date: Date | string) {
    return new Date(date).toLocaleDateString();
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
      <Action icon={Pencil16} on:click={() => editOpen = true}>{$_("sidebar.edit")}</Action>
      {#if editOpen}
      <Portal>
        <Modal on:close={() => editOpen = false}>
          <h1 slot="title">{$_("edit.title")}</h1>
          <Edit {document} on:close={() => editOpen = false}/>
        </Modal>
      </Portal>
      {/if}
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
