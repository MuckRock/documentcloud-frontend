<script>
  import Button from "@/common/Button";
  import { getAddons, getAddonsPage, activateAddon } from "@/api/addon";
  import {
    addons,
    toggleActiveAddon,
  } from "@/manager/addons";
  import SvelteMarkdown from "svelte-markdown";
  import { _ } from "svelte-i18n";
  import emitter from "@/emit";
  import { layout } from "@/manager/layout";

  const emit = emitter({
    dismiss() {},
  });

</script>

<style lang="scss">
  .repository-detail {
    font-size: 16px;
    font-weight: normal;

    a {
      text-decoration: underline;
    }
  }
</style>

<div class="mcontent">
  <h1>Browse Add Ons</h1>
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
      <div>
        <SvelteMarkdown
          source={addon.parameters.description}
          renderers={{ html: null }}
        />
      </div>
      <Button secondary={!addon.active} on:click={() => toggleActiveAddon(addon)}>
        {#if addon.active}
          Active
        {:else}
          Inactive
        {/if}
      </Button>
      <hr />
    {/each}
  </div>
  <div class="buttonpadded">
    <!-- disable button when invalid, maybe -->
    <Button on:click={emit.dismiss}>
      {$_("dialog.done")}
    </Button>
  </div>
</div>
