<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Toaster, { toast } from "../Toaster.svelte";
  import Flex from "../../common/Flex.svelte";
  import Button from "../../common/Button.svelte";
  import Kv from "../../common/KV.svelte";

  export const meta = {
    title: "Layout / Toaster",
    component: Toaster,
    parameters: { layout: "centered" },
  };
</script>

<Story name="With Title">
  <Flex direction="column">
    <Button onclick={() => toast("A standard message")}>Send Toast</Button>
    <Button onclick={() => toast("Did you know?", { status: "info" })}
      >Send Info</Button
    >
    <Button onclick={() => toast("Great job!", { status: "success" })}
      >Send Success</Button
    >
    <Button onclick={() => toast("Look out ahead!", { status: "warning" })}
      >Send Warning</Button
    >
    <Button onclick={() => toast("Bad things happen", { status: "error" })}
      >Send Error</Button
    >
    <Button
      onclick={() =>
        toast("I won't go away on my own", { status: "info", lifespan: null })}
    >
      Permanent Toast
    </Button>
    <Button
      onclick={() => toast(Kv, { props: { key: "Type", value: "Component" } })}
    >
      Component Toast
    </Button>
  </Flex>
  <Toaster />
</Story>
