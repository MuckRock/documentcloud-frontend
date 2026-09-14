<script module lang="ts">
  import type { APIError, APIErrors } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import ApiError from "../ApiError.svelte";
  import Flex from "../Flex.svelte";

  const { Story } = defineMeta({
    title: "Common / API Error",
    component: ApiError,
    parameters: { layout: "padded" },
  });

  function error(message: string, errors?: APIErrors): APIError<APIErrors> {
    return { status: 400, message, errors };
  }
</script>

<!-- Errors about a specific field are keyed by field name. -->
<Story name="Field errors" asChild>
  <ApiError
    error={error("Bad Request", {
      published_url: ["Enter a valid URL."],
      title: ["This field may not be blank."],
    })}
  />
</Story>

<!-- Errors that aren't about one field arrive as a bare array. -->
<Story name="Non-field errors" asChild>
  <ApiError
    error={error("Bad Request", [
      "You may not update `access` while the document is processing",
    ])}
  />
</Story>

<!-- Nothing but the status text to show. -->
<Story name="No detail" asChild>
  <ApiError error={error("Not Found")} />
</Story>

<!-- HTTP/2 responses carry no status text, so the detail has to stand alone. -->
<Story name="Empty status text" asChild>
  <ApiError error={error("", ["Something went wrong."])} />
</Story>

<Story name="Every shape" asChild>
  <Flex direction="column" gap={2}>
    <ApiError error={error("Bad Request", { access: ["Not permitted."] })} />
    <ApiError error={error("Bad Request", ["Not permitted."])} />
    <ApiError error={error("Bad Request", "Not permitted.")} />
    <ApiError error={error("Bad Request", { detail: "Not permitted." })} />
    <ApiError
      error={error("Bad Request", { data: { year: ["is required"] } })}
    />
  </Flex>
</Story>
