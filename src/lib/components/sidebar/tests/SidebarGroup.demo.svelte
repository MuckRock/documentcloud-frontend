<script lang="ts">
  import SidebarGroup from "../SidebarGroup.svelte";

  interface Props {
    name?: string;
    collapsed?: boolean;
  }

  let { name = undefined, collapsed = false }: Props = $props();
</script>

<SidebarGroup {name} {collapsed}>
  {#snippet title()}
    <span>Group title</span>
  {/snippet}

  {#snippet action()}
    <a href="#explore">Explore</a>
  {/snippet}

  <p>Body content</p>
</SidebarGroup>
