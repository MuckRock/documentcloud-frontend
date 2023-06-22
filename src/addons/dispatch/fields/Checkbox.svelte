<script lang="ts">
  export let title: string;
  export let name: string;
  export let value: boolean;
  export let required: boolean = false;
</script>

<label>
  {title}
  <input type="checkbox" {name} bind:checked={value} {required} />
</label>
