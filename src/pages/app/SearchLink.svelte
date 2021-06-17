<script>
  import { _ } from "svelte-i18n";
  // SVG assets
  import SearchIconSvg from "@/assets/search_icon.svg";

  export let link = "";
</script>

<style lang="scss">
  .linkcontainer {
    background: white;
    position: absolute;
    top: 0;
    left: -48px;
    right: 0;
    bottom: -11px;
    z-index: -1;
  }

  .link {
    background: $faint-gray;
    display: inline-block;
    padding: 4px 19px 4px 11px;
    border-radius: $radius;
    border: solid 1px gainsboro;
    margin: 0 -12px;
    color: $secondary;

    margin-bottom: 6px;

    :global(*) {
      display: inline-block;
      vertical-align: middle;
    }

    :global(svg) {
      padding-right: 5px;
      padding-bottom: 1px;
    }

    &:hover {
      text-decoration: underline;
    }
  }
</style>

<div class="link">
  <a href={link} target="_blank"
    >{@html SearchIconSvg}
    {$_("searchLink.search")}</a
  >
</div>
<div class="linkcontainer" />
