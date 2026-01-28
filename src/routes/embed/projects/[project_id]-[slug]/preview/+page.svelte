<script lang="ts">
  import { page } from "$app/state";

  import * as embed from "$lib/api/embed";

  let { data } = $props();

  let project = $derived(data.project);
  let params = $derived(
    [...page.url.searchParams].filter(([k, v]) => k !== "embed"),
  );
  let iframe = $derived(embed.project(project, new URLSearchParams(params)));
</script>

<svelte:head>
  <title>Embed preview: {project.title}</title>
</svelte:head>

<div class="container">
  <h2>Chapter 1. Marseilles—The Arrival</h2>
  <p class="pfirst">
    On the 24th of February, 1815, the look-out at Notre-Dame de la Garde
    signalled the three-master, the
    <i>Pharaon</i> from Smyrna, Trieste, and Naples.
  </p>
  <p>
    As usual, a pilot put off immediately, and rounding the Château d’If, got on
    board the vessel between Cape Morgiou and Rion island.
  </p>
  <p>
    Immediately, and according to custom, the ramparts of Fort Saint-Jean were
    covered with spectators; it is always an event at Marseilles for a ship to
    come into port, especially when this ship, like the <i>Pharaon</i>, has been
    built, rigged, and laden at the old Phocee docks, and belongs to an owner of
    the city.
  </p>
  {@html iframe}
  <p>
    The ship drew on and had safely passed the strait, which some volcanic shock
    has made between the Calasareigne and Jaros islands; had doubled Pomègue,
    and approached the harbor under topsails, jib, and spanker, but so slowly
    and sedately that the idlers, with that instinct which is the forerunner of
    evil, asked one another what misfortune could have happened on board.
    However, those experienced in navigation saw plainly that if any accident
    had occurred, it was not to the vessel herself, for she bore down with all
    the evidence of being skilfully handled, the anchor a-cockbill, the jib-boom
    guys already eased off, and standing by the side of the pilot, who was
    steering the <i>Pharaon</i>
    towards the narrow entrance of the inner port, was a young man, who, with activity
    and vigilant eye, watched every motion of the ship, and repeated each direction
    of the pilot.
  </p>
  <p>
    The vague disquietude which prevailed among the spectators had so much
    affected one of the crowd that he did not await the arrival of the vessel in
    harbor, but jumping into a small skiff, desired to be pulled alongside the <i
      >Pharaon</i
    >, which he reached as she rounded into La Réserve basin.
  </p>
  <p>
    When the young man on board saw this person approach, he left his station by
    the pilot, and, hat in hand, leaned over the ship’s bulwarks.
  </p>
  <p>
    He was a fine, tall, slim young fellow of eighteen or twenty, with black
    eyes, and hair as dark as a raven’s wing; and his whole appearance bespoke
    that calmness and resolution peculiar to men accustomed from their cradle to
    contend with danger.
  </p>
  <a
    href="https://www.gutenberg.org/cache/epub/1184/pg1184-images.html"
    target="_blank"
    rel="noopener noreferrer"
  >
    Read more
  </a>
</div>

<style>
  .container {
    max-width: 100ch;
    margin: 1rem auto;
    padding: 1.5rem;

    display: flex;
    flex-flow: column nowrap;
    gap: 1rem;
  }

  h2 {
    text-align: center;
  }
</style>
