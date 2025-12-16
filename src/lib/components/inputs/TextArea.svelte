<!-- @component
A text area for writing text
-->
<script lang="ts" context="module">
  import { browser } from "$app/environment";

  /**
   * Determines the height of the textarea by collapsing it,
   * and then measuring the amount of overflow.
   */
  export function autoResize(textarea: HTMLTextAreaElement, offset = 2) {
    if (browser && CSS.supports("field-sizing", "content")) return;
    const resize = () => {
      textarea.style.height = "auto"; // reset the height
      textarea.style.height = `${textarea.scrollHeight + offset}px`;
    };

    textarea.style.overflow = "hidden";
    textarea.style.boxSizing = "border-box";

    textarea.addEventListener("input", resize);
    window.addEventListener("resize", resize);
    window.addEventListener("loadingdone", resize);

    return {
      destroy: () => {
        if (browser && CSS.supports("field-sizing", "content")) return;
        textarea.removeEventListener("input", resize);
        window.removeEventListener("resize", resize);
      },
    };
  }
</script>

<script lang="ts">
  export let value = "";
</script>

<textarea bind:value use:autoResize {...$$restProps}></textarea>

<style>
  textarea {
    width: 100%;
    padding: 0.375rem 0.75rem;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-3, hwb(205 60% 30%));
    background: var(--white, #fff);
    box-shadow: 0px 2px 2px 0px var(--gray-2, #d8dee2) inset;

    color: var(--gray-5, #233944);
    font-family: var(--font-family, var(--font-sans, "Source Sans Pro"));
    font-size: var(--font-size, var(--font-md, 1rem));
    font-style: normal;
    font-weight: 400;

    resize: var(--resize, none);
    field-sizing: content;
  }
</style>
