<script lang="ts">
  import "@/style/kit.css";

  import { PlusCircle16 } from "svelte-octicons";
  import type { AddOnListItem } from "@/lib/api/types";
  import type { Page } from "@/api/types";

  import MainLayout from "@/lib/components/MainLayout.svelte";
  import Button from "@/lib/components/common/Button.svelte";
  import SignedIn from "@/lib/components/common/SignedIn.svelte";

  import Actions from "./sidebar/Actions.svelte";
  import AddOns from "./sidebar/AddOns.svelte";
  import Documents from "./sidebar/Documents.svelte";
  import Projects from "./sidebar/Projects.svelte";

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
      <Button mode="primary" href="/app/upload/"
        ><PlusCircle16 /> Upload Documents</Button
      >
      <Actions />
      <AddOns pinnedAddOns={data.pinnedAddons} />
    </SignedIn>
  </svelte:fragment>
</MainLayout>
