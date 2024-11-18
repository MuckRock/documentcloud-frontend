<script>
  import { _ } from "svelte-i18n";
  import { SPECIAL_CONTACT } from "../config/config.js";
</script>

<div class="container">
  <div class="special">
    <p>
      This is the legacy version of DocumentCloud. Check out the new and
      improved version at <a href="www.documentcloud.org">
        https://www.documentcloud.org
      </a>
      or
      <a target="_blank" rel="noopener noreferrer" href={SPECIAL_CONTACT}>
        send us feedback
      </a>.
    </p>
  </div>
</div>

<style>
  .container {
    padding: 10px 0;
  }

  .special {
    background: #82ffbb;
    display: block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 13px;
    box-sizing: border-box;
    color: #043004;
  }

  .special :global(p:only-child) {
    margin: 0;
  }

  .special :global(a) {
    text-decoration: underline;
  }
</style>
