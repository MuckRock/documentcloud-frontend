<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Tag16, Tag24 } from "svelte-octicons";

  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KV from "$lib/components/common/KV.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  import * as search from "$lib/utils/search";

  export let document: Document;

  $: tags = document.data["_tag"];
  $: data = Object.entries(document.data).filter(([k, v]) => k !== "_tag");
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

      <Flex wrap>
        {#each tags as tag}
          <KV tag value={tag} href={search.searchUrl(search.tag(tag)).href} />
        {/each}
      </Flex>
    </div>
  {/if}

  {#if data.length}
    <div class="data">
      <SidebarItem>
        <h4>{$_("sidebar.data.data")}</h4>
      </SidebarItem>
      <Flex wrap>
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
    </div>
  {/if}
</SidebarGroup>
