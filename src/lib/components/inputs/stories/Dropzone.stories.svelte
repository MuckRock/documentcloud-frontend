<script module lang="ts">
  import type { ComponentProps } from "svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import Dropzone from "../Dropzone.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /Dropzone",
    component: Dropzone,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    render: template,
  });

  type Args = ComponentProps<typeof Dropzone>;

  const args = {
    active: false,
    disabled: false,
    onDrop: action("Drop"),
  };
</script>

{#snippet template(args: Args)}
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
{/snippet}

<Story name="Default" {args} />
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
    font-family: var(--font-mono, "Source Code Pro", monospace);
    font-size: var(--font-xs);
  }
  .dropzone dt {
    font-weight: 600;
  }
  .dropzone dd {
    margin-left: 0.5rem;
  }
</style>
