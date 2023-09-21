<script>
  import SearchBar from "@/pages/app/SearchBar.svelte";

  export let content;
  export let compact = false;
</script>

<SearchBar example={true} {compact} search={content} />
