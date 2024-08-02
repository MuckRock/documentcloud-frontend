<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import ScheduledComponent from "../Scheduled.svelte";

  import { eventsList } from "@/test/fixtures/addons";

  export const meta = {
    title: "Components / Add-Ons / Scheduled",
    parameters: {
      layout: "centered",
    },
  };
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
