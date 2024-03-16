<script lang="ts">
  import "@/style/kit.css";
  import { PlusCircle16 } from "svelte-octicons";
  import { page } from "$app/stores";

  import Button from "@/lib/components/common/Button.svelte";
  import MainLayout from "@/lib/components/MainLayout.svelte";
  import SignedIn from "@/lib/components/common/SignedIn.svelte";

  import Actions from "./sidebar/Actions.svelte";
  import AddOns from "./sidebar/AddOns.svelte";
  import Documents from "./sidebar/Documents.svelte";
  import Projects from "./sidebar/Projects.svelte";

  // use $page.data to capture complete load results across routes
  $: basement = $page.data.basement;
  $: basementComponent = $page.data.basementComponent;
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<MainLayout {basement} {basementComponent}>
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
      <AddOns pinnedAddOns={$page.data.pinnedAddons} />
    </SignedIn>
  </svelte:fragment>
</MainLayout>
