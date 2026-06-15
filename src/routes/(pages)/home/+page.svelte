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
  import SourceLogos from "$lib/components/home/SourceLogos/SourceLogos.svelte";

  // Show the login controls
  const showLogin = true;

  let { data } = $props();

  let { me, documentCount } = $derived(data);
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
    <div class="header-content">
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
        <h2>{documentCount?.toLocaleString()} public documents and counting</h2>
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

  <section class="sources">
    <div class="content">
      <div class="column-wide">
        <SourceLogos />
      </div>
      <div style:--col-width="36%" class="sources-info column-narrow">
        <h2>Documents from trustworthy sources</h2>
        <p>
          Newsrooms, independent journalists, archives and academic projects can
          upload, annotate, and publish documents.
        </p>
        <p>
          To get started, create a MuckRock account and request verification.
        </p>
        <div class="sources-account">
          <Button size="small" mode="primary" label="Create an account" />
          <Button
            size="small"
            mode="primary"
            ghost
            label="Learn more about verification"
          />
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
    font-size: 3.5rem;
    line-height: 1.286;
  }

  h2 {
    font-size: 1.75rem;
    line-height: 1.286;
  }

  h3 {
    font-size: 1rem;
    line-height: normal;
  }

  p {
    font-feature-settings: "ss04" on;
    font-family: var(--font-sans);
    font-size: 1rem;
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
    flex-direction: column;
    row-gap: 3rem;
    grid-column: 2 / 3;
    align-items: center;
    justify-content: space-between;
    z-index: 1;
  }

  .column-narrow,
  .column-wide {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 48rem) {
    .column-narrow {
      width: var(--col-width, 33%);
    }

    .column-wide {
      width: var(--col-width, 52%);
    }

    .content {
      flex-direction: row;
    }
  }

  /* Section: Header */

  header {
    padding: 21px 1rem;
  }

  .header-content {
    display: flex;
    flex-direction: row;
    grid-column: 2 / 3;
    align-items: center;
    justify-content: space-between;
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
    gap: 3rem;
  }

  /* Section: Documents */

  .documents {
    padding: 44px 0 54px;
    color: var(--gray-5);
  }

  .documents-info {
    gap: 1.875rem;
  }

  .documents-explore {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .documents-projects {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .documents-search {
    display: flex;
    align-items: center;
  }

  /* Section: Sources */

  .sources {
    background-color: var(--gray-1);
    padding: 53px 0 61px;
  }

  .sources-info {
    gap: 1.5rem;
  }

  .sources-account {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
