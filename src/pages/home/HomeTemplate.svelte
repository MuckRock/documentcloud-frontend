<script>
  import Loader from "@/common/Loader";
  import Button from "@/common/Button";
  import Link from "@/router/Link";
  import { router } from "@/router/router";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";

  // SVG assets
  import mastLogoSvg from "@/assets/mastlogo.svg";
  import mastheadSvg from "@/assets/masthead.svg";
  import mastheadResponsiveSvg from "@/assets/masthead_responsive.svg";

  // Authentication
  import {
    auth,
    logout,
    SIGN_IN_URL,
    SIGN_UP_URL,
    SIGN_OUT_URL
  } from "@/api/auth";

  // Show the masthead
  export let showMast;
</script>

<style lang="scss">
  :global(.masthead) {
    width: 100%;
    max-width: 1200px;
  }

  :global(.mastheadresponsive) {
    display: none;
    width: 100%;
  }

  :global(.mastlogo) {
    max-width: 250px;
    height: auto;
  }

  .container {
    max-width: 1200px;
    margin: 2em auto;
  }

  header {
    display: table;
    width: 100%;
    margin-bottom: 0.8em;
  }

  .headercontents {
    display: table-row;
  }

  .logo {
    display: table-cell;
    vertical-align: middle;
  }

  .signupcontainer {
    display: block;
    text-align: right;
  }

  .signin {
    display: inline-block;

    a {
      text-decoration: inherit;
      color: #494949;
      font-weight: bold;
      font-size: 16px;
      margin-right: 1.5em;
      cursor: pointer;
    }

    &:hover {
      opacity: $hover-opacity;
    }
  }

  .content {
    margin: 2em 0;
    max-width: 80ch;
    color: #494949;
    font-size: 16px;
    line-height: 24px;
  }

  @media only screen and (max-width: 1240px) {
    .logo,
    .content {
      padding: 0 1em;
    }
  }

  @media only screen and (max-width: 1200px) {
    .signupcontainer {
      padding: 0 1em;
    }
  }

  @media only screen and (max-width: $mobileBreak) {
    :global(.masthead) {
      display: none;
    }

    :global(.mastheadresponsive) {
      display: block !important;
    }

    :global(.mastlogo) {
      max-width: 200px;
    }
  }

  .supplemental {
    text-align: right;
    font-size: 13px;
    color: $gray;
    margin: -10px 0 4px 0;
  }

  .narrowshow {
    $bordersize: 16px;

    display: none;
    margin: 10px $bordersize 0 $bordersize;
    padding-top: 20px;
    border-top: solid 1px gainsboro;

    .signupcontainer {
      display: block;
      margin: 0 (-$bordersize);
    }

    .signupcontainer,
    .supplemental {
      text-align: left;
    }
  }

  .narrowhide {
    display: table-cell;
    vertical-align: middle;
    text-align: right;
  }

  @media only screen and (max-width: $mobileBreak) {
    .narrowhide {
      display: none;
    }

    .narrowshow {
      display: block;
    }
  }
</style>

<Loader active={$auth.signingIn}>
  <div class="container">
    <header>
      <div class="headercontents">
        <div class="logo">
          <Link to="app">
            {@html mastLogoSvg}
          </Link>
        </div>
        <div class="narrowhide">
          {#if $orgsAndUsers.me != null}
            <div class="signupcontainer">
              <div class="supplemental">
                Signed in as {$orgsAndUsers.me.name}
              </div>
              <div class="signin">
                <a href={SIGN_OUT_URL}>Sign out</a>
              </div>
              <Link to="app">
                <Button>Go to app</Button>
              </Link>
            </div>
          {:else}
            <div class="signupcontainer">
              <div class="signin">
                <a href={SIGN_IN_URL}>Sign in</a>
              </div>
              <a href={SIGN_UP_URL}>
                <Button>Sign up</Button>
              </a>
            </div>
          {/if}
        </div>
      </div>
      <div class="narrowshow">
        {#if $orgsAndUsers.me != null}
          <div class="signupcontainer">
            <div class="supplemental">Signed in as {$orgsAndUsers.me.name}</div>
            <div class="signin">
              <a href={SIGN_OUT_URL}>Sign out</a>
            </div>
            <Link to="app">
              <Button>Go to app</Button>
            </Link>
          </div>
        {:else}
          <div class="signupcontainer">
            <div class="signin">
              <a href={SIGN_IN_URL}>Sign in</a>
            </div>
            <a href={SIGN_UP_URL}>
              <Button>Sign up</Button>
            </a>
          </div>
        {/if}
      </div>
    </header>
    {#if showMast}
      <div class="mastcontainer">
        {@html mastheadSvg}
        {@html mastheadResponsiveSvg}
      </div>
    {/if}
    <div class="content">
      <slot />
    </div>
  </div>
</Loader>
