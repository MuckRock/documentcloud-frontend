<script>
  import MainContainer from "@/pages/app/MainContainer.svelte";

  import { documents } from "@/manager/documents.js";
  import { layout } from "@/manager/layout.js";
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>
<div>
  <MainContainer
    documents={$documents.documents}
    loading={$layout.loading}
    error={$layout.error}
    embed={true}
  />
</div>
