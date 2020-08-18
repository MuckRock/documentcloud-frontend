<script>
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { getEmbed } from "@/api/embed";
  import { queryBuilder } from "@/util/url";

  let embedElem;
  let linkElem;

  let embedded = true;

  $: embedUrl = queryBuilder($layout.embedDocument.canonicalUrl, {
    embed: embedded ? 1 : null,
    title: 1
  });

  let embedCode = null;

  $: {
    if (embedUrl != null) {
      getEmbed(embedUrl).then(({ html }) => (embedCode = html));
    }
  }
</script>

<h1>Share “{$layout.embedDocument.title}”</h1>

<ShareOptions
  embedDescription="Copy the HTML code to embed this document within an article
  or post:"
  {embedCode}
  linkText={$layout.embedDocument.canonicalUrl}
  tweetText={`${$layout.embedDocument.title} ${$layout.embedDocument.canonicalUrl}`} />
