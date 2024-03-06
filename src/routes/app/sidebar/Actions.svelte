<script lang="ts">
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import { FileDirectory16, Pencil16, Plug16, Share16 } from "svelte-octicons";
</script>

<Flex direction="column">
  <SidebarItem hover disabled><Share16 /> Share…</SidebarItem>
  <SidebarItem hover disabled><Pencil16 /> Edit…</SidebarItem>
  <SidebarItem hover disabled><FileDirectory16 /> Organize…</SidebarItem>
  <SidebarItem hover disabled><Plug16 /> Run…</SidebarItem>
</Flex>
