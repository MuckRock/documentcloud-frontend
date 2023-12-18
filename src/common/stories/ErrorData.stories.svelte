<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import ErrorData from "../ErrorData.svelte";

  export const meta = {
    title: "Common / Error Data",
    component: ErrorData,
  };

  const error = {
    errorData: {},
  };
</script>

<Story name="default">
  <ErrorData {error} />
</Story>
