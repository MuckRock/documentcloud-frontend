<script lang="ts">
  import MainLayout from "@/lib/components/MainLayout.svelte";
  import "@/style/kit.css";
  import Projects from "./sidebar/Projects.svelte";
  import Documents from "./sidebar/Documents.svelte";
  import Button from "@/lib/components/common/Button.svelte";
  import { PlusCircle16 } from "svelte-octicons";
  import Actions from "./sidebar/Actions.svelte";
  import AddOns from "./sidebar/AddOns.svelte";
  import type { AddOnListItem } from "@/lib/api/types";
  import type { Page } from "@/api/types";
  import SignedIn from "@/lib/components/common/SignedIn.svelte";

  export let data: {
    pinnedAddons: Promise<Page<AddOnListItem>>;
  };
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<MainLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <SignedIn>
      <Projects />
    </SignedIn>
  </svelte:fragment>

  <slot slot="content" />

  <svelte:fragment slot="action">
    <SignedIn>
      <Button mode="primary"><PlusCircle16 /> Upload Documents</Button>
      <Actions />
      <AddOns pinnedAddOns={data.pinnedAddons} />
    </SignedIn>
  </svelte:fragment>
</MainLayout>
