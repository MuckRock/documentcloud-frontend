<script lang="ts">
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";
  import {
    ChevronDown12,
    ChevronUp12,
    Code16,
    CommentDiscussion16,
    Gift16,
    Mail16,
    Milestone16,
    Plug16,
    Question24,
    Search16,
    Undo16,
  } from "svelte-octicons";

  import Dropdown, {
    type Placement,
  } from "$lib/components/common/Dropdown.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import Premium from "$lib/components/icons/Premium.svelte";

  import NavItem from "$lib/components/common/NavItem.svelte";

  import { startTour, isTourAvailable } from "../onboarding/GuidedTour.svelte";

  export let position: Placement = "bottom-end";

  function onTourClick() {
    close();
    startTour();
  }

  $: showTour = isTourAvailable($page?.route?.id);
</script>

<!-- Help Menu -->
<Dropdown {position}>
  <NavItem slot="anchor">
    <Question24 slot="start" />
    <div class="dropdownArrow" slot="end">
      {#if position.includes("bottom")}
        <ChevronDown12 />
      {:else}
        <ChevronUp12 />
      {/if}
    </div>
  </NavItem>
  <Menu slot="default" let:close>
    {#if showTour}
      <NavItem hover on:click={onTourClick}>
        <Milestone16 slot="start" />
        Guided Tour
      </NavItem>
    {/if}
    <NavItem href="/help/faq/" on:click={close}>
      <CommentDiscussion16 slot="start" />
      {$_("authSection.help.faq")}
    </NavItem>
    <NavItem href="/help/search/" on:click={close}>
      <Search16 slot="start" />
      {$_("authSection.help.searchDocs")}
    </NavItem>
    <NavItem href="/help/api/" on:click={close}>
      <Code16 slot="start" />
      {$_("authSection.help.apiDocs")}
    </NavItem>
    <NavItem href="/help/add-ons/" on:click={close}>
      <Plug16 slot="start" />
      {$_("authSection.help.addOns")}
    </NavItem>
    <NavItem href="/help/premium/" on:click={close}>
      <Premium slot="start" />
      {$_("authSection.help.premium")}
    </NavItem>
    <NavItem href="https://www.muckrock.com/donate/" on:click={close}>
      <Gift16 slot="start" />
      {$_("authSection.help.donate")}
    </NavItem>
    <NavItem
      href="mailto:info@documentcloud.org"
      target="_blank"
      on:click={close}
    >
      <Mail16 slot="start" />
      {$_("authSection.help.emailUs")}
    </NavItem>
    <NavItem href="https://legacy.www.documentcloud.org">
      <Undo16 slot="start" />
      {$_("authSection.help.legacy")}
    </NavItem>
  </Menu>
</Dropdown>

<style>
  .dropdownArrow {
    display: flex;
    align-items: center;
  }
</style>
