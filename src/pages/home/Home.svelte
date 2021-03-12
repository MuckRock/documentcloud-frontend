<script>
  import HomeTemplate from "./HomeTemplate";
  import Link from "@/router/Link";
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<HomeTemplate showMast="true">
  <p>
    DocumentCloud is an all-in-one platform for documents: upload, organize,
    analyze, annotate, search, and embed. <Link color={true} to="app"
      >View public documents</Link
    >
  </p>
</HomeTemplate>
