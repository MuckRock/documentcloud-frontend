<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Tag16, Tag24 } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KV from "$lib/components/common/KV.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  // editing UI
  import EditData from "@/lib/components/forms/EditData.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";

  import * as search from "$lib/utils/search";

  export let document: Document;

  let edit;

  $: tags = document.data["_tag"];
  $: data = Object.entries(document.data).filter(([k, v]) => k !== "_tag");
  $: empty = Object.keys(document.data).length === 0;
</script>

<SidebarGroup name="data">
  <SidebarItem slot="title">
    <Tag16 />
    {$_("sidebar.data.title")}
  </SidebarItem>

  {#if empty}
    <Empty icon={Tag24}>
      <p>{$_("sidebar.data.empty")}</p>
    </Empty>
  {/if}

  <Flex direction="column">
    {#if tags}
      <Flex wrap class="tags">
        {#each tags as tag}
          <KV tag value={tag} href={search.searchUrl(search.tag(tag)).href} />
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

  {#if document.edit_access}
    <Action on:click={(e) => (edit = true)}>
      <p>{$_("data.title")}</p>
    </Action>
  {/if}
</SidebarGroup>

{#if edit}
  <Portal>
    <Modal on:close={(e) => (edit = false)}>
      <h2 slot="title">{$_("data.title")}</h2>
      <EditData {document} on:close={(e) => (edit = false)} />
    </Modal>
  </Portal>
{/if}
