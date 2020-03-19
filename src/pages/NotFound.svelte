<script>
  import Link from "@/router/Link";

  export let title = "Page not found";
  export let message = "Please try another URL";
</script>

<style lang="scss">
  .notfound {
    padding: 2em;

    :global(a) {
      color: $primary;
    }
  }
</style>

<div class="notfound">
  <p>
    <Link to="default">Home</Link>
  </p>

  <h1>{title}</h1>

  <div>{message}</div>
</div>
