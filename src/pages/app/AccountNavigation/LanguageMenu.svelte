<script lang="ts">
  import { _, locale } from "svelte-i18n";

  import Dropdown from "../../../common/Dropdown.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";

  import langs from "../../../langs/langs.json";
  import LanguageIcon from "../../../common/icons/Language.svelte";

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
  <Dropdown name="language" fixed={true}>
    <MenuTitle
      slot="title"
      label={currentLang[0] ?? $_("authSection.language.title")}
    >
      <LanguageIcon size={1.5} slot="icon" />
    </MenuTitle>
    <Menu>
      {#each langs as [name, code, flag]}
        <MenuItem
          on:click={() => updateLanguage(code)}
          selected={code === $locale}
        >
          {name}
          <span slot="icon">{flag}</span>
        </MenuItem>
      {/each}
    </Menu>
  </Dropdown>
{/if}
