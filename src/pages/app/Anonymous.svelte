<script>
  import Button from "@/common/Button";
  import { search } from "@/search/search";
  import { _ } from "svelte-i18n";
  import { fade } from "svelte/transition";

  // SVG assets
  import documentSilhouetteSvg from "@/assets/document_silhouette.svg";
  import closeSvg from "@/assets/close.svg";

  export let closed = false;

  function dismiss() {
    closed = true;
  }
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

    :global(a) {
      color: $primary;
    }

    li,
    p {
      font-size: 15px;
      line-height: 22px;
      margin: 25px 0;
    }
  }

  p {
    margin: 0 1em;
  }

  :global(.close) {
    @include buttonLike;

    user-select: none;
    margin-left: $closePadding;
    margin-top: $closePadding;
  }
  button.dismiss {
    background: none;
    padding: none;
    border: none;
  }
</style>

<div class="container" out:fade>
  <button class="dismiss" on:click={dismiss}>
    {@html closeSvg}
  </button>
  <h2>{$_("anonymous.title")}</h2>
  <div class="img">
    {@html documentSilhouetteSvg}
  </div>
  <div class="text">
    <p>
      {$_("anonymous.p1", { values: { n: $search.results.count } })}
    </p>
    <p>
      {@html $_("anonymous.p2")}
    </p>
    <p>
      {$_("anonymous.p3")}
    </p>
    <form
      action="https://muckrock.us2.list-manage.com/subscribe/post?u=74862d74361490eca930f4384&amp;id=20aa4a931d&amp;f_id=00f4c0e1f0"
      method="post"
      id="mc-embedded-subscribe-form"
      name="mc-embedded-subscribe-form"
      class="validate"
      target="_blank"
      novalidate=""
    >
      <input
        type="email"
        name="EMAIL"
        class="required email"
        id="mce-EMAIL"
        required=""
        value=""
        placeholder={$_("common.emailAddress")}
      />
      <input
        type="hidden"
        name="b_74862d74361490eca930f4384_20aa4a931d"
        value=""
      />
      <Button>Subscribe</Button>
    </form>
    <p>
      {@html $_("anonymous.p4")}
    </p>
  </div>
</div>
