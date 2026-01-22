<script lang="ts" module>
  import type { Meta } from "@storybook/svelte";
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { XCircle16, Thumbsup16, Thumbsdown16 } from "svelte-octicons";

  import Process from "../Process.svelte";
  import Button from "../../common/Button.svelte";
  import Flex from "../../common/Flex.svelte";

  export const meta: Meta = {
    title: "Processing / Process",
    component: Process,
  };

  let args = {
    status: "in_progress",
  };
</script>

<Template>
  {#snippet children({ args })}
    <Process {...args}>
      <span class="name">Example process</span>
      {#snippet actions()}
        <Flex align="center">
          <Button ghost mode="danger" size="small" minW={false}>
            <XCircle16 />
          </Button>
        </Flex>
      {/snippet}
    </Process>
  {/snippet}
</Template>

<Story
  name="In-Progress"
  args={{ ...args, status: "in_progress" }}
  parameters={{
    chromatic: { disableSnapshot: true },
  }}
/>
<Story
  name="With Progress"
  args={{ ...args, status: "in_progress", progress: ".7" }}
/>
<Story name="Queued" args={{ ...args, status: "queued" }} />
<Story name="Success" args={{ ...args, status: "success" }} />
<Story name="Failure" args={{ ...args, status: "failure" }} />
<Story name="Cancelled" args={{ ...args, status: "cancelled" }} />
<Story name="With Actions">
  <Process status="success">
    <span class="name">Completed event</span>
    {#snippet actions()}
      <Flex>
        <Button size="small" ghost>Dismiss</Button>
        <Button size="small" ghost minW={false} mode="success">
          <Thumbsup16 />
        </Button>
        <Button size="small" ghost minW={false} mode="danger">
          <Thumbsdown16 />
        </Button>
      </Flex>
    {/snippet}
  </Process>
</Story>
