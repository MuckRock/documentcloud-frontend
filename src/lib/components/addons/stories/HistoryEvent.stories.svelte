<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { run } from "@/test/fixtures/addons";
  import Event from "../HistoryEvent.svelte";

  const { Story } = defineMeta({
    title: "Add-Ons /History Event",
    component: Event,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  });
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
