<script lang="ts">
  import DOMPurify from "isomorphic-dompurify";

  export let title: string = "";
  export let description: string = "";
  export let inline = false;
  export let required = false;
  export let sronly = false;

  function clean(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["a", "strong", "em", "code"],
      ALLOWED_ATTR: ["href"],
    });
  }
</script>

<div class="field" class:inline class:required>
  <label>
    {#if title}
      <span class="title" class:sr-only={sronly}>{title}</span>
    {/if}
    <slot />
  </label>
  {#if description}
    <p class="help">{@html clean(description ?? "")}</p>
  {/if}
  <slot name="error" />
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
