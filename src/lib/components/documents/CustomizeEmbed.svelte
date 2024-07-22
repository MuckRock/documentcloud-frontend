<script lang="ts" context="module">
  import { writable } from 'svelte/store';
  import { settings } from '@/lib/utils/embed';

  export const embedSettings = writable(settings);
</script>

<script lang="ts">
  import {_} from 'svelte-i18n';
  import { StorageManager } from "@/lib/utils/storage";
  import Flex from '../common/Flex.svelte';
  import Field from '../common/Field.svelte';
  import { default as NumberInput} from '../inputs/Number.svelte';
  import { settingsConfig } from '@/lib/utils/embed';
  import { onMount } from 'svelte';

  // The embed customization allows a user to control settings
  // that customize the presentation of a document embed. The user's
  // preferences should be saved to localStorage for future embeds.
  export let storageManager = new StorageManager('vieweroptions');

  // initialize settings with loaded values
  onMount(() => {
    Object.keys(settingsConfig).forEach((key) => {
      const config = settingsConfig[key];
      const storageValue = storageManager.get(String(config.storageIndex), config.defaultValue);
      if ($embedSettings[key] === null) {
        $embedSettings[key] = storageValue;
      }
    });
  });
</script>

<div>
  {#each Object.entries(settingsConfig) as [name, config]}
  {#if config.field.type === 'hidden'}
  <input type="hidden" {name} value={config.defaultValue} />
  {:else}
  <fieldset>
    <legend>{$_(config.field.label)}</legend>
    <Flex>
    {#if config.field.type === 'dimension'}
      <div class="flexItem">
        <Field inline>
          <label>
            <input type="radio" name={name} value={config.field.automatic.value} bind:group={$embedSettings[name]} />
            {$_(config.field.automatic.label)}
          </label>
          <p slot="help">{$_(config.field.automatic.help)}</p>
        </Field>
      </div>
      <div class="flexItem">
        <Field inline>
          <label>
            <input type="radio" name={name} value={$embedSettings[name] >= 1 ? $embedSettings[name] : config.field.fixed.value} bind:group={$embedSettings[name]} />
            {$_(config.field.fixed.label)}
          </label>
          <p slot="help">{$_(config.field.fixed.help)}</p>
        </Field>
      </div>
      {#if $embedSettings[name] >= 1}
      <NumberInput min={1} name={name} bind:value={$embedSettings[name]} />
      {/if}
    {:else}
      {#each config.field.options as option}
      <div class="flexItem">
        <Field inline>
          <label>
            <input type="radio" name={name} value={option.value} bind:group={$embedSettings[name]} />
            {$_(option.label)}
          </label>
          <p slot="help">{$_(option.help)}</p>
        </Field>
      </div>
      {/each}
    {/if}
    </Flex>
  </fieldset>
  {/if}
  {/each}
</div>

<style>
  fieldset {
    margin: .5em 0;
    border: 1px solid var(--gray-2);
    border-radius: .25rem;
  }
  .flexItem {
    flex: 0 1 12rem;
    padding: 0 .5rem;
  }
  legend {
    color: var(--gray-5);
    font-weight: var(--font-semibold);
    font-size: var(--font-sm);
    padding: .5em;
  }
  input[type="radio"] {
    margin: 0 0.25em 0 0;
    transform: translateY(1px);
  }
  label {
    font-weight: var(--font-semibold);
    color: var(--gray-5);
    padding: .25em .375em;
    border-radius: .25em;
    vertical-align: middle;
  }
  label:hover {
    background: var(--blue-1);
  }
</style>