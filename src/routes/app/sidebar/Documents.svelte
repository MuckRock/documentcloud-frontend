<script lang="ts">
  import { _ } from "svelte-i18n";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import { Globe16, Infinity16, Lock16, Organization16 } from "svelte-octicons";
</script>

<Flex direction="column">
  <SidebarItem hover><Infinity16 /> {$_("projects.allDocuments")}</SidebarItem>
  <SidebarItem hover><Globe16 /> {$_("projects.yourPubDocuments")}</SidebarItem>
  <SidebarItem hover><Lock16 /> {$_("projects.yourDocuments")}</SidebarItem>
  <SidebarItem hover>
    <Organization16 />
    {$_("projects.orgDocuments", {
      values: { name: "MuckRock" },
    })}
  </SidebarItem>
</Flex>
