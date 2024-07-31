<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import Toast from "../Toast.svelte";
  import Flex from "../Flex.svelte";

  const close = action("close");
  const cancel = action("cancel");
  const reset = action("reset");

  export const meta = {
    title: "Components / Common / Toast",
    component: Toast,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Toast {...args} on:close={close} on:cancel={cancel} on:reset={reset}>
    <p>{args.content}</p>
  </Toast>
</Template>

<Story name="Default">
  <Toast lifespan={0} on:close={close} on:cancel={cancel} on:reset={reset}>
    <p>Default toast contains a message</p>
  </Toast>
</Story>

<Story name="Multiple">
  <Flex direction="column">
    <Toast lifespan={0} on:close={close} on:cancel={cancel} on:reset={reset}>
      <p>First message</p>
    </Toast>
    <Toast lifespan={0} on:close={close} on:cancel={cancel} on:reset={reset}>
      <p>Second message</p>
    </Toast>
    <Toast status="success" lifespan={0} on:close={close}>
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
