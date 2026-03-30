<script lang="ts">
  import { clean } from "$lib/utils/markup";

  interface Props {
    title?: string;
    description?: string;
    inline?: boolean;
    required?: boolean;
    sronly?: boolean;
    children?: import("svelte").Snippet;
    error?: import("svelte").Snippet;
  }

  let {
    title = "",
    description = "",
    inline = false,
    required = false,
    sronly = false,
    children,
    error,
  }: Props = $props();

  const ALLOWED_TAGS = ["a", "strong", "em", "code"];
  const ALLOWED_ATTR = { a: ["href"] };
</script>

<div class="field" class:inline class:required>
  <label>
    {#if title}
      <span class="title" class:sr-only={sronly}>{title}</span>
    {/if}
    {@render children?.()}
  </label>
  {#if description}
    <p class="help">
      {@html clean(description, {
        allowedAttributes: ALLOWED_ATTR,
        allowedTags: ALLOWED_TAGS,
      })}
    </p>
  {/if}
  {@render error?.()}
</div>

<style>
  .field {
    display: block;
    flex: 1 1 auto;
  }
  .field label {
    gap: 0.5em;
    display: flex;
    flex-direction: column;
  }
  .title {
    flex: 1 1 100%;
    font-weight: var(--font-semibold, 600);
  }
  .help {
    margin: 0.5rem 0;
    font-size: var(--font-sm, 0.875em);
    color: var(--gray-4);
    word-break: break-all;
  }
  .inline.field {
    width: 100%;
  }
  .inline.field label {
    flex-direction: row;
    align-items: center;
  }
  .inline.field .title {
    flex: 0 1 auto;
  }
  .required.field .title:after {
    content: "*";
    color: var(--caution);
  }
</style>
