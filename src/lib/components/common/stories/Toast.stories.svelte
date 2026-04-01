<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import Toast from "../Toast.svelte";
  import Flex from "../Flex.svelte";

  const close = action("close");
  const cancel = action("cancel");
  const reset = action("reset");

  const { Story } = defineMeta({
    title: "Common / Toast",
    component: Toast,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  <Toast {...args} onclose={close} oncancel={cancel} onreset={reset}>
    <p>{args.content}</p>
  </Toast>
{/snippet}

<Story name="Default" asChild>
  <Toast lifespan={0} onclose={close} oncancel={cancel} onreset={reset}>
    <p>Default toast contains a message</p>
  </Toast>
</Story>

<Story name="Multiple" asChild>
  <Flex direction="column">
    <Toast lifespan={0} onclose={close} oncancel={cancel} onreset={reset}>
      <p>First message</p>
    </Toast>
    <Toast lifespan={0} onclose={close} oncancel={cancel} onreset={reset}>
      <p>Second message</p>
    </Toast>
    <Toast status="success" lifespan={0} onclose={close}>
      <p>Success message</p>
    </Toast>
  </Flex>
</Story>

<Story
  name="Info"
  args={{
    status: "info",
    lifespan: 0,
    content: "Toasts are for giving users feedback",
  }}
/>

<Story
  name="Success"
  args={{
    status: "success",
    lifespan: 0,
    content: "Everything went better than expected",
  }}
/>

<Story
  name="Warning"
  args={{
    status: "warning",
    lifespan: 0,
    content: "Look out ahead!",
  }}
/>

<Story
  name="Error"
  args={{
    status: "error",
    lifespan: 0,
    content: "Something bad happened",
  }}
/>

<Story
  name="With Long Content"
  args={{
    content:
      "This message is very, very long. It's a super long message. You rarely see a message this long nowadays. Kids these days have no attention span. Back in my day we used to read three books a day, uphill both ways!",
    status: "info",
  }}
/>
