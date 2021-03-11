<script>
  import HomeTemplate from "./HomeTemplate";
  import Link from "@/router/Link";
</script>

<style lang="scss">
  a {
    color: $primary;
  }

  .note {
    background: $fyi;
    border-radius: $radius;
    padding: 5px 10px;
    margin: 0 -10px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
  }
</style>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<HomeTemplate showMast="true">
  <p>
    DocumentCloud is an all-in-one platform for documents: upload, organize,
    analyze, annotate, search, and embed. <Link to="app"
      >View public documents</Link
    >
  </p>
</HomeTemplate>
