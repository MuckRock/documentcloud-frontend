<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";
  import Tip from "./Tip.svelte";

  interface BannerProps {
    icon: Snippet;
    mode: ComponentProps<typeof Tip>["mode"];
    message: string;
    action?: Snippet;
  }

  let { icon, mode, message, action }: BannerProps = $props();
</script>

<Tip {mode} {icon}>
  <div class="container">
    <div class="message">
      {message}
    </div>
    {@render action?.()}
  </div>
</Tip>

<style>
  .container {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .message {
    flex: 1 1 auto;
  }
</style>
