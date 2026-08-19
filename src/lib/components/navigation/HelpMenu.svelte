<script lang="ts">
  import { page } from "$app/state";

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
  } from "svelte-octicons";

  import Dropdown, {
    type Placement,
  } from "$lib/components/common/Dropdown.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import Premium from "$lib/components/icons/Premium.svelte";

  import NavItem from "$lib/components/common/NavItem.svelte";

  import { startTour, isTourAvailable } from "../onboarding/GuidedTour.svelte";
  import { HELP } from "@/config/config.js";

  interface Props {
    position?: Placement;
  }

  let { position = "bottom-end" }: Props = $props();

  function onTourClick() {
    close();
    startTour();
  }

  let showTour = $derived(isTourAvailable(page.route.id));
</script>

<!-- Help Menu -->
<Dropdown {position}>
  {#snippet anchor()}
    <NavItem>
      {#snippet start()}
        <Question24 />
      {/snippet}
      {#snippet end()}
        <div class="dropdownArrow">
          {#if position.includes("bottom")}
            <ChevronDown12 />
          {:else}
            <ChevronUp12 />
          {/if}
        </div>
      {/snippet}
    </NavItem>
  {/snippet}
  {#snippet inner({ close })}
    <Menu>
      {#if showTour}
        <NavItem hover onclick={onTourClick}>
          {#snippet start()}
            <Milestone16 />
          {/snippet}
          Guided Tour
        </NavItem>
      {/if}
      <NavItem href={HELP.faq} target="_blank" onclick={close}>
        {#snippet start()}
          <CommentDiscussion16 />
        {/snippet}
        {$_("authSection.help.faq")}
      </NavItem>
      <NavItem href={HELP.search} target="_blank" onclick={close}>
        {#snippet start()}
          <Search16 />
        {/snippet}
        {$_("authSection.help.searchDocs")}
      </NavItem>
      <NavItem href={HELP.api} target="_blank" onclick={close}>
        {#snippet start()}
          <Code16 />
        {/snippet}
        {$_("authSection.help.apiDocs")}
      </NavItem>
      <NavItem href={HELP.addons} target="_blank" onclick={close}>
        {#snippet start()}
          <Plug16 />
        {/snippet}
        {$_("authSection.help.addOns")}
      </NavItem>
      <NavItem href={HELP.premium} target="_blank" onclick={close}>
        {#snippet start()}
          <Premium />
        {/snippet}
        {$_("authSection.help.premium")}
      </NavItem>
      <NavItem href={HELP.donate} target="_blank" onclick={close}>
        {#snippet start()}
          <Gift16 />
        {/snippet}
        {$_("authSection.help.donate")}
      </NavItem>
      <NavItem href={HELP.email} target="_blank" onclick={close}>
        {#snippet start()}
          <Mail16 />
        {/snippet}
        {$_("authSection.help.emailUs")}
      </NavItem>
    </Menu>
  {/snippet}
</Dropdown>

<style>
  .dropdownArrow {
    display: flex;
    align-items: center;
  }
</style>
