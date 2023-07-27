<script>
  import { rest } from "msw";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import EventList from "../EventList.svelte";
  import eventsListFixture from "../../fixtures/event-list.json";
  import { baseApiUrl } from "../../../api/base";

  const args = {};

  const mockUrl = new URL(`/api/addon_events/*`, baseApiUrl).toString();
  /* Mock Request Handlers */
  const data = rest.get(mockUrl, (req, res, ctx) => res(ctx.json(eventsListFixture)));
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
</script>

<style></style>

<Meta
  title="Add-Ons / Runs / Events"
  component={EventList}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <EventList {...args} />
</Template>

<Story name="Success" {args} parameters={{ msw: { handlers: [data] } }} />
<Story name="Loading" {args} parameters={{ msw: { handlers: [loading] } }} />
<Story name="Error" {args} parameters={{ msw: { handlers: [error] } }} />
<Story name="Empty" {args} parameters={{ msw: { handlers: [empty] } }} />
