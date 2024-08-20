<script lang="ts">
  import type { Document, Project } from "$lib/api/types";

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
  import UserAvatar from "../../accounts/UserAvatar.svelte";
  import Data from "./Data.svelte";
  import Projects from "./Projects.svelte";

  export let document: Document;

  let editOpen = false;

  function dateFormat(date: Date | string) {
    return new Date(date).toLocaleDateString();
  }

  $: projects = document.projects as Project[];
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
<div class="container">
  <Flex direction="column" gap={1}>
    <header>
      <h1>
        {document.title}
      </h1>
      {#if document.edit_access}
        <Action icon={Pencil16} on:click={() => (editOpen = true)}
          >{$_("sidebar.edit")}</Action
        >
        {#if editOpen}
          <Portal>
            <Modal on:close={() => (editOpen = false)}>
              <h1 slot="title">{$_("edit.title")}</h1>
              <Edit {document} on:close={() => (editOpen = false)} />
            </Modal>
          </Portal>
        {/if}
      {/if}
    </header>

    {#if document.description}
      <div class="description">
        {@html document.description}
      </div>
    {/if}
    <Flex gap={2} wrap>
      <Metadata
        key={$_("sidebar.contributed")}
        value={userOrgString(document)}
      />
      <Metadata
        key={$_("sidebar.created")}
        value={dateFormat(document.created_at)}
      />
      <Metadata
        key={$_("sidebar.updated")}
        value={dateFormat(document.updated_at)}
      />
      <Metadata
        key={$_("sidebar.language")}
        value={LANGUAGE_MAP.get(document.language)}
      />
    </Flex>

    <Flex>
      <Data {document} />
      <Projects {projects} />
    </Flex>
  </Flex>
</div>

<style>
  .container {
    background: var(--white);
    padding: 2rem;
    border-bottom: 1px solid var(--gray-2);
    box-shadow: var(--shadow-2);
  }
  header h1 {
    display: inline;
    overflow-wrap: break-word;
    font-weight: var(--font-semibold);
    font-size: calc(1.125 * var(--font-xl));
    line-height: 1.2;
  }
  .description {
    color: var(--gray-5);
  }
  :global(.description > *) {
    margin-bottom: 1rem;
  }
</style>
