<script lang="ts" context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import UserFeedbackForm from "../UserFeedback.svelte";

  export const meta = {
    title: "Forms / User Feedback",
    component: UserFeedbackForm,
    parameters: { layout: "centered" },
  };
</script>

<Story name="User Feedback">
  <div style="max-width: 45rem;">
    <UserFeedbackForm />
  </div>
</Story>
