<script context="module">
  import { rest } from "msw";
  import eventsListFixture from "../../fixtures/event-list.json";
  import { baseApiUrl } from "../../../api/base";

  const mockUrl = new URL(`/api/addon_events/*`, baseApiUrl).toString();
  /* Mock Request Handlers */
  const data = rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.json(eventsListFixture)),
  );
  const loading = rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.delay("infinite")),
  );
  const error = rest.get(mockUrl, (req, res, ctx) =>
    res(
      ctx.status(400, "Ambiguous Error"),
      ctx.json("Something went horribly wrong."),
    ),
  );
  const empty = rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.json({ next: null, previous: null, results: [] })),
  );
  export const handlers = { data, loading, error, empty };
</script>

<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Scheduled from "../Scheduled.svelte";

  const args = {};
</script>

<style></style>

<Meta
  title="Add-Ons / Runs / Scheduled"
  component={Scheduled}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Scheduled {...args} />
</Template>

<Story name="Success" {args} parameters={{ msw: { handlers: [data] } }} />
<Story name="Loading" {args} parameters={{ msw: { handlers: [loading] } }} />
<Story name="Error" {args} parameters={{ msw: { handlers: [error] } }} />
<Story name="Empty" {args} parameters={{ msw: { handlers: [empty] } }} />
