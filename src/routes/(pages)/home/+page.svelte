<script lang="ts">
  import { page } from "$app/state";

  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "$lib/components/common/Button.svelte";
  import Logo from "$lib/components/common/Logo.svelte";

  // Authentication
  import {
    APP_URL,
    SIGN_IN_URL,
    SIGN_UP_URL,
    SIGN_OUT_URL,
  } from "@/config/config.js";

  import Projects from "$lib/components/home/Projects.svelte";
  import SourceLogos from "$lib/components/home/SourceLogos/SourceLogos.svelte";
  import MuckRockLogo from "$lib/components/home/MuckRockLogo.svelte";
  import Search from "$lib/components/home/Search.svelte";
  import DonationForm from "$lib/components/home/DonationForm.svelte";

  // Show the login controls
  const showLogin = true;

  let { data } = $props();

  let { me, featuredProjects, documentCount } = $derived(data);
  let sign_in_url = $derived(new URL(`?next=${APP_URL}`, SIGN_IN_URL));

  let count = $derived(
    documentCount?.toLocaleString() ?? $_("homepage.documents.countFallback"),
  );

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
      <a
        class="logo"
        aria-label={$_("homepage.header.logoLabel")}
        href={APP_URL}
      >
        <Logo />
      </a>

      <div class="signin">
        {#if me}
          <span class="status">
            {$_("homeTemplate.signedIn", {
              values: { name: me?.name },
            })}
          </span>
          <Button href={SIGN_OUT_URL} mode="primary" ghost size="small">
            {$_("homeTemplate.signOut")}
          </Button>
          <Button href="/" size="small" mode="primary">
            {$_("homeTemplate.goToApp")}
          </Button>
        {:else}
          <Button
            href={SIGN_UP_URL + page.url}
            size="small"
            mode="primary"
            label={$_("homepage.header.signIn")}
          />
        {/if}
      </div>
    </div>
  </header>

  <section class="intro">
    <div class="content">
      <h1 class="column" style:--width="33%">
        {@html $_("homepage.intro.heading")}
      </h1>
      <div class="column" style:--width="52%" style:--gap="3rem">
        {@html $_("homepage.intro.content")}
      </div>
    </div>
  </section>

  <section class="documents">
    <div class="content">
      <div class="column" style:--width="33%" style:--gap="1.875rem">
        <h2>
          {$_("homepage.documents.heading", { values: { count } })}
        </h2>
        {@html $_("homepage.documents.description")}
      </div>
      <div class="column" style:--width="52%" style:--gap="1.5rem">
        <Search />

        <div class="documents-projects">
          <h3>{$_("homepage.documents.projectsHeading")}</h3>
          <Projects projects={featuredProjects} />
        </div>
      </div>
    </div>
  </section>

  <section class="sources">
    <div class="content">
      <div class="column" style:--width="52%">
        <SourceLogos />
      </div>
      <div class="column" style:--width="36%" style:--gap="1.5rem">
        <h2>{$_("homepage.sources.heading")}</h2>
        {@html $_("homepage.sources.content")}
        <div class="sources-account">
          <Button
            size="small"
            mode="primary"
            label={$_("homepage.sources.createAccount")}
            href={SIGN_UP_URL + page.url}
          />
          <Button
            size="small"
            mode="primary"
            ghost
            label={$_("homepage.sources.learnMore")}
            href="https://help.muckrock.com/Request-verification-19ef8892696381dba944e17e14938433"
          />
        </div>
      </div>
    </div>
  </section>

  <section class="data">
    <div class="content">
      <div class="data-box">
        <h2 class="data-header">
          {$_("homepage.data.headingPrefix")}
          <span class="data-header-documents">
            {$_("homepage.data.headingDocuments")}
          </span>
          {$_("homepage.data.headingMiddle")}
          <span class="data-header-data">
            {$_("homepage.data.headingData")}
          </span>
        </h2>
        <div class="data-info">
          <div class="data-info-section">
            {@html $_("homepage.data.publicApi")}
          </div>
          <div class="data-info-section">
            {@html $_("homepage.data.addOns")}
          </div>
          <div class="data-info-section">
            {@html $_("homepage.data.fullText")}
          </div>
          <div class="data-info-section">
            {@html $_("homepage.data.pythonSdk")}
          </div>
        </div>
        <div class="data-open-source">
          {@html $_("homepage.data.openSource")}
        </div>
      </div>
    </div>
  </section>

  <section class="muckrock">
    <div class="content">
      <div class="column" style:--width="39%" style:--gap="1.5rem">
        <a
          href="https://www.muckrock.com"
          aria-label={$_("homepage.muckrock.logoLabel")}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MuckRockLogo />
        </a>
        {@html $_("homepage.muckrock.content")}
      </div>
    </div>
  </section>

  <section class="donate">
    <div class="content">
      <div class="column" style:--width="24rem">
        <DonationForm id="g6R32g" />
      </div>
      <div
        class="column"
        style:--width="calc(100% - 26rem)"
        style:--gap="1.5rem"
      >
        <h2>
          {$_("homepage.donate.heading")}
        </h2>
        <h3>
          {$_("homepage.donate.subheading")}
        </h3>
        {@html $_("homepage.donate.content")}
      </div>
    </div>
  </section>
</article>

<style>
  /* Typography */

  :global(h1, h2, h3) {
    font-family: var(--font-serif);
    font-style: normal;
    font-weight: 400;
  }

  :global(h1) {
    font-size: 3.5rem;
    line-height: 1.286;
  }

  :global(h2) {
    font-size: 1.75rem;
    line-height: 1.286;
  }

  :global(h3) {
    font-size: 1rem;
    line-height: normal;
  }

  :global(p) {
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
    display: flex;
    padding-inline: 1.5rem;
  }

  .content {
    width: 100%;
    max-width: 24rem;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    row-gap: 3rem;
    align-items: center;
    justify-content: space-between;
    z-index: 1;
  }

  header .content {
    flex-direction: row;
  }

  .column {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--gap, 0);
  }

  @media (min-width: 48rem) {
    header,
    section {
      padding-inline: 2rem;
    }

    .column {
      width: var(--width);
    }

    .content {
      flex-direction: row;
      max-width: 48rem;
    }
  }

  /* Section: Header */

  header {
    padding-block: 21px;
  }

  .logo :global(.icon) {
    height: 2rem;
    width: auto;
  }

  .signin {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
  }

  .status {
    font-size: 13px;
    color: var(--gray);
  }

  /* Section: Intro */

  .intro {
    position: relative;
    color: #f5f5f5;
    padding-block: 44px;
    background-image: url("/clouds.jpg");
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

  /* Section: Documents */

  .documents {
    padding-block: 44px 54px;
    color: var(--gray-5);
  }

  .documents-projects {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Section: Sources */

  .sources {
    background-color: var(--gray-1);
    padding-block: 53px 61px;
  }

  .sources-account {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Section: Data */

  .data {
    background-color: var(--gray-1);
    padding-block: 0 36px;
  }

  .data-box {
    width: 100%;
    display: flex;
    padding: 1.5rem 2rem;
    flex-direction: column;
    gap: 1.25rem;
    border-radius: 1rem;
    background: var(--gray-5);
    color: var(--white);
  }

  .data-header {
    position: relative;
    font-size: 1.75rem;
    font-style: normal;
  }

  @media (min-width: 48rem) {
    .data-box {
      gap: 1.875rem;

      padding: 2rem 4rem 2rem 4.625rem;
    }

    .data-header {
      font-size: 2.25rem;
    }

    .data-header::before {
      content: ">";
      position: absolute;
      font-family: var(--font-mono);
      left: -2.75rem;
      top: 0;
      font-weight: 600;
      color: var(--green-3);
    }
  }

  .data-header-documents {
    color: var(--green-3);
    font-weight: 600;
    font-style: italic;
  }

  .data-header-data {
    color: var(--green-3);
    font-weight: 600;
    font-family: var(--font-mono);
    letter-spacing: -0.0625rem;
  }

  .data-info {
    display: grid;
    row-gap: 1rem;
    column-gap: 2rem;

    @media (min-width: 48rem) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .data-info-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .data-info :global(p) {
    font-size: 0.875rem;
    line-height: 1.286;
  }

  .data-info :global(a) {
    color: var(--white);
  }

  .data-info :global(h3) {
    font-size: 1.5rem;
    line-height: normal;
  }

  .data-open-source {
    padding: 0.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    border: 1px solid var(--green-3);
  }

  .data-open-source :global(a) {
    color: var(--green-3);
  }

  /* Section: MuckRock */

  .muckrock {
    padding-block: 39px 67px;
    color: var(--gray-5);
  }

  .muckrock :global(a) {
    color: var(--gray-5);
  }

  /* Section: Donate */

  .donate {
    padding-block: 4rem;
    color: var(--white);
    background-color: var(--blue-5);
  }

  .donate :global(a) {
    color: var(--white);
  }
</style>
