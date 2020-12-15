<script>
  import MainContainer from "@/pages/app/MainContainer";

  import { documents } from "@/manager/documents";
  import { layout } from "@/manager/layout";
</script>

<style>
  div {
    background: white;
  }
</style>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>
<div>
  <MainContainer
    documents={$documents.documents}
    loading={$layout.loading}
    error={$layout.error}
    embed={true} />
</div>
