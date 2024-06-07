<script>
  import { createEventDispatcher } from "svelte";
  import Button from "../../common/Button.svelte";

  const dispatch = createEventDispatcher();
</script>

<h2>Chowder.</h2>
<div>
  <p>
    It was quite late in the evening when the little Moss came snugly to anchor,
    and Queequeg and I went ashore; so we could attend to no business that day,
    at least none but a supper and a bed. The landlord of the Spouter-Inn had
    recommended us to his cousin Hosea Hussey of the Try Pots, whom he asserted
    to be the proprietor of one of the best kept hotels in all Nantucket, and
    moreover he had assured us that Cousin Hosea, as he called him, was famous
    for his chowders. In short, he plainly hinted that we could not possibly do
    better than try pot-luck at the Try Pots. But the directions he had given us
    about keeping a yellow warehouse on our starboard hand till we opened a
    white church to the larboard, and then keeping that on the larboard hand
    till we made a corner three points to the starboard, and that done, then ask
    the first man we met where the place was: these crooked directions of his
    very much puzzled us at first, especially as, at the outset, Queequeg
    insisted that the yellow warehouse—our first point of departure—must be left
    on the larboard hand, whereas I had understood Peter Coffin to say it was on
    the starboard. However, by dint of beating about a little in the dark, and
    now and then knocking up a peaceable inhabitant to inquire the way, we at
    last came to something which there was no mistaking.
  </p>
</div>
<div><Button on:click={() => dispatch("close")}>Close</Button></div>
