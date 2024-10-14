<script lang="ts">
  import { _ } from "svelte-i18n";

  import Link from "../../../router/Link.svelte";
  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  import {
    CommentDiscussion16,
    Search16,
    Code16,
    Plug16,
    Zap16,
    Mail16,
    Question16,
    Gift16,
  } from "svelte-octicons";
</script>

<!-- Help Menu -->
<Dropdown position="bottom-end">
  <SidebarItem slot="anchor">
    <Question16 slot="start" />
    {$_("authSection.help.title")}
  </SidebarItem>
  <Menu>
    <Link toUrl="/help/faq" color={true}>
      <MenuItem>
        <CommentDiscussion16 slot="icon" />
        {$_("authSection.help.faq")}
      </MenuItem>
    </Link>
    <Link toUrl="/help/search" color={true}>
      <MenuItem>
        <Search16 slot="icon" />
        {$_("authSection.help.searchDocs")}
      </MenuItem>
    </Link>
    <Link toUrl="/help/api" color={true}>
      <MenuItem>
        <Code16 slot="icon" />
        {$_("authSection.help.apiDocs")}
      </MenuItem>
    </Link>
    <Link toUrl="/help/add-ons" color={true}>
      <MenuItem>
        <Plug16 slot="icon" />
        {$_("authSection.help.addOns")}
      </MenuItem>
    </Link>
    <Link toUrl="/help/premium" color={true}>
      <MenuItem>
        <Zap16 slot="icon" />
        {$_("authSection.help.premium")}
      </MenuItem>
    </Link>
    <a href="https://www.muckrock.com/donate/" class="color">
      <MenuItem>
        <Gift16 slot="icon" />
        {$_("authSection.help.donate")}
      </MenuItem>
    </a>
    <a href="mailto:info@documentcloud.org" class="color" target="_blank">
      <MenuItem>
        <Mail16 slot="icon" />
        {$_("authSection.help.emailUs")}
      </MenuItem>
    </a>
  </Menu>
</Dropdown>

<style>
  .icon {
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
