<script>
  import AppearanceCustomizer from "@/common/AppearanceCustomizer";
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { getEmbed } from "@/api/embed";
  import { queryBuilder } from "@/util/url";
  import { StorageManager } from "@/util/storageManager";
  import { index } from "@/util/array";

  let embedded = true;

  // New options should have strictly incrementing numbers.
  // Like protocol buffers, we want to maintain compatibility with
  // users' previous preferences.
  const RESPONSIVE_OPTION = 8; // out-of-order because added later
  const WIDTH_OPTION = 1;
  const HEIGHT_OPTION = 2;
  const SIDEBAR_OPTION = 0;
  const TITLE_OPTION = 3;
  const PDF_OPTION = 4;
  const FULLSCREEN_OPTION = 5;
  const TEXT_OPTION = 6;
  const ORG_OPTION = 7;

  const storageManager = new StorageManager("vieweroptions");
  let appearanceOptions = [
    {
      type: "toggle",
      title: "Responsive",
      values: [
        [
          "On (default)",
          "Fill the width of the article container (usually works best)",
        ],
        ["Off", "The document will fit the sizes specified below"],
      ],
      option: RESPONSIVE_OPTION,
      selected: storageManager.get(RESPONSIVE_OPTION, 0),
    },
    {
      type: "dimension",
      title: "Width",
      automaticText:
        "Will fill the available space if the document is set to responsive, otherwise defaults to 700px",
      fixedText:
        "Set a maximum width if the document is responsive, or set a fixed size if not responsive",
      option: WIDTH_OPTION,
      selected: storageManager.get(WIDTH_OPTION, 0),
    },
    {
      type: "dimension",
      title: "Height",
      automaticText:
        "The height is based on the size of the document, with no maximum size. If responsive, will be set to the height of the browser window minus 100px",
      fixedText:
        "Set a maximum height if the document is responsive, or set a fixed size if not responsive",
      option: HEIGHT_OPTION,
      selected: storageManager.get(HEIGHT_OPTION, 0),
    },
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
      option: SIDEBAR_OPTION,
      selected: storageManager.get(SIDEBAR_OPTION, 0),
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
      option: TITLE_OPTION,
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
      option: PDF_OPTION,
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
      option: FULLSCREEN_OPTION,
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
      option: TEXT_OPTION,
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
      option: ORG_OPTION,
      selected: storageManager.get(ORG_OPTION, 0),
    },
  ];

  function optionIndex(option) {
    return index(
      appearanceOptions.map((x) => x.option),
      option,
    );
  }

  $: sidebarBehavior =
    appearanceOptions[optionIndex(SIDEBAR_OPTION)].selected == 1
      ? 0
      : appearanceOptions[optionIndex(SIDEBAR_OPTION)].selected == 2
      ? 1
      : null;
  $: width =
    appearanceOptions[optionIndex(WIDTH_OPTION)].selected == 0
      ? null
      : Number.isFinite(appearanceOptions[optionIndex(WIDTH_OPTION)].selected)
      ? appearanceOptions[optionIndex(WIDTH_OPTION)].selected
      : null;
  $: height =
    appearanceOptions[optionIndex(HEIGHT_OPTION)].selected == 0
      ? null
      : Number.isFinite(appearanceOptions[optionIndex(HEIGHT_OPTION)].selected)
      ? appearanceOptions[optionIndex(HEIGHT_OPTION)].selected
      : null;
  $: responsive =
    appearanceOptions[optionIndex(RESPONSIVE_OPTION)].selected == 1 ? 0 : 1;
  $: titleBehavior =
    appearanceOptions[optionIndex(TITLE_OPTION)].selected == 1 ? 0 : 1;
  $: pdfBehavior =
    appearanceOptions[optionIndex(PDF_OPTION)].selected == 1 ? 0 : null;
  $: fullscreenBehavior =
    appearanceOptions[optionIndex(FULLSCREEN_OPTION)].selected == 1 ? 0 : null;
  $: textBehavior =
    appearanceOptions[optionIndex(TEXT_OPTION)].selected == 1 ? 0 : null;
  $: onlyOrgBehavior =
    appearanceOptions[optionIndex(ORG_OPTION)].selected == 1 ? 1 : null;

  $: embedUrl = queryBuilder($layout.embedDocument.canonicalUrl, {
    embed: embedded ? 1 : null,
    responsive: responsive,
    sidebar: sidebarBehavior,
    title: titleBehavior,
    pdf: pdfBehavior,
    fullscreen: fullscreenBehavior,
    text: textBehavior,
    onlyshoworg: onlyOrgBehavior,
  });
  $: linkUrl = queryBuilder(embedUrl, {
    embed: null,
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
  column={true}
  embedDescription="Copy the HTML code to embed this document within an article
  or post:"
  {embedCode}
  {errorOccurred}
  linkText={linkUrl}
  tweetText={`${$layout.embedDocument.title} ${linkUrl}`}
  {width}
  {height}
>
  <AppearanceCustomizer
    options={appearanceOptions}
    {storageManager}
    on:change={() => (appearanceOptions = appearanceOptions)}
  />
</ShareOptions>
