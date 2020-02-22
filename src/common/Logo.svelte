<script>
  import Link from "@/router/Link";

  // Svg assets
  import dcLogo from "@/assets/dc_logo.svg";
</script>

<style lang="scss">
  :global(.dclogo) {
    width: 166px;
    height: 29px;
    padding: 41px 25px 12px 25px;
    user-select: none;
  }

  @media only screen and (max-width: 600px) {
    :global(.dclogo) {
      padding: 10px 25px 40px 25px;
    }
  }
</style>

<Link to="home">
  {@html dcLogo}
</Link>
