<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import EventList from "../runs/EventList.svelte";
  import { results as events } from "../fixtures/event-list.json";

  const args = { events };
</script>

<style></style>

<Meta
  title="Add-Ons / Events"
  component={EventList}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <div class="container">
    <EventList {...args} />
  </div>
</Template>

<Story name="Single" {args} />
