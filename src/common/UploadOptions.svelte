<script>
  import Omniselect from "./Omniselect";
  import Checkbox from "./Checkbox";
  import {
    defaultLanguage,
    languages,
    textractLanguages,
  } from "@/api/languages";
  import { orgsAndUsers, initOrgsAndUsers } from "@/manager/orgsAndUsers";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  export let language = defaultLanguage;
  export let forceOcr = false;
  export let ocrEngine = "tess4";

  const showOcrEngine = $orgsAndUsers.me.feature_level > 0;

  $: selectLanguages = ocrEngine == "textract" ? textractLanguages : languages;

  const ocrEngines = [
    ["tess4", "Tesseract"],
    ["textract", "Textract"],
  ];

  onMount(async () => {
    await initOrgsAndUsers();
  });
</script>

<style lang="scss">
  b,
  .middle {
    display: inline-block;
    vertical-align: middle;
  }
</style>

<div class="option">
  <b>{$_("uploadOptions.documentLang")}</b>
  <Omniselect options={selectLanguages} bind:selected={language} />
</div>

<div class="option">
  <b>{$_("uploadOptions.forceOcr")}</b>
  <div class="middle">
    <input type="checkbox" bind:checked={forceOcr} />
  </div>
</div>

{#if showOcrEngine}
  <div class="option">
    <b>{$_("uploadOptions.ocrEngine")}</b>
    <Omniselect options={ocrEngines} bind:selected={ocrEngine} />
    <div class="small">
      {$_("uploadOptions.creditHelpText", {
        values: {
          organization: $orgsAndUsers.me.organization.name,
          n: $orgsAndUsers.me.organization.monthly_ai_credits,
        },
      })}
    </div>
  </div>
{/if}
