<script>
  import Filter from "../Filter.svelte";
  import Star from "../../../common/icons/Star.svelte";

  export let args = {};
</script>

<Filter {...args}>
  <Star slot="icon" />
</Filter>
