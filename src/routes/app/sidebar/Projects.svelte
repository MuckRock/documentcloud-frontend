<script lang="ts">
  import Pin from "@/common/Pin.svelte";
  import Action from "@/lib/components/common/Action.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import { Book16, FileDirectory16 } from "svelte-octicons";
</script>

<SidebarGroup>
  <SidebarItem slot="title"><FileDirectory16 /> Projects</SidebarItem>
  <Action slot="action" icon={Book16}>Explore</Action>
  <Flex direction="column" gap={0}>
    <SidebarItem small href="/project/1">
      <Pin active /> Oldest Computer
    </SidebarItem>
    <SidebarItem small href="/project/2">
      <Pin active /> FBI Files
    </SidebarItem>
    <SidebarItem small href="/project/3">
      <Pin active /> 1033 Project
    </SidebarItem>
  </Flex>
</SidebarGroup>
