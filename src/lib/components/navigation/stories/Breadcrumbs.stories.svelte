<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Breadcrumbs from "../Breadcrumbs.svelte";

  export const meta = {
    title: "Navigation / Breadcrumbs",
    component: Breadcrumbs,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story name="Root">
  <Breadcrumbs />
</Story>

<Story name="One Crumb">
  <Breadcrumbs trail={[{ href: "/documents", title: "Documents" }]} />
</Story>

<Story name="Two Crumbs">
  <Breadcrumbs
    trail={[
      { href: "/documents", title: "Documents" },
      { href: "/documents/[id]", title: "The Santa Anas" },
    ]}
  />
</Story>

<Story name="Three Crumbs">
  <Breadcrumbs
    trail={[
      { title: "Documents" },
      { href: "/documents/[id]", title: "The Santa Anas" },
      { href: "/documents/[id]/organize", title: "Organize" },
    ]}
  />
</Story>

<Story name="Long Crumb">
  <div style="width: 100%;">
    <Breadcrumbs
      trail={[
        { title: "Documents" },
        {
          href: "/documents/[id]",
          title: "BADFILENAME__TOOLONG__FINAL FINAL DRAFT 2.pdf",
        },
      ]}
    />
  </div>
</Story>

<Story name="Custom Root">
  <Breadcrumbs
    trail={[
      { href: "/documents", title: "Documents" },
      { href: "/documents/[id]", title: "The Santa Anas" },
      { href: "/documents/[id]/organize", title: "Organize" },
    ]}
  >
    {#snippet root()}
      <p>DocumentCloud</p>
    {/snippet}
  </Breadcrumbs>
</Story>
