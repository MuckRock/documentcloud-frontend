<script>
  import { search } from "@/search/search";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";

  // SVG assets
  import documentSilhouetteSvg from "@/assets/document_silhouette.svg";
  import emptyResultsSvg from "@/assets/empty_results.svg";
</script>

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

    a {
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

<div class="container">
  {#if $orgsAndUsers.me == null || $search.params.oneUserSearch != $orgsAndUsers.me.id || !$search.params.noStatus || !$search.params.noAccess}
    <h2>No search results</h2>
    <div class="img">
      {@html emptyResultsSvg}
    </div>
    <div class="text">
      <p>
        Your search query returned no results. Try again with a broader search
        query.
      </p>
    </div>
  {:else if $orgsAndUsers.me != null && !$orgsAndUsers.isVerified}
    <h2>Welcome to DocumentCloud!</h2>
    <div class="img">
      {@html documentSilhouetteSvg}
    </div>
    <div class="text">
      <p>
        Note that currently your account is <b>not verified to upload</b>. You
        can search through the public repository, organize documents you're
        interested in into projects, leave private notes, and collaborate on
        editing and annotating documents other users invite you to.
      </p>
      <p>
        If you’d like to upload or publish documents and you're a working
        journalist or other organization interested in publishing primary source
        materials in the public interest, you'll need to have your account
        verified or added to a verified organization. This is a simple process:
      </p>
      <ul>
        <li>
          First, <a
            target="_blank"
            href="https://accounts.muckrock.com/organizations/"
            >see if your organization already exists</a
          > and, if you find it, click "Request to Join" on its page.
        </li>
        <li>
          If your organization has not been verified yet, or if you're a
          freelancer, <a
            target="_blank"
            href="https://www.muckrock.com/assignment/request-account-verification-377/form/"
            >request verification here</a
          >. Requests usually take two business days to process.
        </li>
      </ul>
    </div>
  {:else}
    <h2>Upload your first document</h2>
    <div class="img">
      {@html documentSilhouetteSvg}
    </div>
    <div class="text">
      <p>
        Upload a document file to get started using DocumentCloud. You can drag
        the file into this window, or click on the blue “Upload” button above.
      </p>
      <p>
        Once you upload a file, DocumentCloud will process the document and
        extract its contents. It may take a few minutes for this to complete,
        but once it’s done your document will be optimized for analysis and
        sharing on the web.
      </p>
    </div>
  {/if}
</div>
