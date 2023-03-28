<script>
  import {
    defaultLanguage,
    languages,
    textractLanguages,
  } from "@/api/languages.js";
  import { orgsAndUsers, initOrgsAndUsers } from "@/manager/orgsAndUsers.js";
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  export let language = defaultLanguage;
  export let forceOcr = false;
  export let ocrEngine = "tess4";

  const hasTextract = $orgsAndUsers.me.feature_level > 0;

  // is this brittle if there isn't a default language?
  // let languageName = languages.find(
  //   ([code, name]) => code === defaultLanguage,
  // )[1];
  let languageName;

  $: selectLanguages = ocrEngine === "textract" ? textractLanguages : languages;
  $: codeToName = new Map([...selectLanguages]);
  $: nameToCode = (selectLanguages || []).reduce((m, [value, name]) => {
    m.set(name, value);
    return m;
  }, new Map());
  $: language = nameToCode.get(languageName);

  // value, name, disabled
  const ocrEngines = [
    ["tess4", "Tesseract", false],
    ["textract", "Textract", !hasTextract],
  ];

  onMount(async () => {
    await initOrgsAndUsers();
  });
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
</style>

<div class="option">
  <label
    >{$_("uploadOptions.documentLang")}
    <input
      type="search"
      name="document-language"
      list="document-language"
      bind:value={languageName}
    />
  </label>
  <datalist id="document-language">
    <optgroup>
      <option>{codeToName.get(defaultLanguage)}</option>
    </optgroup>
    {#each selectLanguages as [value, name]}
      <option>{name}</option>
    {/each}
  </datalist>
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
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://accounts.muckrock.com/accounts/signup/?intent=documentcloud"
          >{$_("homeTemplate.signUp")} &rarr;</a
        >
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
