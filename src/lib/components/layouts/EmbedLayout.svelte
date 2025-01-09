<script lang="ts">
  import type { EmbedSettings } from "$lib/utils/embed";

  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { ScreenFull16, ScreenNormal16, Download16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Logo from "../common/Logo.svelte";
  import Tooltip from "$lib/components/common/Tooltip.svelte";

  export let canonicalUrl: string;
  export let downloadUrl: string = "";
  export let settings: Partial<EmbedSettings> = {};

  let embedRef: HTMLDivElement;
  let isFullscreen = false;
  let isFullscreenSupported = false;

  onMount(() => {
    isFullscreenSupported = window.document.fullscreenEnabled;
  });

  function handleFullscreenChange() {
    isFullscreen = Boolean(window.document.fullscreenElement);
  }

  function toggleFullscreen() {
    if (!window.document.fullscreenElement) {
      embedRef?.requestFullscreen();
    } else {
      window.document.exitFullscreen();
    }
  }
</script>

<div
  class="container"
  bind:this={embedRef}
  on:fullscreenchange={handleFullscreenChange}
>
  <main>
    <slot />
  </main>
  <footer>
    <Tooltip caption="View on DocumentCloud">
      <a href={canonicalUrl} class="logo" target="_blank">
        <Logo />
      </a>
    </Tooltip>
    <Flex align="center">
      {#if settings.pdf && downloadUrl}
        <Tooltip caption={$_("embed.download")}>
          <Button
            size="small"
            ghost
            href={downloadUrl}
            download
            target="_blank"
            minW={false}
          >
            <Download16 />
          </Button>
        </Tooltip>
      {/if}
      {#if settings.fullscreen && isFullscreenSupported}
        <Tooltip
          caption={$_(
            isFullscreen ? "embed.exitFullscreen" : "embed.enterFullscreen",
          )}
        >
          <Button size="small" ghost minW={false} on:click={toggleFullscreen}>
            {#if isFullscreen}
              <ScreenNormal16 />
            {:else}
              <ScreenFull16 />
            {/if}
          </Button>
        </Tooltip>
      {/if}
    </Flex>
  </footer>
</div>

<style>
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--white);
  }
  .logo {
    height: 1.25rem;
  }
  main {
    flex: 1 1 auto;
    overflow-y: auto;
    background: var(--gray-1);
  }
  footer {
    flex: 0 0 2.5rem;
    padding: 0.25rem 0.75rem;
    border-top: 1px solid var(--gray-2);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
