<script lang="ts" context="module">
  import { writable } from "svelte/store";
  import { settings, settingsConfig } from "$lib/utils/embed";

  export const embedSettings = writable(settings);
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Flex from "../common/Flex.svelte";
  import Field from "../common/Field.svelte";
  import NumberInput from "../inputs/Number.svelte";

  import { StorageManager } from "$lib/utils/storage";

  // The embed customization allows a user to control settings
  // that customize the presentation of a document embed. The user's
  // preferences should be saved to localStorage for future embeds.
  export let storageManager = new StorageManager("vieweroptions");

  // initialize settings with loaded values
  onMount(() => {
    Object.keys(settingsConfig).forEach((key) => {
      const config = settingsConfig[key];
      const storageValue = storageManager.get(
        String(config.storageIndex),
        config.defaultValue,
      );
      if ($embedSettings[key] === null) {
        $embedSettings[key] = storageValue;
      }
    });
  });
</script>

<div>
  {#each Object.entries(settingsConfig) as [name, config]}
    {#if config.field.type === "hidden"}
      <input type="hidden" {name} value={config.defaultValue} />
    {:else}
      <fieldset>
        <legend>{$_(config.field.label)}</legend>
        {#if config.field.type === "dimension"}
          {#if config.field.automatic}
            <Flex>
              <div class="flexItem">
                <Field inline>
                  <label>
                    <input
                      type="radio"
                      {name}
                      value={config.field.automatic.value}
                      bind:group={$embedSettings[name]}
                    />
                    {$_(config.field.automatic.label)}
                    {#if config.defaultValue === config.field.automatic.value}
                      <span class="default">{$_("share.default")}</span>
                    {/if}
                  </label>
                  <p slot="help">
                    {$_(config.field.automatic.help)}
                  </p>
                </Field>
              </div>

              <div class="flexItem">
                <Field inline>
                  <label>
                    <input
                      type="radio"
                      {name}
                      value={$embedSettings[name] >= 1
                        ? $embedSettings[name]
                        : config.field.fixed.value}
                      bind:group={$embedSettings[name]}
                    />
                    {$_(config.field.fixed.label)}

                    {#if config.defaultValue === config.field.fixed.value}
                      <span class="default">{$_("share.default")}</span>
                    {/if}
                  </label>

                  <p slot="help">
                    {$_(config.field.fixed.help)}
                  </p>
                </Field>
              </div>
            </Flex>
          {/if}
          {#if $embedSettings[name] >= 1}
            <div class="number-input">
              <NumberInput min={1} {name} bind:value={$embedSettings[name]} />
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
                      bind:group={$embedSettings[name]}
                    />
                    {$_(option.label)}
                    {#if config.defaultValue === option.value}
                      <span class="default">{$_("share.default")}</span>
                    {/if}
                  </label>
                  <p slot="help">{$_(option.help)}</p>
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
