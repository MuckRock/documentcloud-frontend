<script lang="ts">
  // types
  import type { Writable } from "svelte/store";
  import type { User } from "@/api/types/orgAndUser.d.ts";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { page } from "$app/stores";

  import Button from "@/common/Button.svelte";

  // SVG assets
  import mastLogoSvg from "@/assets/mastlogo.svg?raw";
  import mastheadSvg from "@/assets/masthead.svg?raw";
  import mastheadResponsiveSvg from "@/assets/masthead_responsive.svg?raw";

  // Authentication
  import { SIGN_IN_URL, SIGN_UP_URL, SIGN_OUT_URL } from "@/config/config.js";

  // Show the login controls
  const showLogin = true;

  export let data;

  const me: Writable<User> = getContext("me");
</script>

<svelte:head>
  <title>{data.title} | DocumentCloud</title>
</svelte:head>

<div class="container">
  <header>
    <div class="headercontents">
      <div class="logo">
        <a href="/app">{@html mastLogoSvg}</a>
      </div>
      {#if showLogin}
        <div class="narrowhide">
          {#if $me !== null}
            <div class="signupcontainer">
              <div class="supplemental">
                {$_("homeTemplate.signedIn", {
                  values: { name: $me.name },
                })}
              </div>
              <div class="signin">
                <a href={SIGN_OUT_URL}>{$_("homeTemplate.signOut")}</a>
              </div>
              <a href="/app">
                <Button>{$_("homeTemplate.goToApp")}</Button>
              </a>
            </div>
          {:else}
            <div class="signupcontainer">
              <div class="signin">
                <a href={SIGN_IN_URL}>{$_("homeTemplate.signIn")}</a>
              </div>
              <a href={SIGN_UP_URL + $page.url}>
                <Button>{$_("homeTemplate.signUp")}</Button>
              </a>
            </div>
          {/if}
        </div>
      {/if}
    </div>
    {#if showLogin}
      <div class="narrowshow">
        {#if $me !== null}
          <div class="signupcontainer">
            <div class="supplemental">
              {$_("homeTemplate.signedIn", {
                values: { name: $me.name },
              })}
            </div>
            <div class="signin">
              <a href={SIGN_OUT_URL}>{$_("homeTemplate.signOut")}</a>
            </div>
            <a href="/app">
              <Button>{$_("homeTemplate.goToApp")}</Button>
            </a>
          </div>
        {:else}
          <div class="signupcontainer">
            <div class="signin">
              <a href={SIGN_IN_URL}>{$_("homeTemplate.signIn")}</a>
            </div>
            <a href={SIGN_UP_URL}>
              <Button>{$_("homeTemplate.signUp")}</Button>
            </a>
          </div>
        {/if}
      </div>
    {/if}
  </header>
  <div class="mastcontainer">
    {@html mastheadSvg}
    {@html mastheadResponsiveSvg}
  </div>
  <div class="content">
    {@html data.content}
  </div>

  <footer />
</div>

<style>
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
  }
  .signin a {
    text-decoration: inherit;
    color: var(--homeBlack, #222222);
    font-weight: bold;
    font-size: 16px;
    margin-right: 1.5em;
    cursor: pointer;
  }

  .signin:hover {
    opacity: var(--hover-opacity, 0.8);
  }

  .content {
    margin: 2em 0;
    max-width: 80ch;
    color: var(--homeBlack, #222222);
    font-size: 16px;
    line-height: 24px;
  }

  .content :global(a) {
    color: var(--primary);
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

  @media only screen and (max-width: 720px) {
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
    color: var(--gray), rgba(0, 0, 0, 0.53);
    margin: -10px 0 4px 0;
  }

  .narrowshow {
    --bordersize: 16px;

    display: none;
    margin: 10px var(--bordersize) 0 var(--bordersize);
    padding-top: 20px;
    border-top: solid 1px gainsboro;
  }

  .narrowshow .signupcontainer {
    display: block;
    margin: 0 calc(-1 * var(--bordersize));
  }

  .narrowshow .signupcontainer,
  .narrowshow .supplemental {
    text-align: left;
  }

  .narrowhide {
    display: table-cell;
    vertical-align: middle;
    text-align: right;
  }

  @media only screen and (max-width: 720px) {
    .narrowhide {
      display: none;
    }

    .narrowshow {
      display: block;
    }
  }

  footer {
    background: var(--gray, gray);
    height: 2em;
    width: 100%;
  }
</style>
