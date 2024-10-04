<script lang="ts">
  import { _ } from "svelte-i18n";
  import Dropdown, { closeDropdown } from "@/common/Dropdown2.svelte";
  import Menu from "@/common/Menu.svelte";

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
  } from "svelte-octicons";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import Premium from "@/common/icons/Premium.svelte";
  import { startTour, isTourAvailable } from "../onboarding/GuidedTour.svelte";
  import { page } from "$app/stores";

  export let position = "bottom right";

  function close() {
    closeDropdown("help");
  }

  function onTourClick() {
    close();
    startTour();
  }

  $: showTour = isTourAvailable($page.route.id);
</script>

<!-- Help Menu -->
<Dropdown id="help" {position}>
  <SidebarItem slot="title">
    <Question24 slot="start" />
    <div class="dropdownArrow" slot="end">
      {#if position.includes("bottom")}
        <ChevronDown12 />
      {:else}
        <ChevronUp12 />
      {/if}
    </div>
  </SidebarItem>
  <Menu>
    {#if showTour}
      <SidebarItem hover on:click={onTourClick}>
        <Milestone16 slot="start" />
        Guided Tour
      </SidebarItem>
    {/if}
    <SidebarItem href="/help/faq/" on:click={close}>
      <CommentDiscussion16 slot="start" />
      {$_("authSection.help.faq")}
    </SidebarItem>
    <SidebarItem href="/help/search/" on:click={close}>
      <Search16 slot="start" />
      {$_("authSection.help.searchDocs")}
    </SidebarItem>
    <SidebarItem href="/help/api/" on:click={close}>
      <Code16 slot="start" />
      {$_("authSection.help.apiDocs")}
    </SidebarItem>
    <SidebarItem href="/help/add-ons/" on:click={close}>
      <Plug16 slot="start" />
      {$_("authSection.help.addOns")}
    </SidebarItem>
    <SidebarItem href="/help/premium/" on:click={close}>
      <Premium slot="start" />
      {$_("authSection.help.premium")}
    </SidebarItem>
    <SidebarItem href="https://www.muckrock.com/donate/" on:click={close}>
      <Gift16 slot="start" />
      {$_("authSection.help.donate")}
    </SidebarItem>
    <SidebarItem
      href="mailto:info@documentcloud.org"
      target="_blank"
      on:click={close}
    >
      <Mail16 slot="start" />
      {$_("authSection.help.emailUs")}
    </SidebarItem>
  </Menu>
</Dropdown>

<style>
  .dropdownArrow {
    display: flex;
    align-items: center;
  }
</style>
