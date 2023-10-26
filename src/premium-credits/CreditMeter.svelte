<script lang="ts">
  import Price from "./Price.svelte";

  export let id: string;
  export let max: number | undefined = undefined;
  export let value: number;
  export let label: string;
  export let helpText: string;

  const low = max ? max / 4 : undefined;
</script>

<style>
  .creditMeter {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    min-width: 16rem;
  }
  .text,
  .number {
    flex: 0 1 auto;
    font-size: 1.125em;
    font-weight: 600;
  }
  .number {
    display: flex;
    align-items: baseline;
    font-size: 1.25em;
  }
  .denominator {
    font-size: 0.75em;
    color: var(--gray);
  }
  .helpText {
    margin: 0.25rem 0 0;
    flex: 1 1 100%;
    font-size: 0.875em;
    color: var(--gray);
  }
  .meter {
    flex: 1 1 100%;
    height: 2em;
  }
  meter::-webkit-meter-bar {
    border: none;
  }
  meter::-webkit-meter-optimum-value {
    background: var(--premium);
    border-radius: 9999px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
</style>

<label for={id} class="creditMeter">
  <span class="text">
    {label}
  </span>
  <span class="number">
    <Price {value} iconSize={1.25} />
    {#if max}
      <span class="denominator">
        /{max.toLocaleString()}
      </span>
    {/if}
  </span>
  {#if helpText}
    <p class="helpText">{helpText}</p>
  {/if}
  {#if max}
    <meter {id} {value} {max} {low} class="meter" />
  {/if}
</label>
