<script>
  import HomeTemplate from "./HomeTemplate";
  import Link from "@/router/Link";
  import { _ } from "svelte-i18n";
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
