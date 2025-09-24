<!-- 
  @component
  An embedded document viewer.
  Assumes it's a child of a ViewerContext
-->
<script lang="ts">
  import { setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert16 } from "svelte-octicons";

  import Metadata from "../common/Metadata.svelte";
  import Viewer from "../viewer/Viewer.svelte";

  import { defaultSettings, type EmbedSettings } from "$lib/utils/embed";
  import { getUserName, isOrg, isUser } from "$lib/api/accounts";
  import { canonicalUrl } from "$lib/api/documents";
  import { getDocument } from "../viewer/ViewerContext.svelte";

  export let settings: Partial<EmbedSettings> = defaultSettings;

  const documentStore = getDocument();

  $: document = $documentStore;

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
      <a href={canonicalUrl(document)} target="_blank">
        {$_("embed.document.privacyFix")}
      </a>
    </div>
  {/if}
  {#if Boolean(settings.title)}
    <header>
      <h1>{document.title}</h1>
      <Metadata key={$_("titleHeader.contributedBy")}>{contributedBy}</Metadata>
    </header>
  {/if}
  <Viewer />
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
