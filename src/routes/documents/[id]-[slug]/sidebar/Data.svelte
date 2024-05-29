<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Tag16, Tag24 } from "svelte-octicons";

  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KV from "$lib/components/common/KV.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  export let document: Document;

  $: tags = document.data["_tags"];
  $: data = Object.entries(document.data).filter(([k, v]) => k !== "_tags");
  $: empty = Object.keys(document.data).length === 0;
</script>

<SidebarGroup>
  <SidebarItem slot="title">
    <Tag16 />
    <h3>
      {$_("sidebar.data.title")}
    </h3>
  </SidebarItem>

  {#if empty}
    <Empty icon={Tag24}>
      <p>{$_("sidebar.data.empty")}</p>
    </Empty>
  {/if}

  {#if tags}
    <div class="tags">
      <SidebarItem>
        <h4>{$_("sidebar.data.tags")}</h4>
      </SidebarItem>

      <Flex>
        {#each tags as tag}
          <KV tag value={tag} />
        {/each}
      </Flex>
    </div>
  {/if}

  {#if data.length}
    <div class="data">
      <SidebarItem>
        <h4>{$_("sidebar.data.data")}</h4>
      </SidebarItem>
      <Flex direction="row">
        {#each data as [key, values]}
          {#each values as value}
            <KV {key} {value} />
          {/each}
        {/each}
      </Flex>
    </div>
  {/if}
</SidebarGroup>
