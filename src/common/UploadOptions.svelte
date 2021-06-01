<script>
  import Omniselect from "./Omniselect";
  import Checkbox from "./Checkbox";
  import { defaultLanguage, languages } from "@/api/languages";
  import { _ } from "svelte-i18n";

  export let language = defaultLanguage;
  export let forceOcr = false;
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
  <Omniselect options={languages} bind:selected={language} />
</div>

<div class="option">
  <b>{$_("uploadOptions.forceOcr")}</b>
  <div class="middle">
    <input type="checkbox" bind:checked={forceOcr} />
  </div>
</div>
