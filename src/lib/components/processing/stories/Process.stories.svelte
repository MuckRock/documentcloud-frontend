<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { XCircle16, Thumbsup16, Thumbsdown16 } from "svelte-octicons";

  import Process from "../Process.svelte";
  import Button from "../../common/Button.svelte";
  import Flex from "../../common/Flex.svelte";

  const { Story } = defineMeta({
    title: "Processing / Process",
    component: Process,
  });
</script>

<Story
  name="In-Progress"
  parameters={{
    chromatic: { disableSnapshot: true },
  }}
  asChild
>
  <Process status="in_progress">
    <span class="name">Example process</span>
    {#snippet actions()}
      <Flex align="center">
        <Button ghost mode="danger" size="small" minW={false}>
          <XCircle16 />
        </Button>
      </Flex>
    {/snippet}
  </Process>
</Story>

<Story
  name="With Progress"
  parameters={{
    chromatic: { disableSnapshot: true },
  }}
  asChild
>
  <Process status="in_progress" progress={0.7}>
    <span class="name">Example process</span>
    {#snippet actions()}
      <Flex align="center">
        <Button ghost mode="danger" size="small" minW={false}>
          <XCircle16 />
        </Button>
      </Flex>
    {/snippet}
  </Process>
</Story>

<Story
  name="Queued"
  parameters={{
    chromatic: { disableSnapshot: true },
  }}
  asChild
>
  <Process status="queued">
    <span class="name">Example process</span>
    {#snippet actions()}
      <Flex align="center">
        <Button ghost mode="danger" size="small" minW={false}>
          <XCircle16 />
        </Button>
      </Flex>
    {/snippet}
  </Process>
</Story>

<Story
  name="Success"
  parameters={{
    chromatic: { disableSnapshot: true },
  }}
  asChild
>
  <Process status="success">
    <span class="name">Example process</span>
    {#snippet actions()}
      <Flex align="center">
        <Button ghost mode="danger" size="small" minW={false}>
          <XCircle16 />
        </Button>
      </Flex>
    {/snippet}
  </Process>
</Story>

<Story
  name="Failure"
  parameters={{
    chromatic: { disableSnapshot: true },
  }}
  asChild
>
  <Process status="failure">
    <span class="name">Example process</span>
    {#snippet actions()}
      <Flex align="center">
        <Button ghost mode="danger" size="small" minW={false}>
          <XCircle16 />
        </Button>
      </Flex>
    {/snippet}
  </Process>
</Story>

<Story
  name="Cancelled"
  parameters={{
    chromatic: { disableSnapshot: true },
  }}
  asChild
>
  <Process status="cancelled">
    <span class="name">Example process</span>
    {#snippet actions()}
      <Flex align="center">
        <Button ghost mode="danger" size="small" minW={false}>
          <XCircle16 />
        </Button>
      </Flex>
    {/snippet}
  </Process>
</Story>

<Story
  name="With Actions"
  parameters={{
    chromatic: { disableSnapshot: true },
  }}
  asChild
>
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
