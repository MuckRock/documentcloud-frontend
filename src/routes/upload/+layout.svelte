<script lang="ts">
  import "@/style/kit.css";

  import MainLayout from "@/lib/components/layouts/MainLayout.svelte";
  import SignedIn from "@/lib/components/common/SignedIn.svelte";

  import Documents from "../documents/sidebar/Documents.svelte";
  import Projects from "../documents/sidebar/Projects.svelte";
</script>

<MainLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <SignedIn>
      <Projects />
    </SignedIn>
  </svelte:fragment>

  <slot slot="content" />
</MainLayout>
