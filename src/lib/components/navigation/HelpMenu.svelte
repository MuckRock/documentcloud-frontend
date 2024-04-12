<script lang="ts">
  import { _ } from "svelte-i18n";
  import Dropdown from "@/common/Dropdown2.svelte";
  import Menu from "@/common/Menu.svelte";

  import {
    CommentDiscussion16,
    Search16,
    Code16,
    Plug16,
    Mail16,
    Question24,
    ChevronDown16,
  } from "svelte-octicons";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import Premium from "@/common/icons/Premium.svelte";
</script>

<!-- Help Menu -->
<Dropdown id="help" position="right">
  <SidebarItem slot="title">
    <Question24 />
    <div class="dropdownArrow"><ChevronDown16 /></div>
  </SidebarItem>
  <Menu>
    <SidebarItem href="/help/faq">
      <CommentDiscussion16 />
      {$_("authSection.help.faq")}
    </SidebarItem>
    <SidebarItem href="/help/search">
      <Search16 />
      {$_("authSection.help.searchDocs")}
    </SidebarItem>
    <SidebarItem href="/help/api">
      <Code16 />
      {$_("authSection.help.apiDocs")}
    </SidebarItem>
    <SidebarItem href="/help/add-ons">
      <Plug16 />
      {$_("authSection.help.addOns")}
    </SidebarItem>
    <SidebarItem href="/help/premium">
      <Premium />
      {$_("authSection.help.premium")}
    </SidebarItem>
    <SidebarItem href="mailto:info@documentcloud.org" target="_blank">
      <Mail16 />
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
