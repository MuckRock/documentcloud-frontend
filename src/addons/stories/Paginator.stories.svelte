<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import Paginator from "../Paginator.svelte";

  const args = {
    has_next: true,
    has_previous: true,
  };
</script>

<style>
  .container {
    border: 1px solid gray;
    padding: 1em;
    width: 50vw;
  }
</style>

<Meta
  title="Add-Ons / Paginator"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={Paginator}
/>

<Template let:args>
  <div class="container">
    <Paginator
      {...args}
      on:next={action("Next")}
      on:previous={action("Previous")}
    />
  </div>
</Template>

<Story name="Default" {args} />
<Story name="Only Page" args={{ has_next: false, has_previous: false }} />
<Story name="First Page" args={{ has_next: true, has_previous: false }} />
<Story name="Last Page" args={{ has_next: false, has_previous: true }} />
