<script lang="ts">
  import { _, locale } from "svelte-i18n";
  import { ChevronDown12, ChevronUp12 } from "svelte-octicons";

  import Dropdown, {
    type Placement,
  } from "$lib/components/common/Dropdown.svelte";
  import Flex from "../common/Flex.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";

  import { LANGUAGES } from "@/config/config.js";

  export let position: Placement = "bottom-end";

  $: currentLang =
    LANGUAGES.find(([_, code]) => code === $locale) ?? LANGUAGES[0];

  function updateLanguage(code: string) {
    $locale = code;
    try {
      localStorage.setItem("dc-locale", code);
    } catch (e) {}
  }
</script>

{#if LANGUAGES.length > 1}
  <!-- Language Menu -->
  <Dropdown {position}>
    <NavItem slot="anchor">
      <span class="flag" slot="start">{currentLang?.[2]}</span>
      <!-- <span class="lang">{currentLang[0]}</span> -->
      <div class="dropdownArrow" slot="end">
        {#if position.includes("bottom")}
          <ChevronDown12 />
        {:else}
          <ChevronUp12 />
        {/if}
      </div>
    </NavItem>
    <Menu slot="inner" let:close>
      {#each LANGUAGES as [name, code, flag]}
        <NavItem
          on:click={() => {
            updateLanguage(code ?? "");
            close();
          }}
          hover
          active={code === $locale}
        >
          <Flex align="center">
            <span class="flag">{flag}</span>
            <span class="lang">{name}</span>
          </Flex>
        </NavItem>
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
