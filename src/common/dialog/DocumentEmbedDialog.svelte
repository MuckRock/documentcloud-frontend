<script>
  import AppearanceCustomizer from "@/common/AppearanceCustomizer";
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { getEmbed } from "@/api/embed";
  import { queryBuilder } from "@/util/url";
  import { StorageManager } from "@/util/storageManager";
  import { index } from "@/util/array";
  import { _ } from 'svelte-i18n';

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
      title: $_("dialogDocumentEmbedDialog.responsive"),
      values: [
        [
          $_("dialogDocumentEmbedDialog.respOn"),
          $_("dialogDocumentEmbedDialog.respOnHelp"),
        ],
        [
          $_("dialogDocumentEmbedDialog.respOff"),
          $_("dialogDocumentEmbedDialog.respOffHelp"),
        ],
      ],
      option: RESPONSIVE_OPTION,
      selected: storageManager.get(RESPONSIVE_OPTION, 0),
    },
    {
      type: "dimension",
      title: $_("dialogDocumentEmbedDialog.width"),
      automaticText: $_("dialogDocumentEmbedDialog.widthAuto"),
      fixedText: $_("dialogDocumentEmbedDialog.widthFixed"),
      option: WIDTH_OPTION,
      selected: storageManager.get(WIDTH_OPTION, 0),
    },
    {
      type: "dimension",
      title: $_("dialogDocumentEmbedDialog.height"),
      automaticText: $_("dialogDocumentEmbedDialog.heightAuto"),
      fixedText: $_("dialogDocumentEmbedDialog.heightFixed"),
      option: HEIGHT_OPTION,
      selected: storageManager.get(HEIGHT_OPTION, 0),
    },
    {
      type: "toggle",
      title: $_("dialogDocumentEmbedDialog.sidebarBehavior"),
      values: [
        [
          $_("dialogDocumentEmbedDialog.sbResponsive"),
          $_("dialogDocumentEmbedDialog.sbResponsiveHelp"),
        ],
        [
          $_("dialogDocumentEmbedDialog.hidden"),
          $_("dialogDocumentEmbedDialog.sbHiddenHelp"),
        ],
        [
          $_("dialogDocumentEmbedDialog.visible"),
          $_("dialogDocumentEmbedDialog.sbVisibleHelp"),
        ],
      ],
      option: SIDEBAR_OPTION,
      selected: storageManager.get(SIDEBAR_OPTION, 0),
    },
    {
      type: "toggle",
      title: $_("dialogDocumentEmbedDialog.titleBehavior"),
      values: [
        [
          $_("dialogDocumentEmbedDialog.visibleDefault"),
          $_("dialogDocumentEmbedDialog.tVisibleHelp"),
        ],
        [
          $_("dialogDocumentEmbedDialog.hidden"),
          $_("dialogDocumentEmbedDialog.tHiddenHelp"),
        ],
      ],
      option: TITLE_OPTION,
      selected: storageManager.get(TITLE_OPTION, 0),
    },
    {
      type: "toggle",
      title: $_("dialogDocumentEmbedDialog.pdfLink"),
      values: [
        [
          $_("dialogDocumentEmbedDialog.visibleDefault"),
          $_("dialogDocumentEmbedDialog.plVisibleHelp"),
        ],
        [
          $_("dialogDocumentEmbedDialog.hidden"),
          $_("dialogDocumentEmbedDialog.plHiddenHelp"),
        ],
      ],
      option: PDF_OPTION,
      selected: storageManager.get(PDF_OPTION, 0),
    },
    {
      type: "toggle",
      title: $_("dialogDocumentEmbedDialog.fullscreenOption"),
      values: [
        [
          $_("dialogDocumentEmbedDialog.visibleDefault"),
          $_("dialogDocumentEmbedDialog.fsVisibleHelp"),
        ],
        [
          $_("dialogDocumentEmbedDialog.hidden"),
          $_("dialogDocumentEmbedDialog.fsHiddenHelp"),
        ],
      ],
      option: FULLSCREEN_OPTION,
      selected: storageManager.get(FULLSCREEN_OPTION, 0),
    },
    {
      type: "toggle",
      title: $_("dialogDocumentEmbedDialog.textMode"),
      values: [
        [
          $_("dialogDocumentEmbedDialog.visibleDefault"),
          $_("dialogDocumentEmbedDialog.tmVisibleHelp"),
        ],
        [
          $_("dialogDocumentEmbedDialog.hidden"),
          $_("dialogDocumentEmbedDialog.tmHiddenHelp"),
        ],
      ],
      option: TEXT_OPTION,
      selected: storageManager.get(TEXT_OPTION, 0),
    },
    {
      type: "toggle",
      title: $_("dialogDocumentEmbedDialog.contributedByFormat"),
      values: [
        [
          $_("dialogDocumentEmbedDialog.cbfUserAndOrg"),
          $_("dialogDocumentEmbedDialog.cbfUserAndOrgHelp"),
        ],
        [
          $_("dialogDocumentEmbedDialog.cbfOrgOnly"),
          $_("dialogDocumentEmbedDialog.cbfOrgOnlyHelp"),
        ],
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

<h1>{$_("dialogDocumentEmbedDialog.share", {values: {title: $layout.embedDocument.title}})}</h1>

<ShareOptions
  column={true}
  embedDescription={$_("dialogDocumentEmbedDialog.embedDesc")}
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
