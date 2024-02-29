<script>
  import { _ } from "svelte-i18n";

  // SVG assets
  import { Search24 } from "svelte-octicons";
</script>

<div class="no-results">
  <h2>{$_("noDocuments.noSearchResults")}</h2>
  <div class="img">
    <Search24 height="32" width="32" />
  </div>
  <div class="text">
    <p>
      {$_("noDocuments.queryNoResults")}
    </p>
  </div>
</div>

<style>
  .no-results {
    margin: 1em 1.5em;
    background: var(--yellow-light);
    padding: 1em;
    border-radius: 10px;
  }

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 1.5em 0;
    padding-left: 18px;
  }

  .img,
  .text {
    display: inline-block;
    vertical-align: top;
  }

  .text {
    max-width: 80ch;
    width: 30vw;
    margin: 0 2em 1em 2em;
  }
  .text :global(a) {
    color: var(--primary);
  }

  .text p {
    font-size: 15px;
    line-height: 22px;
    margin: 5px 0;
  }

  p {
    margin: 0 1em;
  }
</style>
