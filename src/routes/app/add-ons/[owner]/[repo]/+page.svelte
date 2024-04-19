<script lang="ts">
  import MainLayout from "@/lib/components/MainLayout.svelte";

  export let data;
</script>

<MainLayout>
  <svelte:fragment slot="content">
    <h1>{data.addon.name}</h1>
    <p>Placeholder</p>
  </svelte:fragment>
</MainLayout>
