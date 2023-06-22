<script lang="ts">
  import Checkbox from "./Checkbox.svelte";
  import Number from "./Number.svelte";
  import Text from "./Text.svelte";

  export let items: any = {};

  // only one level of nesting allowed
  const types = {
    string: Text,
    number: Number,
    integer: Number,
    boolean: Checkbox,
  };
</script>

<style></style>
