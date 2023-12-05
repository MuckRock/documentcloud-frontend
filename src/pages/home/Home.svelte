<script context="module" lang="ts">
  // todo move this to FlatPage.svelte
  interface FlatPage {
    title: string;
    content: string;
  }
</script>

<script lang="ts">
  import DOMPurify from "dompurify";
  import { marked } from "marked";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import HomeTemplate from "./HomeTemplate.svelte";
  import Link from "../../router/Link.svelte";

  import { baseApiUrl } from "../../api/base.js";

  const endpoint = new URL("/api/flatpages/home/", baseApiUrl);

  // setting the initial state to rejected lets us show the fallback content first
  let loading: Promise<FlatPage> = Promise.reject();

  function render(content) {
    return DOMPurify.sanitize(marked(content));
  }

  async function load() {
    const resp = await fetch(endpoint);

    if (!resp.ok) {
      throw new Error(`Error fetching flat page: ${resp.statusText}`);
    }

    return resp.json();
  }

  onMount(() => {
    loading = load();
  });
</script>

<svelte:head>
  {#await loading then page}
    <title>{page.title} | DocumentCloud</title>
  {:catch}
    <title>DocumentCloud</title>
  {/await}
</svelte:head>

<HomeTemplate showMast>
  {#await loading then page}
    {@html render(page.content)}
  {:catch}
    <p>
      {$_("home.about")}
      <Link color to="app">{$_("home.viewPublicDocs")}</Link>
    </p>
  {/await}
</HomeTemplate>
