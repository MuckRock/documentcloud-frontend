<script lang="ts">
  import { _, locale } from "svelte-i18n";

  import Link from "../../../router/Link.svelte";
  import Dropdown from "../../../common/Dropdown.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";

  import Help from "../../../common/icons/Help.svelte";

  import {
    CommentDiscussion16,
    Search16,
    Code16,
    Plug16,
    Zap16,
    Mail16,
  } from "svelte-octicons";
</script>

<!-- Help Menu -->
<Dropdown name="help" fixed={true}>
  <MenuTitle slot="title" label={$_("authSection.help.title")}>
    <Help size={1.5} slot="icon" />
  </MenuTitle>
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
    <a href="mailto:info@documentcloud.org" class="color" target="_blank">
      <MenuItem>
        <Mail16 slot="icon" />
        {$_("authSection.help.emailUs")}
      </MenuItem>
    </a>
  </Menu>
</Dropdown>
