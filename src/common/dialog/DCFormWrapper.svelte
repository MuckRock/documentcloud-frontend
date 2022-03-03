<script lang="ts">
  import type { JSONSchema } from "@pyoner/svelte-form-common";

  export let errors: Error[] | null = null;
  export let schema: JSONSchema;
</script>

<style>
  .error {
    color: red;
  }
  input,
  table {
    position: border-box;
    width: 100%;
    font-size: 16px;
    font-family: inherit;
  }

  td:first-child {
    white-space: nowrap;
    padding-right: 5px;
  }

  td:last-child {
    width: 100%;
    position: relative;
  }

  fieldset {
    border: #eee 1px groove;
  }
</style>

{#if schema}
  {#if schema.type == "object" || schema.type == "array"}
    <fieldset>
      <legend>{schema.title}</legend>
      <table>
        <tbody>
          {#if schema.description}
            <tr class="field">
              <td>
                <div class="description">{schema.description}</div>
              </td>
            </tr>
          {/if}

          <slot>A field is not implemented</slot>

          {#if errors && errors.length}
            {#each errors as error}
              <div class="error">{error.message}</div>
            {/each}
          {/if}
        </tbody>
      </table>
    </fieldset>
  {:else}
    <tr class="field">
      {#if schema.title}
        <!-- TODO: add for="" from name of wrapped input-->
        <td><label class="label">{schema.title}</label></td>
      {/if}

      <td><slot>A field is not implemented</slot></td>

      {#if errors && errors.length}
        {#each errors as error}
          <div class="error">{error.message}</div>
        {/each}
      {/if}

      {#if schema.description}
        <div class="description">{schema.description}</div>
      {/if}
    </tr>
  {/if}
{/if}
