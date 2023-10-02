<script>
  import { action } from "@storybook/addon-actions";
  import Paginator from "../Paginator.svelte";

  export let args = {
    has_next: true,
    has_previous: true,
  };
</script>

<style>
  .container {
    border: 1px solid gray;
    padding: 1em;
    width: 50vw;
  }
</style>

<div class="container">
  <Paginator
    {...args}
    on:next={action("Next")}
    on:previous={action("Previous")}
  />
</div>
