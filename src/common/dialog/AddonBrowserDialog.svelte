<script>
  import SvelteMarkdown from "svelte-markdown";
  import { _ } from "svelte-i18n";
  import debounce from "lodash/debounce";

  import Button from "@/common/Button.svelte";
  import {
    addons,
    toggleActiveAddon,
    getBrowserAddons,
  } from "@/manager/addons.js";
  import emitter from "@/emit.js";

  const emit = emitter({
    dismiss() {},
  });

  const handleInput = debounce((e) => {
    getBrowserAddons(e.target.value);
  }, 300);

  function changePage(url) {
    getBrowserAddons("", url);
    // scroll to top of modal
    document.getElementsByClassName("modal")[0].scroll({ top: 0 });
  }
</script>

<style>
  .repository-detail {
    font-size: 16px;
    font-weight: normal;
  }

  .repository-detail a {
    text-decoration: underline;
  }

  .markdown :global(a) {
    text-decoration: underline;
    color: var(--primary, #4294f0);
  }
</style>

<div class="mcontent">
  <h2>{$_("addonBrowserDialog.browseAll")}</h2>
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
      <h3>
        {addon.name}
        <span class="repository-detail">
          by {addon.repository.split("/")[0]}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.github.com/{addon.repository}"
          >
            ({$_("addonBrowserDialog.viewsource")})
          </a>
        </span>
      </h3>
      <div class="markdown">
        <SvelteMarkdown
          source={addon.parameters.description}
          renderers={{ html: null }}
        />
      </div>
      <Button
        secondary={!addon.active}
        on:click={() => toggleActiveAddon(addon)}
      >
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
