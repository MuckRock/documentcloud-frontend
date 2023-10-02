<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import Paginator from "../Paginator.svelte";
  import PaginatorDemo from "./Paginator.demo.svelte";

  const args = {
    has_next: true,
    has_previous: true,
  };
</script>

<Meta
  title="Add-Ons / Paginator"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={Paginator}
/>

<Template let:args>
  <PaginatorDemo {args} />
</Template>

<Story name="Default" {args} />
<Story name="Only Page" args={{ has_next: false, has_previous: false }} />
<Story name="First Page" args={{ has_next: true, has_previous: false }} />
<Story name="Last Page" args={{ has_next: false, has_previous: true }} />
