<script>
  import {
    defaultLanguage,
    languages,
    textractLanguages,
  } from "@/api/languages.js";
  import { orgsAndUsers, initOrgsAndUsers } from "@/manager/orgsAndUsers.js";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import Select from "./Select.svelte";

  export let language = defaultLanguage;
  export let forceOcr = false;
  export let ocrEngine = "tess4";

  const hasTextract = $orgsAndUsers.me.feature_level > 0;

  let languageName = defaultLanguageName(languages);

  $: selectLanguages = ocrEngine === "textract" ? textractLanguages : languages;

  // value, name, disabled
  const ocrEngines = [
    ["tess4", "Tesseract", false],
    ["textract", "Textract", !hasTextract],
  ];

  onMount(async () => {
    await initOrgsAndUsers();
  });

  function defaultLanguageName(languages) {
    const [code, name] = languages.find(
      ([code, name]) => code === defaultLanguage,
    );

    return name;
  }
</script>

<style>
  .small {
    font-size: smaller;
  }
  .middle {
    display: inline-block;
    vertical-align: middle;
  }

  label {
    font-weight: bold;
  }

  p :global(a) {
    font-weight: bold;
  }

  p :global(a:hover) {
    text-decoration: underline;
  }

  select {
    border: none;
    border-bottom: solid 1px #333;
    border-radius: 0;
  }
</style>

<div class="option">
  <Select
    name="document-language"
    label={$_("uploadOptions.documentLang")}
    placeholder={$_("omniselect.filter")}
    options={selectLanguages}
    bind:selected={languageName}
    bind:value={language}
  />
</div>

<div class="option">
  <div class="middle">
    <label
      >{$_("uploadOptions.forceOcr")}
      <input type="checkbox" bind:checked={forceOcr} /></label
    >
  </div>
</div>

<div class="option">
  <label>
    {$_("uploadOptions.ocrEngine")}
    <select name="ocr-engine" bind:value={ocrEngine}>
      {#each ocrEngines as [value, name, disabled]}
        <option {value} {disabled}>{name}</option>
      {/each}
    </select>
  </label>

  <div class="small">
    <p>{@html $_("uploadOptions.tesseract")}</p>
    {#if !hasTextract}
      <p>
        {@html $_("uploadOptions.textractPremium")}
      </p>
    {:else}
      <p>
        {$_("uploadOptions.creditHelpText", {
          values: {
            organization: $orgsAndUsers.me.organization.name,
            n: $orgsAndUsers.me.organization.monthly_ai_credits,
          },
        })}
      </p>
    {/if}
  </div>
</div>
