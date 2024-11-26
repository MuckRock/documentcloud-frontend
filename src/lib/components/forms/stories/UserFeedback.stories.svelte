<script lang="ts" context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import UserFeedbackForm from "../UserFeedback.svelte";
  import { me } from "@/test/fixtures/accounts";
  import { feedback } from "@/test/handlers/feedback";

  export const meta = {
    title: "Forms / User Feedback",
    component: UserFeedbackForm,
    parameters: {
      layout: "centered",
      msw: {
        handlers: [feedback.data],
      },
    },
  };
</script>

<Story name="With User">
  <div style="max-width: 45rem;">
    <UserFeedbackForm user={me} />
  </div>
</Story>

<Story name="Without User">
  <div style="max-width: 45rem;">
    <UserFeedbackForm />
  </div>
</Story>

<Story name="Loading" parameters={{ msw: { handlers: [feedback.loading] } }}>
  <div style="max-width: 45rem;">
    <UserFeedbackForm />
  </div>
</Story>

<Story name="With Error" parameters={{ msw: { handlers: [feedback.error] } }}>
  <div style="max-width: 45rem;">
    <UserFeedbackForm />
  </div>
</Story>
