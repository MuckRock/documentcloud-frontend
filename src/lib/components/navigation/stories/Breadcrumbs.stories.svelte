<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import Breadcrumbs from "../Breadcrumbs.svelte";

  const { Story } = defineMeta({
    title: "Navigation / Breadcrumbs",
    component: Breadcrumbs,
    parameters: { layout: "fullscreen" },
  });
</script>

<Story name="Root" />

<Story
  name="One Crumb"
  args={{ trail: [{ href: "/documents", title: "Documents" }] }}
/>

<Story
  name="Two Crumbs"
  args={{
    trail: [
      { href: "/documents", title: "Documents" },
      { href: "/documents/[id]", title: "The Santa Anas" },
    ],
  }}
/>

<Story
  name="Three Crumbs"
  args={{
    trail: [
      { title: "Documents" },
      { href: "/documents/[id]", title: "The Santa Anas" },
      { href: "/documents/[id]/organize", title: "Organize" },
    ],
  }}
/>

<Story name="Long Crumb" asChild>
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

<Story name="Custom Root" asChild>
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
