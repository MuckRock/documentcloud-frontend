<script lang="ts">
  import { page } from "$app/stores";

  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "$lib/components/common/Button.svelte";
  import Logo from "$lib/components/common/Logo.svelte";

  // SVG assets

  // Authentication
  import {
    APP_URL,
    SIGN_IN_URL,
    SIGN_UP_URL,
    SIGN_OUT_URL,
  } from "@/config/config.js";

  // Show the login controls
  const showLogin = true;

  export let data;

  $: me = data.me;
  $: sign_in_url = new URL(`?next=${APP_URL}`, SIGN_IN_URL);

  onMount(async () => {
    const { init } = await import("@plausible-analytics/tracker");
    init({
      domain: "documentcloud.org",
      autoCapturePageviews: true,
    });
  });
</script>

<svelte:head>
  <title>{data.title} | DocumentCloud</title>
</svelte:head>

<div class="container">
  <header>
    <div class="headercontents">
      <div class="logo">
        <a href="/documents/"><Logo /></a>
      </div>
      {#if showLogin}
        <div class="narrowhide">
          {#if me}
            <div class="signupcontainer">
              <div class="supplemental">
                {$_("homeTemplate.signedIn", {
                  values: { name: me?.name },
                })}
              </div>
              <div class="signin">
                <a href={SIGN_OUT_URL}>{$_("homeTemplate.signOut")}</a>
              </div>
              <a href="/">
                <Button mode="primary">{$_("homeTemplate.goToApp")}</Button>
              </a>
            </div>
          {:else}
            <div class="signupcontainer">
              <div class="signin">
                <a href={sign_in_url.href}>{$_("homeTemplate.signIn")}</a>
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
        {#if me}
          <div class="signupcontainer">
            <div class="supplemental">
              {$_("homeTemplate.signedIn", {
                values: { name: me?.name },
              })}
            </div>
            <div class="signin">
              <a href={SIGN_OUT_URL}>{$_("homeTemplate.signOut")}</a>
            </div>
            <a href="/">
              <Button>{$_("homeTemplate.goToApp")}</Button>
            </a>
          </div>
        {:else}
          <div class="signupcontainer">
            <div class="signin">
              <a href={sign_in_url.href}>{$_("homeTemplate.signIn")}</a>
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
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1219 291"
      class="masthead"
    >
      <path d="M0 8.8h1219v273.1H0V8.8z" fill="#4294F0" />
      <path d="M1219 6.6H723.8l-64.4 277.3H1219V6.6z" fill="#494949" />
      <text
        fill="#fff"
        style="white-space:pre"
        font-family="Source Sans Pro"
        font-size="18"
        letter-spacing="0em"
      >
        <tspan x="864.6" y="224.8">Embed documents on your site and </tspan>
        <tspan x="881.3" y="247.8">publish to our growing archive.</tspan>
      </text>
      <g filter="url(#filter0_d)">
        <path
          d="M146 162.2v14.4c0 .6.5 1 1 1h60.4c.5 0 1-.4 1-1v-14.4h11.8c.7 0 1.2-.5 1.2-1.2v-28c0-.6-.5-1.1-1.2-1.1h-11.8v-8.5a1 1 0 00-.3-.7l-30-32.4a1 1 0 00-.8-.3H147a1 1 0 00-1 1v41h-11.8c-.7 0-1.2.5-1.2 1.1v28c0 .7.5 1.2 1.2 1.2H146v-.1z"
          fill="#fff"
          fill-opacity=".3"
        />
      </g>
      <g filter="url(#filter1_d)">
        <path
          d="M148 164.2v14.4c0 .6.5 1 1 1h60.4c.5 0 1-.4 1-1v-14.4h11.8c.7 0 1.2-.5 1.2-1.2v-28c0-.6-.5-1.1-1.2-1.1h-11.8v-8.5a1 1 0 00-.3-.7l-30-32.4a1 1 0 00-.8-.3H149a1 1 0 00-1 1v41h-11.8c-.7 0-1.2.5-1.2 1.1v28c0 .7.5 1.2 1.2 1.2H148v-.1z"
          fill="#fff"
          fill-opacity=".3"
        />
      </g>
      <g filter="url(#filter2_d)">
        <path
          d="M142 158.2v14.4c0 .6.5 1 1 1h60.4c.5 0 1-.4 1-1v-14.4h11.8c.7 0 1.2-.5 1.2-1.2v-28c0-.6-.5-1.1-1.2-1.1h-11.8v-8.5a1 1 0 00-.3-.7l-30-32.4a1 1 0 00-.8-.3H143a1 1 0 00-1 1v41h-11.8c-.7 0-1.2.5-1.2 1.1v28c0 .7.5 1.2 1.2 1.2H142v-.1z"
          fill="#fff"
          fill-opacity=".3"
        />
      </g>
      <g filter="url(#filter3_d)">
        <path
          d="M144 160.2v14.4c0 .6.5 1 1 1h60.4c.5 0 1-.4 1-1v-14.4h11.8c.7 0 1.2-.5 1.2-1.2v-28c0-.6-.5-1.1-1.2-1.1h-11.8v-8.5a1 1 0 00-.3-.7l-30-32.4a1 1 0 00-.8-.3H145a1 1 0 00-1 1v41h-11.8c-.7 0-1.2.5-1.2 1.1v28c0 .7.5 1.2 1.2 1.2H144v-.1z"
          fill="#fff"
          fill-opacity=".3"
        />
      </g>
      <g filter="url(#filter4_d)">
        <path
          d="M139.6 169.6V84c0-.6.5-1 1-1H171c.3 0 .6.1.8.3l5.7 6.2 15.8 17 8.5 9.2c.2.2.3.5.3.7v53.2c0 .6-.5 1-1 1h-60.4a1 1 0 01-1-1h-.1z"
          fill="#64ACFD"
        />
        <path
          d="M177.4 89.5l15.8 17m-15.8-17l-5.8-6.2a1 1 0 00-.7-.3h-30.3a1 1 0 00-1 1v85.6c0 .6.5 1 1 1H201c.5 0 1-.4 1-1v-53.2a1 1 0 00-.3-.7l-8.5-9.1-15.8-17.1zm0 0v16c0 .6.4 1 1 1h14.8l-15.8-17z"
          stroke="#fff"
          stroke-width="2.1"
        />
      </g>
      <g filter="url(#filter5_d)">
        <g filter="url(#filter6_d)">
          <path
            d="M213.8 124.8h-86c-.7 0-1.2.5-1.2 1.2v28c0 .7.5 1.2 1.2 1.2h86c.7 0 1.2-.5 1.2-1.2v-28c0-.7-.5-1.2-1.2-1.2z"
            fill="#fff"
          />
        </g>
        <g filter="url(#filter7_d)">
          <path
            d="M147.8 130.5h6.6c1 0 1.8.1 2.6.3a5 5 0 012.1.9c.6.4 1.1 1 1.5 1.6.3.7.5 1.6.5 2.6a6 6 0 01-.5 2.6c-.3.7-.8 1.3-1.3 1.7-.6.4-1.3.7-2.1.9-.8.2-1.7.2-2.6.2h-2.9v7h-3.9v-17.8zm4 7.5h3.5l1-.4.5-.6c.2-.3.3-.7.3-1 0-.5-.1-.9-.3-1.2a2 2 0 00-.8-.6 3 3 0 00-1.1-.3h-3.2v4.1h.1zm11.8-7.5h5.8c1.4 0 2.8.2 4 .5 1.3.3 2.4.8 3.4 1.6 1 .7 1.7 1.6 2.2 2.7.6 1.1.9 2.5.9 4.1a8.4 8.4 0 01-3 6.6c-1 .7-2 1.3-3.2 1.7-1.2.3-2.4.5-3.8.5h-6.3v-17.7zm3.9 14.1h2c.9 0 1.7 0 2.5-.2s1.5-.5 2-1c.6-.4 1-1 1.3-1.6.4-.7.5-1.6.5-2.6a4.8 4.8 0 00-3.7-4.7c-.7-.3-1.5-.4-2.3-.4h-2.3v10.5zm15.2-14.1h11.9v3.6h-8v3.6h7.4v3.6h-7.4v7h-4v-17.8h.1z"
            fill="#4294F0"
          />
        </g>
      </g>
      <text
        fill="#fff"
        style="white-space:pre"
        font-family="Source Sans Pro"
        font-size="18"
        letter-spacing="0em"
      >
        <tspan x="98.7" y="235.3">Upload documents.</tspan>
      </text>
      <path d="M449.9 0l-99.4 290.2h373L798 0H449.9z" fill="#1368C7" />
      <path
        d="M449 124.9l-5.6-10.1-6 9.9 11.6.2zm-165.4.9C337.9 96 394 94.6 440.8 121l1-1.7C394.3 92.5 337.5 94 282.6 124l1 1.8zm588.2 2.2l-5-10.5-6.5 9.5 11.5 1zm-165.7.8c54.6-33.5 110.8-35.1 157.8-5.1l1-1.7c-47.7-30.5-104.7-28.8-159.9 5l1 1.8h.1z"
        fill="#fff"
      />
      <text
        fill="#fff"
        style="white-space:pre"
        font-family="Source Sans Pro"
        font-size="18"
        letter-spacing="0em"
      >
        <tspan x="472.3" y="79.8">Extract, analyze and search text.</tspan>
      </text>
      <text
        fill="#fff"
        style="white-space:pre"
        font-family="Source Sans Pro"
        font-size="18"
        letter-spacing="0em"
      >
        <tspan x="455.2" y="225.3">Annotate, redact and edit.</tspan>
      </text>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M576.5 167c-2.8-3.5-5.5-6.8-3-12 3.9-8.5 15.3-12 23.4-12 8.2 0 16.2 3.5 12.3 12-2.6 5.4-8.5 8.7-14.5 12.1-6.2 3.5-12.3 7-15 12.7 2.7-5.8-.3-9.3-3.2-12.9v.1zm13.4-9c3.9 0 8-2 9.2-4.6 1.2-2.6-1-4.7-4.9-4.7-3.9 0-8 2.1-9.2 4.7-1.2 2.6 1 4.7 4.9 4.7v-.1z"
        fill="#000"
        fill-opacity=".1"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M571 160.4c-4.5-5.2-8.8-10.2-8.8-18 0-12.9 9.8-18.3 17.9-18.3 8.1 0 17.9 5.4 17.9 18.2 0 7.9-4.3 13-8.7 18-4.6 5.4-9.2 10.8-9.2 19.5 0-8.7-4.6-14.1-9.2-19.4h.1zm9-13.4a7.1 7.1 0 100-14.2 7.1 7.1 0 000 14.2zm-68.1 17.7s-3.4 0-3.6-.4c-.1-.4-.2-.6 0-.9.1-.2.8-.5 1.5-.9l1.7-1a584 584 0 0013.7-22.4c.8-1.2 2.6-2.8 3.5-2.8.9 0 1.5 1.2 1.8 2 .2.6 1.2 8.5 1.7 12.2l.2 1.7.2 1.5c.4 2.7 1 7 1.2 7.6.1.3.6.6 1 1 .6.3 1.2.7 1.3 1.1 0 .7-1 1.3-2.3 1.3h-1.2c-1.1 0-2.3.1-3.2 0l-1-.1c-.8 0-1.5-.1-1.5-.6 0-.4.3-.7.6-1 .3-.2.6-.4.7-.7.3-.8.9-3.4.6-5.2-.3-2-1.3-2.4-4.1-2.5-3 0-5.8.2-6.7 1.4-.8 1.2-1.5 2.5-1.7 3.2l-.2.5c-.3.7-.6 1.5-.5 2 0 .3.2.5.5.8.3.3.7.7.7 1.5 0 .7-5 .7-5 .7h.1zm9.2-13.4a2 2 0 00-.5 1l1.4.2 5.9-.2c.3 0 .4-.3.4-.7v-.2c-.2-3.3-.7-6.5-1.4-9.7-.1-.3-.3 0-.5.3l-4.5 7.9-.8 1.4zM640.8 167a16.6 16.6 0 100-33.2 16.6 16.6 0 000 33.2zm7.3-23.4l4 .3c2.5.3 3.5 3 2 5-.6 1-1.2 1.6-1.6 1.7-1 .5-6.7.2-7.8 0-.6-.1-1.7-1.4-2.5-2.8l-.2-.6c-.3-.8-.7-1.8-1.5-1.8-.6 0-.9.6-.9 1.2 0 .4 0 .8-.3 1.2-.8 1.4-1.9 2.7-2.5 2.8-1 .2-6.7.5-7.8 0-.4-.1-1-.8-1.6-1.6-1.5-2-.4-4.8 2-5 1.6-.3 3-.4 4-.4s2.5.3 4 .6l1.9.2a10 10 0 012.6 0c.8 0 1.5 0 2.3-.2a22 22 0 013.9-.6z"
        fill="#fff"
      />
      <path d="M927.5 46.6h148.8v136.6H927.5V46.6z" fill="#4294F0" />
      <path d="M927.3 41.7h149v15.8h-149V41.7z" fill="#1368C7" />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M1063.2 48.2a3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 013-3 3 3 0 013 3zm-.6 3c-.6.6-1.5 1-2.4 1a3.9 3.9 0 113-1.6l4.3 4.2-.7.7-4.2-4.2v-.1z"
        fill="#64ACFD"
      />
      <path d="M929.1 57.5h107.8v124H929.1v-124z" fill="#64ACFD" />
      <path
        d="M947.3 63.5h71.3v91.7h-71.3V63.5zm0 102.3h71.3v15.7h-71.3v-15.7z"
        fill="#fff"
      />
      <path
        d="M955.6 45.4h-20.2c-.8 0-1.5.7-1.5 1.5v5.5c0 .8.7 1.5 1.5 1.5h20.2c.8 0 1.5-.7 1.5-1.5v-5.5c0-.8-.7-1.5-1.5-1.5zM981.6 45.4h-20.2c-.8 0-1.5.7-1.5 1.5v5.5c0 .8.7 1.5 1.5 1.5h20.2c.8 0 1.5-.7 1.5-1.5v-5.5c0-.8-.7-1.5-1.5-1.5zM1007.5 45.4h-20.2c-.8 0-1.5.7-1.5 1.5v5.5c0 .8.7 1.5 1.5 1.5h20.2c.8 0 1.5-.7 1.5-1.5v-5.5c0-.8-.7-1.5-1.5-1.5zM1041.6 68.5h29.5v4.9h-29.5v-4.9zm0 12.5h29.5v3.2h-29.5V81zm0 5.8h29.5V90h-29.5v-3.2zm0 10.8h29.5v3.2h-29.5v-3.2zm0 5.7h29.5v3.2h-29.5v-3.2zm0 5.8h29.5v3.2h-29.5v-3.2z"
        fill="#64ACFD"
      />
      <defs>
        <filter
          id="filter0_d"
          x="130.6"
          y="90"
          width="93.2"
          height="94.8"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4.8" />
          <feGaussianBlur stdDeviation="1.2" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <filter
          id="filter1_d"
          x="132.6"
          y="92"
          width="93.2"
          height="94.8"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4.8" />
          <feGaussianBlur stdDeviation="1.2" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <filter
          id="filter2_d"
          x="126.6"
          y="86"
          width="93.2"
          height="94.8"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4.8" />
          <feGaussianBlur stdDeviation="1.2" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <filter
          id="filter3_d"
          x="128.6"
          y="88"
          width="93.2"
          height="94.8"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4.8" />
          <feGaussianBlur stdDeviation="1.2" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <filter
          id="filter4_d"
          x="134.3"
          y="79.8"
          width="72.9"
          height="98.1"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="2.1" />
          <feGaussianBlur stdDeviation="2.1" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <filter
          id="filter5_d"
          x="122.6"
          y="124.8"
          width="96.4"
          height="38.4"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <filter
          id="filter6_d"
          x="124.2"
          y="124.8"
          width="93.2"
          height="37.6"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4.8" />
          <feGaussianBlur stdDeviation="1.2" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
        <filter
          id="filter7_d"
          x="143.6"
          y="126.3"
          width="55.2"
          height="26.2"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2.1" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 497 374"
      class="mastheadresponsive"
    >
      <g clip-path="url(#clip0)">
        <path d="M0 96.6h497v162.3H0V96.6z" fill="#1368C7" />
        <path d="M0 0h497v96.6H0V0z" fill="#4294F0" />
        <text
          fill="#fff"
          style="white-space:pre"
          font-family="Source Sans Pro"
          font-size="18"
          letter-spacing="0em"
        >
          <tspan x="96.1" y="57.2">Upload documents</tspan>
        </text>
        <path d="M497 258.9H0v115.3h497V258.9z" fill="#494949" />
        <text
          fill="#fff"
          style="white-space:pre"
          font-family="Source Sans Pro"
          font-size="18"
          letter-spacing="0em"
        >
          <tspan x="184.4" y="311.3">Embed documents on your site and </tspan>
          <tspan x="184.4" y="334.3">publish to our growing archive.</tspan>
        </text>
        <path d="M49.8 279.1h84.6v77.6H49.8v-77.6z" fill="#4294F0" />
        <path d="M49.7 276.3h84.7v9H49.7v-9z" fill="#1368C7" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M126.9 280a1.7 1.7 0 11-3.4 0 1.7 1.7 0 013.4 0zm-.3 1.7a2.2 2.2 0 11.4-.4l2.3 2.5-.3.3-2.4-2.4z"
          fill="#64ACFD"
        />
        <path d="M50.7 285.3H112v70.5H50.7v-70.5z" fill="#64ACFD" />
        <path
          d="M61 288.7h40.5v52.1H61v-52zm0 58.2h40.5v9H61v-9z"
          fill="#fff"
        />
        <path
          d="M65.7 278.4H54.3c-.5 0-.9.4-.9 1v3c0 .4.4.8.9.8h11.4c.5 0 .9-.4.9-.9v-3c0-.5-.4-.9-.9-.9zM80.5 278.4H69.1c-.5 0-.9.4-.9 1v3c0 .4.4.8.9.8h11.4c.5 0 .9-.4.9-.9v-3c0-.5-.4-.9-.9-.9zM95.2 278.4H83.8c-.5 0-.9.4-.9 1v3c0 .4.4.8.9.8h11.4c.5 0 .9-.4.9-.9v-3c0-.5-.4-.9-.9-.9zM114.6 291.6h16.8v2.8h-16.8v-2.8zm0 7h16.8v1.8h-16.8v-1.8zm0 3.3h16.8v1.8h-16.8V302zm0 6.2h16.8v1.8h-16.8v-1.8zm0 3.2h16.8v1.8h-16.8v-1.8zm0 3.3h16.8v1.8h-16.8v-1.8z"
          fill="#64ACFD"
        />
        <path
          d="M307.5 66.8V75c0 .3.2.6.6.6h34.3c.3 0 .6-.3.6-.6v-8.2h6.7c.4 0 .7-.3.7-.6v-16c0-.3-.3-.7-.7-.7H343v-4.8l-.2-.4-17-18.4a.6.6 0 00-.5-.2h-17.2c-.4 0-.6.3-.6.6v23.3h-6.8c-.4 0-.7.4-.7.7v16c0 .3.3.6.7.6h6.8z"
          fill="#fff"
          fill-opacity=".3"
        />
        <path
          d="M308.7 68v8.2c0 .3.2.5.5.5h34.3c.4 0 .6-.2.6-.5V68h6.8c.3 0 .6-.3.6-.7v-16c0-.3-.3-.6-.6-.6h-6.8V46l-.1-.4-17.1-18.4a.6.6 0 00-.5-.2h-17.2c-.3 0-.6.2-.6.6v23.1h-6.7c-.4 0-.7.3-.7.7v16c0 .3.3.6.7.6h6.7l.1.1z"
          fill="#fff"
          fill-opacity=".3"
        />
        <path
          d="M305.2 64.6v8c0 .4.3.6.6.6h34.3c.4 0 .6-.2.6-.6v-8h6.7c.4 0 .7-.3.7-.7V48c0-.3-.3-.6-.7-.6h-6.7v-4.8l-.1-.4-17.2-18.5a.6.6 0 00-.4-.2h-17.2c-.3 0-.6.3-.6.6v23.3h-6.7c-.4 0-.7.3-.7.6v16c0 .4.3.7.7.7h6.7z"
          fill="#fff"
          fill-opacity=".3"
        />
        <path
          d="M306.3 65.6V74c0 .3.3.6.6.6h34.4c.3 0 .6-.3.6-.6v-8.3h6.7c.4 0 .7-.3.7-.7V49c0-.3-.3-.6-.7-.6h-6.7v-4.7l-.2-.4-17.1-18.4a.6.6 0 00-.4-.2h-17.3c-.3 0-.6.3-.6.6v23.2h-6.6c-.4 0-.7.3-.7.7v16c0 .3.3.6.7.6h6.7-.1z"
          fill="#fff"
          fill-opacity=".3"
        />
        <path
          d="M303.8 70.6V22.8c0-.6.5-1 1-1h16.6c.3 0 .6 0 .8.3l3.1 3.3 9 9.8 4.8 5 .2.7v29.7c0 .6-.4 1-1 1h-33.4a1 1 0 01-1-1h-.1z"
          fill="#64ACFD"
        />
        <path
          d="M325.4 25.4l9 9.8m-9.1-9.8l-3-3.3a1 1 0 00-.9-.4h-16.5a1 1 0 00-1 1v48c0 .5.4 1 1 1h33.4c.6 0 1-.5 1-1V40.8c0-.2 0-.5-.2-.7l-4.7-5-9.1-9.8zm.1 0v8.7c0 .6.4 1 1 1h8l-9-9.7z"
          stroke="#fff"
          stroke-width="2.1"
        />
        <path
          d="M345.5 45.6h-47.9c-.7 0-1.2.6-1.2 1.2v15c0 .6.5 1.1 1.2 1.1h47.9c.7 0 1.2-.5 1.2-1.2V46.8c0-.6-.5-1.2-1.2-1.2z"
          fill="#fff"
        />
        <path
          d="M308.5 48.8h3.8l1.4.1 1.3.5.8 1c.2.4.3 1 .3 1.5s-.1 1-.3 1.4c-.2.4-.4.7-.8 1l-1.2.5-1.4.1h-1.7v4h-2.2V49zm2.2 4.3h2.1l.5-.3.3-.3.2-.6c0-.3 0-.5-.2-.7a1 1 0 00-.5-.3l-.6-.2h-1.8v2.4zm6.8-4.3h3.3c.8 0 1.6 0 2.3.3a5 5 0 012 .8c.4.4.9 1 1.2 1.6.3.7.5 1.4.5 2.4a4.8 4.8 0 01-1.7 3.7l-1.8 1a7 7 0 01-2.2.3h-3.6V49zm2.2 8H322.3l1.1-.6c.4-.3.6-.6.8-1a3.3 3.3 0 000-2.6c-.1-.4-.4-.7-.7-1-.4-.3-.7-.5-1.2-.6l-1.3-.2h-1.3v6zm8.7-8h6.7v2h-4.4v2h4.2V55h-4.2v4h-2.2V49h-.1z"
          fill="#4294F0"
        />
        <text
          fill="#fff"
          style="white-space:pre"
          font-family="Source Sans Pro"
          font-size="18"
          letter-spacing="0em"
        >
          <tspan x="130.3" y="135.8">Extract, analyze and search text.</tspan>
        </text>
        <text
          fill="#fff"
          style="white-space:pre"
          font-family="Source Sans Pro"
          font-size="18"
          letter-spacing="0em"
        >
          <tspan x="149.1" y="232.6">Annotate, redact and edit.</tspan>
        </text>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M244.6 193.7c-2.7-3.2-5.3-6.2-3-11 3.8-7.8 14.7-11 22.5-11 7.7 0 15.4 3.2 11.7 11-2.5 5-8.1 8-13.9 11.1-5.8 3.2-11.7 6.4-14.3 11.6 2.6-5.3-.2-8.5-3-11.7zm12.7-8.2c3.7 0 7.7-1.9 8.9-4.3 1.1-2.3-1-4.2-4.7-4.2s-7.7 2-8.8 4.2c-1.2 2.4.9 4.3 4.6 4.3z"
          fill="#000"
          fill-opacity=".1"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M239.3 187.6c-4.2-4.7-8.4-9.3-8.4-16.5 0-11.7 9.3-16.6 17.1-16.6 7.8 0 17 5 17 16.6 0 7.2-4 11.8-8.3 16.5-4.3 5-8.7 10-8.7 17.8 0-8-4.4-12.9-8.7-17.8zm8.7-12.2c3.7 0 6.7-3 6.7-6.5 0-3.6-3-6.5-6.7-6.5a6.6 6.6 0 00-6.7 6.5c0 3.6 3 6.5 6.7 6.5zm58 18.3c8.7 0 15.7-6.8 15.7-15.2 0-8.4-7-15.2-15.8-15.2-8.7 0-15.8 6.8-15.8 15.2 0 8.4 7 15.2 15.8 15.2h.1zm7-21.4c.8 0 2 0 3.3.2a3 3 0 012.8 3.6 3 3 0 01-.8 1.5l-1.1 1.1c-1 .5-6.5.2-7.5 0-.6 0-1.5-1.2-2.3-2.4l-.2-.5c-.3-.8-.7-2-1.6-2-.6 0-.9.8-.9 1.4 0 .4 0 .7-.3 1.1-.7 1.2-1.7 2.3-2.3 2.4-1 .2-6.4.5-7.4 0-.3 0-.7-.5-1.2-1a3 3 0 012-5.2l3.4-.2c1 0 2.3.2 3.6.5l2 .2a10 10 0 012.5 0c.8 0 1.6 0 2.3-.2a18 18 0 013.6-.5h.1zM182.3 194.8s-3.4 0-3.5-.4c-.2-.4-.3-.5 0-.9l1.4-.8 1.8-1c4.7-7.4 9.3-14.9 13.7-22.5.8-1.2 2.5-2.8 3.4-2.8 1 0 1.6 1.2 1.8 2l1.8 12.3.2 1.6.2 1.6c.3 2.7.9 7 1.2 7.6.1.3.6.6 1 1 .6.3 1.2.7 1.2 1 .1.8-.9 1.3-2.2 1.3h-5.5c-.8 0-1.6-.2-1.6-.7 0-.4.3-.6.7-.9.3-.2.6-.5.7-.8.3-.7.9-3.3.6-5.2-.3-1.9-1.3-2.4-4.2-2.4-2.9 0-5.7.1-6.6 1.3-.9 1.2-1.5 2.5-1.8 3.3l-.2.5c-.3.6-.6 1.4-.5 2 0 .3.3.5.5.7.4.3.8.7.8 1.5 0 .7-5 .7-5 .7h.1zm9.2-13.4l-.5 1h7.3c.4 0 .5-.3.4-.6v-.2a40 40 0 00-1.4-9.7c0-.3-.2 0-.4.2l-4.6 8-.8 1.3z"
          fill="#fff"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <path fill="#fff" d="M0 0h497v374H0z" />
        </clipPath>
      </defs>
    </svg>
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

    display: flex;
    flex-flow: column nowrap;
    gap: 0.5rem;
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
