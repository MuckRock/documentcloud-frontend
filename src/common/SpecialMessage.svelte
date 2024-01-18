<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { baseApiUrl } from "../api/base.js";
  import { SPECIAL_VERSION, SPECIAL_CONTACT } from "../config/config.js";

  const endpoint = new URL("/api/flatpages/tipofday/", baseApiUrl);

  let loading;

  async function load() {
    const resp = await fetch(endpoint);

    if (!resp.ok) {
      return "";
    }

    const { content } = await resp.json();

    return content;
  }

  onMount(() => {
    loading = load();
  });

  $: show = SPECIAL_VERSION != null && SPECIAL_VERSION.trim().length > 0;
  $: showContact = SPECIAL_CONTACT != null && SPECIAL_CONTACT.trim().length > 0;
</script>

{#if show}
  <div class="container">
    <div class="special">
      {#await loading then content}
        {@html content}
      {:catch}
        {SPECIAL_VERSION}
        {#if showContact}
          {@html $_("specialMessage.constactUs", {
            values: { contact: SPECIAL_CONTACT },
          })}
        {/if}
      {/await}
    </div>
  </div>
{/if}

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
