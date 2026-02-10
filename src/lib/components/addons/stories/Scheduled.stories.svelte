<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ScheduledComponent from "../Scheduled.svelte";
  import { eventsList } from "@/test/fixtures/addons";

  const { Story } = defineMeta({
    title: "Add-Ons /Scheduled",
    parameters: {
      layout: "centered",
    },
  });
</script>

<Story name="With Data">
  <ScheduledComponent
    events={eventsList.results}
    next={eventsList.next}
    previous={eventsList.previous}
  />
</Story>

<Story name="Loading">
  <ScheduledComponent
    loading
    events={eventsList.results}
    next={eventsList.next}
    previous={eventsList.previous}
  />
</Story>
