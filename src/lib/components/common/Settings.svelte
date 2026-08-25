<script lang="ts">
  import { _ } from "svelte-i18n";

  import type { Writable } from "svelte/store";
  import type { EmbedSettingConfig } from "$lib/utils/embed";

  import Flex from "$lib/components/common/Flex.svelte";
  import Field from "$lib/components/common/Field.svelte";
  import NumberInput from "$lib/components/inputs/Number.svelte";

  let {
    settings,
    values,
  }: {
    settings: Record<string, EmbedSettingConfig>;
    values: Writable<Record<string, any>>;
  } = $props();
</script>

<div class="settings">
  {#each Object.entries(settings) as [name, config]}
    {#if config.field.type === "hidden"}
      <input type="hidden" {name} value={config.defaultValue} />
    {:else}
      <fieldset>
        <legend>{$_(config.field.label)}</legend>
        {#if config.field.type === "dimension"}
          {@const dimension = config.field}
          {#if dimension.automatic}
            <Flex>
              <div class="flexItem">
                <Field inline>
                  <label>
                    <input
                      type="radio"
                      {name}
                      value={dimension.automatic.value}
                      bind:group={$values[name]}
                    />
                    {$_(dimension.automatic.label)}
                    {#if config.defaultValue === dimension.automatic.value}
                      <span class="default">{$_("share.default")}</span>
                    {/if}
                  </label>
                  {#snippet help()}<p>
                      {$_(dimension.automatic!.help)}
                    </p>{/snippet}
                </Field>
              </div>

              <div class="flexItem">
                <Field inline>
                  <label>
                    <input
                      type="radio"
                      {name}
                      value={$values[name] >= 1
                        ? $values[name]
                        : dimension.fixed.value}
                      bind:group={$values[name]}
                    />
                    {$_(dimension.fixed.label)}

                    {#if config.defaultValue === dimension.fixed.value}
                      <span class="default">{$_("share.default")}</span>
                    {/if}
                  </label>

                  {#snippet help()}<p>
                      {$_(dimension.fixed.help)}
                    </p>{/snippet}
                </Field>
              </div>
            </Flex>
          {/if}
          {#if $values[name] >= 1}
            <div class="number-input">
              <NumberInput min={1} {name} bind:value={$values[name]} />
            </div>
          {/if}
        {:else}
          <Flex>
            {#each config.field.options as option}
              <div class="flexItem">
                <Field inline>
                  <label>
                    <input
                      type="radio"
                      {name}
                      value={option.value}
                      bind:group={$values[name]}
                    />
                    {$_(option.label)}
                    {#if config.defaultValue === option.value}
                      <span class="default">{$_("share.default")}</span>
                    {/if}
                  </label>
                  {#snippet help()}<p>{$_(option.help)}</p>{/snippet}
                </Field>
              </div>
            {/each}
          </Flex>
        {/if}
      </fieldset>
    {/if}
  {/each}
</div>

<style>
  .settings {
    padding: 0 0.5em;
    background: var(--gray-1);
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
    height: 100%;
    overflow-y: auto;
  }
  fieldset {
    margin: 0.5em 0;
    border: 1px solid var(--gray-2);
    border-radius: 0.25rem;
  }
  .flexItem {
    flex: 0 1 12rem;
    padding: 0 0.5rem;
  }
  .number-input {
    margin-top: 0.5rem;
  }
  .default {
    font-size: var(--font-xs);
    color: var(--gray-4);
    font-weight: var(--font-semibold);
    margin-left: 0.25rem;
  }
  legend {
    color: var(--gray-5);
    font-weight: var(--font-semibold);
    font-size: var(--font-sm);
    padding: 0.5em;
  }
  input[type="radio"] {
    margin: 0 0.25em 0 0;
    transform: translateY(1px);
  }
  label {
    font-weight: var(--font-semibold);
    color: var(--gray-5);
    padding: 0.25em 0.375em;
    border-radius: 0.25em;
    vertical-align: middle;
  }
  label:hover {
    background: var(--blue-1);
  }
</style>
