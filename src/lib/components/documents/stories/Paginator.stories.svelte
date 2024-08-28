<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Paginator from "$lib/components/documents/Paginator.svelte";
  import { currentPage } from "$lib/stores/viewer";

  export const meta = {
    title: "Viewer / Paginator",
    component: Paginator,
    parameters: {
      layout: "centered",
    },
  };
</script>

<Story name="default">
  <Paginator totalPages={100} />
  <pre class="storeValue">
    <code>
      $currentPage = {$currentPage}
    </code>
  </pre>
</Story>

<style>
  .storeValue {
    font-size: 1rem;
    font-family: var(--font-mono);
    font-weight: var(--font-semibold);
    background: var(--gray-5);
    color: var(--white);
    border-radius: 1rem;
    border: 1px solid var(--black);
    border-top: 2px;
  }
  .storeValue code {
    margin-bottom: 0;
  }
</style>
