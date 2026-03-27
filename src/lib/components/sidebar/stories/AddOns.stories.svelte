<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import AddOns from "../AddOns.svelte";
  import { activeAddons } from "@/test/fixtures/addons";

  const { Story } = defineMeta({
    title: "Navigation / Add-Ons",
    component: AddOns,
    parameters: { layout: "centered" },
  });
</script>

<Story
  name="Empty"
  args={{ pinnedAddOns: Promise.resolve({ results: [], count: 0 }) }}
/>
<Story name="Loading" args={{ pinnedAddOns: new Promise(() => {}) }} />
<Story
  name="With Data"
  args={{ pinnedAddOns: Promise.resolve({ data: activeAddons }) }}
/>
<Story
  name="With Error"
  args={{
    pinnedAddOns: Promise.resolve({
      error: { message: "Something went wrong" },
    }),
  }}
/>
