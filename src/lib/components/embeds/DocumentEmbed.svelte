<script lang="ts">
  import type { Document, DocumentText } from "$lib/api/types";

  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";

  import { type EmbedSettings, defaultSettings } from "$lib/utils/embed";
  import Metadata from "../common/Metadata.svelte";
  import Viewer from "../viewer/Viewer.svelte";

  import { getUserName, isOrg, isUser } from "$lib/api/accounts";
  import { Alert16 } from "svelte-octicons";
  import { canonicalUrl } from "@/lib/api/documents";

  export let document: Document;
  export let text: DocumentText;
  export let settings: Partial<EmbedSettings> = defaultSettings;

  // if we're using this layout, we're embedded
  setContext("embed", true);

  $: user = isUser(document.user) ? getUserName(document.user) : undefined;
  $: org = isOrg(document.organization)
    ? document.organization.name
    : undefined;
  $: contributedBy = settings.onlyshoworg ? org : `${user} (${org})`;
</script>

<div class="container">
  {#if document.access !== "public"}
    <div class="banner">
      <Alert16 />
      {$_("embed.document.privacyWarning")}
      <a href={canonicalUrl(document)} target="_blank"
        >{$_("embed.document.privacyFix")}</a
      >
    </div>
  {/if}
  {#if Boolean(settings.title)}
    <header>
      <h1>{document.title}</h1>
      <Metadata key="Contributed by">{contributedBy}</Metadata>
    </header>
  {/if}
  <main>
    <Viewer {document} {text} />
  </main>
</div>

<style>
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  header {
    flex: 0 0 auto;
    width: 100%;
    background: var(--white);
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--gray-2);
  }
  main {
    flex: 1 1 auto;
    overflow-y: auto;
  }
  h1 {
    flex: 0 1 auto;
    font-size: var(--font-md);
    font-weight: var(--font-semibold);
    max-width: 24rem;
    margin: 0;
  }
  .banner {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--orange-1);
    color: var(--orange-5);
    fill: var(--orange-3);
  }
  .banner a {
    color: inherit;
    text-decoration: underline;
  }
</style>
