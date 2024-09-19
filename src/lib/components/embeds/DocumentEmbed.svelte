<script lang="ts">
  import type { Document, DocumentText } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import { type EmbedSettings, defaultSettings } from "$lib/utils/embed";
  import Metadata from "../common/Metadata.svelte";
  import Viewer from "../documents/Viewer.svelte";

  import { isOrg, isUser } from "$lib/api/accounts";

  export let document: Document;
  export let text: Promise<DocumentText> | DocumentText;
  export let settings: Partial<EmbedSettings> = defaultSettings;

  $: user = isUser(document.user) ? document.user.name : undefined;
  $: org = isOrg(document.organization)
    ? document.organization.name
    : undefined;
  $: contributedBy = settings.onlyshoworg ? org : `${user} (${org})`;
</script>

<div class="container">
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
  }
</style>
