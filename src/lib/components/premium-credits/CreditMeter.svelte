<script module lang="ts">
  import type { Maybe, Nullable } from "$lib/api/types";

  export function formatResetDate(
    dateStr: string,
    locale: Maybe<Nullable<string>>,
  ): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "numeric",
    };
    const intl = new Intl.DateTimeFormat(locale ?? "en", options);
    return intl.format(date);
  }
</script>

<script lang="ts">
  import Price from "./Price.svelte";

  interface Props {
    id: string;
    max?: number | undefined;
    value: number;
    label: string;
    helpText: string;
  }

  let { id, max = undefined, value, label, helpText }: Props = $props();

  let low = $derived(max ? max / 4 : undefined);
</script>

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
    <meter {id} {value} {max} {low} class="meter"></meter>
  {/if}
</label>

<style>
  .creditMeter {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
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
  meter::-webkit-meter-suboptimum-value {
    background: var(--highlight-orange);
    border-radius: 9999px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
</style>
