<script>
  import Omniselect from "./Omniselect";
  import Checkbox from "./Checkbox";
  import { defaultLanguage, languages } from "@/api/languages";

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
  <b>Document language:</b>
  <Omniselect options={languages} bind:selected={language} />
</div>

<div class="option">
  <b>Force OCR:</b>
  <div class="middle">
    <input type="checkbox" bind:checked={forceOcr} />
  </div>
</div>
