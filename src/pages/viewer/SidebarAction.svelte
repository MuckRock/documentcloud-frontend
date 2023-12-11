<script lang="ts">
  import Badge from "../../common/Badge.svelte";
  import Credit from "../../common/icons/Credit.svelte";

  export let action: () => void;
  export let header: string;
  export let description: string;
  export let disabled = false;
  export let premium = false;
  let className = "";
  export { className as class };
</script>

<button
  class={`action ${className}`}
  class:disabled
  class:premium
  on:click={action}
>
  <header>
    <h3>{header}</h3>
    {#if premium}
      <Badge
        label="Premium"
        badgeColor="var(--premium)"
        labelColor="var(--darkgray)"
      >
        <Credit badge slot="icon" color="var(--darkgray)" />
      </Badge>
    {/if}
  </header>
  <p>{description}</p>
</button>

<style>
  .action {
    appearance: none;
    border: none;
    text-align: left;
    font-family: inherit;
    display: block;
    width: 100%;
    cursor: pointer;
    background: #ffffff;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
    padding: 8px 20px;
  }

  .action.disabled {
    background: #e8e8e8;
    opacity: 0.5;
    cursor: default;
    pointer-events: none;
  }

  .action:hover,
  .action:focus {
    background: rgba(0, 0, 0, 0.02);
  }

  .action header {
    display: flex;
    gap: 1em;
    align-items: center;
    justify-content: space-between;
  }

  .action h3 {
    font-weight: bold;
    font-size: 14px;
    color: var(--viewerDarkGray, #171717);
    margin: 8px 0;
  }

  .action p {
    font-size: 14px;
    line-height: 18px;
    color: var(--viewerGray, #525252);
    margin: 8px 0;
  }
</style>
