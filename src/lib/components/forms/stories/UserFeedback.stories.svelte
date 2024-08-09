<script lang="ts" context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import UserFeedbackForm from "../UserFeedback.svelte";
  import { me } from "@/test/fixtures/accounts";

  export const meta = {
    title: "Forms / User Feedback",
    component: UserFeedbackForm,
    parameters: { layout: "centered" },
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
