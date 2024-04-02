<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import Dropzone from "../Dropzone.svelte";

  let args = {
    active: false,
    disabled: false,
    onDrop: action("Drop"),
  };

  export const meta = {
    title: "Components / Forms / Dropzone",
    component: Dropzone,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Dropzone {...args}>
    <svelte:fragment let:active let:disabled>
      <div class="dropzone" class:active class:disabled>
        <p>Drop files here</p>
        <dl>
          <dt>Active</dt>
          <dd>{String(active)}</dd>
          <dt>Disabled</dt>
          <dd>{String(disabled)}</dd>
        </dl>
      </div>
    </svelte:fragment>
  </Dropzone>
</Template>

<Story name="Default" />
<Story name="Active" args={{ ...args, active: true }} />
<Story name="Disabled" args={{ ...args, disabled: true }} />

<style>
  .dropzone {
    border: 1px solid var(--blue-3);
    padding: 1rem;
  }
  .dropzone.active {
    background: var(--blue-1);
  }
  .dropzone.disabled {
    opacity: 0.5;
  }
  .dropzone dl {
    font-family: var(--font-code, "Source Code Pro");
    font-size: var(--font-xs);
  }
  .dropzone dt {
    font-weight: 600;
  }
  .dropzone dd {
    margin-left: 0.5rem;
  }
</style>
