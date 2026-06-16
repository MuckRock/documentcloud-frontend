<script lang="ts">
  let { id }: { id: string } = $props();
</script>

<svelte:head>
  <script
    async
    src="https://widgets.givebutter.com/latest.umd.cjs?acct=bxj57JvZkwOILwSl&p=other"
  ></script>
</svelte:head>

<givebutter-widget {id}></givebutter-widget>
