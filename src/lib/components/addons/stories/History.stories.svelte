<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import History from "../History.svelte";
  import { history } from "@/test/handlers/addons";
  import { runsList } from "@/test/fixtures/addons";

  const args = {
    runs: runsList.results,
    next: runsList.next,
    previous: runsList.previous,
  };

  const { Story } = defineMeta({
    title: "Add-Ons /History",
    component: History,
    parameters: { layout: "centered" },
  });
</script>

<Story
  name="Success"
  {args}
  parameters={{ msw: { handlers: [history.data] } }}
/>
<Story
  name="Loading"
  args={{ ...args, loading: true }}
  parameters={{ msw: { handlers: [history.loading] } }}
/>
<Story
  name="Error"
  {args}
  parameters={{ msw: { handlers: [history.error] } }}
/>
<Story
  name="Empty"
  args={{ ...args, runs: [] }}
  parameters={{ msw: { handlers: [history.empty] } }}
/>
