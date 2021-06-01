<script>
  import { pageCache, grabTipOfDay } from "@/manager/pageCache";
  import { _ } from "svelte-i18n";

  const version = process.env.SPECIAL_VERSION;
  const contact = process.env.SPECIAL_CONTACT;

  export let tipoftheday = false;

  $: show =
    version != null &&
    version.trim().length > 0 &&
    (!tipoftheday || (tipoftheday && $pageCache.tipResponse != null));
  $: showContact = contact != null && contact.trim().length > 0;

  $: {
    if (tipoftheday && !$pageCache.grabbingTip) {
      grabTipOfDay();
    }
  }
</script>

<style lang="scss">
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

    :global(p:only-child) {
      margin: 0;
    }

    a {
      text-decoration: underline;
    }
  }
</style>

{#if show}
  <div class="container">
    <div class="special">
      {#if tipoftheday}
        {#if $pageCache.tipResponse != null}
          {@html $pageCache.tipResponse}
        {/if}
      {:else}
        {version}
        {#if showContact}
          {@html $_("specialMessage.constactUs", {
            values: { contact: contact },
          })}
        {/if}
      {/if}
    </div>
  </div>
{/if}
