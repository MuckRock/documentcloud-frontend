<script>
  import AppearanceCustomizer from "@/common/AppearanceCustomizer";
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { getEmbed } from "@/api/embed";
  import { queryBuilder } from "@/util/url";
  import { StorageManager } from "@/util/storageManager";

  let embedded = true;

  const SIDEBAR_OPTION = 0;
  const WIDTH_OPTION = 1;
  const HEIGHT_OPTION = 2;
  const TITLE_OPTION = 3;
  const PDF_OPTION = 4;
  const FULLSCREEN_OPTION = 5;
  const TEXT_OPTION = 6;
  const ORG_OPTION = 7;

  const storageManager = new StorageManager("vieweroptions");
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
      selected: storageManager.get(SIDEBAR_OPTION, 0),
    },
    {
      type: "dimension",
      title: "Max width",
      selected: storageManager.get(WIDTH_OPTION, 0),
    },
    {
      type: "dimension",
      title: "Max height",
      selected: storageManager.get(HEIGHT_OPTION, 0),
    },
    {
      type: "toggle",
      title: "Title behavior",
      values: [
        [
          "Visible (default)",
          "Display the title and attribution in the header of the viewer",
        ],
        [
          "Hidden",
          "Hide the title in the header of the viewer (still visible in the sidebar)",
        ],
      ],
      selected: storageManager.get(TITLE_OPTION, 0),
    },
    {
      type: "toggle",
      title: "PDF link",
      values: [
        [
          "Visible (default)",
          "Show a link to the raw PDF document in the sidebar",
        ],
        [
          "Hidden",
          "Hide the sidebar PDF link (file is still accessible if the URL is known)",
        ],
      ],
      selected: storageManager.get(PDF_OPTION, 0),
    },
    {
      type: "toggle",
      title: "Fullscreen option",
      values: [
        [
          "Visible (default)",
          "Show a fullscreen icon in the bottom-right corner",
        ],
        ["Hidden", "Hide the fullscreen option"],
      ],
      selected: storageManager.get(FULLSCREEN_OPTION, 0),
    },
    {
      type: "toggle",
      title: "Text mode",
      values: [
        [
          "Visible (default)",
          "Show an option to view the document’s text in the view dropdown",
        ],
        ["Hidden", "Hide text mode"],
      ],
      selected: storageManager.get(TEXT_OPTION, 0),
    },
    {
      type: "toggle",
      title: "Contributed by format",
      values: [
        [
          "User and org (default)",
          "Show a document’s attribution as the user name followed by the organization",
        ],
        ["Org only", "Attribute the document to just the organization"],
      ],
      selected: storageManager.get(ORG_OPTION, 0),
    },
  ];

  function toParam(bool) {
    return bool == true ? 1 : 0;
  }

  $: sidebarBehavior =
    appearanceOptions[SIDEBAR_OPTION].selected == 1
      ? 0
      : appearanceOptions[SIDEBAR_OPTION].selected == 2
      ? 1
      : null;
  $: width =
    appearanceOptions[WIDTH_OPTION].selected == 0
      ? null
      : Number.isFinite(appearanceOptions[WIDTH_OPTION].selected)
      ? appearanceOptions[WIDTH_OPTION].selected
      : null;
  $: height =
    appearanceOptions[HEIGHT_OPTION].selected == 0
      ? null
      : Number.isFinite(appearanceOptions[HEIGHT_OPTION].selected)
      ? appearanceOptions[HEIGHT_OPTION].selected
      : null;
  $: titleBehavior = appearanceOptions[TITLE_OPTION].selected == 1 ? 0 : 1;
  $: pdfBehavior = appearanceOptions[PDF_OPTION].selected == 1 ? 0 : null;
  $: fullscreenBehavior =
    appearanceOptions[FULLSCREEN_OPTION].selected == 1 ? 0 : null;
  $: textBehavior = appearanceOptions[TEXT_OPTION].selected == 1 ? 0 : null;
  $: onlyOrgBehavior = appearanceOptions[ORG_OPTION].selected == 1 ? 1 : null;

  $: embedUrl = queryBuilder($layout.embedDocument.canonicalUrl, {
    embed: embedded ? 1 : null,
    sidebar: sidebarBehavior,
    title: titleBehavior,
    pdf: pdfBehavior,
    fullscreen: fullscreenBehavior,
    text: textBehavior,
    onlyshoworg: onlyOrgBehavior,
  });
  $: linkUrl = queryBuilder($layout.embedDocument.canonicalUrl, {
    sidebar: sidebarBehavior,
  });

  let embedCode = null;
  let errorOccurred = false;

  $: {
    if (embedUrl != null) {
      getEmbed(embedUrl, { width, height })
        .then(({ html }) => (embedCode = html))
        .catch((e) => {
          console.error(e);
          errorOccurred = true;
        });
    }
  }
</script>

<h1>Share “{$layout.embedDocument.title}”</h1>

<ShareOptions
  embedDescription="Copy the HTML code to embed this document within an article
  or post:"
  {embedCode}
  {errorOccurred}
  linkText={linkUrl}
  tweetText={`${$layout.embedDocument.title} ${linkUrl}`}
>
  <AppearanceCustomizer
    options={appearanceOptions}
    {storageManager}
    on:change={() => (appearanceOptions = appearanceOptions)}
  />
</ShareOptions>
