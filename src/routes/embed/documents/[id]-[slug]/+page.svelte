<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import { _ } from "svelte-i18n";

  import DocumentEmbed from "@/lib/components/embeds/DocumentEmbed.svelte";
  import EmbedLayout from "@/lib/components/layouts/EmbedLayout.svelte";

  // config and utils
  import { canonicalUrl, pdfUrl } from "$lib/api/documents";
  import { getDocument } from "@/lib/components/viewer/ViewerContext.svelte";

  export let data;

  const document = getDocument();
</script>

<EmbedLayout
  settings={data.settings}
  canonicalUrl={canonicalUrl(document).href}
  downloadUrl={pdfUrl(document).href}
>
  <DocumentEmbed settings={data.settings} />
</EmbedLayout>
