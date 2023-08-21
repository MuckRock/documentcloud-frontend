<script>
  import { rest } from "msw";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Browser from "../Browser.svelte";
  import listFixture from "../../fixtures/addon-list.json";
  import { baseApiUrl } from "../../../api/base.js";

  const args = { visible: true };
  const mockUrl = new URL(`addons/`, baseApiUrl).toString();
  /* Mock Request Handlers */
  const data = rest.get(mockUrl, (req, res, ctx) => res(ctx.json(listFixture)));
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

<Meta
  title="Add-Ons / Browser"
  tags={["autodocs"]}
  parameters={{ layout: "fullscreen" }}
  component={Browser}
/>

<Template let:args>
  <Browser {...args} />
</Template>

<Story name="Success" {args} parameters={{ msw: { handlers: [data] } }} />
<Story name="Loading" {args} parameters={{ msw: { handlers: [loading] } }} />
<Story name="Error" {args} parameters={{ msw: { handlers: [error] } }} />
<Story name="Empty" {args} parameters={{ msw: { handlers: [empty] } }} />
