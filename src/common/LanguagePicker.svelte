<script>
  const languageCodes = process.env.LANGUAGE_CODES.split(",");
  const languageNames = process.env.LANGUAGE_NAMES.split("|");
  const primaryLanguages = process.env.PRIMARY_LANGUAGES.split(",");
  export let language = process.env.DEFAULT_LANGUAGE;

  function makeLanguageMap(codes, names) {
    const results = {};
    for (let i = 0; i < codes.length; i++) {
      results[codes[i]] = names[i];
    }
    return results;
  }

  $: languageMap = makeLanguageMap(languageCodes, languageNames);
</script>

Language:
<select bind:value={language}>
  {#each languageCodes as code}
    <option value={code}>{languageMap[code]}</option>
  {/each}
</select>
