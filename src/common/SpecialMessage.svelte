<script>
  const version = process.env.SPECIAL_VERSION;
  const contact = process.env.SPECIAL_CONTACT;

  $: show = version != null && version.trim().length > 0;
  $: showContact = contact != null && contact.trim().length > 0;
</script>

<style lang="scss">
  .container {
    padding: 10px 0;
  }

  .special {
    background: #82ffbb;
    display: block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 13px;
    box-sizing: border-box;
    color: #043004;

    a {
      text-decoration: underline;
    }
  }
</style>

{#if show}
  <div class="container">
    <div class="special">
      {version}
      {#if showContact}
        <a href={contact} target="_blank">Contact us</a>
        with bug reports, questions, and suggestions.
      {/if}
    </div>
  </div>
{/if}
