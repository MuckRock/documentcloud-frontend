<script lang="ts">
  import {
    defaultLanguage,
    languages,
    textractLanguages,
  } from "../api/languages.js";
  import { _ } from "svelte-i18n";
  import Select from "./Select.svelte";
  import type { Org, User } from "../pages/app/accounts/types.js";
  import { getMe, getOrganization } from "../api/orgAndUser.js";
  import { onMount } from "svelte";

  export let language = defaultLanguage;
  export let forceOcr = false;
  export let ocrEngine = "tess4";
  export let revisionControl = false;

  let languageName = defaultLanguageName(languages);

  let user: User | null = null;
  let org: Org | null = null;

  async function getUser() {
    try {
      user = await getMe();
      const activeOrg = user?.organization;
      if (typeof activeOrg === "string") {
        org = await getOrganization(activeOrg);
      } else {
        org = activeOrg;
      }
    } catch (e) {
      user = null;
    }
  }

  $: hasTextract = user?.feature_level > 0;
  $: selectLanguages = ocrEngine === "textract" ? textractLanguages : languages;

  // value, name, disabled
  type OCREngine = [string, string, boolean];
  const ocrEngines: OCREngine[] = [
    ["tess4", "Tesseract", false],
    ["textract", "Textract", !hasTextract],
  ];

  function defaultLanguageName(languages) {
    const [code, name] = languages.find(
      ([code, name]) => code === defaultLanguage,
    );

    return name;
  }

  const getUserPromise = getUser();

  onMount(async () => {
    await getUser();
  });
</script>

<div class="option">
  <Select
    name="document-language"
    label={$_("uploadOptions.documentLang")}
    placeholder={$_("uploadOptions.documentLanguagePlaceholder")}
    options={selectLanguages}
    bind:selected={languageName}
    bind:value={language}
  />
</div>

<div class="option">
  <div class="flex alignCenter">
    <label>
      {$_("uploadOptions.ocrEngine")}
      <select name="ocr-engine" bind:value={ocrEngine}>
        {#each ocrEngines as [value, name, disabled]}
          <option {value} {disabled}>{name}</option>
        {/each}
      </select>
    </label>
    <label>
      {$_("uploadOptions.forceOcr")}
      <input type="checkbox" bind:checked={forceOcr} />
    </label>
  </div>

  <div class="small gray margin">
    <p>{@html $_("uploadOptions.tesseract")}</p>
    {#if !hasTextract}
      <p class="nomargin">
        {@html $_("uploadOptions.textract")}
      </p>
      <p class="nomargin">{@html $_("uploadOptions.premiumTout")}</p>
    {:else}
      {#await getUserPromise then}
        <p>
          {$_("uploadOptions.creditHelpText", {
            values: {
              organization: org.name,
              n: org.monthly_credits,
            },
          })}
        </p>
      {/await}
    {/if}
  </div>
</div>

<div class="option">
  <div class="middle">
    <label>
      {$_("uploadOptions.revisionControl")}
      <input type="checkbox" bind:checked={revisionControl} />
    </label>
    <p class="small gray nomargin">{$_("uploadOptions.revisionControlHelp")}</p>
    <p class="small gray nomargin">{@html $_("uploadOptions.premiumTout")}</p>
  </div>
</div>

<style>
  .margin {
    margin: 1rem 0;
  }
  .nomargin {
    margin: 0;
  }
  .small {
    font-size: smaller;
  }
  .gray {
    color: var(--darkgray);
  }
  .middle {
    display: inline-block;
    vertical-align: middle;
  }
  .option {
    margin-bottom: 1rem;
  }

  .flex {
    display: flex;
    width: 100%;
    gap: 1rem;
  }

  .alignCenter {
    align-items: center;
  }

  label {
    font-weight: bold;
  }

  p :global(a) {
    font-weight: bold;
    text-decoration: underline;
  }

  select {
    border: none;
    border-bottom: solid 1px #333;
    border-radius: 0;
  }
</style>
