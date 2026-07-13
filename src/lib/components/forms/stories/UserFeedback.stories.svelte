<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import UserFeedbackForm from "../UserFeedback.svelte";
  import { me } from "@/test/fixtures/accounts";
  import { feedback } from "@/test/handlers/feedback";

  const { Story } = defineMeta({
    title: "Forms / User Feedback",
    component: UserFeedbackForm,
    parameters: {
      layout: "centered",
      msw: {
        handlers: [feedback.data],
      },
    },
    render: template,
  });
</script>

{#snippet template(args)}
  <div style="max-width: 45rem;">
    <UserFeedbackForm {...args} />
  </div>
{/snippet}

<Story name="With User" args={{ user: me }} />

<Story name="Without User" args={{}} />

<Story name="Loading" parameters={{ msw: { handlers: [feedback.loading] } }} />

<Story name="With Error" parameters={{ msw: { handlers: [feedback.error] } }} />
