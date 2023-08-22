<script>
  import { _ } from "svelte-i18n";
  import HomeTemplate from "./HomeTemplate.svelte";
  import Link from "../../router/Link.svelte";
</script>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<HomeTemplate showMast="true">
  <p>
    {$_("home.about")}
    <Link color={true} to="app">{$_("home.viewPublicDocs")}</Link>
  </p>
</HomeTemplate>
