<script>
  import AppearanceCustomizer from "@/common/AppearanceCustomizer";
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { getEmbed } from "@/api/embed";
  import { queryBuilder } from "@/util/url";

  let embedded = true;

  let appearanceOptions = [
    {
      type: "toggle",
      title: "Sidebar behavior",
      values: [
        [
          "Responsive (default)",
          "Show sidebar automatically on large screens and hide on mobile devices. In embed mode, the sidebar will be hidden",
        ],
        ["Hidden", "Hide the sidebar by default"],
        ["Visible", "Show the sidebar by default"],
      ],
      selected: 0,
    },
  ];

  $: sidebarBehavior =
    appearanceOptions[0].selected == 1
      ? 0
      : appearanceOptions[0].selected == 2
      ? 1
      : null;

  $: embedUrl = queryBuilder($layout.embedDocument.canonicalUrl, {
    embed: embedded ? 1 : null,
    title: 1,
    sidebar: sidebarBehavior,
  });
  $: linkUrl = queryBuilder($layout.embedDocument.canonicalUrl, {
    sidebar: sidebarBehavior,
  });

  let embedCode = null;
  let errorOccurred = false;

  $: {
    if (embedUrl != null) {
      getEmbed(embedUrl)
        .then(({ html }) => (embedCode = html))
        .catch((e) => {
          console.error(e);
          errorOccurred = true;
        });
    }
  }
</script>

<h1>Share “{$layout.embedDocument.title}”</h1>

<AppearanceCustomizer
  options={appearanceOptions}
  on:change={() => (appearanceOptions = appearanceOptions)} />

<ShareOptions
  embedDescription="Copy the HTML code to embed this document within an article
  or post:"
  {embedCode}
  {errorOccurred}
  linkText={linkUrl}
  tweetText={`${$layout.embedDocument.title} ${linkUrl}`} />
