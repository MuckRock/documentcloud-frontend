<script lang="ts">
  import { _, locale } from "svelte-i18n";
  import Globe16 from "svelte-octicons/lib/Globe16.svelte";

  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";

  import langs from "../../../langs/langs.json";

  $: currentLang = langs.find(([_, code]) => code == $locale);

  function updateLanguage(code) {
    $locale = code;
    try {
      localStorage.setItem("dc-locale", code);
    } catch (e) {}
  }
</script>

{#if langs.length > 1}
  <!-- Language Menu -->
  <Dropdown position="bottom-end">
    <MenuTitle slot="anchor" label={$_("authSection.language.title")}>
      <div class="icon" slot="icon"><Globe16 /></div>
    </MenuTitle>
    <Menu slot="default" let:close>
      {#each langs as [name, code, flag]}
        <MenuItem
          on:click={() => {
            updateLanguage(code);
            close();
          }}
          selected={code === $locale}
        >
          {name}
          <span slot="icon">{flag}</span>
        </MenuItem>
      {/each}
    </Menu>
  </Dropdown>
{/if}

<style>
  .icon {
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
