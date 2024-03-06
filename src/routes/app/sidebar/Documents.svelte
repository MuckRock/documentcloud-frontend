<script lang="ts">
  import { _ } from "svelte-i18n";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import { Globe16, Infinity16, Lock16, Organization16 } from "svelte-octicons";
  import SignedIn from "@/lib/components/common/SignedIn.svelte";
</script>

<Flex direction="column">
  <SidebarItem hover><Infinity16 /> {$_("projects.allDocuments")}</SidebarItem>
  <SignedIn>
    <SidebarItem hover
      ><Globe16 /> {$_("projects.yourPubDocuments")}</SidebarItem
    >
    <SidebarItem hover><Lock16 /> {$_("projects.yourDocuments")}</SidebarItem>
    <SidebarItem hover>
      <Organization16 />
      {$_("projects.orgDocuments", {
        values: { name: "MuckRock" },
      })}
    </SidebarItem>
  </SignedIn>
</Flex>
