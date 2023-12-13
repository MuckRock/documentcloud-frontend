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
  import {
    getUpgradeURL,
    isOrgAdmin,
    isPremiumOrg,
  } from "../manager/orgsAndUsers.js";
  import PremiumBadge from "../premium-credits/PremiumBadge.svelte";

  export let language = defaultLanguage;
  export let forceOcr = false;
  export let ocrEngine: "tess4" | "textract" = "tess4";
  export let revisionControl = false;

  let languageName = defaultLanguageName(languages);

  let user: User | null = null;
  let org: Org | null = null;

  async function getUser() {
    try {
      user = await getMe();
    } catch (e) {
      user = null;
      console.error("Error setting User: ", JSON.stringify(e, null, 2));
    }
    try {
      let activeOrg = user?.organization;
      if (typeof activeOrg === "string") {
        org = (await getOrganization(activeOrg)) as Org;
      } else {
        org = activeOrg;
      }
    } catch (e) {
      org = null;
      console.error("Error setting Org: ", JSON.stringify(e, null, 2));
    }
  }

  $: selectLanguages = ocrEngine === "textract" ? textractLanguages : languages;
  $: hasTextract = isPremiumOrg(org);

  // value, name, disabled
  type OCREngine = [value: string, name: string, isPremium: boolean];
  const ocrEngines: OCREngine[] = [
    ["tess4", "Tesseract", false],
    ["textract", "Textract", true],
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

{#await getUserPromise then}
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
          {#each ocrEngines as [value, name, isPremium]}
            <option {value} disabled={isPremium && !isPremiumOrg(org)}
              >{name}</option
            >
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
      <p class="nomargin">
        <span>{@html $_("uploadOptions.textract")}</span>
        {#if !isPremiumOrg(org)}
          {#if isOrgAdmin(user)}
            <span
              >{@html $_("uploadOptions.premiumToutAdmin", {
                values: { upgradeUrl: getUpgradeURL(org) },
              })}</span
            >
          {:else}
            <span class="nomargin"
              >{@html $_("uploadOptions.premiumToutMember")}</span
            >
          {/if}
        {/if}
      </p>
      {#if isPremiumOrg(org) && ocrEngine == "textract"}
        <p>
          {$_("uploadOptions.creditHelpText", {
            values: {
              organization: org.name,
              n: org.monthly_credits,
            },
          })}
        </p>
      {/if}
    </div>
  </div>

  <div class="option">
    <div class="middle">
      <div class="flex spaceBetween">
        <div>
          <label class:fade={!isPremiumOrg(org)}>
            {$_("uploadOptions.revisionControl")}
            <input
              type="checkbox"
              bind:checked={revisionControl}
              disabled={!isPremiumOrg(org)}
            />
          </label>
          <p class="small gray nomargin" class:fade={!isPremiumOrg(org)}>
            {$_("uploadOptions.revisionControlHelp")}
          </p>
        </div>
        <PremiumBadge />
      </div>
      {#if !isPremiumOrg(org)}
        <p class="small gray nomargin">
          {#if isOrgAdmin(user)}
            <span
              >{@html $_("uploadOptions.premiumToutAdmin", {
                values: { upgradeUrl: getUpgradeURL(org) },
              })}</span
            >
          {:else}
            <span class="nomargin"
              >{@html $_("uploadOptions.premiumToutMember")}</span
            >
          {/if}
        </p>
      {/if}
    </div>
  </div>
{/await}

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
  .fade {
    opacity: 0.7;
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
    align-items: flex-start;
  }

  .alignCenter {
    align-items: center;
  }

  .spaceBetween {
    justify-content: space-between;
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
