<script lang="ts">
  import { _, locale } from "svelte-i18n";
  import { ChevronDown12, ChevronUp12 } from "svelte-octicons";

  import Dropdown, {
    type Placement,
  } from "@/lib/components/common/Dropdown.svelte";
  import Menu from "@/lib/components/common/Menu.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  import langs from "@/langs/langs.json";
  import Flex from "../common/Flex.svelte";

  export let position: Placement = "bottom-end";

  $: currentLang = langs.find(([_, code]) => code == $locale) ?? langs[0];

  function updateLanguage(code) {
    $locale = code;
    try {
      localStorage.setItem("dc-locale", code);
    } catch (e) {}
  }
</script>

{#if langs.length > 1}
  <!-- Language Menu -->
  <Dropdown {position}>
    <SidebarItem slot="anchor">
      <span class="flag" slot="start">{currentLang[2]}</span>
      <!-- <span class="lang">{currentLang[0]}</span> -->
      <div class="dropdownArrow" slot="end">
        {#if position.includes("bottom")}
          <ChevronDown12 />
        {:else}
          <ChevronUp12 />
        {/if}
      </div>
    </SidebarItem>
    <Menu slot="default" let:close>
      {#each langs as [name, code, flag]}
        <SidebarItem
          on:click={() => {
            updateLanguage(code);
            close();
          }}
          hover
          active={code === $locale}
        >
          <Flex align="center">
            <span class="flag">{flag}</span>
            <span class="lang">{name}</span>
          </Flex>
        </SidebarItem>
      {/each}
    </Menu>
  </Dropdown>
{/if}

<style>
  .flag {
    font-size: var(--font-lg);
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dropdownArrow {
    display: flex;
    align-items: center;
  }
</style>
