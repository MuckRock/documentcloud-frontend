<script lang="ts">
  import { Book16, FileDirectory16 } from "svelte-octicons";
  import SidebarHeader from "./SidebarHeader.svelte";
  import SidebarItem from "./SidebarItem.svelte";
  import Action from "./common/Action.svelte";

  let collapsed = false;
  function toggle(val: boolean) {
    collapsed = !val;
  }
</script>

<div class="container">
  <SidebarHeader {collapsed} {toggle}>
    <SidebarItem><FileDirectory16 /> Project</SidebarItem>
    <Action slot="action" icon={Book16}>Explore</Action>
  </SidebarHeader>
  {#if !collapsed}
    <slot />
  {/if}
</div>
