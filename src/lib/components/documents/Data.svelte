<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { LinkExternal16, Pencil16, Tag16, Tag24 } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KV from "$lib/components/common/KV.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";

  // editing UI
  import EditData from "$lib/components/forms/EditDataMany.svelte";
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

  function externalHref(value: string): string | undefined {
    try {
      const url = new URL(value);
      if (url.protocol === "http:" || url.protocol === "https:")
        return url.href;
    } catch {
      // Metadata values may be plain text rather than URLs.
    }
  }
</script>

<SidebarGroup name="projects:viewer">
  {#snippet title()}
    <NavItem>
      {#snippet start()}
        <Tag16 />
      {/snippet}
      {$_("sidebar.data.title")}
    </NavItem>
  {/snippet}
  {#snippet action()}
    {#if document.edit_access}
      <Action onclick={() => (edit = true)} icon={Pencil16}>
        {$_("common.edit")}
      </Action>
    {/if}
  {/snippet}
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
                {@const destination = externalHref(value)}
                <Flex gap={0.25} align="center">
                  <KV
                    {key}
                    {value}
                    href={search.searchUrl(search.kv(key, value)).href}
                  />
                  {#if destination}
                    <a
                      href={destination}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={value}
                      title={value}><LinkExternal16 /></a
                    >
                  {/if}
                </Flex>
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
    <Modal onclose={() => (edit = false)}>
      {#snippet title()}
        <h2>{$_("data.title")}</h2>
      {/snippet}
      <EditData documents={[document]} onclose={() => (edit = false)} />
    </Modal>
  </Portal>
{/if}
