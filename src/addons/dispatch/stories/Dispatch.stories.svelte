<script>
  import { rest } from "msw";
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Dispatch from "../Dispatch.svelte";
  import * as addons from "../../fixtures/addons.json";
  import * as eventFixture from "../../fixtures/event.json";
  import { baseApiUrl } from "../../../api/base";

  const { addon: klaxon, ...event } = eventFixture;

  const mockScheduleUrl = new URL(
    "/api/addon_events/:event",
    baseApiUrl,
  ).toString();
  const scheduleSuccess = rest.all(mockScheduleUrl, (req, res, ctx) =>
    res(ctx.json({})),
  );
  const scheduleLoading = rest.all(mockScheduleUrl, (req, res, ctx) =>
    res(ctx.delay("infinite")),
  );
  const scheduleError = rest.all(mockScheduleUrl, (req, res, ctx) =>
    res(ctx.status(400, "Something went wrong")),
  );

  const mockSendUrl = new URL("/api/addon_runs/", baseApiUrl).toString();
  const sendSuccess = rest.all(mockSendUrl, (req, res, ctx) =>
    res(ctx.json({})),
  );
  const sendLoading = rest.all(mockSendUrl, (req, res, ctx) =>
    res(ctx.delay("infinite")),
  );
  const sendError = rest.all(mockSendUrl, (req, res, ctx) =>
    res(ctx.status(400, "Something went wrong")),
  );

  const mockPinUrl = new URL("/api/addons/:id", baseApiUrl).toString();
  const pinSuccess = rest.all(mockPinUrl, (req, res, ctx) => res(ctx.json({})));
  const pinLoading = rest.all(mockPinUrl, (req, res, ctx) =>
    res(ctx.delay("infinite")),
  );
  const pinError = rest.all(mockPinUrl, (req, res, ctx) =>
    res(ctx.status(400, "Something went wrong")),
  );

  let args = {
    visible: true,
    addon: null,
    event: null,
  };
</script>

<Meta
  title="Add-Ons / Dispatch"
  component={Dispatch}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Dispatch {...args} />
</Template>

<Story
  name="Success"
  args={{ visible: true, addon: klaxon, event }}
  parameters={{ msw: { handlers: [scheduleSuccess, sendSuccess, pinSuccess] } }}
/>
<Story
  name="Error"
  args={{ visible: true, addon: klaxon, event }}
  parameters={{ msw: { handlers: [scheduleError, sendError, pinError] } }}
/>
<Story
  name="Loading"
  args={{ visible: true, addon: klaxon, event }}
  parameters={{ msw: { handlers: [scheduleLoading, sendLoading, pinLoading] } }}
/>

<Story name="Klaxon" args={{ visible: true, addon: klaxon, event }} />

<Story name="PDF Exporter" args={{ ...args, addon: addons[0] }} />

<Story name="Scraper" args={{ ...args, addon: addons[1] }} />

<Story
  name="Tabula Spreadsheet Extraction"
  args={{ ...args, addon: addons[2] }}
/>

<Story
  name="Transcribe Audio, powered by Whisper"
  args={{ ...args, addon: addons[3] }}
/>

<Story name="Import Documents" args={{ ...args, addon: addons[4] }} />

<Story name="Bad Redactions" args={{ ...args, addon: addons[5] }} />

<Story name="Site Snapshot" args={{ ...args, addon: addons[6] }} />
