<script>
  import { search } from "@/search/search.js";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";
  import { _ } from "svelte-i18n";

  // SVG assets
  import documentSilhouetteSvg from "@/assets/document_silhouette.svg?raw";
  import emptyResultsSvg from "@/assets/empty_results.svg?raw";


  function constructPrefillUrl() {
    const baseUrl = "https://airtable.com/app93Yt5cwdVWTnqn/pagogIhgB1jZTzq00/form";
    const email = encodeURIComponent(orgsAndUsers.me.email);
    const username = encodeURIComponent(orgsAndUsers.me.username);
    const accountUrl = `https://accounts.muckrock.com/users/${username}/`;
    const orgSlug = encodeURIComponent(orgsAndUsers.me.organization.slug);
    const orgAccountUrl = `https://accounts.muckrock.com/organizations/${orgSlug}`;
    
    return `${baseUrl}?prefill_MR+User+Email=${email}&prefill_MR+User+Name=${username}&prefill_MR+User+Account+URL=${accountUrl}&prefill_MR+Organization+Name=${orgSlug}&prefill_MR+Organization+Account+URL=${orgAccountUrl}`;
  }

</script>

<div class="container">
  {#if $orgsAndUsers.me == null || $search.params.oneUserSearch != $orgsAndUsers.me.id || !$search.params.noStatus || !$search.params.noAccess}
    <h2>{$_("noDocuments.noSearchResults")}</h2>
    <div class="img">
      {@html emptyResultsSvg}
    </div>
    <div class="text">
      <p>
        {$_("noDocuments.queryNoResults")}
      </p>
    </div>
  {:else if $orgsAndUsers.me != null && !$orgsAndUsers.isVerified}
    <h2>{$_("noDocuments.welcome")}</h2>
    <div class="img">
      {@html documentSilhouetteSvg}
    </div>
    <div class="text">
      <p>
        {@html $_("noDocuments.verify1")}
      </p>
      <p>
        {$_("noDocuments.verify2")}
      </p>
      <ul>
        <li>
          {@html $_("noDocuments.verify3")}
        </li>
        <li>
          {@html $_("noDocuments.verify4")} 
          <a target="_blank" href={constructPrefillUrl()}>
            {$_("noDocuments.verify5")}
          </a>
        </li>
      </ul>
    </div>
  {:else}
    <h2>{$_("noDocuments.uploadFirst")}</h2>
    <div class="img">
      {@html documentSilhouetteSvg}
    </div>
    <div class="text">
      <p>
        {$_("noDocuments.upload1")}
      </p>
      <p>
        {$_("noDocuments.upload2")}
      </p>
    </div>
  {/if}
</div>

<style lang="scss">
  .container {
    margin: 1em 1.5em;
    background: $fyi;
    padding: 1em;
    border-radius: 10px;
  }

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 1.5em 0;
    padding-left: 18px;
  }

  .img,
  .text {
    display: inline-block;
    vertical-align: top;
  }

  .text {
    max-width: 80ch;
    width: 30vw;
    margin: 0 2em 1em 2em;

    :global(a) {
      color: $primary;
    }

    li,
    p {
      font-size: 15px;
      line-height: 22px;
      margin: 5px 0;
    }
  }

  p {
    margin: 0 1em;
  }
</style>
