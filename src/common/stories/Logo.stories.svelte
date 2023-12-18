<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Logo from "../Logo.svelte";

  export const meta = {
    title: "Common / Logo",
    component: Logo,
  };

  const args = {
    newPage: false,
    nopadding: false,
    homeLink: false,
  };
</script>

<Template let:args>
  <Logo {...args} />
</Template>

<Story name="default" {args} />

<Story name="new page" args={{ ...args, newPage: true }} />

<Story name="no padding" args={{ ...args, nopadding: true }} />

<Story name="home link" args={{ ...args, homeLink: true }} />
