<script>
  import { action } from "@storybook/addon-actions";

  import AddOnListItem from "../AddOnListItem.svelte";

  export let args = {};

  const onClick = action("Click");
</script>

<style>
  .container {
    max-width: 32rem;
    border: 1px solid #eee;
  }
</style>

<div class="container">
  <AddOnListItem {...args} on:click={onClick} />
</div>
