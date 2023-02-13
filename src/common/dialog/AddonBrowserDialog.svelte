<script>
  import Button from "@/common/Button";
  import { activateAddon } from "@/api/addon";
  import {
    addons,
    toggleActiveAddon,
    getBrowserAddons,
  } from "@/manager/addons";
  import SvelteMarkdown from "svelte-markdown";
  import { _ } from "svelte-i18n";
  import emitter from "@/emit";
  import { layout } from "@/manager/layout";

  import debounce from 'lodash/debounce';

  const emit = emitter({
    dismiss() {},
  });

  const handleInput = debounce(e => { getBrowserAddons(e.target.value); }, 300);

  function changePage(url) {
    getBrowserAddons("", url);
    // scroll to top of modal
    document.getElementsByClassName("modal")[0].scroll({top: 0});
  }

</script>

<style lang="scss">
  .repository-detail {
    font-size: 16px;
    font-weight: normal;

    a {
      text-decoration: underline;
    }
  }

  .markdown :global(a) {
    text-decoration: underline;
    color: $primary;
  }

</style>

<div class="mcontent">
  <h1>Browse Add Ons</h1>
  <div>
    <input
      type="text"
      placeholder={$_("addonBrowserDialog.searchPlaceholder")}
      on:input={handleInput}
    />
  </div>
  <div class="addons">
    <hr />
    {#each $addons.browserAddons as addon}
      <h2>
        {addon.name}
        <span class="repository-detail">
          by {addon.repository.split("/")[0]}
          <a target="_blank" href="https://www.github.com/{addon.repository}">
            (View Source)
          </a>
        </span>
      </h2>
      <div class="markdown">
        <SvelteMarkdown
          source={addon.parameters.description}
          renderers={{ html: null }}
        />
      </div>
      <Button secondary={!addon.active} on:click={() => toggleActiveAddon(addon)}>
        {#if addon.active}
          {$_("addonBrowserDialog.active")}
        {:else}
          {$_("addonBrowserDialog.inactive")}
        {/if}
      </Button>
      <hr />
    {/each}
    <div>
      <Button
        disabled={!$addons.browserPrev}
        on:click={() => changePage($addons.browserPrev)}
      >
        {$_("addonBrowserDialog.previous")}
      </Button>
      <Button
        disabled={!$addons.browserNext}
        on:click={() => changePage($addons.browserNext)}
      >
        {$_("addonBrowserDialog.next")}
      </Button>
    </div>
  </div>
  <div class="buttonpadded">
    <!-- disable button when invalid, maybe -->
    <Button on:click={emit.dismiss}>
      {$_("dialog.done")}
    </Button>
  </div>
</div>
