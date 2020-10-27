<script>
  import HomeTemplate from "./HomeTemplate";
</script>

<style lang="scss">
  a {
    color: $primary;
  }

  .note {
    background: $fyi;
    border-radius: $radius;
    padding: 5px 10px;
    margin: 0 -10px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
  }
</style>

<svelte:head>
  <title>DocumentCloud</title>
</svelte:head>

<HomeTemplate showMast="true">
  <p>
    DocumentCloud is an all-in-one platform for documents: upload, organize,
    analyze, annotate, search, and embed.
  </p>
  <p class="note">
    Please note that this is currently an invite-only beta. You can
    <a href="https://documentcloud.org">
      log in to the classic version of DocumentCloud here.
    </a>
    To receive an invite to test the new version of the site, 
    <a
      href="https://documentcloud.us11.list-manage.com/subscribe?u=4e1ca6e52b3163639d641f360&id=20a793193a">
      subscribe to our newsletter.
    </a>
  </p>
</HomeTemplate>
