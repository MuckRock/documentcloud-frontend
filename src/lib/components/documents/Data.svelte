<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Pencil16, Tag16, Tag24 } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KV from "$lib/components/common/KV.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";

  // editing UI
  import EditData from "$lib/components/forms/EditData.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";

  import * as search from "$lib/utils/search";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";

  interface Props {
    document: Document;
  }

  let { document }: Props = $props();

  let edit = $state(false);

  let tags = $derived(document.data["_tag"]);
  let data = $derived(
    Object.entries(document.data).filter(([k, v]) => k !== "_tag"),
  );
  let empty = $derived(Object.keys(document.data).length === 0);
</script>

<SidebarGroup name="projects:viewer">
  <NavItem slot="title">
    <Tag16 slot="start" />
    {$_("sidebar.data.title")}
  </NavItem>
  <div slot="action">
    {#if document.edit_access}
      <Action on:click={() => (edit = true)} icon={Pencil16}>
        {$_("common.edit")}
      </Action>
    {/if}
  </div>
  <div>
    {#if empty}
      <Empty icon={Tag24}>
        <p>{$_("sidebar.data.empty")}</p>
      </Empty>
    {:else}
      <Flex direction="column" gap={1}>
        {#if tags}
          <Flex wrap class="tags">
            {#each tags as tag}
              <KV
                tag
                value={tag}
                href={search.searchUrl(search.tag(tag)).href}
              />
            {/each}
          </Flex>
        {/if}

        {#if data.length}
          <Flex wrap class="data">
            {#each data as [key, values]}
              {#each values as value}
                <KV
                  {key}
                  {value}
                  href={search.searchUrl(search.kv(key, value)).href}
                />
              {/each}
            {/each}
          </Flex>
        {/if}
      </Flex>
    {/if}
  </div>
</SidebarGroup>

{#if edit}
  <Portal>
    <Modal on:close={() => (edit = false)}>
      <h2 slot="title">{$_("data.title")}</h2>
      <EditData {document} onclose={() => (edit = false)} />
    </Modal>
  </Portal>
{/if}
