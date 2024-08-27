<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { ChevronDown12, Pencil16, Tag16, Tag24 } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KV from "$lib/components/common/KV.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  // editing UI
  import EditData from "@/lib/components/forms/EditData.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";

  import * as search from "$lib/utils/search";
  import Dropdown from "@/common/Dropdown2.svelte";
  import Menu from "@/common/Menu.svelte";
  import Button from "../common/Button.svelte";

  export let document: Document;

  let edit = false;

  $: tags = document.data["_tag"];
  $: data = Object.entries(document.data).filter(([k, v]) => k !== "_tag");
  $: empty = Object.keys(document.data).length === 0;
</script>

<Dropdown id="document-projects" position="bottom left" --offset=".25rem">
  <SidebarItem slot="title">
    <Tag16 />
    {$_("sidebar.data.title")}
    <ChevronDown12 />
  </SidebarItem>
  <Menu>
    {#if empty}
      <Empty icon={Tag24}>
        <p>{$_("sidebar.data.empty")}</p>
      </Empty>
    {/if}

    <Flex direction="column" gap={1}>
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

      {#if document.edit_access}
        <Button
          size="small"
          ghost
          mode="primary"
          on:click={() => (edit = true)}
        >
          <Pencil16 />
          {$_("data.title")}
        </Button>
      {/if}
    </Flex>
  </Menu>
</Dropdown>

{#if edit}
  <Portal>
    <Modal on:close={() => (edit = false)}>
      <h2 slot="title">{$_("data.title")}</h2>
      <EditData {document} on:close={() => (edit = false)} />
    </Modal>
  </Portal>
{/if}
