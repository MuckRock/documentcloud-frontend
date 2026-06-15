<script lang="ts">
  import { page } from "$app/state";

  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "$lib/components/common/Button.svelte";
  import Logo from "$lib/components/common/Logo.svelte";
  import Search from "$lib/components/forms/Search.svelte";

  // Authentication
  import {
    APP_URL,
    SIGN_IN_URL,
    SIGN_UP_URL,
    SIGN_OUT_URL,
  } from "@/config/config.js";
  import Projects from "$lib/components/home/Projects.svelte";

  // Show the login controls
  const showLogin = true;

  let { data } = $props();

  let me = $derived(data.me);
  let sign_in_url = $derived(new URL(`?next=${APP_URL}`, SIGN_IN_URL));

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

<article class="page">
  <header>
    <div class="content">
      <a class="logo" aria-label="DocumentCloud homepage" href={APP_URL}>
        <Logo />
      </a>

      <Button size="small" mode="primary" label="Sign in with MuckRock" />
    </div>
  </header>

  <section class="intro">
    <div class="content">
      <h1 class="column-narrow">Upload.<br />Analyze.<br />Embed.</h1>
      <div class="column-wide intro-info">
        <p>
          <strong>DocumentCloud</strong> is an all-in-one platform used by newsrooms
          around the world for work with primary source documents.
        </p>
        <p>
          Upload and organize documents.<br />
          Extract, analyze and search text.<br />
          Annotate, redact and edit.<br />
          Embed documents on your website.
        </p>
      </div>
    </div>
  </section>

  <section class="documents">
    <div class="content">
      <div class="column-narrow documents-info">
        <h2>7,003,584 public documents and counting</h2>
        <p>
          Everyone is welcome to explore our public document archive and
          organize interesting documents into projects.
        </p>
      </div>
      <div class="column-wide">
        <div class="documents-explore">
          <div class="documents-search">
            <Search placeholder="Search public documents..." />
            <Button size="small" mode="primary" label="Search" />
          </div>

          <div class="documents-projects">
            <h3>Explore some of our newsworthy projects:</h3>
            <Projects />
          </div>
        </div>
      </div>
    </div>
  </section>
</article>

<style>
  /* Typography */

  h1,
  h2,
  h3 {
    font-family: var(--font-serif);
    font-style: normal;
    font-weight: 400;
  }

  h1 {
    font-size: 56px;
    line-height: 72px;
  }

  h2 {
    font-size: 28px;
    line-height: 36px;
  }

  h3 {
    font-size: 16px;
    line-height: normal;
  }

  p {
    font-feature-settings: "ss04" on;
    font-family: var(--font-sans);
    font-size: var(--font-md, 16px);
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  /* Reusable styles */

  header,
  section {
    display: grid;
    grid-template-columns: minmax(1rem, 1fr) minmax(auto, 42rem) minmax(
        1rem,
        1fr
      );
  }

  .content {
    display: flex;
    flex-direction: row;
    grid-column: 2 / 3;
    align-items: center;
    justify-content: space-between;
    z-index: 1;
  }

  .column-narrow,
  .column-wide {
    display: flex;
    flex-direction: column;
  }

  .column-narrow {
    width: 33%;
  }

  .column-wide {
    width: 50%;
  }

  /* Section: Header */

  header {
    padding: 21px 1rem;
  }

  .logo :global(.icon) {
    height: 2rem;
    width: auto;
  }

  /* Section: Intro */

  .intro {
    position: relative;
    color: #f5f5f5;
    padding: 44px 0;
    background-image: url("/clouds.png");
    background-size: cover;
    background-position: center;
  }

  .intro::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, var(--blue-3) 0%, var(--blue-4) 100%);
    opacity: 75%;
  }

  .intro-info {
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  /* Section: Documents */

  .documents {
    padding: 44px 0 54px;
    color: var(--gray-5);
  }

  .documents-info {
    gap: 30px;
  }

  .documents-explore {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .documents-projects {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .documents-search {
    display: flex;
    align-items: center;
  }
</style>
