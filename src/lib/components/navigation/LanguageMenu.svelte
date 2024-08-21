<script lang="ts">
  import { _, locale } from "svelte-i18n";
  import { Check16, ChevronDown16 } from "svelte-octicons";

  import Dropdown, { closeDropdown } from "@/common/Dropdown2.svelte";
  import Menu from "@/common/Menu.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  import langs from "@/langs/langs.json";

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
  <Dropdown id="language" position="bottom right">
    <SidebarItem slot="title">
      <span class="flag">{currentLang[2]}</span>
      <!-- <span class="lang">{currentLang[0]}</span> -->
      <div class="dropdownArrow"><ChevronDown16 /></div>
    </SidebarItem>
    <Menu>
      {#each langs as [name, code, flag]}
        <SidebarItem
          on:click={() => {
            updateLanguage(code);
            closeDropdown("language");
          }}
          hover
          active={code === $locale}
        >
          <span class="flag">{flag}</span>
          <span class="lang">{name}</span>
          {#if code === $locale}<Check16 />{/if}
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
