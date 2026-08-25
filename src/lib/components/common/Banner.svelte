<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";
  import Tip from "./Tip.svelte";
  import Button from "./Button.svelte";

  interface BannerProps {
    icon: Snippet;
    mode: ComponentProps<typeof Tip>["mode"];
    message: string;
    buttonLabel?: string;
    buttonAction?: () => void;
  }

  let { icon, mode, message, buttonLabel, buttonAction }: BannerProps =
    $props();
</script>

<Tip {mode} {icon}>
  <div class="privateWarning">
    <div class="message">
      {message}
    </div>
    {#if buttonAction && buttonLabel}
      <Button mode="danger" size="small" onClick={buttonAction}>
        {buttonLabel}
      </Button>
    {/if}
  </div>
</Tip>

<style>
  .privateWarning {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .message {
    flex: 1 1 auto;
  }
</style>
