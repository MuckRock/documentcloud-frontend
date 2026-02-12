<script module lang="ts">
  import type { Event } from "$lib/api/types";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { run } from "@/test/fixtures/addons";
  import HistoryEvent from "../HistoryEvent.svelte";

  const { Story } = defineMeta({
    title: "Add-Ons /History Event",
    component: HistoryEvent,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  });

  const event = run.event as Event;
</script>

<Story name="Success" args={{ run: { ...run, status: "success" } }} />
<Story name="Dismissable" args={{ run, dismissable: true }} />
<Story
  name="Dismissed"
  args={{
    dismissable: true,
    run: {
      ...run,
      dismissed: true,
      message:
        "I dismissed this message and it will disappear soon. Please be patient.",
    },
  }}
/>
<Story
  name="Very long label"
  args={{
    run: {
      ...run,
      event: {
        ...event,
        parameters: {
          site: "https://www.gutenberg.org/files/2701/2701-h/2701-h.htm#link2HCH0001:~:text=Call%20me%20Ishmael.%20Some%20years%20ago%E2%80%94never%20mind%20how%20long%20precisely%E2%80%94having%20little%20or%20no%20money%20in%20my%20purse%2C%20and%20nothing%20particular%20to%20interest%20me%20on%20shore%2C%20I%20thought%20I%20would%20sail%20about%20a%20little%20and%20see%20the%20watery%20part%20of%20the%20world.",
        },
      },
    },
  }}
/>

<Story name="Failure" args={{ run: { ...run, status: "failure" } }} />
<Story name="Queued" args={{ run: { ...run, status: "queued" } }} />
<Story
  name="In Progress"
  args={{ run: { ...run, status: "in_progress", progress: 0.5 } }}
/>
<Story
  name="Unknown"
  args={{ run: { ...run, status: "unexpectedStatus" as any } }}
/>
<Story
  name="Premium Run"
  args={{ run: { ...run, status: "success", credits_spent: 700 } }}
/>
