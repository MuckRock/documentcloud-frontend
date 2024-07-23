<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Scheduled from "../Scheduled.svelte";

  import { eventsList } from "@/test/fixtures/addons";

  export const meta = {
    title: "Add-Ons / Scheduled",
  };
</script>

<Story name="default">
  <Scheduled
    events={eventsList.results}
    count={eventsList.count}
    next={eventsList.next}
    previous={eventsList.previous}
  />
</Story>
